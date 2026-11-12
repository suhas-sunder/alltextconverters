import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const [normalDocx, dependencies, playwright, edge, ...origins] = process.argv.slice(2);
assert.ok(normalDocx && dependencies && playwright && edge && origins.length);
const require = createRequire(import.meta.url);
const { unzipSync, zipSync, strFromU8, strToU8 } = require(resolve(dependencies, "fflate"));
const { chromium } = require(resolve(playwright));
const parts = unzipSync(new Uint8Array(await readFile(normalDocx)));
const file = "word/document.xml";
const original = strFromU8(parts[file]);
assert.match(original, /<w:t\b[^>]*>.*?<\/w:t>/s);
const marker = "atc-docx-entity-probe.invalid";
parts[file] = strToU8(original.replace(/<w:document\b/, '<!DOCTYPE w:document [<!ENTITY external SYSTEM "https://' + marker + '/external">]><w:document')
  .replace(/<w:t\b[^>]*>.*?<\/w:t>/s, "<w:t>&external;</w:t>"));
const malformed = Buffer.from(zipSync(parts));
const browser = await chromium.launch({ executablePath: edge });
try {
  for (const origin of origins) {
    const context = await browser.newContext({ serviceWorkers: "block" });
    const requests = [];
    await context.route(url => url.hostname === marker, async route => {
      requests.push(route.request().url());
      await route.abort();
    });
    const page = await context.newPage();
    await page.goto(origin, { waitUntil: "networkidle" });
    await page.locator("#textInput").fill("Previous local text");
    await page.locator('input[type="file"]').setInputFiles({ name: "external-entity.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer: malformed });
    await page.waitForFunction(() => !document.querySelector('input[type="file"]').value);
    assert.deepEqual(requests, []);
    assert.doesNotMatch(await page.locator("#textInput").inputValue(), /external|atc-docx-entity-probe/);
    await context.close();
    console.log("External-entity DOCX stayed local on " + origin);
  }
} finally {
  await browser.close();
}
