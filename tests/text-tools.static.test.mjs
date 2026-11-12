import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import "./table-workspace.behavior.test.mjs";
import "./batch-text.behavior.test.mjs";
import "./markdown-table.behavior.test.mjs";
import "./compare-two-lists.behavior.test.mjs";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("text tool engines centralize logical-line, list, and CSV semantics", async () => {
  const [core, list, csv] = await Promise.all([
    read("app/client/text/text-core.ts"),
    read("app/client/text/list-core.ts"),
    read("app/client/text/csv.ts"),
  ]);
  assert.match(core, /replace\(\/\\r\\n\|\\r\/g, "\\n"\)/);
  assert.match(core, /mode: "space" \| "nothing" \| "custom" \| "paragraphs" \| "blank-lines"/);
  assert.match(list, /parseSimpleList/);
  assert.match(csv, /RFC 4180-style state machine/);
  assert.match(csv, /Unterminated quoted field/);
  assert.match(csv, /value\.replace\(\/"\/g, '\"\"'\)/);
});

test("line break removal preserves unrelated whitespace and applies the selected join rules", async () => {
  const { transformLineBreaks } = await import("../app/client/text/text-core.ts");
  const apply = (input, options) => transformLineBreaks(input, options).output;
  const input = "  A  B\r\n\tC\r\n \t\r\n\r\n😀\re\u0301\n";

  assert.equal(apply("", { mode: "space" }), "");
  assert.equal(apply("\r\n", { mode: "space", collapseJoinSpaces: true }), "");
  assert.equal(apply("\r\n", { mode: "space", retainFinalNewline: true }), "\n");
  assert.equal(apply(input, { mode: "space", collapseJoinSpaces: true }), "A  B C 😀 e\u0301");
  assert.equal(apply(input, { mode: "space", collapseJoinSpaces: false }), "A  B C   😀 e\u0301");
  assert.equal(apply(input, { mode: "nothing" }), "A  BC😀e\u0301");
  assert.equal(apply("a\r\nb\rc\n", { mode: "custom", separator: "\t  / ", collapseJoinSpaces: true }), "a\t  / b\t  / c");
  assert.equal(apply(input, { mode: "paragraphs", retainFinalNewline: true }), "A  B C\n\n😀 e\u0301\n");
  assert.equal(apply("  A  B \r\n  C\r\n", { mode: "space", preserveIndentation: true }), "  A  B   C");

  const bullets = " - item  1\r\n\t\r\n\u2003\n  - item  2\r";
  assert.equal(apply(bullets, { mode: "blank-lines", collapseJoinSpaces: true }), " - item  1\n  - item  2");
  assert.equal(apply(bullets, { mode: "blank-lines", trimEachLine: true, retainFinalNewline: true }), "- item  1\n- item  2\n");

  const large = "café\r\n".repeat(25_000);
  const largeResult = transformLineBreaks(large, { mode: "custom", separator: "," });
  assert.equal(largeResult.output, "café,".repeat(24_999) + "café");
  assert.equal(largeResult.statistics.inputLines, 25_001);
  assert.equal(largeResult.statistics.outputLines, 1);
});

test("space cleanup honors line-break settings and preserves Unicode join controls", async () => {
  const { cleanExtraSpaces } = await import("../app/client/text/text-core.ts");
  const { cleanText } = await import("../app/client/components/text-cleaner/textCleanerTransforms.ts");
  assert.equal(cleanExtraSpaces("a  b\r\nc  d\re\n\nf").output, "a b\nc d\ne\n\nf");
  assert.equal(cleanExtraSpaces("a  b\r\nc  d\re\n\nf", { preserveLineBreaks: false }).output, "a b c d e f");
  assert.equal(cleanExtraSpaces("a\tb\r\nc", { preserveLineBreaks: false, preserveTabs: true }).output, "a\tb c");
  const result = cleanText("\uFEFFFamily 👨‍👩‍👧‍👦 and می\u200cروم\u200B");
  assert.equal(result.output, "Family 👨‍👩‍👧‍👦 and می\u200cروم");
  assert.equal(result.applied.find((item) => item.key === "remove_zero_width").count, 2);
});

test("CSV parsing handles quoted delimiters, multiline values, terminal newlines and malformed quotes", async () => {
  const { build } = await import("esbuild");
  const { fileURLToPath } = await import("node:url");
  const { outputFiles: [bundle] } = await build({
    stdin: {
      contents: [
        'export { parseCsv, serializeCsv } from "./app/client/text/csv.ts";',
        'export { tableToList } from "./app/client/components/table-to-list/tableToListTransforms.ts";',
      ].join("\n"),
      resolveDir: fileURLToPath(new URL("..", import.meta.url)),
    },
    bundle: true,
    write: false,
    format: "esm",
  });
  const { parseCsv, serializeCsv, tableToList } =
    await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

  const parsed = parseCsv('\uFEFF"Québec, Canada\nDistrict, East";"Quoted ""name"""\r\n"東京";"emoji 😀"\r');
  assert.equal(parsed.delimiter, ";");
  assert.deepEqual(parsed.rows, [
    ["Québec, Canada\nDistrict, East", 'Quoted "name"'],
    ["東京", "emoji 😀"],
  ]);
  assert.deepEqual(parseCsv("").rows, []);
  assert.deepEqual(parseCsv("a,b\n\n").rows, [["a", "b"], [""]]);
  assert.deepEqual(parseCsv("a,").rows, [["a", ""]]);
  assert.match(parseCsv('name,city\nAda,"Toronto"bad', ",").error, /after closing quote at row 2, column 2/);
  assert.match(parseCsv('"unfinished').error, /Unterminated quoted field/);
  assert.match(parseCsv('a,b"bad', ",").error, /Unexpected quote/);

  const csv = serializeCsv([["value"], ["Toronto, ON"], ['He said "hi"'], [""], ["東京"]], { bom: true });
  assert.equal(csv, '\uFEFFvalue\r\n"Toronto, ON"\r\n"He said ""hi"""\r\n""\r\n東京\r\n');
  assert.deepEqual(parseCsv(csv).rows, [["value"], ["Toronto, ON"], ['He said "hi"'], [""], ["東京"]]);
  assert.equal(parseCsv("a,b\n".repeat(150_000)).rows.length, 150_000);

  assert.equal(tableToList('name,city\r\nAda,"Toronto, ON"\r\nLin,"Two\nlines"', { columnIndex: 1 }).output, "city\nToronto, ON\nTwo\nlines");
  assert.equal(tableToList("name\tcity\nAda\tQuébec", { columnIndex: 1 }).output, "city\nQuébec");
  const malformedTable = tableToList('name,city\nAda,"Toronto', { columnIndex: 1 });
  assert.equal(malformedTable.output, "");
  assert.match(malformedTable.error, /Unterminated quoted field/);
});

test("CSV routes are canonical, local, and use bounded previews", async () => {
  const [routes, config, listToCsv, csvToList] = await Promise.all([
    read("app/routes.ts"), read("app/site-config.ts"),
    read("app/client/components/list-to-csv/ListToCsvToolCard.tsx"),
    read("app/client/components/csv-to-list/CsvToListToolCard.tsx"),
  ]);
  for (const source of [routes, config]) { assert.match(source, /list-to-csv/); assert.match(source, /csv-to-list/); }
  for (const source of [listToCsv, csvToList]) { assert.match(source, /slice\(0, 25\)/); assert.match(source, /navigator\.clipboard/); assert.doesNotMatch(source, /fetch\(/); }
});

test("encoding engines and the byte-counter route use explicit UTF-8 terminology", async () => {
  const [bytes, metrics, routes, config] = await Promise.all([
    read("app/client/text/bytes.ts"), read("app/client/text/metrics.ts"),
    read("app/routes.ts"), read("app/site-config.ts"),
  ]);
  assert.match(bytes, /TextDecoder\("utf-8", \{ fatal: true, ignoreBOM: true \}\)/);
  assert.match(bytes, /Complete bytes require a multiple of 8/);
  assert.match(bytes, /outside the ASCII range/);
  assert.match(metrics, /utf16CodeUnits/);
  assert.match(metrics, /graphemes/);
  for (const source of [routes, config]) assert.match(source, /byte-counter/);
});

test("encoding and XML routes use the accessible shared card and canonical related links", async () => {
  const cards = await Promise.all([
    "html-to-text/HtmlToTextToolCard.tsx", "text-to-html/TextToHtmlToolCard.tsx",
    "xml-to-text/XmlToTextToolCard.tsx", "text-to-xml/TextToXmlToolCard.tsx",
    "url-encode/UrlEncodeToolCard.tsx", "url-decode/UrlDecodeToolCard.tsx",
    "text-to-hex/TextToHexToolCard.tsx", "hex-to-text/components/HexToTextToolCard.tsx",
    "text-to-binary/TextToBinaryToolCard.tsx", "binary-to-text/BinaryToTextToolCard.tsx",
    "text-to-ascii/TextToAsciiToolCard.tsx", "ascii-to-text/AsciiToTextToolCard.tsx",
  ].map((path) => read(`app/client/components/${path}`)));
  for (const card of cards) {
    assert.match(card, /ConverterCard/);
    assert.match(card, /clearResult/);
    assert.doesNotMatch(card, /fetch\(|XMLHttpRequest|sendBeacon/);
  }
  const shared = await read("app/client/components/converter/ConverterCard.tsx");
  assert.match(shared, /<fieldset/);
  assert.match(shared, /<legend/);
  assert.match(shared, /role="alert"/);
  assert.match(shared, /role="status"/);
  assert.match(shared, /navigator\.clipboard\.writeText\(props\.output\)/);
  assert.match(shared, /new Blob\(\[output\]/);
  assert.match(shared, /min-h-11/);
});

test("List to Table keeps multiword rows and recognizes imported line endings", async () => {
  const { parseListItems, toCsv } = await import("../app/client/components/list-to-table/listToTableTransforms.ts");
  const input = 'New York\rMontréal, QC\r\nDesk "A"\n';
  assert.deepEqual(parseListItems(input, "lines"), ["New York", "Montréal, QC", 'Desk "A"']);
  assert.equal(toCsv(parseListItems(input, "lines")), 'New York\n"Montréal, QC"\n"Desk ""A"""');
  assert.deepEqual(parseListItems("one two\rthree", "whitespace"), ["one", "two", "three"]);
});

test("shared input policy and XML security rules are permanent and browser-local", async () => {
  const [size, xml, docs] = await Promise.all([
    read("app/client/text/input-size.ts"), read("app/client/text/xml.ts"),
    read("docs/encoding-and-text-metrics-policies.md"),
  ]);
  assert.match(size, /warningBytes:\s*1024 \* 1024/);
  assert.match(size, /hardLimitBytes:\s*5 \* 1024 \* 1024/);
  assert.match(size, /previewRows:\s*200/);
  assert.match(xml, /DOCTYPE/); assert.match(xml, /ENTITY/); assert.match(xml, /SYSTEM\|PUBLIC/);
  assert.doesNotMatch(xml, /fetch\(|XMLHttpRequest/);
  assert.match(docs, /External DTD\/entity declarations must be rejected/);
});

test("case routes and counters share Unicode engines and local accessible interfaces", async () => {
  const [caseEngine, metrics, caseCard, counterCard, routes, config] = await Promise.all([
    read("app/client/text/case.ts"), read("app/client/text/metrics.ts"),
    read("app/client/components/case-converter/CaseTransformToolCard.tsx"),
    read("app/client/components/counter/CounterToolCard.tsx"),
    read("app/routes.ts"), read("app/site-config.ts"),
  ]);
  assert.match(caseEngine, /Intl\.Segmenter/);
  assert.match(caseEngine, /applyMatchCase/);
  assert.match(caseEngine, /unit \?\? "letters"/);
  assert.match(metrics, /withoutLiteralSpaces/);
  assert.match(metrics, /withoutWhitespace/);
  assert.match(metrics, /granularity: "word"/);
  assert.match(caseCard, /ConverterCard/);
  assert.match(counterCard, /setTimeout\(\(\) => setResult/);
  assert.match(counterCard, /new Worker\(new URL\("\.\/counter-metrics\.worker\.ts", import\.meta\.url\)/);
  assert.match(counterCard, /role="alert"/);
  assert.match(counterCard, /role="status"/);
  assert.doesNotMatch(caseEngine + metrics + caseCard + counterCard, /fetch\(|XMLHttpRequest|sendBeacon/);
  for (const path of ["case-converter", "uppercase-converter", "lowercase-converter", "title-case-converter", "sentence-case-converter", "alternating-case-converter", "text-case-checker", "match-case-converter", "character-counter", "word-counter", "byte-counter"]) {
    assert.match(routes, new RegExp(path));
    assert.match(config, new RegExp(path));
  }
});

test("comma list tools preserve quoted values, logical lines, and the requested separator", async () => {
  const { build } = await import("esbuild");
  const { fileURLToPath } = await import("node:url");
  const { outputFiles: [bundle] } = await build({
    stdin: {
      contents: [
        'export { textToCommaSeparatedList } from "./app/client/components/text-to-comma-separated-list/textToCommaSeparatedListTransforms.ts";',
        'export { listToCommaSeparated } from "./app/client/components/list-to-comma-separated/listToCommaTransforms.ts";',
        'export { commaSeparatedToList } from "./app/client/components/comma-separated-to-list/commaSeparatedToListTransforms.ts";',
      ].join("\n"),
      resolveDir: fileURLToPath(new URL("..", import.meta.url)),
    },
    bundle: true,
    write: false,
    format: "esm",
  });
  const { textToCommaSeparatedList, listToCommaSeparated, commaSeparatedToList } =
    await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

  const options = { splitMode: "lines", trimItems: true, ignoreEmpty: true, quoteItems: true, spaceAfterComma: false };
  const result = textToCommaSeparatedList('1. Café\r2. Toronto, ON\r\n3. He said "hi"\n\n', options);
  assert.equal(result.output, '"Café","Toronto, ON","He said ""hi"""');
  assert.equal(result.strippedPrefixCount, 3);
  assert.equal(textToCommaSeparatedList("", options).output, "");
  assert.equal(textToCommaSeparatedList(" A ; B,\n C  D", { ...options, splitMode: "auto", quoteItems: false, spaceAfterComma: true }).output, "A, B, C, D");
  assert.equal(listToCommaSeparated(" café \r\n\r\n tea", { spaceAfterComma: true }).output, "café, tea");
  assert.equal(listToCommaSeparated(" café \r\n\r\n tea", { spaceAfterComma: false }).output, "café,tea");
  assert.equal(commaSeparatedToList(result.output).output, 'Café\nToronto, ON\nHe said "hi"');
  assert.match(commaSeparatedToList('apple,"banana').error, /Unterminated quoted field/);
});
