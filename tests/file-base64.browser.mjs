// Usage: node tests/file-base64.browser.mjs <build/client or preview URL> <playwright-core module path> <Chromium executable>
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { zipSync } from "fflate";
import { jsPDF } from "jspdf";
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



const workerUrl = /\/assets\/file-base64\.worker-[^/]+\.js/;
const route = "/file-base64-converter/";
const marker = "PrivateBase64Fixture";
const probe = "/file-base64-unsafe-probe";
const button = (page, name) => page.getByRole("button", { name, exact: true });
const field = (page, name) => page.getByLabel(name, { exact: true });
const encodeFile = (page) => field(page, "Open binary file");
const decodeFile = (page) => field(page, "Open Base64 text file");
const pasted = (page) => page.getByRole("textbox", { name: "Paste Base64 text or a data URI", exact: true });
const fixture = (name, content, mimeType = "application/octet-stream") => ({ name, mimeType, buffer: Buffer.from(content) });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function visit(context, path = route) {
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  assert.equal((await page.goto(origin + path))?.status(), 200);
  await page.waitForLoadState("networkidle");
  return page;
}

async function reflow(page) {
  const widths = await page.evaluate(() => [document.documentElement.clientWidth, document.documentElement.scrollWidth, document.body.scrollWidth]);
  assert.ok(widths[1] <= widths[0] && widths[2] <= widths[0], "horizontal overflow " + JSON.stringify(widths));
}

async function waitFor(page, state) {
  await page.getByRole("status").getByText(state, { exact: true }).waitFor();
}

async function download(page, name) {
  const [file] = await Promise.all([page.waitForEvent("download"), button(page, name).click()]);
  return { name: file.suggestedFilename(), bytes: await readFile(await file.path()) };
}

async function captureTypes(context) {
  await context.addInitScript(() => {
    const create = URL.createObjectURL;
    window.atcDownloadedMime = [];
    URL.createObjectURL = function (blob) {
      window.atcDownloadedMime.push(blob.type);
      return create.call(URL, blob);
    };
  });
}

const binary = Buffer.from(Array.from({ length: 256 }, (_, index) => index));
const html = Buffer.from('<img src="' + probe + '"><script>window.atcBinaryExecuted=true</script>');
const pdfDoc = new jsPDF();
pdfDoc.text("Local binary fixture", 10, 10);
const pdf = Buffer.from(pdfDoc.output("arraybuffer"));
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lS8AAAAASUVORK5CYII=", "base64");
const zip = Buffer.from(zipSync({ "data.bin": binary }));
const formats = [
  { buffer: png, media: "image/png", extension: "png" },
  { buffer: pdf, media: "application/pdf", extension: "pdf" },
  { buffer: zip, media: "application/zip", extension: "zip" },
];

try {
  for (const width of [320, 375, 768, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 800 }, acceptDownloads: true });
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await captureTypes(context);
    const requests = [];
    const errors = [];
    context.on("request", (request) => requests.push(request.url() + " " + (request.postData() ?? "")));
    const page = await visit(context);
    page.on("pageerror", (error) => errors.push(String(error)));
    assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex,follow");
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://www.alltextconverters.com/file-base64-converter/");
    assert.equal(await page.locator("[data-ad-placement]").count(), 0);
    assert.ok(!requests.some((request) => workerUrl.test(request)));
    const sitemap = await (await page.request.get(origin + "/sitemap.xml")).text();
    assert.equal((sitemap.match(/<loc>/g) ?? []).length, 48);
    assert.ok(!sitemap.includes(route));
    await reflow(page);

    await encodeFile(page).setInputFiles(fixture(marker + ".bin", binary));
    await encodeFile(page).focus();
    await page.keyboard.press("Tab");
    const encode = button(page, "Encode file");
    assert.ok(await encode.evaluate((element) => element === document.activeElement));
    assert.notEqual(await encode.evaluate((element) => getComputedStyle(element).outlineStyle), "none");
    await page.keyboard.press("Enter");
    await waitFor(page, "Base64 is ready.");
    assert.ok(requests.some((request) => workerUrl.test(request)));
    assert.equal(await page.getByLabel("Base64 preview").textContent(), binary.toString("base64"));
    const textDownload = await download(page, "Download Base64 text");
    assert.equal(textDownload.name, marker + "_bin.base64.txt");
    assert.equal(textDownload.bytes.toString(), binary.toString("base64"));
    assert.equal(await page.evaluate(() => window.atcDownloadedMime.at(-1)), "text/plain");
    await button(page, "Copy full Base64").click();
    await waitFor(page, "Full Base64 copied.");
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), binary.toString("base64"));

    await field(page, "Encoding format").selectOption("url-safe");
    assert.equal(await button(page, "Download Base64 text").count(), 0);
    await encode.click();
    await waitFor(page, "Base64 is ready.");
    const urlSafe = (await download(page, "Download Base64 text")).bytes;
    assert.equal(urlSafe.toString(), binary.toString("base64url"));

    const known = formats[[320, 375, 768, 1280, 1920].indexOf(width) % formats.length];
    await field(page, "Encoding format").selectOption("data-uri");
    await encodeFile(page).setInputFiles(fixture(marker + "." + known.extension, known.buffer, known.media));
    await encode.click();
    await waitFor(page, "Base64 is ready.");
    const uri = await download(page, "Download Base64 text");
    assert.equal(uri.bytes.toString(), "data:" + known.media + ";base64," + known.buffer.toString("base64"));
    assert.equal(await page.locator('a[href^="data:"]').count(), 0);

    await field(page, "Convert").selectOption("decode");
    assert.equal(await button(page, "Download Base64 text").count(), 0);
    await field(page, "Base64 alphabet").selectOption("url-safe");
    await decodeFile(page).setInputFiles(fixture(marker + ".b64", urlSafe, "text/plain"));
    await button(page, "Decode to file").click();
    await waitFor(page, "Decoded file is ready.");
    const decoded = await download(page, "Download decoded file");
    assert.equal(decoded.name, "decoded-file.bin");
    assert.deepEqual(decoded.bytes, binary);
    assert.equal(await page.evaluate(() => window.atcDownloadedMime.at(-1)), "application/octet-stream");

    await decodeFile(page).setInputFiles(fixture(marker + ".datauri", uri.bytes, "text/plain"));
    await field(page, "File extension").selectOption("declared");
    await button(page, "Decode to file").click();
    await waitFor(page, "Decoded file is ready.");
    const restored = await download(page, "Download decoded file");
    assert.equal(restored.name, "decoded-file." + known.extension);
    assert.deepEqual(restored.bytes, known.buffer);
    await reflow(page);

    await pasted(page).fill("data:text/html;base64," + html.toString("base64"));
    await field(page, "File name without extension").fill("../NUL\\payload\u202e.html.exe");
    await button(page, "Decode to file").click();
    await waitFor(page, "Decoded file is ready.");
    const unsafe = await download(page, "Download decoded file");
    assert.equal(unsafe.name, "NUL_payload__html_exe.bin");
    assert.deepEqual(unsafe.bytes, html);
    assert.equal(await page.evaluate(() => Boolean(window.atcBinaryExecuted)), false);
    assert.equal(await page.locator('img[src="' + probe + '"]').count(), 0);
    assert.equal(await page.evaluate(() => window.atcDownloadedMime.at(-1)), "application/octet-stream");

    await pasted(page).fill("https://example.invalid/" + marker);
    await button(page, "Decode to file").click();
    await page.getByRole("alert").getByText(/External URLs cannot be opened here/).waitFor();
    assert.equal(await button(page, "Download decoded file").count(), 0);
    await pasted(page).fill("AB==");
    await button(page, "Decode to file").click();
    await page.getByRole("alert").getByText(/non-zero trailing bits/).waitFor();
    await button(page, "Clear").click();
    await field(page, "File extension").selectOption("bin");
    await field(page, "File name without extension").fill("NUL");
    await button(page, "Decode to file").click();
    await waitFor(page, "Decoded file is ready.");
    assert.deepEqual(await download(page, "Download decoded file"), { name: "decoded-file.bin", bytes: Buffer.alloc(0) });

    await field(page, "Convert").selectOption("encode");
    await field(page, "Encoding format").selectOption("standard");
    await encodeFile(page).setInputFiles(fixture("empty", Buffer.alloc(0)));
    await button(page, "Encode file").click();
    await waitFor(page, "Base64 is ready.");
    assert.deepEqual(await download(page, "Download Base64 text"), { name: "empty.base64.txt", bytes: Buffer.alloc(0) });
    await reflow(page);
    assert.deepEqual(errors, []);
    assert.ok(!requests.some((request) => new RegExp(marker + "|" + probe + "|googlesyndication|doubleclick|google-analytics|consentmanager", "i").test(request)));
    const storage = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
    assert.ok(!storage.includes(marker));
    await context.close();
    console.log(width + " px passed three output formats, exact binary bytes, clipboard, empty data, hostile filenames and URLs, keyboard, reflow and privacy");
  }

  const context = await browser.newContext({ viewport: { width: 640, height: 800 }, acceptDownloads: true });
  await context.addInitScript(() => {
    const fail = async () => { throw new Error("Clipboard denied"); };
    Object.defineProperty(navigator, "clipboard", { value: { write: fail, writeText: fail } });
  });
  const page = await visit(context, "/base64-encode/");
  await page.getByRole("link", { name: "File Base64 Converter", exact: true }).click();
  await page.waitForURL("**/file-base64-converter/");
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await encodeFile(page).evaluate((field) => {
    const drop = new DataTransfer();
    drop.items.add(new File([new Uint8Array([0, 1, 2, 255])], "dropped.bin"));
    field.parentElement.dispatchEvent(new DragEvent("drop", { dataTransfer: drop, cancelable: true, bubbles: true }));
  });
  await page.getByText("dropped.bin", { exact: true }).waitFor();
  await button(page, "Encode file").click();
  await waitFor(page, "Base64 is ready.");
  await button(page, "Copy full Base64").click();
  await waitFor(page, "Automatic copy was unavailable. Download the Base64 text instead.");
  assert.equal((await download(page, "Download Base64 text")).bytes.toString(), "AAEC/w==");
  await reflow(page);

  await page.setViewportSize({ width: 320, height: 800 });
  await page.evaluate(() => { document.documentElement.style.zoom = ""; });
  const limit = 12 * 1024 * 1024;
  await encodeFile(page).setInputFiles(fixture("too-large.bin", Buffer.alloc(limit + 1)));
  await page.getByRole("alert").getByText(/up to 12 MiB/).waitFor();
  assert.ok(await button(page, "Encode file").isDisabled());

  const large = Buffer.allocUnsafe(limit);
  for (let index = 0; index < large.length; index += 1) large[index] = (index * 31 + (index >>> 8)) & 255;
  await encodeFile(page).setInputFiles(fixture("full-binary.bin", large));
  const activeWorker = page.waitForEvent("worker");
  await button(page, "Encode file").click();
  await activeWorker;
  await page.waitForFunction(() => {
    const progress = document.querySelector("progress");
    return progress && progress.value > 0 && progress.value < 100;
  });
  await button(page, "Cancel conversion").click();
  await waitFor(page, "Conversion cancelled.");
  assert.equal(await button(page, "Download Base64 text").count(), 0);
  const encodeStart = performance.now();
  await button(page, "Encode file").click();
  await waitFor(page, "Base64 is ready.");
  const encodeMs = Math.round(performance.now() - encodeStart);
  assert.equal((await page.getByLabel("Base64 preview").textContent()).length, 2048);
  const largeOutput = await download(page, "Download Base64 text");
  assert.equal(largeOutput.bytes.length, 16 * 1024 * 1024);
  assert.equal(hash(largeOutput.bytes), hash(Buffer.from(large.toString("base64"))));
  await reflow(page);

  await field(page, "Convert").selectOption("decode");
  await decodeFile(page).setInputFiles(fixture("invalid-base64.txt", [0xff], "text/plain"));
  await button(page, "Decode to file").click();
  await page.getByRole("alert").getByText(/not valid UTF-8/).waitFor();
  await button(page, "Load decode example").click();
  await button(page, "Decode to file").click();
  await waitFor(page, "Decoded file is ready.");
  assert.deepEqual((await download(page, "Download decoded file")).bytes, Buffer.from([0, 1, 2, 3, 254, 255]));
  await pasted(page).evaluate((field) => {
    field.focus();
    const clipboard = new DataTransfer();
    clipboard.setData("text/plain", "A".repeat(512 * 1024 + 1));
    field.dispatchEvent(new ClipboardEvent("paste", { clipboardData: clipboard, bubbles: true, cancelable: true }));
  });
  await page.getByRole("alert").getByText(/Paste up to 524,288 characters/).waitFor();
  assert.equal(await button(page, "Download decoded file").count(), 0);
  await decodeFile(page).setInputFiles(fixture("full-base64.txt", largeOutput.bytes, "text/plain"));
  const decodeStart = performance.now();
  await button(page, "Decode to file").click();
  await waitFor(page, "Decoded file is ready.");
  const decodeMs = Math.round(performance.now() - decodeStart);
  const largeDecoded = await download(page, "Download decoded file");
  assert.equal(largeDecoded.bytes.length, limit);
  assert.equal(hash(largeDecoded.bytes), hash(large));
  await reflow(page);
  await context.close();
  console.log("200% CSS zoom, drop, denied clipboard, invalid UTF-8, input bounds, real worker cancellation and retry passed");
  console.log("12 MiB exact SHA-256 round trip at 320 px: encode " + encodeMs + " ms, decode " + decodeMs + " ms (single local Edge run)");
} finally {
  await browser.close();
  local?.close();
}
