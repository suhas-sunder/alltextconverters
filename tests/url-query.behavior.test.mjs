import assert from "node:assert/strict";
import test from "node:test";
import { buildQueryOutput, parseQueryInput, queryByteLimit, queryRowLimit } from "../app/client/text/url-query.ts";
import { applyEditorEdit, editorValue } from "../app/client/text/text-editor-newlines.ts";

const ok = value => ({ ok: true, value });

test("query builder preserves the exact base, fragment, repeated fields and pair order", () => {
  const source = "HTTPs://ExAmPlE.com:443/a/../b?tag=red&tag=blue&=unnamed&bare&escaped=a%26b%3Dc%2B+d#frag?x=#";
  const result = parseQueryInput(source, "url");
  const pairs = [
    { key: "tag", value: "red" },
    { key: "tag", value: "blue" },
    { key: "", value: "unnamed" },
    { key: "bare", value: "" },
    { key: "escaped", value: "a&b=c+ d" },
  ];
  assert.deepEqual(result, ok({ base: "HTTPs://ExAmPlE.com:443/a/../b", fragment: "#frag?x=#", pairs }));
  assert.deepEqual(buildQueryOutput(result.value, "url", "plus"), ok(source.replace("&bare&", "&bare=&")));
  assert.deepEqual(buildQueryOutput(result.value, "query", "percent"), ok("tag=red&tag=blue&=unnamed&bare=&escaped=a%26b%3Dc%2B%20d"));
  assert.deepEqual(buildQueryOutput(result.value, "json", "plus"), ok(JSON.stringify(pairs, null, 2)));
});

test("query builder normalizes empty separators and preserves explicit empty pairs and fragments", () => {
  assert.deepEqual(parseQueryInput("?", "query"), ok({ base: "", fragment: "", pairs: [] }));
  assert.deepEqual(parseQueryInput("?&&=&&x==", "query"), ok({ base: "", fragment: "", pairs: [{ key: "", value: "" }, { key: "x", value: "=" }] }));
  const result = parseQueryInput("https://example.com/path?#", "url");
  assert.deepEqual(buildQueryOutput(result.value, "url", "plus"), ok("https://example.com/path#"));
  assert.deepEqual(buildQueryOutput(result.value, "query", "plus"), ok(""));
});

test("query builder preserves controls and composed or decomposed Unicode in encoded pairs", () => {
  const query = "a%0A=%00%0D%0A&%C3%A9=e%CC%81&%F0%9F%92%A1=%E6%9D%B1%E4%BA%AC";
  const result = parseQueryInput(query, "query");
  assert.deepEqual(result.value.pairs, [{ key: "a\n", value: "\0\r\n" }, { key: "é", value: "e\u0301" }, { key: "💡", value: "東京" }]);
  assert.deepEqual(buildQueryOutput(result.value, "query", "plus"), ok(query));
});

test("query-only input rejects literal lone surrogates before loading editable rows", () => {
  for (const input of ["a=\uD800", "?\uDFFF=x", "valid=💡&broken=\uD800"]) {
    assert.deepEqual(parseQueryInput(input, "query"), { ok: false, error: "The query contains an unpaired Unicode surrogate." });
  }
  assert.deepEqual(parseQueryInput("key=💡", "query"), ok({ base: "", fragment: "", pairs: [{ key: "key", value: "💡" }] }));
});

test("editing one parameter retains untouched line endings and nonadjacent repeated rows", () => {
  const initial = parseQueryInput("tag=one%0D%0Atwo&note=%00%0D&tag=left%0D%0A%0Aright&separator=keep&tag=last", "query").value;
  assert.equal(editorValue(initial.pairs[0].value), "one\ntwo");
  initial.pairs[0].value = applyEditorEdit(initial.pairs[0].value, "one\ntwo!", { start: 7, end: 7, inputType: "insertText" });
  initial.pairs[2].value = applyEditorEdit(initial.pairs[2].value, "left\nright", { start: 4, end: 5, inputType: "deleteContentForward" });
  assert.deepEqual(buildQueryOutput(initial, "query", "plus"), ok("tag=one%0D%0Atwo%21&note=%00%0D&tag=left%0Aright&separator=keep&tag=last"));
});

test("editor selection distinguishes adjacent CRLF and LF and preserves raw offsets around a deletion", () => {
  const raw = "x\r\n\ny";
  assert.equal(applyEditorEdit(raw, "x\ny", { start: 1, end: 2, inputType: "deleteContentForward" }), "x\ny");
  assert.equal(applyEditorEdit(raw, "x\ny", { start: 2, end: 3, inputType: "deleteContentForward" }), "x\r\ny");
  assert.equal(applyEditorEdit(raw, "x\ny", { start: 2, end: 2, inputType: "deleteContentBackward" }), "x\ny");
  assert.equal(applyEditorEdit(raw, "x\ny", { start: 2, end: 2, inputType: "deleteContentForward" }), "x\r\ny");
  assert.equal(applyEditorEdit("old\r\nline\rtail", "old\nline\ntail!"), "old\r\nline\rtail!");
});

for (const source of ["a=%", "a=%GG", "a=%C0%AF", "a=%ED%A0%80", "a=%F0%9F%92", "%FF=x", "x=one#fragment"]) {
  test("query builder rejects " + source, () => {
    assert.equal(parseQueryInput(source, "query").ok, false);
  });
}

for (const source of ["//example.com", "javascript:alert(1)", "ftp://example.com", "https://user:pw@example.com", "https://@example.com", "https:///example.com", "https://example.com\\path", "https://example.com/?q=a b", "https://example.com/#a\nb", "https://exa%mple.com"]) {
  test("query builder rejects invalid full URL " + JSON.stringify(source), () => {
    assert.equal(parseQueryInput(source, "url").ok, false);
  });
}

test("query builder accepts IPv6 and international hostnames without rewriting their text", () => {
  for (const base of ["http://[::1]:8080/path", "https://例え.テスト/東京"]) {
    const result = parseQueryInput(base + "?q=x", "url");
    assert.deepEqual(buildQueryOutput(result.value, "url", "plus"), ok(base + "?q=x"));
  }
});

test("query builder bounds row count, byte length and cumulative edited data", () => {
  const atLimit = Array.from({ length: queryRowLimit }, () => "x=y").join("&");
  assert.equal(parseQueryInput(atLimit, "query").value.pairs.length, queryRowLimit);
  assert.equal(parseQueryInput(atLimit + "&extra=x", "query").ok, false);
  assert.equal(parseQueryInput("é".repeat(queryByteLimit / 2), "query").ok, true);
  assert.equal(parseQueryInput("é".repeat(queryByteLimit / 2 + 1), "query").ok, false);
  const pairs = [{ key: "a", value: "é".repeat(queryByteLimit / 2) }];
  assert.equal(buildQueryOutput({ base: "", fragment: "", pairs }, "json", "plus").ok, false);
  assert.equal(buildQueryOutput({ base: "", fragment: "", pairs: [{ key: "\uD800", value: "" }] }, "query", "plus").ok, false);
});

test("URL output validates edits while query and JSON output ignore the base and fragment", () => {
  const input = { base: "https://example.com/?existing=1", fragment: "#valid", pairs: [{ key: "foo", value: "bar" }] };
  assert.equal(buildQueryOutput(input, "url", "plus").ok, false);
  assert.equal(buildQueryOutput({ ...input, base: "https://example.com/", fragment: "missing-hash" }, "url", "plus").ok, false);
  assert.deepEqual(buildQueryOutput(input, "query", "plus"), ok("foo=bar"));
});
