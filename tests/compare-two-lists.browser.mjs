// node tests/compare-two-lists.browser.mjs <build/client or HTTPS origin> <playwright-core path> <Edge executable>
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, isAbsolute, join, relative, resolve } from "node:path";

const [target, packagePath, executablePath] = process.argv.slice(2);
assert.ok(target && packagePath && executablePath, "Supply build/client or HTTPS origin, playwright-core, and Edge.");
const { chromium } = createRequire(import.meta.url)(resolve(packagePath));
const route = "/compare-two-lists/";
const workerAsset = /\/assets\/compare-two-lists\.worker-[^/]+\.js$/;
const privateValue = "M02-private-reconciliation-7Q";
const fileName = "M02-private-list-A.txt";
const widths = [320, 375, 768, 1280, 1920];
const adOrConsent = /googlesyndication|doubleclick|googleadservices|fundingchoices|googletagmanager|google-analytics/i;
const normalize = (value) => value.replaceAll("\r\n", "\n");
const button = (page, name) => page.getByRole("button", { name, exact: true });
const group = (page, name) => page.getByRole("region", { name, exact: true });
const input = (page, side) => page.getByRole("textbox", { name: "List " + side, exact: true });
const picker = (page, side) => page.getByLabel("Import TXT into List " + side, { exact: true });
const output = (page, name) => group(page, name).locator("bdi");
const waitReady = (page) => page.getByRole("heading", { name: "Comparison results", exact: true }).waitFor();

async function serve(directory) {
  const root = resolve(directory);
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".xml": "application/xml", ".png": "image/png", ".webp": "image/webp" };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      let file = resolve(root, "." + decodeURIComponent(url.pathname));
      const within = relative(root, file);
      assert.ok(!isAbsolute(within) && !within.startsWith(".."));
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const bytes = await readFile(file);
      response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" }).end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((ready, fail) => server.once("error", fail).listen(0, "127.0.0.1", ready));
  return { origin: "http://127.0.0.1:" + server.address().port, close: () => new Promise((done) => server.close(done)) };
}

async function download(page, name, expectedFilename) {
  const [file] = await Promise.all([page.waitForEvent("download"), button(page, name).press("Enter")]);
  assert.equal(file.suggestedFilename(), expectedFilename);
  return readFile(await file.path());
}

function textFile(name, bytes) {
  return { name, mimeType: "text/plain", buffer: Buffer.from(bytes) };
}

async function expectCopy(page, name, expected) {
  await page.evaluate(() => navigator.clipboard.writeText("copy sentinel"));
  await button(page, name).press("Enter");
  await page.getByRole("status").filter({ hasText: name.replace("Copy ", "") + " copied." }).waitFor();
  assert.equal(normalize(await page.evaluate(() => navigator.clipboard.readText())), expected);
}

async function noOverflow(page, width) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} px overflows`);
}

const hosted = target.startsWith("https://");
const local = hosted ? null : await serve(target);
const origin = local?.origin ?? new URL(target).origin;
const browser = await chromium.launch({ executablePath, headless: true });
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
assert.doesNotMatch(sitemap, /compare-two-lists/);

try {
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const staticPage = await noJS.newPage();
  const staticResponse = await staticPage.goto(origin + route);
  assert.equal(staticResponse.status(), 200);
  assert.equal(await staticPage.locator('meta[name="robots"]').getAttribute("content"), "noindex,follow");
  assert.equal(await staticPage.locator('link[rel="canonical"]').getAttribute("href"), "https://www.alltextconverters.com" + route);
  if (/^https:\/\/deploy-preview-/.test(origin)) assert.match((await staticResponse.allHeaders())["x-robots-tag"], /noindex/i);
  assert.equal(await staticPage.locator("[data-ad-placement]").count(), 0);
  await staticPage.getByRole("heading", { name: "How matches and repeats are counted", exact: true }).waitFor();
  await input(staticPage, "A").waitFor();
  await input(staticPage, "B").waitFor();
  await noOverflow(staticPage, 320);
  await noJS.close();

  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, permissions: ["clipboard-read", "clipboard-write"], serviceWorkers: "block" });
    await context.route((url) => adOrConsent.test(url.hostname), (request) => request.abort());
    const page = await context.newPage();
    const requests = [];
    const pageErrors = [];
    page.on("request", (request) => requests.push(request.url() + " " + (request.postData() ?? "")));
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    try {
      assert.equal((await page.goto(origin + route, { waitUntil: "networkidle" })).status(), 200);
      assert.ok(!requests.some((request) => workerAsset.test(request.trim())), "worker loaded before comparison");
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), "Skip to content");
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => document.activeElement.id), "main-content");
      await noOverflow(page, width);

      const left = privateValue + "\rCafé\r\nSKU-07\nSKU-07\r\n\neast";
      const choose = page.waitForEvent("filechooser");
      await picker(page, "A").press("Enter");
      await (await choose).setFiles(textFile(fileName, left));
      await page.getByRole("status").filter({ hasText: "File loaded into List A." }).waitFor();
      assert.equal(await input(page, "A").inputValue(), left.replace(/\r\n|\r/g, "\n"));
      await page.evaluate(() => navigator.clipboard.writeText("Café\nSKU-07\n西\nwest"));
      await input(page, "B").press("Control+v");
      await page.waitForFunction(() => [...document.querySelectorAll("main textarea")].some((el) => el.value === "Café\nSKU-07\n西\nwest"));
      await button(page, "Compare lists").press("Enter");
      await waitReady(page);
      assert.ok(requests.some((request) => workerAsset.test(request.trim())));
      assert.deepEqual(await output(page, "Common").allTextContents(), ["Café", "SKU-07"]);
      assert.deepEqual(await output(page, "Only A").allTextContents(), [privateValue, "⟨empty line⟩", "east"]);
      assert.deepEqual(await output(page, "Only B").allTextContents(), ["西", "west"]);
      await group(page, "Common").getByText("A 2 · B 1 · Output 1", { exact: true }).waitFor();
      await expectCopy(page, "Copy Only A", privateValue + "\n\neast\n");
      await expectCopy(page, "Copy Only B", "西\nwest\n");
      const saved = await download(page, "Download Common TXT", "compare-lists-common.txt");
      assert.equal(saved.toString("utf8"), "Café\nSKU-07\n");
      assert.equal((await download(page, "Download Union TXT", "compare-lists-union.txt")).toString("utf8"), privateValue + "\nCafé\nSKU-07\n\neast\n西\nwest\n");
      await noOverflow(page, width);

      await page.getByRole("combobox", { name: "Duplicates", exact: true }).selectOption("multiset");
      assert.equal(await group(page, "Comparison results").count(), 0);
      await button(page, "Compare lists").press("Enter");
      await waitReady(page);
      await group(page, "Only A").getByText("A 2 · B 1 · Output 1", { exact: true }).waitFor();
      assert.equal((await download(page, "Download Only A TXT", "compare-lists-only-a.txt")).toString("utf8"), privateValue + "\nSKU-07\n\neast\n");
      assert.equal((await download(page, "Download Only B TXT", "compare-lists-only-b.txt")).toString("utf8"), "西\nwest\n");
      await input(page, "B").fill("changed");
      assert.equal(await group(page, "Comparison results").count(), 0);
      await picker(page, "B").setInputFiles(textFile("reimport.txt", saved));
      await page.getByRole("status").filter({ hasText: "File loaded into List B." }).waitFor();
      await button(page, "Compare lists").press("Enter");
      await waitReady(page);
      assert.deepEqual(await output(page, "Common").allTextContents(), ["Café", "SKU-07"]);

      assert.ok(!requests.some((request) => request.includes(privateValue) || request.includes(fileName) || adOrConsent.test(request)));
      const stored = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
      assert.ok(!stored.includes(privateValue) && !stored.includes(fileName));
      assert.deepEqual(pageErrors, []);
      console.log(`${width}px passed native paste, keyboard file import, set/multiset counts, side export, round trip, stale result, reflow and privacy`);
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({ viewport: { width: 320, height: 900 }, serviceWorkers: "block" });
  await context.route((url) => adOrConsent.test(url.hostname) || url.hostname === "example.invalid", (request) => request.abort());
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.addInitScript(() => {
    Object.defineProperty(navigator.clipboard, "writeText", { value: async () => { throw new DOMException("Denied", "NotAllowedError"); } });
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (this.name === "slow.txt") await new Promise((resolve) => setTimeout(resolve, 500));
      return read.call(this);
    };
  });
  await page.goto(origin + route, { waitUntil: "networkidle" });
  await button(page, "Compare lists").press("Enter");
  await waitReady(page);
  await group(page, "Union").getByText("0 distinct · 0 output occurrences", { exact: true }).waitFor();
  assert.ok(await button(page, "Copy Union").isDisabled());
  await input(page, "A").fill("  Café  \n\n👩‍💻\ne\u0301");
  await input(page, "B").fill("CAFÉ\n👩💻\né");
  await page.getByRole("checkbox", { name: "Ignore letter case when matching" }).check();
  await page.getByRole("checkbox", { name: "Ignore whitespace at line edges when matching" }).check();
  await page.getByRole("checkbox", { name: "Ignore empty entries" }).check();
  await page.getByRole("combobox", { name: "Output order" }).selectOption("sorted");
  await button(page, "Compare lists").press("Enter");
  await waitReady(page);
  assert.deepEqual(await output(page, "Common").allTextContents(), ["  Café  "]);
  assert.deepEqual(await output(page, "Union").allTextContents(), ["  Café  ", "e\u0301", "é", "👩‍💻", "👩💻"]);
  await button(page, "Copy Common").press("Enter");
  await page.getByRole("status").filter({ hasText: /Automatic copy was unavailable/ }).waitFor();
  assert.equal((await download(page, "Download Common TXT", "compare-lists-common.txt")).toString("utf8"), "  Café  \n");

  await picker(page, "A").setInputFiles(textFile("invalid.txt", [0xc3, 0x28]));
  await page.getByRole("alert").filter({ hasText: /List A could not read this file as UTF-8/ }).waitFor();
  assert.equal(await input(page, "A").inputValue(), "  Café  \n\n👩‍💻\ne\u0301");
  await picker(page, "A").setInputFiles(textFile("slow.txt", "late value"));
  await input(page, "A").fill("new edit");
  await page.waitForFunction(() => document.querySelector("main textarea").value === "new edit");
  await picker(page, "B").setInputFiles(textFile("huge.txt", Buffer.alloc(512 * 1024 + 1, 65)));
  await page.getByRole("alert").filter({ hasText: /List B needs a UTF-8 file up to 512 KiB/ }).waitFor();
  assert.equal(await input(page, "B").inputValue(), "CAFÉ\n👩💻\né");

  await page.route(workerAsset, (interception) => interception.abort("blockedbyclient"));
  await button(page, "Compare lists").press("Enter");
  await page.getByRole("alert").filter({ hasText: /comparison worker could not run/ }).waitFor();
  await page.unroute(workerAsset);

  let release;
  const wait = new Promise((done) => { release = done; });
  const hold = async (interception) => {
    await wait;
    await interception.continue().catch(() => {});
  };
  await page.route(workerAsset, hold);
  try {
    await button(page, "Compare lists").press("Enter");
    await button(page, "Cancel comparison").press("Enter");
    await page.getByRole("status").filter({ hasText: "Comparison canceled." }).waitFor();
    assert.equal(await group(page, "Comparison results").count(), 0);
    await button(page, "Compare lists").press("Enter");
    await button(page, "Cancel comparison").waitFor();
    await input(page, "A").fill("edited during comparison");
    assert.equal(await button(page, "Cancel comparison").count(), 0);
    assert.equal(await group(page, "Comparison results").count(), 0);
  } finally {
    release();
    await page.unroute(workerAsset, hold);
  }
  await button(page, "Compare lists").press("Enter");
  await waitReady(page);
  assert.equal(await input(page, "A").inputValue(), "edited during comparison");

  const markup = '<img src="https://example.invalid/fixture"><b>client value</b>';
  await input(page, "A").fill(markup);
  await button(page, "Compare lists").press("Enter");
  await waitReady(page);
  assert.equal(await output(page, "Only A").first().textContent(), markup);
  assert.equal(await group(page, "Only A").locator("img, b").count(), 0);
  assert.ok(!requests.some((url) => url.includes("example.invalid") || adOrConsent.test(url)));
  await page.setViewportSize({ width: 640, height: 900 });
  const zoom = await page.addStyleTag({ content: "html { zoom: 2 }" });
  await noOverflow(page, 640);
  await zoom.evaluate((element) => element.remove());
  console.log("Passed zero inputs, explicit normalization/sort, Unicode, denied clipboard, malformed UTF-8, oversized import, blocked and canceled worker, stale file/results, inert markup and 200% CSS zoom");

  await page.setViewportSize({ width: 1280, height: 900 });
  const records = Array.from({ length: 20_000 }, (_, index) => `SKU-${String(index).padStart(5, "0")}-abcdefghijklmn`);
  const large = records.join("\n") + "\n";
  await picker(page, "A").setInputFiles(textFile("large.txt", large));
  await page.getByRole("status").filter({ hasText: "File loaded into List A." }).waitFor();
  await input(page, "B").fill(records[0]);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const start = performance.now();
  await button(page, "Compare lists").press("Enter");
  await waitReady(page);
  const elapsed = performance.now() - start;
  assert.equal(await output(page, "Union").count(), 30);
  await group(page, "Union").getByText("20000 distinct · 20000 output occurrences", { exact: true }).waitFor();
  assert.equal((await download(page, "Download Union TXT", "compare-lists-union.txt")).toString("utf8"), large);
  await picker(page, "B").setInputFiles(textFile("too-many-rows.txt", "x\n".repeat(20_001)));
  await page.getByRole("status").filter({ hasText: "File loaded into List B." }).waitFor();
  await button(page, "Compare lists").press("Enter");
  await page.getByRole("alert").filter({ hasText: /List B exceeds 20,000/ }).waitFor();
  assert.equal(await group(page, "Comparison results").count(), 0);
  console.log(`20,000 lines, ${Buffer.byteLength(large)} UTF-8 bytes, ${Math.round(elapsed)} ms compare-to-visible at 4x CPU throttle; full TXT equals source`);

  await page.goto(origin + "/remove-duplicate-lines/", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Compare Two Lists", exact: true }).press("Enter");
  await page.waitForURL("**/compare-two-lists/");
  assert.equal(await input(page, "A").inputValue(), "");
  assert.equal(await input(page, "B").inputValue(), "");
  await context.close();
} finally {
  await browser.close();
  await local?.close();
}
