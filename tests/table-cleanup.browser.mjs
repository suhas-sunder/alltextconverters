// node tests/table-cleanup.browser.mjs <build/client or preview URL> <playwright-core path> <Chromium executable>
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, resolve, sep } from "node:path";

const [target, playwrightPath, executablePath] = process.argv.slice(2);
if (!target || !playwrightPath || !executablePath) throw new Error("Pass build directory or preview URL, playwright-core path and Chromium executable.");

async function serveStatic(directory) {
  const root = resolve(directory);
  const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml" };
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
const sentinel = "PrivateCleanupFixture";
const fixture = 'id,id,note,hidden\n" b ",1," Québec ",m\nb,1,duplicate,x\n,," ",unused\n'
  + 'a,2,"=SUM(1,2)","line\n2"\na,3,null\nz,9,' + sentinel;
const csv = 'id,note,=Key\r\na,"=SUM(1,2)",2\r\na,null,3\r\nb,Québec,1\r\n';
const guardedCsv = "id,note,'=Key\r\na,\"'=SUM(1,2)\",2\r\na,null,3\r\nb,Québec,1\r\n";
const tsv = "id\tnote\t'=Key\r\na\t'=SUM(1,2)\t2\r\na\tnull\t3\r\nb\tQuébec\t1\r\n";
const lf = (text) => text.replace(/\r\n/g, "\n");

async function download(page, button, format) {
  const [result] = await Promise.all([page.waitForEvent("download"), button.click()]);
  assert.equal(result.suggestedFilename(), "table." + format);
  return readFile(await result.path(), "utf8");
}

async function run(width) {
  const context = await browser.newContext({ viewport: { width, height: 820 }, permissions: ["clipboard-read", "clipboard-write"] });
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(12_000);
    const requests = [];
    const errors = [];
    page.on("request", (request) => requests.push(request));
    page.on("pageerror", (error) => errors.push(error.message));
    assert.equal((await page.goto(origin + "/csv-to-list/", { waitUntil: "networkidle" })).status(), 200);
    assert.equal(requests.some((request) => request.url().includes("TableWorkspace")), false);
    await page.getByRole("button", { name: "Load example", exact: true }).click();
    await page.getByRole("button", { name: "Convert", exact: true }).click();
    assert.equal(await page.getByRole("textbox", { name: "List output", exact: true }).inputValue(), "Toronto, Ontario\nMontréal");
    const opener = page.getByRole("button", { name: "Open table workspace", exact: true });
    await opener.focus();
    await page.keyboard.press("Enter");
    const workspace = page.getByRole("region", { name: "Table workspace", exact: true });
    const button = (name) => workspace.getByRole("button", { name, exact: true });
    const source = workspace.getByRole("textbox", { name: "Workspace source", exact: true });
    const summary = workspace.getByText("Clean table data", { exact: true });
    const preview = workspace.getByRole("region", { name: "Scrollable output preview", exact: true });
    const pending = workspace.getByRole("region", { name: "Pending cleanup", exact: true });
    const status = workspace.getByRole("status");
    await source.fill(fixture);
    await button("Parse table").click();
    assert.match(await preview.locator("caption").textContent(), /6 of 6/);
    await summary.focus();
    await page.keyboard.press("Enter");
    await workspace.getByLabel("Exclude data rows").waitFor();
    await preview.getByRole("rowheader", { name: "6", exact: true }).waitFor();
    await workspace.getByLabel("Exclude data rows").fill("6");
    await workspace.getByLabel("Trim leading and trailing whitespace in data cells").check();
    await workspace.getByLabel("Remove rows blank in").selectOption("0");
    await workspace.getByLabel("Remove duplicate rows", { exact: true }).check();
    await button("Clear matching columns").click();
    const keys = workspace.getByRole("group", { name: "Match on these columns" });
    await keys.getByRole("checkbox", { name: "Column 1: id", exact: true }).check();
    await keys.getByRole("checkbox", { name: "Column 2: id", exact: true }).check();
    await workspace.getByLabel("Sort by column").selectOption("0");
    await workspace.getByLabel("Rename header").selectOption("1");
    await workspace.getByLabel("New header name").fill("=Key");
    const chooser = workspace.getByRole("group", { name: "Columns in output order" });
    await chooser.getByRole("checkbox", { name: "Column 4: hidden" }).uncheck();
    await chooser.getByRole("button", { name: "Move Column 3: note earlier" }).click();
    await button("Preview cleanup").focus();
    await page.keyboard.press("Enter");
    await pending.waitFor();
    assert.match(await pending.textContent(), /before 6, after 3/);
    assert.match(await pending.textContent(), /Excluded rows 1\. Blank rows removed 1\. Duplicates removed 1\. Cells trimmed 3\./);
    assert.match(await preview.locator("caption").textContent(), /Proposed cleanup preview/);
    assert.equal(await button("Copy CSV").isDisabled(), true);
    assert.equal(await button("Copy for spreadsheet").isDisabled(), true);
    assert.equal(await button("Download CSV").isDisabled(), true);
    assert.equal(await source.inputValue(), fixture);
    if (width === 320 && process.env.ATC_CLEANUP_SCREENSHOT) {
      await pending.screenshot({ path: process.env.ATC_CLEANUP_SCREENSHOT });
    }
    await button("Discard cleanup preview").click();
    assert.equal(await pending.count(), 0);
    assert.match(await preview.locator("caption").textContent(), /6 of 6/);
    assert.equal(await summary.evaluate((node) => node === document.activeElement), true);
    await button("Preview cleanup").click();
    await button("Apply cleanup to export").click();
    await status.filter({ hasText: "Cleanup applied to export. 3 data rows." }).waitFor();
    assert.equal(await preview.evaluate((node) => node === document.activeElement), true);
    assert.equal(await source.inputValue(), fixture);
    assert.match(await preview.locator("caption").textContent(), /3 of 3/);
    assert.equal(await download(page, button("Download CSV"), "csv"), csv);

    await workspace.getByLabel("Prefix formula-like text with an apostrophe").check();
    await workspace.getByText(/Apostrophes will prefix 2 formula-like cells/).waitFor();
    assert.equal(await download(page, button("Download CSV"), "csv"), guardedCsv);
    await workspace.getByLabel("Output format").selectOption("tsv");
    assert.equal(await download(page, button("Download TSV"), "tsv"), tsv);
    await button("Copy TSV").click();
    await status.filter({ hasText: "TSV copied." }).waitFor();
    assert.equal(lf(await page.evaluate(() => navigator.clipboard.readText())), lf(tsv));
    await button("Copy for spreadsheet").click();
    await status.filter({ hasText: "Spreadsheet table and TSV copied." }).waitFor();
    const clipboard = await page.evaluate(async () => {
      const [item] = await navigator.clipboard.read();
      const html = await (await item.getType("text/html")).text();
      const template = document.createElement("template");
      template.innerHTML = html;
      return {
        text: await (await item.getType("text/plain")).text(),
        rows: Array.from(template.content.querySelectorAll("tr"), (row) => Array.from(row.cells, (cell) => cell.textContent)),
      };
    });
    assert.equal(lf(clipboard.text), lf(tsv));
    assert.deepEqual(clipboard.rows, [["id", "note", "'=Key"], ["a", "'=SUM(1,2)", "2"], ["a", "null", "3"], ["b", "Québec", "1"]]);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);

    await workspace.getByLabel("Exclude data rows").fill("2");
    await button("Preview cleanup").click();
    await button("Apply cleanup to export").click();
    await status.filter({ hasText: "Cleanup applied to export. 2 data rows." }).waitFor();
    await button("Undo last cleanup").click();
    await status.filter({ hasText: "Last cleanup undone. 3 data rows." }).waitFor();
    assert.equal(await download(page, button("Download TSV"), "tsv"), tsv);
    await button("Reset all cleanup").click();
    await status.filter({ hasText: "All cleanup reset. 6 original data rows." }).waitFor();
    assert.equal(await source.inputValue(), fixture);
    assert.match(await preview.locator("caption").textContent(), /6 of 6/);
    assert.equal(await button("Undo last cleanup").count(), 0);

    if (width === 320) {
      await workspace.getByLabel("Exclude data rows").fill("8-7");
      await button("Preview cleanup").click();
      await workspace.getByRole("alert").filter({ hasText: "Choose data rows between 1 and 6" }).waitFor();
      await workspace.getByLabel("Exclude data rows").fill("2");
      await button("Preview cleanup").click();
      await pending.waitFor();
      await source.fill("id,name\n100,current");
      assert.equal(await pending.count(), 0);
      assert.equal(await button("Copy TSV").count(), 0);
      await button("Parse table").click();
      assert.match(await preview.locator("caption").textContent(), /1 of 1/);
      assert.equal(await button("Undo last cleanup").count(), 0);

      const original = "id,name\n" + Array.from({ length: 10_000 }, (_, row) => "ID-" + (row % 5000) + ',\" 東京 ' + row + ' \"').join("\n");
      await workspace.getByLabel("Open UTF-8 file").setInputFiles({ name: sentinel + ".csv", mimeType: "text/csv", buffer: Buffer.from(original) });
      await status.filter({ hasText: "File loaded." }).waitFor();
      await button("Parse table").click();
      await summary.click();
      await workspace.getByLabel("Trim leading and trailing whitespace in data cells").check();
      await workspace.getByLabel("Remove duplicate rows", { exact: true }).check();
      await button("Clear matching columns").click();
      await workspace.getByRole("group", { name: "Match on these columns" }).getByRole("checkbox", { name: "Column 1: id" }).check();
      const started = performance.now();
      await button("Preview cleanup").click();
      await pending.waitFor();
      console.log("10,000-row cleanup preview at 320 px in " + Math.round(performance.now() - started) + " ms (includes browser harness)");
      assert.match(await pending.textContent(), /before 10000, after 5000/);
      await button("Apply cleanup to export").click();
      assert.match(await preview.locator("caption").textContent(), /20 of 5000/);
      const full = await download(page, button("Download TSV"), "tsv");
      assert.equal(full.split("\r\n").length, 5002);
      assert.ok(full.endsWith("ID-4999\t東京 4999\r\n"));
      await page.evaluate(() => {
        Object.defineProperties(navigator.clipboard, {
          write: { configurable: true, value: () => Promise.reject(new Error("Denied")) },
          writeText: { configurable: true, value: () => Promise.reject(new Error("Denied")) },
        });
      });
      await button("Copy for spreadsheet").click();
      const fallback = workspace.getByRole("textbox", { name: "Spreadsheet TSV for manual copy" });
      await fallback.waitFor();
      assert.equal(lf(await fallback.inputValue()), lf(full));
      await fallback.focus();
      assert.deepEqual(await fallback.evaluate((node) => [node.selectionStart, node.selectionEnd]), [0, lf(full).length]);
    }
    assert.deepEqual(errors, []);
    assert.equal(requests.some((request) => (request.url() + (request.postData() ?? "")).includes(sentinel)), false);
    assert.equal(await page.evaluate((value) => JSON.stringify({ ...sessionStorage, ...localStorage }).includes(value), sentinel), false);
    console.log(width + " px passed keyboard and composable cleanup, source preservation, protected CSV/TSV/HTML, undo, reset and reflow");
  } finally {
    await context.close();
  }
}

try {
  for (const width of [320, 375, 768, 1280, 1920]) await run(width);
} finally {
  await browser.close();
  if (local) await new Promise((closed) => local.server.close(closed));
}
