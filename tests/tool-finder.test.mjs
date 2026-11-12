import assert from "node:assert/strict";
import test from "node:test";
import { parseToolFavorites, searchTools } from "../app/client/components/navigation/tool-search.ts";

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
