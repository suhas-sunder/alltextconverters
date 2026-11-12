import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  stdin: {
    contents: [
      'export * from "./app/client/text/markdown-table.ts";',
      'export { parseCsv, serializeCsv } from "./app/client/text/csv.ts";',
    ].join("\n"),
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true,
  write: false,
  format: "esm",
});
const { convertTable, parseCsv, serializeCsv, tableInputLimit } =
  await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const toCsv = (input) => convertTable(input, { source: "markdown", target: "csv" });
const toMarkdown = (input, source = "csv") =>
  convertTable(input, { source, firstRowHeader: true, alignment: "default" });

test("Markdown reads optional borders, escapes, GFM alignment and short records", () => {
  const result = toCsv("\uFEFF\nName | Area | Detail | Status\n:--- | ---: | :---: | ---\n| Éva | 東京 | red \\| blue | **ready** |\n| Zoë | Sydney |\n");
  assert.deepEqual(result.header, ["Name", "Area", "Detail", "Status"]);
  assert.deepEqual(result.alignment, ["left", "right", "center", "default"]);
  assert.deepEqual(result.rows, [
    ["Éva", "東京", "red | blue", "**ready**"],
    ["Zoë", "Sydney", "", ""],
  ]);
  assert.equal(result.output, "Name,Area,Detail,Status\r\nÉva,東京,red | blue,**ready**\r\nZoë,Sydney,,\r\n");
  assert.deepEqual(result.warnings, ["Short rows were padded with empty cells."]);
  const backticks = String.fromCharCode(96);
  const codeSpan = toCsv("| a |\n| --- |\n| " + backticks + "\\|" + backticks + " |");
  assert.deepEqual(codeSpan.rows, [[backticks + "|" + backticks]]);
  const consecutive = toCsv("| a | b |\n| --- | --- |\n| one \\\\| two | c |");
  assert.deepEqual(consecutive.rows, [["one | two", "c"]]);
});

test("quoted CSV and quoted TSV round-trip cell values including multiline and edge whitespace", () => {
  const rawRows = [
    ["header", "header", ""],
    [" Montréal ", "line 1\r\nline 2\n", "tab\tand \"quotes\""],
    ["A\\|B", "literal &#10; and &amp;", "**source** <img src=x>"],
    ["", "", ""],
    ["C:\\Users\\", "e\u0301", "🇨🇦"],
    ["&#32;", "\t", "\\\\"],
  ];
  const expected = rawRows.map((row) => row.map((cell) => cell.replace(/\r\n/g, "\n")));
  for (const source of ["csv", "tsv"]) {
    const input = serializeCsv(rawRows, { delimiter: source === "csv" ? "," : "\t", bom: true });
    const result = toMarkdown(input, source);
    assert.equal(result.header.length, 3);
    assert.equal(result.rows.length, 5);
    assert.ok(result.output.includes("&#32;Montréal&#32;"));
    assert.ok(result.output.includes("line 1&#10;line 2&#10;"));
    assert.ok(result.output.includes("A&#92;\\|B"));
    assert.ok(result.output.includes("\\<img"));
    for (const target of ["csv", "tsv"]) {
      const back = convertTable(result.output, { source: "markdown", target });
      assert.deepEqual(parseCsv(back.output, target === "csv" ? "," : "\t").rows, expected);
    }
  }
});

test("headerless CSV keeps every record and offers Markdown alignment", () => {
  const result = convertTable("1,2\n3,4", { source: "csv", firstRowHeader: false, alignment: "right" });
  assert.deepEqual(result.header, ["Column 1", "Column 2"]);
  assert.deepEqual(result.rows, [["1", "2"], ["3", "4"]]);
  assert.equal(result.output, "| Column 1 | Column 2 |\n| ---: | ---: |\n| 1 | 2 |\n| 3 | 4 |\n");
  assert.equal(toCsv("| Empty |\n| --- |\n| |").output, 'Empty\r\n""\r\n');
  assert.equal(toCsv("| Heading |\n| --- |").output, "Heading\r\n");
  assert.deepEqual(toMarkdown("\t\t", "tsv").header, ["", "", ""]);
});

test("invalid input yields no partial export and bounded inputs fail before preview", () => {
  assert.match(toMarkdown('a,b\nvalid,row\n"unfinished').error, /Unterminated quoted field at row 3, column 1/);
  assert.match(toMarkdown("a,b\n1,2,3").error, /Row 2 has more columns/);
  assert.match(toCsv("| a | b |\n| --- |\n| first | second |").error, /dash marker for each header cell/);
  assert.match(toCsv("| a | b |\n| --- | --- |\n| first | second | third |").error, /Line 3 has more cells/);
  assert.match(toCsv("| a |\n| --- |\n\n| second |").error, /Unexpected blank line/);
  assert.match(toCsv("Plain heading\n---").error, /dash marker/);
  assert.match(toMarkdown("\0").error, /null characters/);
  assert.match(toMarkdown("a".repeat(tableInputLimit + 1)).error, /524,288 characters of pasted text/);
  assert.match(toMarkdown("x,".repeat(256) + "x").error, /256 columns/);
  assert.match(toMarkdown("x,y\n".repeat(25_001)).error, /50,000 cells/);
  assert.match(toMarkdown('header\n"' + "\t".repeat(tableInputLimit / 2) + '"').error, /converted table exceeds/);
});

test("spreadsheet formula-like text stays literal in the export and has a visible warning", () => {
  const result = toCsv("| A |\n| --- |\n| =1+2 |\n");
  assert.equal(result.output, "A\r\n=1+2\r\n");
  assert.match(result.warnings[0], /may be interpreted as formulas/);
});
