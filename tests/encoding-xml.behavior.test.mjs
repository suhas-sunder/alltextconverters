import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();

async function importTypeScript(relativePath) {
  if (cache.has(relativePath)) return cache.get(relativePath);
  const built = await build({ entryPoints: [resolve(root, relativePath)], bundle: true, platform: "node", format: "esm", write: false });
  const source = built.outputFiles[0].text;
  const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  cache.set(relativePath, module);
  return module;
}

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://www.alltextconverters.com/" });
for (const name of ["DOMParser", "Node", "NodeFilter", "Element", "Document", "Text"]) globalThis[name] = dom.window[name];

test("JSON Lines preserves raw number, key and string lexemes through both directions", async () => {
  const { convertJsonLines } = await importTypeScript("app/client/text/json-lines.ts");
  const record = String.raw`{"x":"comma, quote \" and slash \\","x":"東京\nQuébec","array":[1e999,9007199254740993,-0]}`;
  const records = [record, "null", '""', "false"];
  const expected = `${records.join("\n")}\n`;
  assert.deepEqual(convertJsonLines(`[\r\n${records.join(",\r\n")}\r\n]`, "array-to-lines"), {
    ok: true, output: expected, count: 4,
  });
  assert.deepEqual(convertJsonLines(expected.replaceAll("\n", "\r\n"), "lines-to-array"), {
    ok: true, output: `[\n${records.join(",\n")}\n]`, count: 4,
  });
  assert.equal(convertJsonLines('[{\n "k": [\n 1, 2\n ]\n}]', "array-to-lines").output, '{ "k": [ 1, 2 ]}\n');
  assert.equal(convertJsonLines("[]", "array-to-lines").output, "");
  assert.equal(convertJsonLines("", "lines-to-array").output, "[]");
});

test("JSON Lines rejects malformed records, BOMs, and oversized inputs without partial output", async () => {
  const { convertJsonLines } = await importTypeScript("app/client/text/json-lines.ts");
  for (const input of ["null\n\ntrue", "null\n{} 1", "null\n{\n}"]) {
    assert.deepEqual(convertJsonLines(input, "lines-to-array"), {
      ok: false, error: "Line 2 must contain one valid JSON value.",
    });
  }
  assert.equal(convertJsonLines("\uFEFF{}", "lines-to-array").ok, false);
  assert.equal(convertJsonLines("[1,]", "array-to-lines").ok, false);
  assert.equal(convertJsonLines("{}", "array-to-lines").ok, false);
  assert.match(convertJsonLines("0\n".repeat(20_001), "lines-to-array").error, /20,000/);
  assert.match(convertJsonLines("[" + "0,".repeat(20_000) + "0]", "array-to-lines").error, /20,000/);
  assert.match(convertJsonLines("😀".repeat(524_289), "lines-to-array").error, /2 MiB/);
});

test("HTML extraction is inert, structural, and excludes unsafe URL schemes", async () => {
  const { htmlToText } = await importTypeScript("app/client/components/html-to-text/htmlToTextTransforms.ts");
  let executions = 0;
  dom.window.alert = () => { executions += 1; };
  const result = htmlToText(`
    <script>alert(1)</script><style>body{color:red}</style>
    <p onclick="alert(2)">Hello <strong>world</strong></p>
    <ul><li>One</li><li>Two</li></ul>
    <table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>
    <a href="javascript:alert(3)">bad</a><a href="custom:unsafe">custom</a><a href="https://example.com/a">safe</a>
    <img src="https://example.com/x.png"><iframe src="https://example.com/"></iframe><link rel="stylesheet" href="https://example.com/x.css">`,
    { preserveParagraphs: true, preserveListMarkers: true, preserveTableStructure: true, appendLinkUrls: true, collapseBlankLines: true },
  );
  assert.equal(executions, 0);
  assert.match(result.text, /Hello world/);
  assert.match(result.text, /- One\n- Two/);
  assert.match(result.text, /A\tB\n1\t2/);
  assert.doesNotMatch(result.text, /alert|javascript:|custom:unsafe|x\.png|x\.css/);
  assert.match(result.text, /safe \(https:\/\/example\.com\/a\)/);
});

test("Text to HTML escapes source in every supported mode", async () => {
  const { textToHtml } = await importTypeScript("app/client/components/text-to-html/textToHtmlTransforms.ts");
  const source = "<script>alert(1)</script>\nsecond";
  for (const mode of ["paragraphs", "br", "pre", "unordered-list", "ordered-list"]) {
    const output = textToHtml(source, { mode, paragraphLineMode: "br" });
    assert.doesNotMatch(output, /<script>/);
    assert.match(output, /&lt;script&gt;/);
  }
  assert.match(textToHtml("a\nb", { mode: "paragraphs", paragraphLineMode: "space" }), /<p>a b<\/p>/);
  const document = textToHtml("hello", { mode: "paragraphs", fullDocument: true, title: "<unsafe>" });
  assert.match(document, /<!doctype html>/);
  assert.match(document, /<title>&lt;unsafe&gt;<\/title>/);
});

test("XML extraction rejects unsafe declarations before parsing and supports selection", async () => {
  const { xmlToText } = await importTypeScript("app/client/components/xml-to-text/xmlToTextTransforms.ts");
  let parserCalls = 0;
  const parserFactory = () => { parserCalls += 1; return new DOMParser(); };
  for (const source of [
    '<!DOCTYPE root SYSTEM "https://example.com/external.dtd"><root>test</root>',
    '<!DOCTYPE root [<!ENTITY external SYSTEM "https://example.com/secret.txt">]><root>&external;</root>',
  ]) {
    const result = xmlToText(source, { mode: "all" }, parserFactory);
    assert.equal(result.ok, false);
    assert.match(result.error, /DTD|unsafe external declaration/i);
  }
  assert.equal(parserCalls, 0, "unsafe XML must be rejected before the parser can resolve anything");

  const source = '<root xmlns:p="urn:test"><p:item id="a">First <b>bold</b></p:item><p:item>Second</p:item><empty /></root>';
  const selected = xmlToText(source, { mode: "selected", elementName: "item", attributeName: "id" });
  assert.equal(selected.ok, true);
  assert.equal(selected.text, "[id=a] First bold\n[id=(missing)] Second");
  const qualified = xmlToText(source, { mode: "selected", elementName: "p:item" });
  assert.equal(qualified.ok, true);
  assert.equal(qualified.matches, 2);
  const boundaries = xmlToText(source, { mode: "boundaries" });
  assert.equal(boundaries.ok, true);
  assert.match(boundaries.text, /<p:item>:/);
  assert.match(boundaries.text, /<empty>:/);
});

test("XML parse failures and generated XML round trips are explicit", async () => {
  const { xmlToText } = await importTypeScript("app/client/components/xml-to-text/xmlToTextTransforms.ts");
  const { textToXml } = await importTypeScript("app/client/components/text-to-xml/textToXmlTransforms.ts");
  for (const source of ["", "<root><a></root>", "<a/><b/>", "<root>\u0001</root>", '<root xmlns:="bad"/>']) {
    const result = xmlToText(source, { mode: "all" });
    assert.equal(result.ok, false, source || "empty XML");
  }
  const generated = textToXml("A & B\nCafé\n😀", { mode: "lines", rootTag: "root", itemTag: "item", includeDeclaration: true, addIndexAttribute: true });
  assert.equal(generated.ok, true);
  assert.match(generated.xml, /A &amp; B/);
  const roundTrip = xmlToText(generated.xml, { mode: "selected", elementName: "item", attributeName: "index" });
  assert.equal(roundTrip.ok, true);
  assert.equal(roundTrip.text, "[index=1] A & B\n[index=2] Café\n[index=3] 😀");
  for (const rootTag of ["9root", "xmlRoot", "has space", "p:root"]) {
    const invalid = textToXml("x", { rootTag });
    assert.equal(invalid.ok, false);
  }
  assert.equal(textToXml("a\u0001b", {}).ok, false);
});

test("XML extraction keeps mixed-content order and accepts a parsererror data element", async () => {
  const { xmlToText } = await importTypeScript("app/client/components/xml-to-text/xmlToTextTransforms.ts");
  const { textToXml } = await importTypeScript("app/client/components/text-to-xml/textToXmlTransforms.ts");
  const source = "<root>Before <item>middle</item><![CDATA[after]]><parsererror>data</parsererror></root>";
  assert.equal(xmlToText(source, { mode: "all" }).text, "Before\nmiddle\nafter\ndata");
  assert.equal(xmlToText(source, { mode: "selected", elementName: "parsererror" }).text, "data");
  assert.equal(textToXml("test", { rootTag: "parsererror" }).ok, true);
});

test("URL component and form modes remain distinct and strict", async () => {
  const { encodeUrlText } = await importTypeScript("app/client/components/url-encode/urlEncodeTransforms.ts");
  const { decodeUrlEncodedText } = await importTypeScript("app/client/components/url-decode/urlDecodeTransforms.ts");
  const source = "café + a&b/?#😀";
  const component = encodeUrlText(source, "component");
  const form = encodeUrlText(source, "form");
  assert.equal(component.ok, true); assert.equal(form.ok, true);
  assert.match(component.value, /%20%2B%20/); assert.match(form.value, /\+%2B\+/);
  assert.equal(decodeUrlEncodedText(component.value, "component").value, source);
  assert.equal(decodeUrlEncodedText(form.value, "form").value, source);
  assert.equal(decodeUrlEncodedText("a+b", "component").value, "a+b");
  assert.equal(decodeUrlEncodedText("a+b", "form").value, "a b");
  for (const malformed of ["%", "%2", "%ZZ", "%C3%28"]) assert.equal(decodeUrlEncodedText(malformed).ok, false);
  assert.equal(encodeUrlText("\ud800").ok, false);
});

test("hex encodes UTF-8 formats and strictly decodes supported input forms", async () => {
  const { convertTextToHex } = await importTypeScript("app/client/components/text-to-hex/textToHexTransforms.ts");
  const { decodeHexToText } = await importTypeScript("app/client/components/hex-to-text/utils/hexDecode.ts");
  assert.equal(convertTextToHex("A é 😀").hex, "41 20 c3 a9 20 f0 9f 98 80");
  assert.equal(convertTextToHex("é", { uppercase: true, separatorMode: "none", prefix0x: false }).hex, "C3A9");
  assert.equal(convertTextToHex("é", { uppercase: true, separatorMode: "space", prefix0x: true }).hex, "0xC3 0xA9");
  assert.equal(convertTextToHex("A", { separatorMode: "custom", customSeparator: "::", prefix0x: true }).hex, "0x41");
  const fixtures = [
    ["41c3a9f09f9880", { mode: "continuous" }],
    ["41 c3 a9 f0 9f 98 80", { mode: "space" }],
    ["41,c3,a9,f0,9f,98,80", { mode: "comma" }],
    ["0x41|0xc3|0xa9|0xf0|0x9f|0x98|0x80", { mode: "custom", customSeparator: "|", allowPrefix: true }],
  ];
  for (const [value, options] of fixtures) assert.equal(decodeHexToText(value, options).text, "Aé😀");
  for (const [value, options] of [["4g", { mode: "continuous" }], ["abc", { mode: "continuous" }], ["41,,42", { mode: "comma" }], ["0x41 42", { mode: "space", allowPrefix: false }], ["c3 28", { mode: "space" }]]) {
    assert.equal(decodeHexToText(value, options).ok, false);
  }
  assert.equal(decodeHexToText("0x", { mode: "continuous", allowPrefix: true }).ok, false);
});

test("binary uses complete UTF-8 bytes and never pads or strips", async () => {
  const { textToBinary } = await importTypeScript("app/client/components/text-to-binary/textToBinaryTransforms.ts");
  const { decodeBinary } = await importTypeScript("app/client/components/binary-to-text/binaryTransforms.ts");
  const encoded = textToBinary("Aé😀");
  assert.equal(encoded.ok, true);
  assert.equal(encoded.value, "01000001 11000011 10101001 11110000 10011111 10011000 10000000");
  assert.equal(decodeBinary(encoded.value, { mode: "space" }).outputText, "Aé😀");
  const continuous = textToBinary("é", { separatorMode: "none" }).value;
  assert.equal(decodeBinary(continuous, { mode: "continuous" }).outputText, "é");
  const custom = textToBinary("Aé", { separatorMode: "custom", customSeparator: "|" }).value;
  assert.equal(decodeBinary(custom, { mode: "custom", customSeparator: "|" }).outputText, "Aé");
  for (const [value, options] of [["0100000x", { mode: "continuous" }], ["0100000", { mode: "continuous" }], ["01000001 1", { mode: "space" }], ["11000011 00101000", { mode: "space" }]]) assert.equal(decodeBinary(value, options).ok, false);
});

test("ASCII is strict 0 through 127 and reports control details", async () => {
  const { textToAscii } = await importTypeScript("app/client/components/text-to-ascii/textToAsciiTransforms.ts");
  const { decodeDecimalAscii } = await importTypeScript("app/client/components/ascii-to-text/asciiToTextTransforms.ts");
  assert.equal(textToAscii("A\u0000\u001f ~\u007f").ok, true);
  assert.equal(textToAscii("é").ok, false);
  const decoded = decodeDecimalAscii("0 31 32 126 127");
  assert.equal(decoded.ok, true);
  assert.deepEqual(decoded.controls.map(({ value, name }) => [value, name]), [[0, "NUL"], [31, "US"], [127, "DEL"]]);
  assert.match(decoded.warning, /control/i);
  assert.equal(decodeDecimalAscii("65,66", { mode: "comma" }).output, "AB");
  assert.equal(decodeDecimalAscii("65|66", { mode: "custom", customSeparator: "|" }).output, "AB");
  for (const value of ["-1", "128", "65.5", "hello", "0x41", "0b1000001", "65,,66"]) assert.equal(decodeDecimalAscii(value, { mode: value.includes(",") ? "comma" : "space" }).ok, false);
  assert.equal(decodeDecimalAscii("65 66").output, "AB");
  assert.equal(textToAscii(decodeDecimalAscii("65 66").output).output, "65 66");
});

test("ASCII decoding handles a large accepted input without dropping control values", async () => {
  const { decodeDecimalAscii } = await importTypeScript("app/client/components/ascii-to-text/asciiToTextTransforms.ts");
  const repeated = 150_000;
  const decoded = decodeDecimalAscii("65 ".repeat(repeated) + "0 13 10 127");
  assert.equal(decoded.ok, true);
  assert.equal(decoded.output, "A".repeat(repeated) + "\0\r\n\x7f");
  assert.equal(decoded.count, repeated + 4);
  assert.deepEqual(decoded.controls.map(({ value }) => value), [0, 13, 10, 127]);
});

test("byte decoders preserve leading and embedded UTF-8 U+FEFF", async () => {
  const { decodeBase64ToText } = await importTypeScript("app/client/components/base64-decode/base64DecodeTransforms.ts");
  const { decodeBinary } = await importTypeScript("app/client/components/binary-to-text/binaryTransforms.ts");
  const { decodeHexToText } = await importTypeScript("app/client/components/hex-to-text/utils/hexDecode.ts");
  const source = "\uFEFFA\uFEFFé😀";
  const bytes = Buffer.from(source);
  assert.equal(decodeBase64ToText(bytes.toString("base64")).value, source);
  assert.equal(decodeHexToText(bytes.toString("hex"), { mode: "continuous" }).text, source);
  const bits = Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join(" ");
  assert.equal(decodeBinary(bits).outputText, source);
});

test("shared size policy covers normal, warning, hard-limit, and preview thresholds", async () => {
  const { assessInputSize, INPUT_SIZE_POLICY } = await importTypeScript("app/client/text/input-size.ts");
  assert.equal(assessInputSize("a".repeat(10 * 1024)).level, "normal");
  assert.equal(assessInputSize("a".repeat(100 * 1024)).level, "normal");
  assert.equal(assessInputSize("a".repeat(1024 * 1024)).level, "warning");
  assert.equal(assessInputSize("a".repeat(5 * 1024 * 1024)).level, "warning");
  assert.equal(assessInputSize("a".repeat(5 * 1024 * 1024 + 1)).level, "blocked");
  assert.equal(INPUT_SIZE_POLICY.previewRows, 200);
});

test("workflow recipes handle spreadsheet columns, wrapped text, and case-insensitive IDs", async () => {
  const { runTextWorkflow, workflowPresets } = await importTypeScript("app/client/text/text-workflow.ts");
  const examples = [
    ["  Café  \r\n東京\r\nCafé\r\nA\tB", "Café\n東京\nA\tB"],
    ["  Résumé starts\r\nhere.  \r\n\r\nSecond  paragraph\r\nwith 😀 and e\u0301.", "Résumé starts here.\n\nSecond paragraph with 😀 and e\u0301."],
    ["  Équipe\r\néquipe\r\n  ALPHA\r\nalpha", "équipe, alpha"],
  ];
  for (const [index, [source, output]] of examples.entries()) {
    assert.deepEqual(runTextWorkflow(source, workflowPresets[index].steps), { ok: true, output });
  }

  const source = "É\r\né\r\n東京";
  assert.deepEqual(runTextWorkflow(source, ["lowercase", "remove-duplicates"]), { ok: true, output: "é\n東京" });
  assert.deepEqual(runTextWorkflow(source, ["remove-duplicates", "lowercase"]), { ok: true, output: "é\né\n東京" });
  assert.deepEqual(runTextWorkflow("  \r\n ", ["trim-text"]), { ok: true, output: "" });
});

test("workflow refuses unknown steps, invalid Unicode and oversized source or output", async () => {
  const { runTextWorkflow, WORKFLOW_MAX_BYTES, WORKFLOW_MAX_STEPS } = await importTypeScript("app/client/text/text-workflow.ts");
  assert.match(runTextWorkflow("test", []).error, /between 1 and 12/);
  assert.match(runTextWorkflow("test", Array(WORKFLOW_MAX_STEPS + 1).fill("trim-text")).error, /between 1 and 12/);
  for (const step of ["missing", "__proto__", "constructor"]) {
    assert.match(runTextWorkflow("test", [step]).error, /unknown step/);
  }
  assert.match(runTextWorkflow("\ud800", ["lowercase"]).error, /invalid Unicode/);
  assert.match(runTextWorkflow("😀".repeat(WORKFLOW_MAX_BYTES / 4 + 1), ["trim-text"]).error, /source exceeds/);
  assert.match(runTextWorkflow("İ".repeat(100_000), ["lowercase"]).error, /output limit/);
  const exact = "😀".repeat(WORKFLOW_MAX_BYTES / 4);
  assert.deepEqual(runTextWorkflow(exact, ["trim-text"]), { ok: true, output: exact });
});

test("homepage Base64 handles large UTF-8 without injecting errors into text", async () => {
  const { converters } = await importTypeScript("app/client/components/home/textConverters.ts");
  const value = "⚠️ Café 東京 e\u0301 😀\r\n".repeat(18_000);
  const encoded = converters["Encode Base64"](value);
  assert.equal(encoded, Buffer.from(value, "utf8").toString("base64"));
  assert.equal(converters["Decode Base64"](encoded), value);
  assert.throws(() => converters["Decode Base64"]("not valid!"), /Base64/);
  assert.throws(() => converters["Decode Base64"]("/w=="), /UTF-8/);
  assert.throws(() => converters["Encode Base64"]("\ud800"), /surrogate/);
});
