// Usage: node tests/text-diff.browser.mjs <build/client or preview URL> <playwright-core module path> <Chromium executable>
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { createRequire } from "node:module";

const [target, playwrightPath, executablePath] = process.argv.slice(2);
if (!target || !playwrightPath || !executablePath) {
  throw new Error("Pass a local build directory or preview URL, playwright-core path and Chromium executable.");
}

async function serveStatic(root) {
  const directory = resolve(root);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".xml": "application/xml",
    ".txt": "text/plain",
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      let file = resolve(directory, "." + pathname);
      if (file !== directory && !file.startsWith(directory + sep)) throw new Error("Not found");
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      const bytes = await readFile(file);
      response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" }).end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return { origin: "http://127.0.0.1:" + server.address().port, close: () => server.close() };
}

const local = /^https?:\/\//.test(target) ? null : await serveStatic(target);
const origin = local?.origin ?? target.replace(/\/+$/, "");
const { chromium } = createRequire(import.meta.url)(resolve(playwrightPath));
const browser = await chromium.launch({ executablePath, headless: true });



const workerUrl = /\/assets\/text-diff\.worker-[^/]+\.js/;
const marker = "PrivateM03Fixture";
const probe = "/m03-preview-unsafe-probe";
const before = "Agreement\r\nPay 30 days.\r\nSame 東京\rKeep\nSend by post.\nLast line\r";
const after = "Agreement\r\nPay 45 days.\nSame 東京\rKeep\nSend by café\t.\n" + marker + "<img src=" + probe + ">\nLast line\r";
const expected = [
  "Text comparison", "Change groups: 2", "Removed: 2 · Added: 3 · Unchanged: 4", "",
  "Change 1 · Original position 2 · Revised position 2",
  '- 2 [CRLF] "Pay 30 days."', '+ 2 [LF] "Pay 45 days."', "",
  "Change 2 · Original position 5 · Revised position 5",
  '- 5 [LF] "Send by post."', '+ 5 [LF] "Send by café\\t."',
  '+ 6 [LF] "' + marker + '<img src=' + probe + '>"', "",
].join("\n");
const button = (page, name) => page.getByRole("button", { name, exact: true });
const original = (page) => page.getByRole("textbox", { name: "Original text", exact: true });
const revised = (page) => page.getByRole("textbox", { name: "Revised text", exact: true });
const file = (page, side) => page.getByLabel("Open " + side + " text file", { exact: true });
const fixture = (name, text) => ({ name, mimeType: "text/plain", buffer: Buffer.from(text) });

async function visit(context, path = "/text-diff/") {
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  assert.equal((await page.goto(origin + path))?.status(), 200);
  await page.waitForLoadState("networkidle");
  return page;
}

async function assertReflow(page) {
  const { viewport, rootWidth, bodyWidth } = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    rootWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  assert.ok(rootWidth <= viewport && bodyWidth <= viewport, "horizontal overflow " + JSON.stringify({ viewport, rootWidth, bodyWidth }));
}

async function download(page) {
  const [file] = await Promise.all([page.waitForEvent("download"), button(page, "Download report").click()]);
  assert.equal(file.suggestedFilename(), "text-comparison.txt");
  return readFile(await file.path(), "utf8");
}

async function awaitResult(page, message) {
  await page.getByRole("status").getByText(message).waitFor();
  await page.getByRole("heading", { name: "Comparison results" }).waitFor();
}

try {
  for (const width of [320, 375, 768, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, acceptDownloads: true });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const requests = [];
    context.on("request", (request) => requests.push(request.url() + " " + (request.postData() ?? "")));
    const page = await visit(context);
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex,follow");
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://www.alltextconverters.com/text-diff/");
    assert.equal(await page.locator("[data-ad-placement]").count(), 0);
    assert.equal(await page.locator("h1").textContent(), "Text Diff Checker");
    assert.ok(!requests.some((request) => workerUrl.test(request)), "worker must wait for the comparison gesture");
    const sitemap = await (await page.request.get(origin + "/sitemap.xml")).text();
    assert.equal((sitemap.match(/<loc>/g) ?? []).length, 48);
    assert.ok(!sitemap.includes("/text-diff/"));
    await assertReflow(page);

    await Promise.all([
      file(page, "original").setInputFiles(fixture(marker + "-original.txt", before)),
      file(page, "revised").setInputFiles(fixture(marker + "-revised.txt", after)),
    ]);
    await page.waitForFunction(() => document.querySelector("#text-diff-original")?.value.includes("30") &&
      document.querySelector("#text-diff-revised")?.value.includes("45"));
    assert.equal(await original(page).inputValue(), before.replace(/\r\n|\r/g, "\n"));
    assert.equal(await revised(page).inputValue(), after.replace(/\r\n|\r/g, "\n"));
    const highlight = page.getByLabel("Highlight words in short one-line replacements", { exact: true });
    await highlight.focus();
    await page.keyboard.press("Tab");
    const compare = button(page, "Compare text");
    assert.ok(await compare.evaluate((element) => element === document.activeElement));
    assert.notEqual(await compare.evaluate((element) => getComputedStyle(element).outlineStyle), "none");
    await page.keyboard.press("Enter");
    await awaitResult(page, "2 change groups. 2 removed, 3 added.");
    assert.ok(requests.some((request) => workerUrl.test(request)));
    const removed = page.getByRole("region", { name: "Original · Removed" });
    const added = page.getByRole("region", { name: "Revised · Added" });
    assert.equal(await removed.locator("mark").textContent(), "30");
    assert.equal(await added.locator("mark").textContent(), "45");
    await removed.getByText("CRLF", { exact: true }).waitFor();
    await added.getByText("LF", { exact: true }).waitFor();
    await page.getByRole("region", { name: "Unchanged context after" }).getByText("Same 東京", { exact: true }).waitFor();

    const next = button(page, "Next change");
    await next.focus();
    await page.keyboard.press("Enter");
    assert.ok(await next.evaluate((element) => element === document.activeElement));
    assert.ok(await next.isDisabled());
    await page.getByRole("status").getByText("Change 2 of 2").waitFor();
    await added.getByText(marker + "<img src=" + probe + ">", { exact: true }).waitFor();
    assert.equal(await added.locator("img").count(), 0);
    await page.getByLabel("Show spaces, tabs, and byte-order marks").check();
    await added.getByText("Send·by·café→.", { exact: true }).waitFor();
    await button(page, "Previous change").click();
    await page.getByRole("status").getByText("Change 1 of 2").waitFor();
    assert.equal(await download(page), expected);
    await button(page, "Copy report").click();
    await page.getByRole("status").getByText("Report copied.").waitFor();
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n"), expected);
    await assertReflow(page);

    await highlight.uncheck();
    assert.equal(await button(page, "Download report").count(), 0);
    await compare.click();
    await awaitResult(page, "2 change groups. 2 removed, 3 added.");
    assert.equal(await page.locator("mark").count(), 0);
    await button(page, "Clear").click();
    assert.equal(await original(page).inputValue(), "");
    assert.equal(await revised(page).inputValue(), "");
    assert.equal(await button(page, "Copy report").count(), 0);
    await compare.click();
    await awaitResult(page, "The two texts are identical.");
    assert.match(await download(page), /Removed: 0 · Added: 0 · Unchanged: 0/);

    assert.deepEqual(errors, []);
    assert.ok(!requests.some((request) => new RegExp(marker + "|" + probe + "|googlesyndication|doubleclick|google-analytics|consentmanager", "i").test(request)));
    assert.ok(!(await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]))).includes(marker));
    await context.close();
    console.log(width + " px passed real files, worker-only loading, exact exports, clipboard, line and word view, keyboard, reflow and privacy");
  }

  const context = await browser.newContext({ viewport: { width: 640, height: 800 }, acceptDownloads: true });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => { throw new Error("Blocked clipboard"); } } });
    const readFile = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (this.name === "delayed.txt") await new Promise((resolve) => setTimeout(resolve, 400));
      return readFile.call(this);
    };
  });
  const page = await visit(context, "/text-cleaner/");
  await page.getByRole("link", { name: "Text Diff Checker", exact: true }).click();
  await page.waitForURL("**/text-diff/");
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await button(page, "Load example").click();
  await button(page, "Compare text").click();
  await awaitResult(page, "2 change groups. 2 removed, 2 added.");
  await button(page, "Copy report").click();
  await page.getByRole("status").getByText(/Automatic copy was unavailable/).waitFor();
  assert.ok((await download(page)).includes("Payment is due in 45 days."));
  await assertReflow(page);

  await file(page, "original").setInputFiles(fixture("invalid.txt", [0xff]));
  await page.getByRole("alert").getByText(/not valid UTF-8/).waitFor();
  assert.equal(await button(page, "Download report").count(), 0);
  await file(page, "original").setInputFiles(fixture("oversize.txt", Buffer.alloc(512 * 1024 + 1)));
  await page.getByRole("alert").getByText(/up to 512 KiB/).waitFor();
  await file(page, "original").setInputFiles(fixture("delayed.txt", "Stale file text."));
  await page.getByRole("status").getByText("Reading original file…").waitFor();
  await original(page).fill("Manual edit wins.");
  await page.waitForTimeout(450);
  assert.equal(await original(page).inputValue(), "Manual edit wins.");

  await button(page, "Clear").click();
  await file(page, "original").setInputFiles(fixture("paste-source.txt", "a\r\nold\rend\n"));
  await page.waitForFunction(() => document.querySelector("#text-diff-original")?.value === "a\nold\nend\n");
  await original(page).evaluate((field) => {
    field.focus();
    field.setSelectionRange(2, 5);
    const clipboard = new DataTransfer();
    clipboard.setData("text/plain", "cafe\u0301\r\n👩‍💻");
    field.dispatchEvent(new ClipboardEvent("paste", { clipboardData: clipboard, bubbles: true, cancelable: true }));
  });
  await revised(page).fill("a\ncafé\n👩‍💻\nend\n");
  await button(page, "Compare text").click();
  await awaitResult(page, "1 change group. 3 removed, 3 added.");
  const pasteReport = await download(page);
  assert.ok(pasteReport.includes('- 2 [CRLF] "cafe\u0301"'));
  assert.ok(pasteReport.includes('- 3 [CR] "👩‍💻"'));

  await page.setViewportSize({ width: 320, height: 800 });
  await page.evaluate(() => { document.documentElement.style.zoom = ""; });
  await button(page, "Clear").click();
  const long = Array.from({ length: 12000 }, (_, n) => "line" + (n + 1)).join("\n");
  await file(page, "revised").setInputFiles(fixture("12000-lines.txt", long));
  await page.getByRole("status").getByText("Revised text loaded from file.").waitFor();
  await button(page, "Compare text").click();
  await awaitResult(page, "1 change group. 0 removed, 12000 added.");
  await page.getByRole("status").getByText("Page 1 of 750").waitFor();
  await button(page, "Next page").click();
  await page.getByRole("status").getByText("Page 2 of 750").waitFor();
  await page.getByRole("region", { name: "Revised · Added" }).getByText("line17", { exact: true }).waitFor();
  await button(page, "Last page").click();
  await page.getByRole("status").getByText("Page 750 of 750").waitFor();
  await page.getByRole("region", { name: "Revised · Added" }).getByText("line12000", { exact: true }).waitFor();
  assert.ok((await download(page)).endsWith('+ 12000 [No ending] "line12000"\n'));
  await assertReflow(page);

  await file(page, "revised").setInputFiles(fixture("12001-lines.txt", long + "\nextra"));
  await page.getByRole("status").getByText("Revised text loaded from file.").waitFor();
  await button(page, "Compare text").click();
  await page.getByRole("alert").getByText(/Revised text exceeds 12,000 lines/).waitFor();
  assert.equal(await button(page, "Download report").count(), 0);

  await file(page, "original").setInputFiles(fixture("repeated-original.txt", "a\n".repeat(6000)));
  await page.getByRole("status").getByText("Original text loaded from file.").waitFor();
  await file(page, "revised").setInputFiles(fixture("repeated-revised.txt", "b\n".repeat(6000)));
  await page.getByRole("status").getByText("Revised text loaded from file.").waitFor();
  const readyWorker = page.waitForEvent("worker");
  await button(page, "Compare text").click();
  await readyWorker;
  await button(page, "Cancel comparison").click();
  await page.getByRole("status").getByText("Comparison cancelled.").waitFor();
  assert.equal(await button(page, "Download report").count(), 0);
  await button(page, "Compare text").click();
  await page.getByRole("alert").getByText(/comparison exceeded the time or edit limit/).waitFor();
  assert.equal(await button(page, "Download report").count(), 0);

  await page.route(workerUrl, (route) => route.fulfill({
    contentType: "application/javascript",
    body: "self.addEventListener('message', () => {});",
  }));
  await button(page, "Load example").click();
  await button(page, "Compare text").click();
  await page.getByRole("alert").getByText(/comparison timed out/).waitFor();
  assert.equal(await button(page, "Download report").count(), 0);
  await page.unroute(workerUrl);
  await button(page, "Compare text").click();
  await awaitResult(page, "2 change groups. 2 removed, 2 added.");
  await context.close();
  console.log("200% zoom, blocked clipboard, file errors and races, mixed-ending paste, 12,000 lines, worker cancellation and both time guards passed");
} finally {
  await browser.close();
  local?.close();
}
