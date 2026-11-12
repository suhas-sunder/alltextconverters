// node tests/document-import.browser.mjs <build/client or preview URL> <playwright-core path> <Chromium executable>
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, resolve, sep } from "node:path";
import { jsPDF } from "jspdf";
import { strToU8, zipSync } from "fflate";

const [target, playwrightPath, executablePath] = process.argv.slice(2);
if (!target || !playwrightPath || !executablePath) throw new Error("Pass build directory or preview URL, playwright-core path and Chromium executable.");
async function serveStatic(directory) {
  const root = resolve(directory);
  const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".xml": "application/xml", ".svg": "image/svg+xml" };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      let file = resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + sep)) throw new Error("Outside the build");
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      const contents = await readFile(file);
      response.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" }).end(contents);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((ready) => server.listen(0, "127.0.0.1", ready));
  return { server, origin: "http://127.0.0.1:" + server.address().port };
}

const local = /^https?:\/\//.test(target) ? null : await serveStatic(target);
const origin = local?.origin ?? target.replace(/\/+$/, "");
const { chromium } = createRequire(import.meta.url)(resolve(playwrightPath));
const browser = await chromium.launch({ executablePath, headless: true });
const privateText = "PrivateDocumentFixture";
const pdf = new jsPDF();
pdf.text(["First PDF line", "Deuxième ligne"], 20, 20);
pdf.addPage();
pdf.text(["Page two", privateText], 20, 20);
const pdfText = "First PDF line\nDeuxième ligne\n\nPage two\n" + privateText;
const locked = new jsPDF({ encryption: { userPassword: "fixture", ownerPassword: "fixture-owner", userPermissions: ["print"] } });
locked.text("Protected", 20, 20);
const scanned = new jsPDF();
scanned.rect(20, 20, 100, 100, "F");
const manyPages = new jsPDF();
for (let page = 1; page <= 200; page++) manyPages.addPage();
const relationship = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
const rels = (content) => '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + content + "</Relationships>";
const paragraph = (text) => "<w:p><w:r><w:t>" + text + "</w:t></w:r></w:p>";
const tableRow = (...cells) => "<w:tr>" + cells.map((cell) => "<w:tc>" + paragraph(cell) + "</w:tc>").join("") + "</w:tr>";
function docx(text) {
  const entries = {
    "[Content_Types].xml": '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    "_rels/.rels": rels('<Relationship Id="rId1" Type="' + relationship + 'officeDocument" Target="word/document.xml"/>'),
    "word/_rels/document.xml.rels": rels('<Relationship Id="rId2" Type="' + relationship + 'hyperlink" Target="https://example.invalid/' + privateText + '" TargetMode="External"/>'
      + '<Relationship Id="rId3" Type="' + relationship + 'image" Target="https://example.invalid/external.png" TargetMode="External"/>'),
    "word/document.xml": '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:v="urn:schemas-microsoft-com:vml"><w:body>'
      + paragraph(text) + "<w:tbl>" + tableRow("Name", "City") + tableRow("Zoë", "東京") + tableRow("Ana", "") + "</w:tbl>"
      + '<w:p><w:hyperlink r:id="rId2"><w:r><w:t>Reference text</w:t></w:r></w:hyperlink></w:p>'
      + '<w:p><w:r><w:pict><v:shape><v:imagedata r:id="rId3"/></v:shape></w:pict></w:r></w:p>'
      + "</w:body></w:document>",
  };
  return Buffer.from(zipSync(Object.fromEntries(Object.entries(entries).map(([name, value]) => [name, strToU8(value)]))));
}
const docxBytes = docx("Montréal 東京 😀");
const docxText = "Montréal 東京 😀\n\nName\tCity\nZoë\t東京\nAna\t\n\nReference text";
const pickerFile = (name, mimeType, buffer) => ({ name, mimeType, buffer: Buffer.from(buffer) });
const pdfFile = (name, doc) => pickerFile(name, "application/pdf", doc.output("arraybuffer"));
const wordFile = (name, bytes) => pickerFile(name, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", bytes);
const heavy = /(?:pdf(?:\.worker)?[.-]|mammoth|docx-text-import\.worker)/i;

async function chooseFileFromKeyboard(page, upload) {
  // The prerendered button can appear before hydration attaches its file picker handler.
  for (const key of ["Enter", "Space", "Enter"]) {
    const chooser = page.waitForEvent("filechooser", { timeout: 2500 }).catch(() => null);
    await upload.press(key);
    const result = await chooser;
    if (result) return result;
  }
  throw new Error("Keyboard activation did not open the file chooser.");
}

async function run(width) {
  const context = await browser.newContext({ viewport: { width, height: 830 }, permissions: ["clipboard-read", "clipboard-write"] });
  try {
    await context.addInitScript(() => {
      const NativeWorker = window.Worker;
      window.terminatedFixtureDocxWorkers = 0;
      window.terminatedFixturePdfWorkers = 0;
      window.Worker = class FixtureWorker extends NativeWorker {
        constructor(url, options) {
          super(url, options);
          this.documentFixture = String(url).includes("docx-text-import.worker");
          this.pdfFixture = String(url).includes("pdf.worker");
        }
        postMessage(...args) {
          if (this.documentFixture && window.holdFixtureDocx) { window.fixtureWorkerWaiting = true; return; }
          if (this.pdfFixture && window.holdFixturePdf) { window.fixturePdfWorkerWaiting = true; return; }
          super.postMessage(...args);
        }
        terminate() {
          if (this.documentFixture) window.terminatedFixtureDocxWorkers++;
          if (this.pdfFixture) window.terminatedFixturePdfWorkers++;
          super.terminate();
        }
      };
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    const requests = [];
    const errors = [];
    page.on("request", (request) => requests.push(request));
    page.on("pageerror", (error) => errors.push(error.message));
    assert.equal((await page.goto(origin + "/", { waitUntil: "networkidle" })).status(), 200);
    assert.equal(requests.some((request) => heavy.test(request.url())), false);
    const editor = page.getByRole("textbox", { name: "Text editor input" });
    const picker = page.locator("main input[type=file]").first();
    const upload = page.getByRole("button", { name: /Upload \(/ });
    const status = (message) => page.getByRole("status").filter({ hasText: message });
    const error = (message) => page.getByRole("alert").filter({ hasText: message });
    const chooser = await chooseFileFromKeyboard(page, upload);
    await chooser.setFiles(pickerFile("sample.txt", "text/plain", "original\r\n東京"));
    await status("File loaded locally.").waitFor();
    assert.equal(await editor.inputValue(), "original\n東京");
    assert.equal(requests.some((request) => heavy.test(request.url())), false);
    await picker.setInputFiles(pdfFile(privateText + ".pdf", pdf));
    await status("File loaded locally.").waitFor();
    assert.equal(await editor.inputValue(), pdfText);
    assert.ok(requests.some((request) => /pdf\.worker/i.test(request.url())));
    assert.equal(requests.some((request) => /mammoth|docx-text-import\.worker/i.test(request.url())), false);

    await picker.setInputFiles(wordFile("table.docx", docxBytes));
    await status("File loaded locally.").waitFor();
    assert.equal(await editor.inputValue(), docxText);
    await page.getByRole("button", { name: /Copy Text/ }).click();
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replaceAll("\r\n", "\n"), docxText);
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download TXT", exact: true }).click()]);
    assert.equal(download.suggestedFilename(), "alltextconverters-text.txt");
    const output = await readFile(await download.path());
    assert.deepEqual(output, Buffer.from(docxText));
    await picker.setInputFiles(pickerFile(download.suggestedFilename(), "text/plain", output));
    await status("File loaded locally.").waitFor();
    assert.equal(await editor.inputValue(), docxText);

    await picker.setInputFiles(pdfFile("locked.pdf", locked));
    await error("password protected").waitFor();
    assert.equal(await editor.inputValue(), docxText);
    await picker.setInputFiles(pickerFile("bad.pdf", "application/pdf", "%PDF-1.7\nbroken body"));
    await error("may be damaged").waitFor();
    await picker.setInputFiles(pdfFile("scan.pdf", scanned));
    await error("no selectable text").waitFor();
    await picker.setInputFiles(wordFile("broken.docx", new Uint8Array([80, 75, 3, 4, 0, 0, 0])));
    await error("DOCX could not be opened").waitFor();

    await page.evaluate(() => { window.holdFixtureDocx = true; });
    await picker.setInputFiles(wordFile("cancel.docx", docxBytes));
    await page.waitForFunction(() => window.fixtureWorkerWaiting === true);
    const terminated = await page.evaluate(() => window.terminatedFixtureDocxWorkers);
    await page.getByRole("button", { name: "Cancel file import" }).click();
    await status("File import canceled.").waitFor();
    assert.equal(await upload.evaluate((node) => node === document.activeElement), true);
    assert.equal(await page.evaluate(() => window.terminatedFixtureDocxWorkers), terminated + 1);
    assert.equal(await editor.inputValue(), docxText);
    await page.evaluate(() => { window.holdFixtureDocx = false; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);

    if (width === 320) {
      await page.evaluate(() => { window.holdFixturePdf = true; });
      await picker.setInputFiles(pdfFile("cancel.pdf", pdf));
      await page.waitForFunction(() => window.fixturePdfWorkerWaiting === true);
      const pdfWorkers = await page.evaluate(() => window.terminatedFixturePdfWorkers);
      await page.getByRole("button", { name: "Cancel file import" }).click();
      await status("File import canceled.").waitFor();
      assert.equal(await page.evaluate(() => window.terminatedFixturePdfWorkers), pdfWorkers + 1);
      assert.equal(await editor.inputValue(), docxText);
      await page.evaluate(() => { window.holdFixturePdf = false; });
      await picker.setInputFiles(pdfFile("too-many-pages.pdf", manyPages));
      await error("200 pages or fewer").waitFor();
      await picker.setInputFiles(wordFile("expanded.docx", docx("x".repeat(16 * 1024 * 1024))));
      await error("expanded DOCX text parts exceed").waitFor();
      await picker.setInputFiles(pickerFile("bad.txt", "text/plain", new Uint8Array([0xff])));
      await error("not valid UTF-8").waitFor();
      await editor.evaluate((node) => {
        const files = new DataTransfer();
        files.items.add(new File(["Dropped 東京"], "drop.txt", { type: "text/plain" }));
        node.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: files }));
      });
      await status("File loaded locally.").waitFor();
      assert.equal(await editor.inputValue(), "Dropped 東京");

      await page.goto(origin + "/byte-counter/");
      await page.locator("main input[type=file]").setInputFiles(wordFile("counter.docx", docxBytes));
      await status("File loaded locally.").waitFor();
      assert.equal(await page.getByLabel("Text to count").inputValue(), docxText);
      await page.locator("main input[type=file]").setInputFiles(pickerFile("native.txt", "text/plain", "a\r\nb"));
      await status("File loaded locally.").waitFor();
      assert.equal(await page.getByLabel("Text to count").inputValue(), "a\nb");
      await page.getByText("UTF-8 bytes", { exact: true }).first().waitFor();
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    assert.deepEqual(errors, []);
    assert.equal(requests.some((request) => (request.url() + (request.postData() ?? "")).includes(privateText)), false);
    assert.equal(requests.some((request) => new URL(request.url()).hostname === "example.invalid"), false);
    assert.equal(await page.evaluate((text) => JSON.stringify({ ...localStorage, ...sessionStorage }).includes(text), privateText), false);
    console.log(width + " px passed lazy imports, page and line order, DOCX tables, malformed/password/scanned PDF, cancellation and exact TXT round-trip");
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
