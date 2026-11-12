import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const { outputFiles: [bundle] } = await build({
  stdin: {
    contents: 'export * from "./app/client/text/xml-formatter-engine.ts"; export * from "./app/client/text/xml-format-options.ts";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true, write: false, format: "esm",
});
const { formatXml, xmlFormatLimits } = await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));
const { DOMParser } = new JSDOM().window;
const parserFactory = () => new DOMParser();
const execute = (source, options = {}, factory = parserFactory) => formatXml(source, {
  operation: "format", indent: "two", reindentContent: false, ...options,
}, factory);
function run(source, options) {
  const response = execute(source, options);
  assert.ok("result" in response, response.error?.message);
  return response.result;
}

function signature(source) {
  const doc = parserFactory().parseFromString(source, "application/xml");
  assert.equal(doc.getElementsByTagNameNS("http://www.mozilla.org/newlayout/xml/parsererror.xml", "parsererror").length, 0);
  function snapshot(node) {
    if (node.nodeType !== 1) return [node.nodeType, node.nodeName, node.nodeValue];
    return [
      node.namespaceURI, node.tagName,
      [...node.attributes].map((attribute) => [attribute.namespaceURI, attribute.name, attribute.value]),
      [...node.childNodes].map(snapshot),
    ];
  }
  return [...doc.childNodes].map(snapshot);
}

test("default format and compact preserve DOM semantics, lexical attributes, and existing character data", () => {
  const declaration = '<?xml version="1.0" encoding="UTF-8"?>';
  const source = declaration + "\r\n<!-- note -->" +
    '<ns:root xmlns:ns = "urn:items" q = \'a > b &amp; c\' >\r\n  <ns:item code = "東京" />  \n</ns:root  ><?keep exactly?>';
  const pretty = run(source);
  assert.equal(pretty.output, declaration + "\n<!-- note -->\n" +
    '<ns:root\n  xmlns:ns="urn:items"\n  q=\'a > b &amp; c\'>\r\n  <ns:item code="東京"/>  \n</ns:root>\n<?keep exactly?>\n');
  assert.equal(pretty.elements, 2);
  assert.equal(pretty.depth, 2);
  assert.equal(pretty.sourceBytes, Buffer.byteLength(source));
  assert.equal(pretty.outputBytes, Buffer.byteLength(pretty.output));
  assert.deepEqual(signature(pretty.output), signature(source));
  const compact = run(source, { operation: "compact" }).output;
  assert.deepEqual(signature(compact), signature(source));
  assert.match(compact, /<ns:root xmlns:ns="urn:items" q='a > b &amp; c'>\r\n  <ns:item code="東京"\/>/);
  assert.equal(run(source, { operation: "validate" }).output, null);
});

test("opt-in structural layout preserves mixed content, CDATA, xml:space, and explicit character references", () => {
  const mixed = "<p>Before <b  k='x' >bold</b> after\r\n<![CDATA[<raw>\n東京]]></p>";
  const kept = "<keep xml:space = 'preserve'>  \r\n<inner xml:space='default'><one /> <two /></inner> \n</keep>";
  const reference = "<ref><one/>&#x20;<two/></ref>";
  const leaf = "<leaf>  \r\n </leaf>";
  const source = "<root>" + mixed + kept + reference + leaf + "<data>   <item/><next/>  </data></root>";
  const formatted = run(source, { reindentContent: true, indent: "tab" });
  assert.equal(formatted.output, [
    "<root>", "\t" + mixed, "\t" + kept, "\t" + reference, "\t" + leaf,
    "\t<data>", "\t\t<item/>", "\t\t<next/>", "\t</data>", "</root>", "",
  ].join("\n"));
  assert.equal(run(formatted.output, { reindentContent: true, operation: "compact" }).output,
    "<root>" + mixed + kept + reference + leaf + "<data><item/><next/></data></root>");
  assert.ok(formatted.protectedSections >= 3);
});

test("doctype and entity declarations, stylesheet processing, XInclude, and incompatible XML declarations are rejected", () => {
  const blocked = [
    ['<!DOCTYPE root SYSTEM "https://example.invalid/secret.dtd"><root/>', /DTD/],
    ['<!DOCTYPE root [<!ENTITY x SYSTEM "file:///secrets">]><root>&x;</root>', /DTD/],
    ['<?xml-stylesheet href="https://example.invalid/style.xsl"?><root/>', /stylesheet/],
    ['<?xml version="1.1"?><root/>', /XML 1\.0/],
    ['<?xml version="1.0" encoding="ISO-8859-1"?><root/>', /UTF-8/],
  ];
  for (const [source, message] of blocked) {
    let parses = 0;
    const result = execute(source, {}, () => { parses++; return parserFactory(); });
    assert.equal(parses, 0, "blocked before native parsing");
    assert.match(result.error.message, message);
    assert.equal(result.error.position.line, 1);
    assert.doesNotMatch(result.error.message, /example\.invalid|secrets/);
  }
  for (const source of [
    '<root><alternative:include xmlns:alternative="http://www.w3.org/2001/XInclude" href="https://example.invalid/external"/></root>',
    '<include xmlns="http://www.w3.org/2001/XInclude" href="https://example.invalid/external"/>',
    '<root><i:include xmlns:i="http://www.w3.org/2001/&#88;Include"/></root>',
  ]) assert.match(execute(source).error.message, /XInclude elements are disabled/);
});

test("comments, processing instruction data, harmless namespaces, BOM, and schema hints are inert and preserved", () => {
  const source = '\uFEFF<?xml version="1.0" encoding="utf-8"?>' +
    '<?job literal="<!DOCTYPE example>"?>' +
    '<!-- <!ENTITY x SYSTEM "https://example.invalid/dtd"> -->' +
    '<parsererror xmlns:xi="urn:unrelated" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:sample https://example.invalid/file.xsd">' +
    '<xi:include/> <![CDATA[<!DOCTYPE fake>]]></parsererror>';
  const result = run(source, { operation: "compact", reindentContent: true });
  assert.equal(result.output, source);
  assert.equal(result.elements, 2);
  const literal = '<r xmlns:h="http://www.w3.org/1999/xhtml"><h:parsererror>actual data</h:parsererror></r>';
  assert.equal(run(literal, { operation: "compact" }).output, literal);
  const unprefixed = '<root xmlns="http://www.w3.org/1999/xhtml"><parsererror>ordinary data</parsererror></root>';
  const rootMarker = '<parsererror xmlns="http://www.w3.org/1999/xhtml"><value/></parsererror>';
  const geckoMarker = '<parsererror xmlns="http://www.mozilla.org/newlayout/xml/parsererror.xml">data</parsererror>';
  for (const source of [unprefixed, rootMarker, geckoMarker]) {
    assert.equal(run(source, { operation: "compact" }).output, source);
  }
});

test("malformed structures fail safely with no source snippet in diagnostics", () => {
  for (const source of [
    "<r><x></r>", "<r><x></x>", '<r a="PRIVATE-SOURCE-1" a="b"/>', "<prefix:r/>", "<a/><b/>", "<r>&unknown;</r>",
    "<r><!-- invalid -- comment --></r>", '<r xmlns:x="urn:one" xmlns:y="urn:one" x:a="1" y:a="2"/>',
    '<root xmlns="http://www.w3.org/1999/xhtml"><parsererror>data</root>',
    '<parsererror xmlns="http://www.w3.org/1999/xhtml"></atc-parser-probe-0>',
  ]) {
    const { error } = execute(source);
    assert.ok(error, source);
    assert.doesNotMatch(error.message, /PRIVATE-SOURCE-1/);
  }
  assert.deepEqual(execute("<r>\r\n\u0001</r>").error.position, { offset: 5, line: 2, column: 1 });
  assert.deepEqual(execute("<r>\n\uD800</r>").error.position, { offset: 4, line: 2, column: 1 });
  assert.match(execute("<r><!-- unfinished").error.message, /comment/);
  assert.match(execute('<r a="unfinished').error.message, /matching quote/);
  assert.equal(execute("<r>\n<other></r>").error.position.line, 2);
});

test("UTF-8 size, nesting, token, and output caps reject work before unbounded parsing or expansion", () => {
  const exact = "<r>" + "é".repeat((xmlFormatLimits.inputBytes - 8) / 2) + "a</r>";
  assert.equal(run(exact, { operation: "validate" }).sourceBytes, xmlFormatLimits.inputBytes);
  assert.match(execute(exact + " ").error.message, /512 KiB/);
  assert.equal(run("<r>".repeat(127) + "<r/>" + "</r>".repeat(127), { operation: "validate" }).depth, 128);
  let parses = 0;
  const factory = () => { parses++; return parserFactory(); };
  assert.match(execute("<r>".repeat(128) + "<r/>" + "</r>".repeat(128), {}, factory).error.message, /128 nested/);
  assert.match(execute("<r>" + "<i/>".repeat(30_000) + "</r>", {}, factory).error.message, /30,000 XML tokens/);
  assert.equal(parses, 0);
  const expanded = "<r>".repeat(120) + "<i/>".repeat(5000) + "</r>".repeat(120);
  assert.match(execute(expanded, { reindentContent: true, indent: "four" }).error.message, /2 MiB/);
  assert.equal(run(expanded, { operation: "compact", reindentContent: true }).output, expanded);
});

test("60 seeded structural samples retain all nodes and attributes across default format and compact", () => {
  let seed = 3816;
  const pick = (length) => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return (seed >>> 7) % length;
  };
  const atoms = ["", " \n ", "a &amp; b", "東京", "👩‍💻", "<![CDATA[ <id> ]]>", "<?task test?>", "<!-- keep -->"];
  function element(level) {
    const tag = "x:" + ["entry", "row", "商品"][pick(3)];
    const attribute = ["", ' id = "foo &quot; bar"', " ref = 'x &gt; y' title = \"東京\" "][pick(3)];
    if (pick(5) === 0) return "<" + tag + attribute + "/>";
    const nested = level > 0 ? element(level - 1) : "";
    return "<" + tag + attribute + ">" + atoms[pick(atoms.length)] + nested + atoms[pick(atoms.length)] + "</" + tag + ">";
  }
  for (let index = 0; index < 60; index++) {
    const original = '<root xmlns:x="urn:x">' + element(3) + "</root>";
    const formatted = run(original, { indent: ["two", "four", "tab"][index % 3] }).output;
    const compact = run(formatted, { operation: "compact" }).output;
    assert.deepEqual(signature(formatted), signature(original));
    assert.deepEqual(signature(compact), signature(original));
  }
});
