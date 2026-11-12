// Usage: node tests/markdown-table.browser.mjs <build/client or preview URL> <playwright-core module path> <Chromium executable>
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


const sentinel = "PrivateMarkdownFixture";
const input = "| Name | City | Notes |\n| :--- | ---: | :---: |\n| Montréal | 東京 | red \\| blue |\n| \"" + sentinel + "\" | Paris | one&#10;two |";
const csv = 'Name,City,Notes\r\nMontréal,東京,red | blue\r\n"""' + sentinel + '""",Paris,"one\ntwo"\r\n';
const tsv = 'Name\tCity\tNotes\r\nMontréal\t東京\tred | blue\r\n"""' + sentinel + '"""\tParis\t"one\ntwo"\r\n';
const button = (page, name) => page.getByRole("button", { name, exact: true });
const editor = (page, name) => page.getByRole("textbox", { name, exact: true });
const lf = (value) => value.replace(/\r\n/g, "\n");

async function convert(page) {
  await button(page, "Convert table").click();
  await page.getByRole("status").getByText(/data rows, \d+ columns converted\./).waitFor();
}

async function download(page, format) {
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    button(page, "Download " + format).click(),
  ]);
  return { name: file.suggestedFilename(), bytes: await readFile(await file.path(), "utf8") };
}

async function assertReflow(page) {
  const { viewport, document, body } = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert.ok(document <= viewport && body <= viewport, "horizontal overflow " + JSON.stringify({ viewport, document, body }));
}

try {
  for (const width of [320, 375, 768, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, acceptDownloads: true });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const requests = [];
    const page = await context.newPage();
    page.on("request", (request) => requests.push(request.url() + " " + (request.postData() ?? "")));
    const errors = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    assert.equal((await page.goto(origin + "/markdown-table-converter/"))?.status(), 200);
    await page.waitForLoadState("networkidle");
    assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex,follow");
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://www.alltextconverters.com/markdown-table-converter/");
    assert.equal(await page.locator("[data-ad-placement]").count(), 0);
    assert.ok(!requests.some((request) => /\/assets\/markdown-table-(?!converter-)[^/]+\.js/.test(request)), "engine must load on conversion");
    const sitemap = await (await page.request.get(origin + "/sitemap.xml")).text();
    assert.ok(!sitemap.includes("markdown-table-converter"));
    assert.equal((sitemap.match(/<loc>/g) ?? []).length, 48);
    await assertReflow(page);

    await editor(page, "Markdown input").fill(input);
    await editor(page, "CSV output").focus();
    await page.keyboard.press("Tab");
    const convertButton = button(page, "Convert table");
    assert.ok(await convertButton.evaluate((element) => element === document.activeElement));
    assert.notEqual(await convertButton.evaluate((element) => getComputedStyle(element).outlineStyle), "none");
    await page.keyboard.press("Enter");
    await page.getByRole("status").getByText("2 data rows, 3 columns converted.").waitFor();
    assert.ok(requests.some((request) => /\/assets\/markdown-table-(?!converter-)[^/]+\.js/.test(request)));
    assert.equal(await editor(page, "CSV output").inputValue(), lf(csv));
    const preview = page.getByRole("region", { name: "Table preview" });
    const note = preview.getByRole("cell", { name: "red | blue", exact: true });
    assert.equal(await note.evaluate((element) => getComputedStyle(element).textAlign), "center");
    await button(page, "Copy CSV").click();
    await page.getByRole("status").getByText("CSV copied.").waitFor();
    assert.equal(lf(await page.evaluate(() => navigator.clipboard.readText())), lf(csv));
    assert.deepEqual(await download(page, "CSV"), { name: "converted-table.csv", bytes: csv });

    await page.getByLabel("Output format", { exact: true }).selectOption("tsv");
    assert.equal(await editor(page, "TSV output").inputValue(), "");
    assert.ok(await button(page, "Copy TSV").isDisabled());
    await convert(page);
    assert.deepEqual(await download(page, "TSV"), { name: "converted-table.tsv", bytes: tsv });

    await page.getByLabel("Open UTF-8 file").setInputFiles({ name: "roundtrip.tsv", mimeType: "text/tab-separated-values", buffer: Buffer.from("\uFEFF" + tsv) });
    await page.getByRole("status").getByText("File loaded into the source editor.").waitFor();
    assert.equal(await page.getByLabel("Source format", { exact: true }).inputValue(), "tsv");
    assert.ok(await button(page, "Download Markdown").isDisabled());
    await page.getByLabel("Markdown alignment").selectOption("right");
    await convert(page);
    const { name, bytes } = await download(page, "Markdown");
    assert.equal(name, "converted-table.md");
    assert.ok(bytes.includes("| ---: | ---: | ---: |"));
    assert.ok(bytes.includes("red \\| blue"));
    assert.ok(bytes.includes("one&#10;two"));
    await page.getByLabel("Open UTF-8 file").setInputFiles({ name, mimeType: "text/markdown", buffer: Buffer.from(bytes) });
    await page.getByRole("status").getByText("File loaded into the source editor.").waitFor();
    await page.getByLabel("Output format", { exact: true }).selectOption("csv");
    await convert(page);
    assert.deepEqual(await download(page, "CSV"), { name: "converted-table.csv", bytes: csv });

    const records = Array.from({ length: 32 }, (_, index) => "| " + sentinel + index + " | <img src=/fixture-request onerror=alert(1)> |").join("\n");
    await editor(page, "Markdown input").fill("| Id | Value |\n| --- | --- |\n" + records);
    await convert(page);
    assert.equal(await preview.locator("tbody tr").count(), 20);
    assert.equal(await preview.locator("img").count(), 0);
    assert.equal(await preview.getByText("<img src=/fixture-request onerror=alert(1)>", { exact: true }).count(), 20);
    const complete = (await download(page, "CSV")).bytes;
    assert.ok(complete.includes(sentinel + "31"));
    assert.equal(complete.split("\r\n").length, 34);
    await assertReflow(page);

    await editor(page, "Markdown input").fill("| A |\n| --- |\n| excess | column |");
    await button(page, "Convert table").click();
    await page.getByRole("alert").getByText(/Line 3 has more cells/).waitFor();
    assert.ok(await button(page, "Download CSV").isDisabled());
    await button(page, "Load example").click();
    await convert(page);
    await button(page, "Clear").click();
    assert.equal(await editor(page, "Markdown input").inputValue(), "");
    assert.equal(await editor(page, "CSV output").inputValue(), "");
    assert.ok(await button(page, "Convert table").isDisabled());

    assert.deepEqual(errors, []);
    assert.ok(!requests.some((request) => new RegExp(sentinel + "|fixture-request|googlesyndication|doubleclick|google-analytics|consentmanager", "i").test(request)));
    const storage = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
    assert.ok(!storage.includes(sentinel));
    await context.close();
    console.log(width + " px passed keyboard, CSV and TSV round trips, clipboard, full downloads, noindex, reflow and privacy");
  }

  const context = await browser.newContext({ viewport: { width: 640, height: 800 } });
  await context.addInitScript(() => Object.defineProperty(navigator, "clipboard", {
    value: { writeText: async () => { throw new Error("Blocked clipboard"); } },
  }));
  const page = await context.newPage();
  await page.goto(origin + "/list-to-table/");
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Markdown Table Converter", exact: true }).click();
  await page.waitForURL("**/markdown-table-converter/");
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await button(page, "Load example").click();
  await convert(page);
  await assertReflow(page);
  await button(page, "Copy CSV").click();
  await page.getByRole("status").getByText(/Automatic copy was unavailable/).waitFor();
  assert.ok(await editor(page, "CSV output").evaluate((element) =>
    element === document.activeElement && element.selectionStart === 0 && element.selectionEnd === element.value.length));
  await page.getByLabel("Open UTF-8 file").setInputFiles({ name: "invalid.csv", mimeType: "text/csv", buffer: Buffer.from([0xff]) });
  await page.getByRole("alert").getByText(/Could not read this file as UTF-8/).waitFor();
  assert.ok(await button(page, "Download CSV").isDisabled());
  await page.getByLabel("Open UTF-8 file").setInputFiles({ name: "too-large.csv", mimeType: "text/csv", buffer: Buffer.alloc(512 * 1024 + 1) });
  await page.getByRole("alert").getByText(/up to 512 KiB/).waitFor();
  await page.getByLabel("Source format", { exact: true }).selectOption("csv");
  await editor(page, "CSV input").fill("1,2\n3,4");
  await page.getByLabel("First row contains column headings").uncheck();
  await convert(page);
  assert.ok((await editor(page, "Markdown output").inputValue()).includes("| Column 1 | Column 2 |"));
  assert.ok((await editor(page, "Markdown output").inputValue()).includes("| 1 | 2 |"));
  await context.close();
  console.log("Related link, 200% zoom, blocked clipboard fallback, invalid and oversized files, and headerless conversion passed");
} finally {
  await browser.close();
  local?.close();
}
