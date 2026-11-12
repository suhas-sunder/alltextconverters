import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseToolFavorites, searchTools } from "../app/client/components/navigation/tool-search.ts";
import { primaryTools, taskGroups, toolCatalog } from "../app/client/components/navigation/tool-catalog.ts";

const tools = [
  { label: "Character Counter", href: "/character-counter", keywords: ["length"] },
  { label: "UTF-8 Byte Counter", href: "/byte-counter", keywords: ["bytes", "encoding"] },
  { label: "Table to List", href: "/table-to-list", keywords: ["spreadsheet", "extract column"] },
  { label: "Line Break Remover", href: "/line-break-remover", keywords: ["newlines", "preserve paragraphs"] },
];

test("tool finder ranks names and matches function terms across punctuation and token order", () => {
  assert.equal(searchTools(tools, "counter")[0].href, "/character-counter");
  assert.deepEqual(searchTools(tools, "UTF‑8 bytes").map((tool) => tool.href), ["/byte-counter"]);
  assert.deepEqual(searchTools(tools, "column spreadsheet").map((tool) => tool.href), ["/table-to-list"]);
  assert.deepEqual(searchTools(tools, "preserve paragraphs").map((tool) => tool.href), ["/line-break-remover"]);
  assert.deepEqual(searchTools(tools, "zzzz"), []);
});

test("favorites allow only known route references and tolerate corrupt storage", () => {
  assert.deepEqual(parseToolFavorites('["/table-to-list","/table-to-list","//elsewhere","secret text",{"href":"/byte-counter"}]', tools), ["/table-to-list"]);
  assert.deepEqual(parseToolFavorites("{broken", tools), []);
  assert.deepEqual(parseToolFavorites(null, tools), []);
});

test("the shared catalog covers every registered tool once and gives each task a destination", async () => {
  const routes = await readFile(new URL("../app/routes.ts", import.meta.url), "utf8");
  const excluded = new Set(["/tools", "/privacy-policy", "/terms-of-service", "/cookies-policy", "/contact", "/about", "/*"]);
  const registered = [...routes.matchAll(/route\("([^"]+)"/g)]
    .map(([, path]) => "/" + path).filter((path) => !excluded.has(path));
  const paths = toolCatalog.map((tool) => tool.href);
  assert.equal(new Set(paths).size, paths.length);
  assert.deepEqual(paths.toSorted(), registered.toSorted());
  assert.deepEqual(primaryTools.map((tool) => tool.href), ["/word-counter", "/character-counter", "/case-converter", "/text-cleaner"]);
  const groups = taskGroups.map((task) => task.id);
  assert.equal(new Set(groups).size, groups.length);
  assert.deepEqual(new Set(toolCatalog.map((tool) => tool.group)), new Set(groups));
});

test("the shared catalog finds both staged tasks and familiar routes with stable favorites", () => {
  assert.equal(searchTools(toolCatalog, "reconcile ids")[0].href, "/compare-two-lists");
  assert.equal(searchTools(toolCatalog, "invisible characters")[0].href, "/unicode-inspector");
  assert.equal(searchTools(toolCatalog, "repeated keys")[0].href, "/url-query-builder");
  assert.equal(searchTools(toolCatalog, "UTF-8 bytes")[0].href, "/byte-counter");
  assert.equal(searchTools(toolCatalog, "html to markdown")[0].href, "/html-markdown-converter");
  assert.equal(searchTools(toolCatalog, "minify json")[0].href, "/json-formatter");
  assert.equal(searchTools(toolCatalog, "compact xml")[0].href, "/xml-formatter");
  assert.equal(searchTools(toolCatalog, "binary file")[0].href, "/file-base64-converter");
  assert.deepEqual(parseToolFavorites('["/word-counter","/text-diff","/tools","/privacy-policy"]', toolCatalog), ["/word-counter", "/text-diff"]);
});
