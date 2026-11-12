import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  stdin: {
    contents: 'export * from "./app/client/text/csv-json.ts"; export * from "./app/client/text/csv.ts";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true,
  format: "esm",
  write: false,
});
const { csvJsonLimits, delimitedToJson, jsonToDelimited, parseCsv, serializeCsv } =
  await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const toJson = (source, options = {}) => delimitedToJson(source, {
  delimiter: "auto", includeHeader: true, outputShape: "objects", interpretJson: false, sortRows: false, ...options,
});
const toCsv = (source, options = {}) => jsonToDelimited(source, {
  delimiter: ",", includeHeader: true, allowNested: true, prefixFormulas: false, sortRows: false, ...options,
});

test("CSV defaults preserve identifiers, whitespace, empty and missing values with collision-proof headers", () => {
  const result = toJson('\uFEFFsku,sku,sku_2,,Column 4\r0012,0023,,Montréal,\r0013,東京\r', { delimiter: "," });
  assert.equal(result.ok, true);
  assert.equal(result.columns, 5);
  assert.deepEqual(JSON.parse(result.output), [
    { sku: "0012", sku_3: "0023", sku_2: "", "Column 4_2": "Montréal", "Column 4": "" },
    { sku: "0013", sku_3: "東京", sku_2: null, "Column 4_2": null, "Column 4": null },
  ]);
  assert.match(result.notices.join("\n"), /missing cells.*\n.*unique names/);
  assert.deepEqual(JSON.parse(toJson('  x  ,y\n', { includeHeader: false }).output), [{ "Column 1": "  x  ", "Column 2": "y" }]);
  assert.equal(toJson("Only a header").output, "[]\n");
});

test("CSV emits row arrays and only interprets valid JSON when opted in", () => {
  const result = toJson('9007199254740993;-0;0012;null;true;"{""n"":1e999}";invalid;\n', {
    delimiter: ";", includeHeader: false, outputShape: "arrays", interpretJson: true,
  });
  assert.equal(result.output, '[\n  [9007199254740993, -0, "0012", null, true, {"n":1e999}, "invalid", ""]\n]\n');
  assert.match(toJson("id|color\n1|blue", { delimiter: "|" }).output, /"id": "1", "color": "blue"/);
});

test("JSON object export preserves number lexemes, key order, nested JSON and explicit null", () => {
  const result = toCsv('\uFEFF[\r\n {"10":9007199254740993,"2":-0,"details":{"n":1e999},"nullable":null},\r {"2":1.2300e-16,"city":"東京\\tQuébec","__proto__":true},{}\r\n]');
  assert.equal(result.ok, true);
  assert.equal(result.output,
    '10,2,details,nullable,city,__proto__\r\n9007199254740993,-0,"{""n"":1e999}",null,,\r\n'
    + ',1.2300e-16,,,東京\tQuébec,true\r\n,,,,,\r\n');
  const rowArrays = toCsv('[["id",1],["short"],[],["b",null,["x",2]]]', { delimiter: "\t", includeHeader: false });
  assert.deepEqual(parseCsv(rowArrays.output, "\t").rows, [
    ["id", "1", ""], ["short", "", ""], ["", "", ""], ["b", "null", '["x",2]'],
  ]);
});

test("stable optional sorting uses first-column text and leaves duplicates in source order", () => {
  const source = 'sort,token\nb,first\n10,next\n2,other\nb,last\n';
  assert.deepEqual(JSON.parse(toJson(source, { outputShape: "arrays", sortRows: true }).output), [
    ["10", "next"], ["2", "other"], ["b", "first"], ["b", "last"],
  ]);
  assert.equal(toCsv('[{"x":"b","y":1},{"x":"a","y":2},{"x":"b","y":3}]', { delimiter: ";", sortRows: true }).output,
    "x;y\r\na;2\r\nb;1\r\nb;3\r\n");
});

test("formula-risk option changes only emitted header and string cells with suspicious prefixes", () => {
  const source = '[{"=heading":" ＋SUM(1,2)","real":-42,"fake":"-001","newline":"\\nnotes","plain":"ok","formula":"=x\\";=z"}]';
  const raw = toCsv(source);
  assert.equal(raw.formulaCells, 5);
  const protectedOutput = toCsv(source, { prefixFormulas: true });
  assert.deepEqual(parseCsv(protectedOutput.output, ",").rows, [
    ["'=heading", "real", "fake", "newline", "plain", "formula"],
    ["' ＋SUM(1,2)", "-42", "'-001", "'\nnotes", "ok", '\'=x";=z'],
  ]);
  assert.equal(toCsv(source, { includeHeader: false }).formulaCells, 4);
});

test("invalid CSV and JSON fail with actionable positions and zero partial output", () => {
  const cases = [
    [toJson('a,b\n"unfinished', { delimiter: "," }), /row 2, column 1/],
    [toJson('a,b\nx,"bad"y', { delimiter: "," }), /row 2, column 2/],
    [toJson("", { delimiter: "," }), /Paste or open/],
    [toCsv('[{"x":1},\n{"y":}]'), /Invalid JSON at line 2, column/],
    [toCsv('{"x":1}'), /array of objects/],
    [toCsv('[{"x":1},null]'), /Record 2 must/],
    [toCsv('[[],{}]'), /Record 2 has a different shape/],
    [toCsv('[{"x":1,"\\u0078":2}]'), /Duplicate key at record 1, column 2/],
    [toCsv('[{"\\uD800":1}]'), /key at record 1, column 1/],
    [toCsv('[["\\uD800"]]'), /string at record 1, column 1/],
    [toCsv('[{},{}]'), /define the columns/],
    [toCsv('[{"nested":{}}]', { allowNested: false }), /Nested JSON at record 1, column 1/],
  ];
  for (const [result, reason] of cases) {
    assert.equal(result.ok, false);
    assert.match(result.error, reason);
    assert.equal(result.output, undefined);
  }
});

test("parser limits enforce record and column boundaries without changing the shared default", () => {
  assert.deepEqual(parseCsv("a,b\nc,d").rows, [["a", "b"], ["c", "d"]]);
  const limits = { records: 2, columns: 2 };
  assert.deepEqual(parseCsv('a,b\r\n"c\nc",d\r\n', ",", limits).rows, [["a", "b"], ["c\nc", "d"]]);
  assert.match(parseCsv("a,b\nc,d\ne,f", ",", limits).error, /row 3, column 1/);
  assert.match(parseCsv("a,b,c", ",", limits).error, /Column limit/);
  assert.match(toJson("a,".repeat(128) + "a").error, /128 columns/);
  assert.match(toJson("a\n".repeat(20_001), { delimiter: "," }).error, /20,000 records/);
  assert.match(toCsv("[" + "{},".repeat(20_000) + '{"x":1}]').error, /20,000 records/);
  assert.match(toCsv('[[1' + ',1'.repeat(128) + ']]').error, /128 distinct columns/);
  const longRecord = ("x,".repeat(127) + "x\n").repeat(1954);
  assert.match(toJson(longRecord, { delimiter: "," }).error, /250,000 table cells/);
  assert.match(toCsv('[[' + "1,".repeat(127) + '1],' + "[],".repeat(1953) + '[]]').error, /250,000 table cells/);
});

test("1 MiB source and 20,000-record exports stay complete while JSON expansion is bounded", () => {
  const edge = toJson("x".repeat(csvJsonLimits.bytes), { delimiter: ",", includeHeader: false });
  assert.equal(JSON.parse(edge.output)[0]["Column 1"].length, csvJsonLimits.bytes);
  assert.match(toJson("é".repeat(csvJsonLimits.bytes / 2 + 1)).error, /1 MiB/);
  assert.match(toJson("h".repeat(40_000) + "\n" + "a\n".repeat(210), { delimiter: "," }).error, /8 MiB/);
  const result = toJson(Array.from({ length: 20_000 }, (_, index) => "row-" + index).join("\n"), {
    delimiter: ",", includeHeader: false, outputShape: "arrays",
  });
  assert.equal(result.rows, 20_000);
  assert.equal(JSON.parse(result.output).at(-1)[0], "row-19999");
});

test("72 deterministic data fixtures survive CSV to JSON row arrays and back", () => {
  let seed = 44157;
  const next = (max) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  };
  const values = ["", "  leading", "trailing  ", "a,b;c", '"a" b', "first\r\nsecond", "tab\there", "Zürich", "東京", "👩‍💻", "0012", "=SUM(1,2)", "null"];
  for (let index = 0; index < 72; index++) {
    const delimiter = [",", "\t", ";"][index % 3];
    const width = 1 + next(7);
    const rows = Array.from({ length: 1 + next(9) }, () => Array.from({ length: width }, () => values[next(values.length)]));
    const csv = serializeCsv(rows, { delimiter, lineEnding: index % 2 ? "LF" : "CRLF", bom: index % 4 === 0 });
    const json = toJson(csv, { delimiter, includeHeader: false, outputShape: "arrays" });
    assert.equal(json.ok, true, "fixture " + index);
    const output = toCsv(json.output, { delimiter, includeHeader: false });
    assert.equal(output.ok, true, "fixture " + index);
    assert.deepEqual(parseCsv(output.output, delimiter).rows, rows.map((row) => row.map((cell) => cell.replaceAll("\r\n", "\n"))), "fixture " + index);
  }
});
