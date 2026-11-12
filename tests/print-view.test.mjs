import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { buildTextPrintDocument, needsUnicodePrint } from "../app/client/text/print-view.ts";

test("Unicode print uses text-only nodes with wrapping, no remote content, and a native print control", () => {
  assert.equal(needsUnicodePrint("plain ASCII\r\nwith tabs\t"), false);
  assert.equal(needsUnicodePrint("Café 東京 e\u0301 — مرحبا"), true);
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>");
  const doc = dom.window.document;
  let prints = 0;
  const text = "Café 東京 e\u0301 — مرحبا\n<img src=https://example.test/pixel>\n" + "long".repeat(200);
  buildTextPrintDocument(doc, "Counter export", text, () => prints++);
  assert.equal(doc.title, "Counter export");
  assert.equal(doc.querySelector("pre").textContent, text);
  assert.equal(doc.querySelector("pre").dir, "auto");
  assert.equal(doc.querySelector("img, script, iframe, link"), null);
  assert.match(doc.querySelector("style").textContent, /overflow-wrap:\s*anywhere/);
  assert.match(doc.querySelector("style").textContent, /@media print/);
  doc.querySelector("button").click();
  assert.equal(prints, 1);
  dom.window.close();
});
