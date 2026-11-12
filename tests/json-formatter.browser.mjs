// node tests/json-formatter.browser.mjs <build/client or HTTPS origin> <playwright-core path> <Edge executable>
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, isAbsolute, join, relative, resolve } from "node:path";

const [target, packagePath, executablePath] = process.argv.slice(2);
assert.ok(target && packagePath && executablePath, "Supply build/client or HTTPS origin, playwright-core, and Edge.");
const { chromium } = createRequire(import.meta.url)(resolve(packagePath));
const route = "/json-formatter/";
const workerAsset = /\/assets\/json-formatter\.worker-[^/]+\.js$/;
const marker = "M07-private-lexical-fixture-64";
const fixtureName = "M07-private-file.json";
const lexical = String.raw`{"id":900719925474099312345,"a":-0,"\u0061":1.20E+09,"__proto__":{"raw":"<img src=\"https://example.invalid/fixture\">"},"notes":"${marker}"}`;
const pretty = [
  "{", '  "id": 900719925474099312345,', '  "a": -0,', String.raw`  "\u0061": 1.20E+09,`,
  '  "__proto__": {', String.raw`    "raw": "<img src=\"https://example.invalid/fixture\">"`,
  "  },", `  "notes": "${marker}"`, "}", "",
].join("\n");
const widths = [320, 375, 768, 1280, 1920];
const adOrConsent = /googlesyndication|doubleclick|googleadservices|fundingchoices|googletagmanager|google-analytics/i;
const blockedHost = (url) => adOrConsent.test(url.hostname) || url.hostname === "example.invalid";
const button = (page, name) => page.getByRole("button", { name, exact: typeof name === "string" });
const input = (page) => page.getByRole("textbox", { name: "JSON source", exact: true });
const output = (page) => page.getByRole("textbox", { name: "JSON output", exact: true });
const picker = (page) => page.getByLabel("Import JSON file", { exact: true });
const status = (page, message) => page.getByRole("status").filter({ hasText: message }).waitFor();
const alert = (page, message) => page.getByRole("alert").filter({ hasText: message }).waitFor();
const file = (name, bytes) => ({ name, mimeType: "application/json", buffer: Buffer.from(bytes) });

async function serve(directory) {
  const root = resolve(directory);
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".xml": "application/xml", ".png": "image/png", ".webp": "image/webp" };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      let resource = resolve(root, "." + decodeURIComponent(url.pathname));
      const within = relative(root, resource);
      assert.ok(!isAbsolute(within) && !within.startsWith(".."));
      if ((await stat(resource)).isDirectory()) resource = join(resource, "index.html");
      const bytes = await readFile(resource);
      response.writeHead(200, { "Content-Type": types[extname(resource)] ?? "application/octet-stream" }).end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((ready, fail) => server.once("error", fail).listen(0, "127.0.0.1", ready));
  return { origin: "http://127.0.0.1:" + server.address().port, close: () => new Promise((done) => server.close(done)) };
}

async function download(page) {
  const [result] = await Promise.all([page.waitForEvent("download"), button(page, "Download JSON").press("Enter")]);
  assert.equal(result.suggestedFilename(), "formatted.json");
  return readFile(await result.path(), "utf8");
}

async function noOverflow(page, width) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} px overflows`);
}

const hosted = target.startsWith("https://");
const local = hosted ? null : await serve(target);
const origin = local?.origin ?? new URL(target).origin;
const browser = await chromium.launch({ executablePath, headless: true });
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
assert.doesNotMatch(sitemap, /json-formatter/);

try {
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const staticPage = await staticContext.newPage();
  const response = await staticPage.goto(origin + route);
  assert.equal(response.status(), 200);
  if (/^https:\/\/deploy-preview-/.test(origin)) assert.match((await response.allHeaders())["x-robots-tag"], /noindex/i);
  assert.equal(await staticPage.locator('meta[name="robots"]').getAttribute("content"), "noindex,follow");
  assert.equal(await staticPage.locator('link[rel="canonical"]').getAttribute("href"), "https://www.alltextconverters.com" + route);
  assert.equal(await staticPage.locator("[data-ad-placement]").count(), 0);
  await staticPage.getByRole("heading", { name: "What formatting changes", exact: true }).waitFor();
  await input(staticPage).waitFor();
  await noOverflow(staticPage, 320);
  await staticContext.close();

  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, permissions: ["clipboard-read", "clipboard-write"], serviceWorkers: "block" });
    await context.route(blockedHost, (request) => request.abort());
    const page = await context.newPage();
    const requests = [];
    const pageErrors = [];
    page.on("request", (request) => requests.push(request.url() + " " + (request.postData() ?? "")));
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    try {
      assert.equal((await page.goto(origin + route, { waitUntil: "networkidle" })).status(), 200);
      assert.ok(!requests.some((request) => workerAsset.test(request.trim())), "worker started before a JSON operation");
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), "Skip to content");
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => document.activeElement.id), "main-content");
      await noOverflow(page, width);

      const imported = " \r\n" + lexical + "\r";
      const fileChooser = page.waitForEvent("filechooser");
      await picker(page).press("Enter");
      await (await fileChooser).setFiles(file(fixtureName, imported));
      await status(page, "Local JSON file loaded.");
      assert.equal(await input(page).inputValue(), " \n" + lexical + "\n");
      await button(page, "Format JSON").press("Enter");
      await status(page, "JSON result ready.");
      assert.ok(requests.some((request) => workerAsset.test(request.trim())));
      assert.equal(await output(page).inputValue(), pretty);
      await page.getByText(/1 repeated object key found/).waitFor();
      assert.equal(await page.locator("main img").count(), 0, "markup remains inert text");

      await page.evaluate(() => navigator.clipboard.writeText("clipboard sentinel"));
      await button(page, "Copy JSON").press("Enter");
      await status(page, "JSON copied.");
      assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replaceAll("\r\n", "\n"), pretty);
      assert.equal(await download(page), pretty);
      await noOverflow(page, width);

      const indentation = page.getByRole("combobox", { name: "Indentation", exact: true });
      await indentation.selectOption("four");
      assert.equal(await output(page).inputValue(), "");
      await button(page, "Format JSON").press("Enter");
      await status(page, "JSON result ready.");
      assert.match(await output(page).inputValue(), /\n    "id": 900719925474099312345,/);
      await indentation.selectOption("tab");
      await button(page, "Format JSON").press("Enter");
      await status(page, "JSON result ready.");
      assert.match(await output(page).inputValue(), /\n\t"id": 900719925474099312345,/);

      await button(page, "Minify JSON").press("Enter");
      await status(page, "JSON result ready.");
      assert.equal(await download(page), lexical);
      await button(page, "Validate JSON").press("Enter");
      await status(page, "Valid JSON.");
      assert.equal(await output(page).inputValue(), "");
      assert.equal(await button(page, "Download JSON").count(), 0);
      await button(page, /"id" number/).press("Enter");
      assert.equal(await input(page).evaluate((textarea) => textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)), "900719925474099312345");

      const bad = '{\n  "a": 1,\n}';
      await page.evaluate((source) => navigator.clipboard.writeText(source), bad);
      await input(page).press("Control+a");
      await input(page).press("Control+v");
      await button(page, "Validate JSON").press("Enter");
      await alert(page, "Line 3, column 1. Remove the trailing comma.");
      await button(page, "Go to error").press("Enter");
      assert.equal(await input(page).evaluate((textarea) => textarea.selectionStart), bad.indexOf("}"));
      assert.equal(await button(page, "Copy JSON").count(), 0);
      assert.ok(!requests.some((request) => request.includes(marker) || request.includes(fixtureName) || /example\.invalid/.test(request) || adOrConsent.test(request)));
      const storage = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
      assert.ok(!storage.includes(marker) && !storage.includes(fixtureName));
      assert.deepEqual(pageErrors, []);
      console.log(`${width}px passed native file/paste/copy, three indentation modes, exact JSON downloads, structure/error focus, reflow and privacy`);
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({ viewport: { width: 320, height: 900 }, serviceWorkers: "block" });
  await context.route(blockedHost, (request) => request.abort());
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator.clipboard, "writeText", { value: async () => { throw new DOMException("Denied", "NotAllowedError"); } });
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (this.name === "slow.json") await new Promise((resolve) => setTimeout(resolve, 500));
      return read.call(this);
    };
  });
  await page.goto(origin + route, { waitUntil: "networkidle" });
  await input(page).fill(lexical);
  await button(page, "Format JSON").press("Enter");
  await status(page, "JSON result ready.");
  await button(page, "Copy JSON").press("Enter");
  await status(page, /Automatic copy was unavailable/);
  assert.equal(await output(page).evaluate((textarea) => textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)), pretty);
  await page.setViewportSize({ width: 640, height: 900 });
  const zoom = await page.addStyleTag({ content: "html { zoom: 2 }" });
  await noOverflow(page, 640);
  await zoom.evaluate((element) => element.remove());

  await picker(page).setInputFiles(file("bad.json", [0xc3, 0x28]));
  await alert(page, /Could not read the file as UTF-8/);
  assert.equal(await input(page).inputValue(), lexical);
  await picker(page).setInputFiles(file("oversized.json", Buffer.alloc(1024 * 1024 + 1, 65)));
  await alert(page, /Choose a UTF-8 file up to 1 MiB/);
  assert.equal(await input(page).inputValue(), lexical);
  await picker(page).setInputFiles(file("slow.json", '{"stale":true}'));
  await input(page).fill('{"new":true}');

  await page.route(workerAsset, (interception) => interception.abort("blockedbyclient"));
  await button(page, "Format JSON").press("Enter");
  await alert(page, /JSON worker could not run/);
  await page.unroute(workerAsset);
  let release;
  const wait = new Promise((done) => { release = done; });
  const hold = async (interception) => {
    await wait;
    await interception.continue().catch(() => {});
  };
  await page.route(workerAsset, hold);
  try {
    await button(page, "Format JSON").press("Enter");
    await button(page, "Cancel").press("Enter");
    await status(page, "Operation canceled.");
    assert.ok(await input(page).evaluate((element) => document.activeElement === element));
    assert.equal(await output(page).inputValue(), "");
    await button(page, "Minify JSON").press("Enter");
    await button(page, "Cancel").waitFor();
    await input(page).fill('{"current":true}');
    assert.equal(await button(page, "Cancel").count(), 0);
    assert.equal(await output(page).inputValue(), "");
  } finally {
    release();
    await page.unroute(workerAsset, hold);
  }
  await button(page, "Minify JSON").press("Enter");
  await status(page, "JSON result ready.");
  assert.equal(await output(page).inputValue(), '{"current":true}');
  console.log("Passed denied clipboard, invalid/oversized files, stale import and worker, blocked/canceled workers, and 200% CSS zoom");

  await page.setViewportSize({ width: 1280, height: 900 });
  const rows = Array.from({ length: 4000 }, (_, index) => `"item-${String(index).padStart(5, "0")}-${"x".repeat(235)}"`);
  const exact = "[" + rows.join(",") + "]";
  const withLines = "[\n" + rows.join(",\n") + "\n]";
  const large = withLines + " ".repeat(1024 * 1024 - withLines.length);
  assert.equal(Buffer.byteLength(large), 1024 * 1024);
  await picker(page).setInputFiles(file("one-mib.json", large));
  await status(page, "Local JSON file loaded.");
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const start = performance.now();
  await button(page, "Minify JSON").press("Enter");
  await status(page, "JSON result ready.");
  const elapsed = performance.now() - start;
  assert.ok((await output(page).inputValue()).length <= 16 * 1024);
  assert.equal(await page.getByRole("region", { name: "JSON structure" }).getByRole("listitem").count(), 40);
  assert.equal(await download(page), exact);
  await page.getByText("The editor shows a preview. Copy and download use the complete output.", { exact: true }).waitFor();
  await button(page, "Copy JSON").press("Enter");
  await status(page, "Automatic copy was unavailable. Download the JSON to keep the complete result.");
  console.log(`1 MiB of JSON with 4,000 items, ${Math.round(elapsed)} ms minify-to-visible at 4x CPU throttle; complete UTF-8 export matched`);

  const deep = "[".repeat(129) + "0" + "]".repeat(129);
  await input(page).fill(deep);
  await button(page, "Validate JSON").press("Enter");
  await alert(page, /exceeds 128 nested containers/);
  const expand = "[".repeat(120) + "1,".repeat(10_000) + "0" + "]".repeat(120);
  await picker(page).setInputFiles(file("expansion.json", expand));
  await status(page, "Local JSON file loaded.");
  await page.getByRole("combobox", { name: "Indentation" }).selectOption("four");
  await button(page, "Format JSON").press("Enter");
  await alert(page, /result exceeds 4 MiB/);
  assert.equal(await output(page).inputValue(), "");
  await button(page, "Validate JSON").press("Enter");
  await status(page, "Valid JSON.");

  await page.goto(origin + "/json-to-text/", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "JSON Formatter", exact: true }).press("Enter");
  await page.waitForURL("**/json-formatter/");
  assert.equal(await input(page).inputValue(), "");
  await context.close();
} finally {
  await browser.close();
  await local?.close();
}
