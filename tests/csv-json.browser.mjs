// node tests/csv-json.browser.mjs <build/client or preview URL> <playwright-core path> <Chromium executable>
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, resolve, sep } from "node:path";

const [target, playwrightPath, executablePath] = process.argv.slice(2);
if (!target || !playwrightPath || !executablePath) throw new Error("Pass build directory or preview URL, playwright-core path and Chromium executable.");

async function serveStatic(directory) {
  const root = resolve(directory);
  const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".xml": "application/xml", ".svg": "image/svg+xml" };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      let file = resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + sep)) throw new Error("Outside the build");
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      const contents = await readFile(file);
      response.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" }).end(contents);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
  return { server, origin: "http://127.0.0.1:" + server.address().port };
}

const local = /^https?:\/\//.test(target) ? null : await serveStatic(target);
const origin = local?.origin ?? target.replace(/\/+$/, "");
const { chromium } = createRequire(import.meta.url)(resolve(playwrightPath));
const browser = await chromium.launch({ executablePath, headless: true });
const path = "/csv-json-converter/";
const sentinel = "PrivateCsvJsonFixture";
const lf = (text) => text.replace(/\r\n/g, "\n");
const file = (name, mimeType, text) => ({ name, mimeType, buffer: Buffer.from(text) });

async function download(page, name, type, extension) {
  const [result] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name, exact: true }).click(),
  ]);
  assert.equal(result.suggestedFilename(), "converted." + extension);
  assert.equal(await page.evaluate(() => window.lastFixtureBlobType), type + ";charset=utf-8");
  return readFile(await result.path(), "utf8");
}

async function run(width) {
  const context = await browser.newContext({ viewport: { width, height: 850 }, permissions: ["clipboard-read", "clipboard-write"] });
  try {
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => requests.push(request));
    assert.equal((await page.goto(origin + "/csv-to-list/")).status(), 200);
    const legacy = page.getByRole("textbox", { name: "CSV or delimited text" });
    await legacy.fill("label,city\none,Paris\ntwo,Tokyo");
    await page.getByRole("button", { name: "Convert", exact: true }).click();
    assert.equal(await page.getByRole("textbox", { name: "List output" }).inputValue(), "label\none\ntwo");
    const link = page.getByRole("link", { name: "CSV and JSON Converter" });
    await link.focus();
    await page.keyboard.press("Enter");
    await page.waitForURL("**" + path);
    await page.getByRole("heading", { name: "CSV and JSON Converter", exact: true }).waitFor();
    assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex,follow");
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://www.alltextconverters.com" + path);
    assert.equal(await page.locator("[data-ad-placement]").count(), 0);
    await page.evaluate(() => {
      const create = URL.createObjectURL;
      URL.createObjectURL = function (blob) {
        window.lastFixtureBlobType = blob.type;
        return create.call(this, blob);
      };
    });

    const direction = page.getByLabel("Direction");
    const source = page.getByRole("textbox", { name: "Source text", exact: true });
    const preview = page.getByRole("textbox", { name: "Output preview", exact: true });
    const open = page.getByLabel("Open UTF-8 file");
    const convert = page.getByRole("button", { name: "Convert table", exact: true });
    const status = page.getByRole("region", { name: "Convert a table" }).getByRole("status");
    assert.equal(await direction.inputValue(), "csv-to-json");
    const pasted = 'id,id,id_2,note\r\n0012,東京,,"' + sentinel + '\r\nline ""2"""\r\n0013,Montréal';
    await page.evaluate((value) => navigator.clipboard.writeText(value), pasted);
    await source.focus();
    await page.keyboard.press("Control+v");
    await convert.focus();
    await page.keyboard.press("Enter");
    await status.filter({ hasText: "Converted 2 rows and 4 columns." }).waitFor();
    const converted = await preview.inputValue();
    assert.deepEqual(JSON.parse(converted), [
      { id: "0012", id_3: "東京", id_2: "", note: sentinel + '\nline "2"' },
      { id: "0013", id_3: "Montréal", id_2: null, note: null },
    ]);
    await page.getByText("Blank, duplicate, or missing headers received unique names.").waitFor();
    await page.getByRole("button", { name: "Copy JSON", exact: true }).click();
    await status.filter({ hasText: "Full JSON copied." }).waitFor();
    assert.equal(lf(await page.evaluate(() => navigator.clipboard.readText())), converted);
    assert.equal(await download(page, "Download JSON", "application/json", "json"), converted);
    const primary = await convert.evaluate((node) => ({ background: getComputedStyle(node).backgroundColor, foreground: getComputedStyle(node).color }));
    assert.notEqual(primary.background, primary.foreground);

    await page.getByRole("button", { name: "Use result as source" }).click();
    assert.equal(await direction.inputValue(), "json-to-csv");
    assert.equal(await source.inputValue(), converted);
    assert.equal(await source.evaluate((node) => document.activeElement === node), true);
    const input = '\uFEFF[{"id":9007199254740993,"nested":{"n":1e999},"note":"=1+2"},{"id":-0,"city":"東京\\tQuébec","note":null}]';
    await open.setInputFiles(file(sentinel + ".json", "application/json", input));
    await status.filter({ hasText: "File loaded." }).waitFor();
    await convert.click();
    const expectedCsv = 'id,nested,note,city\r\n9007199254740993,"{""n"":1e999}",=1+2,\r\n-0,,null,東京\tQuébec\r\n';
    assert.equal(await preview.inputValue(), lf(expectedCsv));
    await page.getByText(/interpret formula-like text in 1 cell/).waitFor();
    assert.equal(await download(page, "Download CSV", "text/csv", "csv"), expectedCsv);
    await page.getByLabel("Nested values").selectOption("reject");
    assert.equal(await preview.count(), 0);
    await convert.click();
    await page.getByRole("alert").filter({ hasText: "Nested JSON at record 1, column 2." }).waitFor();
    await page.getByLabel("Nested values").selectOption("json");
    await page.getByLabel("Output delimiter").selectOption("\t");
    await page.getByLabel("Include column headers").uncheck();
    await page.getByLabel("Prefix formula-like text with an apostrophe").check();
    await convert.click();
    const expectedTsv = '9007199254740993\t"{""n"":1e999}"\t\'=1+2\t\r\n-0\t\tnull\t"東京\tQuébec"\r\n';
    assert.equal(await download(page, "Download TSV", "text/tab-separated-values", "tsv"), expectedTsv);
    await page.getByRole("button", { name: "Copy TSV", exact: true }).click();
    await status.filter({ hasText: "Full TSV copied." }).waitFor();
    assert.equal(lf(await page.evaluate(() => navigator.clipboard.readText())), lf(expectedTsv));
    await page.getByRole("button", { name: "Use result as source" }).click();
    assert.equal(await direction.inputValue(), "csv-to-json");
    assert.equal(await page.getByLabel("Source delimiter").inputValue(), "\t");
    assert.equal(await page.getByLabel("First record contains headers").isChecked(), false);
    assert.equal(await preview.count(), 0);

    if (width === 320) {
      await open.setInputFiles(file("sample.tsv", "text/tab-separated-values", '2\t003\tfalse\r\n10\t"東京\tQuébec"\ttrue'));
      await status.filter({ hasText: "File loaded." }).waitFor();
      assert.equal(await page.getByLabel("Source delimiter").inputValue(), "\t");
      await page.getByLabel("JSON structure").selectOption("arrays");
      await page.getByLabel("Interpret valid JSON values in cells").check();
      await page.getByLabel("Sort by the first column as text").check();
      await convert.click();
      assert.deepEqual(JSON.parse(await preview.inputValue()), [[10, "東京\tQuébec", true], [2, "003", false]]);
      await page.getByLabel("JSON structure").selectOption("objects");
      await page.getByLabel("Interpret valid JSON values in cells").uncheck();
      await page.getByLabel("Sort by the first column as text").uncheck();

      await open.setInputFiles(file("bad.csv", "text/csv", new Uint8Array([0xff])));
      await page.getByRole("alert").filter({ hasText: "could not be read as UTF-8" }).waitFor();
      await page.evaluate(() => {
        const original = File.prototype.arrayBuffer;
        File.prototype.arrayBuffer = function () {
          if (this.name === "delayed.csv") {
            return new Promise((ready) => { window.finishDelayedFixture = () => original.call(this).then(ready); });
          }
          return original.call(this);
        };
      });
      await open.setInputFiles(file("delayed.csv", "text/csv", "stale data"));
      await status.filter({ hasText: "Reading file." }).waitFor();
      assert.equal(await convert.isDisabled(), true);
      await source.fill("current source");
      await page.evaluate(() => window.finishDelayedFixture());
      assert.equal(await source.inputValue(), "current source");

      await page.getByLabel("Source delimiter").selectOption(",");
      const full = Array.from({ length: 20_000 }, (_, index) => sentinel + "-" + index).join("\n");
      await open.setInputFiles(file("large.csv", "text/csv", full));
      await status.filter({ hasText: "File loaded." }).waitFor();
      await convert.click();
      await page.getByText(/Preview shows the first 16,000 characters/).waitFor();
      assert.equal((await preview.inputValue()).length, 16_000);
      const fullOutput = await download(page, "Download JSON", "application/json", "json");
      assert.equal(JSON.parse(fullOutput).length, 20_000);
      assert.equal(JSON.parse(fullOutput).at(-1)["Column 1"], sentinel + "-19999");
      await page.evaluate(() => {
        Object.defineProperty(navigator.clipboard, "writeText", { value: () => Promise.reject(new Error("Blocked")), configurable: true });
      });
      await page.getByRole("button", { name: "Copy JSON", exact: true }).click();
      await status.filter({ hasText: "Clipboard access failed. Download the full JSON instead." }).waitFor();
      await page.evaluate(() => { delete navigator.clipboard.writeText; });
      await page.getByRole("button", { name: "Copy JSON", exact: true }).click();
      await status.filter({ hasText: "Full JSON copied." }).waitFor();
      assert.equal(lf(await page.evaluate(() => navigator.clipboard.readText())), fullOutput);

      for (const bytes of [10_240, 102_400, 1_048_576]) {
        await open.setInputFiles(file("size-check.csv", "text/csv", "x".repeat(bytes)));
        await status.filter({ hasText: "File loaded." }).waitFor();
        const start = performance.now();
        await convert.click();
        await status.filter({ hasText: "Converted 1 row and 1 column." }).waitFor();
        console.log(bytes + " source bytes converted at 320 px in " + Math.round(performance.now() - start) + " ms (includes browser harness)");
      }
      await open.setInputFiles(file("oversized.csv", "text/csv", "x".repeat(1_048_577)));
      await page.getByRole("alert").filter({ hasText: "1 MiB or less." }).waitFor();
      assert.equal(await preview.count(), 0);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    assert.deepEqual(errors, []);
    assert.equal(requests.some((request) => (request.url() + (request.postData() ?? "")).includes(sentinel)), false);
    assert.equal(requests.some((request) => /googlesyndication|doubleclick|google-analytics|googletagmanager/.test(request.url())), false);
    assert.equal(await page.evaluate((value) => JSON.stringify({ ...sessionStorage, ...localStorage }).includes(value), sentinel), false);
    console.log(width + " px passed keyboard navigation, CSV paste, JSON file, exact copy/download, error states and reflow");
  } finally {
    await context.close();
  }
}

try {
  for (const width of [320, 375, 768, 1280, 1920]) await run(width);
  const noScript = await browser.newPage({ javaScriptEnabled: false });
  assert.equal((await noScript.goto(origin + path)).status(), 200);
  await noScript.getByRole("heading", { name: "CSV and JSON Converter" }).waitFor();
  await noScript.getByRole("heading", { name: "How values are converted" }).waitFor();
  assert.doesNotMatch(await (await fetch(origin + "/sitemap.xml")).text(), /csv-json-converter/);
  await noScript.close();
} finally {
  await browser.close();
  if (local) await new Promise((closed) => local.server.close(closed));
}
