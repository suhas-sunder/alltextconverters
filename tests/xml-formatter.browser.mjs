// node tests/xml-formatter.browser.mjs <build/client or HTTPS origin> <playwright-core path> <Edge executable>
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, isAbsolute, join, relative, resolve } from "node:path";

const [target, packagePath, executablePath] = process.argv.slice(2);
assert.ok(target && packagePath && executablePath, "Supply build/client or HTTPS origin, playwright-core, and Edge.");
const { chromium } = createRequire(import.meta.url)(resolve(packagePath));
const route = "/xml-formatter/";
const engine = /\/assets\/xml-formatter\.worker-[^/]+\.js$/;
const marker = "M08-private-markup-fixture-39";
const filename = "M08-private-document.xml";
const declaration = '<?xml version="1.0" encoding="UTF-8"?>';
const comment = "<!-- " + marker + " -->";
const mixed = "<p>Hi <b  weight='bold' >café</b>\r\n<![CDATA[<tag>東京]]></p>";
const preserved = '<keep xml:space="preserve">\r\n <a />   <b/>\n</keep>';
const reference = "<spaces><a/>&#x20;<b/></spaces>";
const source = declaration + "\r\n" + comment + '<root xmlns:p = "urn:items" zone = "EU" >' +
  "\r\n  <p:item   id = '3' />\r\n  " + mixed + "  " + preserved + reference + "</root>";
const pretty = declaration + "\n" + comment + '\n<root\n  xmlns:p="urn:items"\n  zone="EU">\r\n  <p:item id=\'3\'/>\r\n  ' +
  mixed + "  " + preserved + reference + "</root>\n";
const compact = declaration + comment + '<root xmlns:p="urn:items" zone="EU"><p:item id=\'3\'/>' + mixed + preserved + reference + "</root>";
const widths = [320, 375, 768, 1280, 1920];
const adOrConsent = /googlesyndication|doubleclick|googleadservices|fundingchoices|googletagmanager|google-analytics/i;
const blockedHost = (url) => adOrConsent.test(url.hostname) || url.hostname === "example.invalid";
const button = (page, name) => page.getByRole("button", { name, exact: true });
const input = (page) => page.getByRole("textbox", { name: "XML source", exact: true });
const output = (page) => page.getByRole("textbox", { name: "XML output", exact: true });
const picker = (page) => page.getByLabel("Import XML file", { exact: true });
const status = (page, message) => page.getByRole("status").filter({ hasText: message }).waitFor();
const alert = (page, message) => page.getByRole("alert").filter({ hasText: message }).waitFor();
const file = (name, bytes) => ({ name, mimeType: "application/xml", buffer: Buffer.from(bytes) });
const normalized = (value) => value.replace(/\r\n|\r/g, "\n");

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
  const [result] = await Promise.all([page.waitForEvent("download"), button(page, "Download XML").press("Enter")]);
  assert.equal(result.suggestedFilename(), "formatted.xml");
  return readFile(await result.path(), "utf8");
}

async function noOverflow(page, width) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} px overflows`);
}

const hosted = target.startsWith("https://");
const local = hosted ? null : await serve(target);
const origin = local?.origin ?? new URL(target).origin;
const browser = await chromium.launch({ executablePath, headless: true });

try {
  assert.doesNotMatch(await (await fetch(origin + "/sitemap.xml")).text(), /xml-formatter/);
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const staticPage = await staticContext.newPage();
  const response = await staticPage.goto(origin + route);
  assert.equal(response.status(), 200);
  if (/^https:\/\/deploy-preview-/.test(origin)) assert.match((await response.allHeaders())["x-robots-tag"], /noindex/i);
  assert.equal(await staticPage.locator('meta[name="robots"]').getAttribute("content"), "noindex,follow");
  assert.equal(await staticPage.locator('link[rel="canonical"]').getAttribute("href"), "https://www.alltextconverters.com" + route);
  assert.equal(await staticPage.locator("[data-ad-placement]").count(), 0);
  await staticPage.getByRole("heading", { name: "How whitespace is handled", exact: true }).waitFor();
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
      assert.ok(!requests.some((request) => engine.test(request.trim())), "engine loaded before an operation");
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), "Skip to content");
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => document.activeElement.id), "main-content");
      await noOverflow(page, width);

      const chooser = page.waitForEvent("filechooser");
      await picker(page).press("Enter");
      await (await chooser).setFiles(file(filename, source));
      await status(page, "Local XML file loaded.");
      assert.equal(await input(page).inputValue(), normalized(source));
      await button(page, "Format XML").press("Enter");
      await status(page, "XML result ready.");
      assert.ok(requests.some((request) => engine.test(request.trim())));
      assert.equal(await output(page).inputValue(), normalized(pretty));
      assert.equal(await download(page), pretty, "download retains original CRLF inside protected content");
      await page.evaluate(() => navigator.clipboard.writeText("clipboard sentinel"));
      await button(page, "Copy XML").press("Enter");
      await status(page, "XML copied.");
      assert.equal(normalized(await page.evaluate(() => navigator.clipboard.readText())), normalized(pretty));
      await noOverflow(page, width);

      await page.getByRole("checkbox", { name: "Reindent element-only content", exact: true }).check();
      assert.equal(await output(page).inputValue(), "");
      await button(page, "Format XML").press("Enter");
      await status(page, "XML result ready.");
      const structured = await download(page);
      assert.ok(structured.includes("\n  " + mixed + "\n  " + preserved + "\n  " + reference + "\n"));
      const indentation = page.getByRole("combobox", { name: "Indentation", exact: true });
      await indentation.selectOption("four");
      await button(page, "Format XML").press("Enter");
      await status(page, "XML result ready.");
      assert.match(await output(page).inputValue(), /\n    <p:item/);
      await indentation.selectOption("tab");
      await button(page, "Format XML").press("Enter");
      await status(page, "XML result ready.");
      assert.match(await output(page).inputValue(), /\n\t<p:item/);

      await button(page, "Compact XML").press("Enter");
      await status(page, "XML result ready.");
      assert.equal(await download(page), compact);
      await button(page, "Validate XML").press("Enter");
      await status(page, "Well-formed XML.");
      assert.equal(await output(page).inputValue(), "");
      assert.equal(await button(page, "Download XML").count(), 0);

      const malformed = "<root>\n  <b></root>";
      await page.evaluate((value) => navigator.clipboard.writeText(value), malformed);
      await input(page).press("Control+a");
      await input(page).press("Control+v");
      await button(page, "Validate XML").press("Enter");
      await alert(page, /Line 2, column \d+.*not well-formed/);
      await button(page, "Go to error").press("Enter");
      assert.ok(await input(page).evaluate((field) => document.activeElement === field && field.selectionStart >= field.value.indexOf("\n")));
      assert.equal(await button(page, "Copy XML").count(), 0);
      assert.ok(!requests.some((request) => request.includes(marker) || request.includes(filename) || adOrConsent.test(request)));
      const storage = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
      assert.ok(!storage.includes(marker) && !storage.includes(filename));
      assert.deepEqual(pageErrors, []);
      console.log(`${width}px passed native file/paste/copy, safe and reindented formats, exact XML exports, validation/error focus, reflow and privacy`);
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({ viewport: { width: 320, height: 900 }, serviceWorkers: "block" });
  await context.route(blockedHost, (request) => request.abort());
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.addInitScript(() => {
    Object.defineProperty(navigator.clipboard, "writeText", { value: async () => { throw new DOMException("Denied", "NotAllowedError"); } });
    const read = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (this.name === "slow.xml") await new Promise((resolve) => setTimeout(resolve, 500));
      return read.call(this);
    };
  });
  await page.goto(origin + route, { waitUntil: "networkidle" });
  await input(page).fill("<r/>");
  await page.route(engine, (interception) => interception.abort("blockedbyclient"));
  await button(page, "Format XML").press("Enter");
  await alert(page, /XML formatter could not start/);
  await page.unroute(engine);
  await page.reload({ waitUntil: "networkidle" });

  let release;
  const wait = new Promise((done) => { release = done; });
  const hold = async (interception) => {
    await wait;
    await interception.continue().catch(() => {});
  };
  await page.route(engine, hold);
  try {
    await input(page).fill("<stale/>");
    await button(page, "Format XML").press("Enter");
    await status(page, "Checking XML");
    await button(page, "Cancel").press("Enter");
    await status(page, "Formatting canceled.");
    assert.ok(await input(page).evaluate((field) => document.activeElement === field));
    assert.equal(await input(page).inputValue(), "<stale/>");
    await button(page, "Format XML").press("Enter");
    await status(page, "Checking XML");
    await input(page).fill("<current/>");
    assert.equal(await output(page).inputValue(), "");
  } finally {
    release();
    await page.unroute(engine, hold);
  }
  await button(page, "Format XML").press("Enter");
  await status(page, "XML result ready.");
  assert.equal(await output(page).inputValue(), "<current/>\n");
  await button(page, "Copy XML").press("Enter");
  await status(page, /Automatic copy was unavailable/);
  assert.equal(await download(page), "<current/>\n");

  const rejected = [
    ['<!DOCTYPE x SYSTEM "https://example.invalid/external.dtd"><x/>', /DTD and entity/],
    ['<!DOCTYPE x [<!ENTITY private SYSTEM "https://example.invalid/entity">]><x>&private;</x>', /DTD and entity/],
    ['<?xml-stylesheet href="https://example.invalid/style.xsl"?><x/>', /stylesheet instructions/],
    ['<x xmlns:alt="http://www.w3.org/2001/XInclude"><alt:include href="https://example.invalid/include"/></x>', /XInclude/],
  ];
  for (const [payload, expected] of rejected) {
    await input(page).fill(payload);
    await button(page, "Validate XML").press("Enter");
    await alert(page, expected);
    assert.equal(await output(page).inputValue(), "");
  }
  const activeMarkup = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:x https://example.invalid/schema"><script>window.xmlFormatterExecuted = true</script><image href="https://example.invalid/image"/></svg>';
  await input(page).fill(activeMarkup);
  await button(page, "Format XML").press("Enter");
  await status(page, "XML result ready.");
  assert.match(await output(page).inputValue(), /<script>window\.xmlFormatterExecuted = true<\/script>/);
  assert.equal(await page.locator("main svg, main script:not([type])").count(), 0);
  assert.equal(await page.evaluate(() => window.xmlFormatterExecuted), undefined);
  assert.ok(!requests.some((url) => /example\.invalid/.test(url) || adOrConsent.test(url)));
  const astralError = "<r>\n😀<a></r>";
  await input(page).fill(astralError);
  await button(page, "Validate XML").press("Enter");
  await alert(page, /Line 2, column 8/);
  await button(page, "Go to error").press("Enter");
  assert.equal(await input(page).evaluate((field) => field.selectionStart), astralError.lastIndexOf(">"));
  const literal = '<r xmlns:h="http://www.w3.org/1999/xhtml"><h:parsererror>actual data</h:parsererror></r>';
  await input(page).fill(literal);
  await button(page, "Compact XML").press("Enter");
  await status(page, "XML result ready.");
  assert.equal(await output(page).inputValue(), literal);
  for (const authored of [
    '<root xmlns="http://www.w3.org/1999/xhtml"><parsererror>ordinary data</parsererror></root>',
    '<parsererror xmlns="http://www.w3.org/1999/xhtml"><value/></parsererror>',
  ]) {
    await input(page).fill(authored);
    await button(page, "Compact XML").press("Enter");
    await status(page, "XML result ready.");
    assert.equal(await output(page).inputValue(), authored);
  }
  await input(page).fill('<parsererror xmlns="http://www.w3.org/1999/xhtml"></atc-parser-probe-0>');
  await button(page, "Validate XML").press("Enter");
  await alert(page, /not well-formed/);
  assert.equal(await output(page).inputValue(), "");
  await input(page).fill(activeMarkup);
  await page.setViewportSize({ width: 640, height: 900 });
  const zoom = await page.addStyleTag({ content: "html { zoom: 2 }" });
  await noOverflow(page, 640);
  await zoom.evaluate((element) => element.remove());

  await picker(page).setInputFiles(file("bad.xml", [0xc3, 0x28]));
  await alert(page, /Could not read this file as UTF-8/);
  assert.equal(await input(page).inputValue(), activeMarkup);
  await picker(page).setInputFiles(file("oversized.xml", Buffer.alloc(512 * 1024 + 1, 65)));
  await alert(page, /Choose a UTF-8 file up to 512 KiB/);
  assert.equal(await input(page).inputValue(), activeMarkup);
  await picker(page).setInputFiles(file("slow.xml", "<stale/>"));
  await input(page).fill("<typed/>");
  await button(page, "Compact XML").press("Enter");
  await status(page, "XML result ready.");
  assert.equal(await output(page).inputValue(), "<typed/>");
  console.log("Passed DTD/entity, stylesheet and XInclude rejection, inert SVG/schema hints, blocked and stale imports, denied clipboard, invalid/oversized files and 200% CSS zoom");

  await page.setViewportSize({ width: 1280, height: 900 });
  const rows = Array.from({ length: 8_000 }, (_, index) => `<item code="ID-${String(index).padStart(5, "0")}-${"x".repeat(40)}"/>`);
  // Keep the fixture within the byte budget and exercise the maximum exact input.
  const kept = rows.slice(0, 7_500);
  const expected = "<root>" + kept.join("") + "</root>";
  const large = "<root>\n" + kept.join("\n") + "\n</root>";
  const exactInput = large + " ".repeat(512 * 1024 - large.length);
  assert.equal(Buffer.byteLength(exactInput), 512 * 1024);
  await picker(page).setInputFiles(file("large.xml", exactInput));
  await status(page, "Local XML file loaded.");
  await page.getByRole("checkbox", { name: "Reindent element-only content" }).check();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const start = performance.now();
  await button(page, "Compact XML").press("Enter");
  await status(page, "XML result ready.");
  const elapsed = performance.now() - start;
  assert.ok((await output(page).inputValue()).length <= 16 * 1024);
  assert.equal(await download(page), expected);
  console.log(`512 KiB XML with 7,500 entries, ${Math.round(elapsed)} ms compact-to-visible at 4x CPU throttle; full export matched`);

  await input(page).fill("<r>".repeat(128) + "<r/>" + "</r>".repeat(128));
  await button(page, "Validate XML").press("Enter");
  await alert(page, /exceeds 128 nested elements/);
  const expand = "<r>".repeat(120) + "<i/>".repeat(5000) + "</r>".repeat(120);
  await picker(page).setInputFiles(file("expansion.xml", expand));
  await status(page, "Local XML file loaded.");
  await page.getByRole("combobox", { name: "Indentation" }).selectOption("four");
  await button(page, "Format XML").press("Enter");
  await alert(page, /formatted output exceeds 2 MiB/);
  assert.equal(await output(page).inputValue(), "");
  await button(page, "Validate XML").press("Enter");
  await status(page, "Well-formed XML.");

  await page.goto(origin + "/xml-to-text/", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "XML Formatter", exact: true }).press("Enter");
  await page.waitForURL("**/xml-formatter/");
  assert.equal(await input(page).inputValue(), "");
  await context.close();
} finally {
  await browser.close();
  await local?.close();
}
