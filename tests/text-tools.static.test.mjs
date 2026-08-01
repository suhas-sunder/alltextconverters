import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
  assert.match(bytes, /TextDecoder\("utf-8", \{ fatal: true \}\)/);
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
  assert.match(counterCard, /setTimeout\(\(\) => setMetrics/);
  assert.match(counterCard, /role="alert"/);
  assert.match(counterCard, /role="status"/);
  assert.doesNotMatch(caseEngine + metrics + caseCard + counterCard, /fetch\(|XMLHttpRequest|sendBeacon/);
  for (const path of ["case-converter", "uppercase-converter", "lowercase-converter", "title-case-converter", "sentence-case-converter", "alternating-case-converter", "text-case-checker", "match-case-converter", "character-counter", "word-counter", "byte-counter"]) {
    assert.match(routes, new RegExp(path));
    assert.match(config, new RegExp(path));
  }
});
