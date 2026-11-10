// Usage: node tests/batch-text.browser.mjs <build/client or preview URL> <playwright-core module path> <Chromium executable>
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { createRequire } from "node:module";
import { unzipSync, strFromU8 } from "fflate";

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

function fixture(name, content) {
  return { name, mimeType: "text/plain", buffer: Buffer.from(content) };
}

async function download(page, name, filename) {
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name, exact: true }).click(),
  ]);
  assert.equal(file.suggestedFilename(), filename);
  return readFile(await file.path());
}

async function openPage(width) {
  const page = await browser.newPage({ viewport: { width, height: 800 }, acceptDownloads: true });
  const requestUrls = [];
  const pageErrors = [];
  page.on("request", (request) => requestUrls.push(request.url() + " " + (request.postData() ?? "")));
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  const response = await page.goto(origin + "/batch-text-files/", { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex,follow");
  assert.match(await page.locator('link[rel="canonical"]').getAttribute("href"), /alltextconverters\.com\/batch-text-files\/?$/);
  assert.equal(await page.locator("[data-ad-placement]").count(), 0);
  assert.ok(!requestUrls.some((url) => /batch-(?:text|zip)\.worker/.test(url)));
  return { page, requestUrls, pageErrors };
}

try {
  for (const width of [320, 375, 768, 1280, 1920]) {
    const { page, requestUrls, pageErrors } = await openPage(width);
    await page.keyboard.press("Tab");
    assert.equal(await page.evaluate(() => document.activeElement.textContent?.trim()), "Skip to content");
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => document.activeElement.id), "main-content");
    const input = page.getByLabel("Choose .txt files");
    await input.focus();
    assert.equal(await page.evaluate(() => document.activeElement.id), "batch-text-input");
    await input.setInputFiles([
      fixture("private-batch.txt", "α local-fixture-content\r\n東京\r東京\n"),
      fixture("PRIVATE-BATCH.txt", "أهلا\r\n"),
      fixture("bad.txt", [0xc3, 0x28]),
      fixture("empty.txt", ""),
    ]);
    await page.getByLabel("Transformation").selectOption("deduplicate-lines");
    const convert = page.getByRole("button", { name: "Convert files" });
    if (width === 320) await convert.evaluate((button) => { button.click(); button.click(); });
    else await convert.click();
    await page.getByRole("heading", { name: "File results · 3 ready" }).waitFor();
    await page.getByText("Last run · 4 of 4 files processed").waitFor();
    await page.getByText("Invalid UTF-8.", { exact: false }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(await page.locator("[data-ad-placement]").count(), 0);
    assert.ok(!requestUrls.some((url) => /batch-zip\.worker/.test(url)));

    const individual = await download(page, "Download private-batch-processed.txt", "private-batch-processed.txt");
    assert.equal(individual.toString("utf-8"), "α local-fixture-content\n東京\n");
    await page.getByRole("button", { name: "Prepare ZIP of ready files" }).click();
    await page.getByRole("button", { name: "Download ZIP" }).waitFor();
    const zip = await download(page, "Download ZIP", "processed-text-files.zip");
    const entries = unzipSync(zip);
    assert.equal(Object.keys(entries).length, 3);
    assert.equal(strFromU8(entries["PRIVATE-BATCH-processed-2.txt"]), "أهلا\n");
    assert.equal(entries["empty-processed.txt"].length, 0);
    assert.equal(entries["bad-processed.txt"], undefined);

    await page.getByRole("button", { name: "Retry bad.txt" }).click();
    await page.getByText("Last run · 1 of 1 files processed").waitFor();
    await page.getByRole("button", { name: "Prepare ZIP of ready files" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Download ZIP" }).count(), 0);
    await page.getByRole("button", { name: "Clear files and results" }).click();
    assert.equal(await page.getByRole("heading", { name: /File results/ }).count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.id), "batch-text-input");
    assert.ok(!requestUrls.some((url) => /local-fixture-content|private-batch\.txt/i.test(url)));
    assert.equal(await page.evaluate(() =>
      [localStorage, sessionStorage].some((storage) => JSON.stringify(storage).includes("local-fixture-content"))
    ), false);
    assert.deepEqual(pageErrors, []);
    await page.close();
    console.log(width + " px passed keyboard focus, 4-file conversion, ZIP, retry, clear and privacy checks");
  }

  const { page, pageErrors } = await openPage(320);
  const input = page.getByLabel("Choose .txt files");
  const corpus = Array.from({ length: 125000 }, (_, index) => "r" + index).join("\r\n");
  await input.setInputFiles([
    ...Array.from({ length: 16 }, (_, index) => fixture("row-" + index + ".txt", corpus)),
    ...Array.from({ length: 16 }, (_, index) => fixture("small-" + index + ".txt", "a\r\nb")),
    fixture("past-limit.txt", ""),
  ]);
  await page.getByText("Only the first 32 files were added.", { exact: true }).waitFor();
  await page.getByLabel("Transformation").selectOption("deduplicate-lines");

  // Click cancel on the first rendered ready row while the genuine worker processes the rest.
  await page.evaluate(() => {
    const observer = new MutationObserver(() => {
      if (!document.querySelector('button[aria-label="Download row-0-processed.txt"]')) return;
      const cancel = [...document.querySelectorAll("button")].find((button) => button.textContent === "Cancel");
      if (cancel) {
        observer.disconnect();
        cancel.click();
      }
    });
    observer.observe(document.querySelector("main"), { childList: true, subtree: true });
  });
  await page.getByRole("button", { name: "Convert files" }).click();
  await page.getByText("Conversion cancelled.", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Download row-0-processed.txt" }).waitFor();
  const cancelled = await page.getByText("Cancelled", { exact: true }).count();
  assert.ok(cancelled > 0 && cancelled < 32);
  await page.getByRole("button", { name: "Retry unfinished" }).click();
  await page.getByRole("heading", { name: "File results · 32 ready" }).waitFor();
  await page.getByRole("button", { name: "Clear files and results" }).click();
  const dropFiles = await page.evaluateHandle(() => {
    const data = new DataTransfer();
    data.items.add(new File(["new\rfile"], "dropped.txt", { type: "text/plain" }));
    data.items.add(new File([new Uint8Array(1024 * 1024 + 1)], "oversize.txt", { type: "text/plain" }));
    return data;
  });
  await input.dispatchEvent("drop", { dataTransfer: dropFiles });
  await page.getByText("This file exceeds the 1 MiB limit.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Convert files" }).click();
  await page.getByRole("heading", { name: "File results · 1 ready" }).waitFor();
  const dropped = await download(page, "Download dropped-processed.txt", "dropped-processed.txt");
  assert.equal(dropped.toString("utf-8"), "new\nfile");
  assert.deepEqual(pageErrors, []);
  console.log("32-file cap, genuine mid-run cancellation, partial retry, drag/drop and oversized file checks passed");
} finally {
  await browser.close();
  local?.close();
}
