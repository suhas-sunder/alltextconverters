import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { unlink } from "node:fs/promises";
import test, { after } from "node:test";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://www.alltextconverters.com/" });
for (const name of ["window", "document", "HTMLElement", "HTMLTextAreaElement", "HTMLInputElement", "HTMLSelectElement", "HTMLAnchorElement", "Event", "MouseEvent", "Node", "DOMParser", "Blob"]) globalThis[name] = dom.window[name];
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let copiedText = null;
Object.defineProperty(globalThis.navigator, "clipboard", { value: { writeText: async (value) => { copiedText = value; } }, configurable: true });
let downloadedBlob = null;
let downloadedFilename = null;
globalThis.URL.createObjectURL = (blob) => { downloadedBlob = blob; return "blob:test"; };
globalThis.URL.revokeObjectURL = () => {};
dom.window.HTMLAnchorElement.prototype.click = function click() { downloadedFilename = this.download; };

const harnessSource = `
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { UrlEncodeToolCard } from "./app/client/components/url-encode/UrlEncodeToolCard";
import { UrlDecodeToolCard } from "./app/client/components/url-decode/UrlDecodeToolCard";
import { TextToHtmlToolCard } from "./app/client/components/text-to-html/TextToHtmlToolCard";
import { CaseConverterToolCard } from "./app/client/components/case-converter/CaseConverterToolCard";
import { MatchCaseConverterToolCard } from "./app/client/components/match-case-converter/MatchCaseConverterToolCard";
import { CharacterCounterToolCard } from "./app/client/components/character-counter/CharacterCounterToolCard";
let root = null;
let container = null;
function Wrapper({ kind }) {
  const [input, setInput] = useState("");
  if (kind === "url-encode") return <UrlEncodeToolCard input={input} setInput={setInput} />;
  if (kind === "url-decode") return <UrlDecodeToolCard input={input} setInput={setInput} />;
  if (kind === "text-to-html") return <TextToHtmlToolCard input={input} setInput={setInput} />;
  if (kind === "case-converter") return <CaseConverterToolCard input={input} setInput={setInput} />;
  if (kind === "match-case") return <MatchCaseConverterToolCard input={input} setInput={setInput} />;
  return <CharacterCounterToolCard input={input} setInput={setInput} />;
}
export async function mount(kind) {
  if (root) await act(async () => root.unmount());
  document.body.innerHTML = "";
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<Wrapper kind={kind} />));
}
export async function cleanup() {
  if (root) await act(async () => root.unmount());
  root = null;
  container = null;
  document.body.innerHTML = "";
}
export async function setTextarea(id, value) {
  await act(async () => {
    const element = document.getElementById(id);
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
    setter.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
export async function clickButton(text) {
  const button = Array.from(container.querySelectorAll("button")).find((item) => item.textContent.trim() === text);
  if (!button) throw new Error("Missing button: " + text);
  await act(async () => button.click());
}
export async function clickLabel(text) {
  const label = Array.from(container.querySelectorAll("label")).find((item) => item.textContent.includes(text));
  if (!label) throw new Error("Missing label: " + text);
  const input = label.querySelector("input");
  await act(async () => input.click());
}
export async function selectValue(label, value) {
  const select = Array.from(container.querySelectorAll("select")).find((item) => item.getAttribute("aria-label") === label);
  if (!select) throw new Error("Missing select: " + label);
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set;
    setter.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
export async function openAdvanced() {
  const details = container.querySelector("details");
  if (!details) throw new Error("Missing advanced details");
  await act(async () => { details.open = true; details.dispatchEvent(new Event("toggle", { bubbles: true })); });
}
export async function waitForDebounce() { await act(async () => { await new Promise((resolve) => setTimeout(resolve, 230)); }); }
export function value(id) { return document.getElementById(id).value; }
export function checkedLabel(text) {
  const label = Array.from(container.querySelectorAll("label")).find((item) => item.textContent.includes(text));
  return Boolean(label?.querySelector("input")?.checked);
}
export function alertText() { return container.querySelector('[role="alert"]')?.textContent ?? ""; }
export function markup() { return container.innerHTML; }
export function selectValueNow(label) { return Array.from(container.querySelectorAll("select")).find((item) => item.getAttribute("aria-label") === label)?.value; }
`;

const harnessOutput = resolve(root, "tests", ".converter-ui-harness.mjs");
await build({
  stdin: { contents: harnessSource, resolveDir: root, sourcefile: "ui-harness.tsx", loader: "tsx" },
  bundle: true,
  platform: "node",
  format: "esm",
  jsx: "automatic",
  external: ["react", "react-dom/client"],
  outfile: harnessOutput,
});
const ui = await import(`${pathToFileURL(harnessOutput).href}?run=${Date.now()}`);

after(async () => {
  await ui.cleanup();
  dom.window.close();
  await unlink(harnessOutput).catch(() => {});
});

test("URL Encode route controls change output, copy current output, and reset defaults", async () => {
  copiedText = null;
  await ui.mount("url-encode");
  await ui.setTextarea("url-encode-input", "a +");
  await ui.clickLabel("Form value mode");
  await ui.clickButton("Encode");
  assert.equal(ui.value("url-encode-output"), "a+%2B");
  await ui.clickButton("Copy");
  assert.equal(copiedText, "a+%2B");
  await ui.clickButton("Reset settings");
  assert.equal(ui.checkedLabel("URL component mode"), true);
  assert.equal(ui.value("url-encode-output"), "");
});

test("URL Decode clears stale output and exposes an accessible error", async () => {
  await ui.mount("url-decode");
  await ui.setTextarea("url-decode-input", "caf%C3%A9");
  await ui.clickButton("Decode");
  assert.equal(ui.value("url-decode-output"), "café");
  await ui.setTextarea("url-decode-input", "%ZZ");
  assert.equal(ui.value("url-decode-output"), "");
  await ui.clickButton("Decode");
  assert.match(ui.alertText(), /Invalid percent escape/);
  assert.match(ui.markup(), /role="status"/);
  assert.match(ui.markup(), /<fieldset/);
  assert.match(ui.markup(), /<legend/);
});

test("Text to HTML mode, copy, preview source, and download use generated output", async () => {
  copiedText = null; downloadedBlob = null; downloadedFilename = null;
  await ui.mount("text-to-html");
  await ui.setTextarea("text-to-html-input", "one\n<script>alert(1)</script>");
  await ui.clickLabel("Ordered list");
  await ui.clickButton("Convert");
  const output = ui.value("text-to-html-output");
  assert.match(output, /^<ol>/);
  assert.match(output, /&lt;script&gt;/);
  assert.doesNotMatch(output, /<script>/);
  await ui.clickButton("Copy");
  assert.equal(copiedText, output);
  await ui.clickButton("Download HTML");
  assert.equal(downloadedFilename, "converted-text.html");
  assert.equal(await downloadedBlob.text(), output);
  const markup = ui.markup();
  assert.doesNotMatch(markup, /<script>alert\(1\)<\/script>/);
  assert.match(markup, /Generated HTML preview/);
});

test("Case Converter mode, reset, copy, and accessible settings use current output", async () => {
  copiedText = null;
  await ui.mount("case-converter");
  await ui.setTextarea("case-converter-input", "hello WORLD");
  await ui.selectValue("Transformation", "title");
  await ui.clickButton("Convert");
  assert.equal(ui.value("case-converter-output"), "Hello World");
  await ui.clickButton("Copy");
  assert.equal(copiedText, "Hello World");
  await ui.clickButton("Reset settings");
  assert.equal(ui.selectValueNow("Transformation"), "uppercase");
  assert.equal(ui.value("case-converter-output"), "");
  assert.match(ui.markup(), /<fieldset/);
  assert.match(ui.markup(), /role="status"/);
});

test("Match Case uses both inputs, repeats its pattern, and clears stale output", async () => {
  await ui.mount("match-case");
  await ui.setTextarea("match-case-pattern", "AbC");
  await ui.setTextarea("match-case-converter-input", "example target");
  await ui.clickButton("Match case");
  assert.equal(ui.value("match-case-converter-output"), "ExAMpLE tARgET");
  await ui.setTextarea("match-case-pattern", "123");
  assert.equal(ui.value("match-case-converter-output"), "");
  await ui.clickButton("Match case");
  assert.equal(ui.value("match-case-converter-output"), "example target");
  assert.match(ui.markup(), /no cased letters/i);
});

test("Character Counter updates after debounce and exposes advanced metrics without live chatter", async () => {
  copiedText = null; downloadedBlob = null; downloadedFilename = null;
  await ui.mount("character-counter");
  await ui.setTextarea("characters-counter-input", "A 👨‍👩‍👧‍👦");
  await ui.waitForDebounce();
  assert.match(ui.markup(), /Characters including spaces/);
  assert.match(ui.markup(), />3<\/div>/);
  await ui.openAdvanced();
  assert.match(ui.markup(), /Unicode code points/);
  assert.match(ui.markup(), /UTF-16 code units/);
  await ui.clickButton("Copy");
  assert.equal(copiedText, "A 👨‍👩‍👧‍👦");
  await ui.clickButton("Download TXT");
  assert.equal(downloadedFilename, "characters-counter-text.txt");
  assert.equal(await downloadedBlob.text(), "A 👨‍👩‍👧‍👦");
  const status = document.querySelector('[role="status"]');
  assert.equal(status?.textContent, "Text copied.");
});
