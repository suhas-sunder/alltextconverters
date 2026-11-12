import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const { outputFiles: [bundle] } = await build({
  stdin: {
    contents: [
      'export * from "./app/client/components/csv-to-list/tableWorkspaceData.ts";',
      'export * from "./app/client/components/csv-to-list/tableWorkspaceClipboard.ts";',
      'export * from "./app/client/components/csv-to-list/tableWorkspaceCleanup.ts";',
      'export { parseCsv } from "./app/client/text/csv.ts";',
    ].join("\n"),
    resolveDir: fileURLToPath(new URL("..", import.meta.url)),
  },
  bundle: true,
  write: false,
  format: "esm",
});
const {
  buildWorkspaceClipboardHtml, looksLikeWorkspaceClipboardTsv, readWorkspaceClipboardTable,
  decodeWorkspaceFile, exportWorkspaceTable, moveWorkspaceColumn, parseCsv,
  parseWorkspaceTable, TABLE_WORKSPACE_LIMITS, workspaceColumnLabel,
  countWorkspaceFormulaCells, previewWorkspaceCleanup,
} = await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const { document } = new JSDOM("").window;

function cleanup(table, options = {}) {
  return previewWorkspaceCleanup(table, {
    excludedRows: "", trimCells: false, blankColumns: null, duplicateKeys: null, sort: null, rename: null, ...options,
  });
}

test("workspace composes row selection, trimming, blank filtering, key dedupe, sort and rename without mutating source", () => {
  const source = 'id,id,note,hidden\r\n" b ",1," Québec ",m\r\nb,1,different,x\r\n,," ",\r\na,2,"=SUM(1,2)",p\r\na,3,null\r\nz,9,excluded';
  const { table } = parseWorkspaceTable(source, ",", true);
  const original = structuredClone(table);
  const preview = cleanup(table, {
    excludedRows: "6, 6-6",
    trimCells: true,
    blankColumns: [0, 1, 2],
    duplicateKeys: [0, 1],
    sort: { column: 0, descending: false },
    rename: { column: 1, name: "Key" },
  });
  assert.deepEqual(table, original);
  assert.deepEqual(preview.table.headers, ["id", "Key", "note", "hidden"]);
  assert.deepEqual(preview.table.rows, [["a", "2", "=SUM(1,2)", "p"], ["a", "3", "null"], ["b", "1", "Québec", "m"]]);
  const { table: _, ...summary } = preview;
  assert.deepEqual(summary, { sourceRows: 6, excluded: 1, trimmed: 3, blanks: 1, duplicates: 1, reordered: true, renamed: true });
  const stepTwo = cleanup(preview.table, { excludedRows: "2", rename: { column: 2, name: "" } });
  assert.deepEqual(stepTwo.table.rows, [preview.table.rows[0], preview.table.rows[2]]);
  assert.deepEqual(stepTwo.table.headers, ["id", "Key", "", "hidden"]);
  assert.deepEqual(preview.table.headers, ["id", "Key", "note", "hidden"]);
});

test("workspace composite keys distinguish sparse cells, empty strings, literal null, Unicode and separators", () => {
  const { table } = parseWorkspaceTable('x,y\r\nA\r\nA,\r\nA,null\r\nA\r\nA,\r\na,\r\n"東,京","a\nb"\r\n東京,"a,b"', ",", true);
  const preview = cleanup(table, { duplicateKeys: [0, 1] });
  assert.equal(preview.duplicates, 2);
  assert.deepEqual(preview.table.rows, [["A"], ["A", ""], ["A", "null"], ["a", ""], ["東,京", "a\nb"], ["東京", "a,b"]]);
  assert.equal(cleanup(table, { blankColumns: [1] }).blanks, 5);
});

test("workspace sort is stable and leaves blank or missing sort values last in both directions", () => {
  const { table } = parseWorkspaceTable('label,value\r\nfirst,10\r\nblank," "\r\nsecond,2\r\nsame,10\r\nmissing\r\nsmall,01', ",", true);
  assert.deepEqual(cleanup(table, { sort: { column: 1, descending: false } }).table.rows.map((row) => row[0]),
    ["small", "first", "same", "second", "blank", "missing"]);
  assert.deepEqual(cleanup(table, { sort: { column: 1, descending: true } }).table.rows.map((row) => row[0]),
    ["second", "first", "same", "small", "blank", "missing"]);
});

test("workspace refuses invalid ranges and empty key selections without a partial preview", () => {
  const { table } = parseWorkspaceTable("x,y\n1,2\n3,4", ",", true);
  for (const [options, error] of [
    [{ excludedRows: "2-" }, /numbers or ranges/],
    [{ excludedRows: "2-1" }, /smaller range number first/],
    [{ excludedRows: "3" }, /between 1 and 2/],
    [{ excludedRows: "1, 99999999999999999999" }, /between 1 and 2/],
    [{ duplicateKeys: [] }, /matching column/],
    [{ blankColumns: [] }, /blank-row filter/],
    [{ sort: { column: 2, descending: true } }, /valid sort column/],
    [{ rename: { column: 0, name: "\uD800" } }, /valid UTF-8 name/],
  ]) {
    const invalid = cleanup(table, options);
    assert.match(invalid.error, error);
    assert.equal(invalid.table, undefined);
  }
});

test("workspace formula warning and guard cover headers and the same cells in CSV, TSV and rich clipboard HTML", () => {
  const { table } = parseWorkspaceTable('=Head,note,ignore\r\n"  =1+2","東京\tQuébec",=ignored\r\nnull,"Line\nquote ""x""",+ignored', ",", true);
  const { table: cleaned } = cleanup(table, { trimCells: true });
  assert.equal(countWorkspaceFormulaCells(cleaned, [1, 0], true), 2);
  assert.equal(countWorkspaceFormulaCells(cleaned, [1, 0], false), 1);
  const expected = [["note", "'=Head"], ["東京\tQuébec", "'=1+2"], ['Line\nquote "x"', "null"]];
  const output = (format) => exportWorkspaceTable(cleaned, [1, 0], { format, includeHeader: true, prefixFormulas: true });
  assert.deepEqual(parseCsv(output("csv"), ",").rows, expected);
  assert.deepEqual(parseCsv(output("tsv"), "\t").rows, expected);
  const html = buildWorkspaceClipboardHtml(cleaned, [1, 0], true, true);
  const imported = readWorkspaceClipboardTable(html, document);
  assert.deepEqual(parseCsv(imported.text, "\t").rows, expected);
  assert.match(exportWorkspaceTable(cleaned, [0], { format: "csv", includeHeader: true }), /^=Head\r\n=1\+2\r\nnull/);
});

test("workspace cleanup and output retain all qualifying records from a 10,000-row source", () => {
  const rows = Array.from({ length: 10_000 }, (_, index) => "ID-" + (index % 5000) + ",\" 東京 " + index + " \"");
  const { table } = parseWorkspaceTable("id,name\n" + rows.join("\n"), ",", true);
  const preview = cleanup(table, { trimCells: true, duplicateKeys: [0] });
  assert.equal(preview.table.rows.length, 5000);
  assert.equal(preview.duplicates, 5000);
  assert.equal(preview.trimmed, 10_000);
  const output = exportWorkspaceTable(preview.table, [1, 0], { format: "tsv", includeHeader: true });
  assert.equal(parseCsv(output, "\t").rows.length, 5001);
  assert.deepEqual(parseCsv(output, "\t").rows.at(-1), ["東京 4999", "ID-4999"]);
  assert.equal(table.rows.length, 10_000);
});

test("spreadsheet HTML imports display text and merged positions from inert markup", () => {
  const result = readWorkspaceClipboardTable(
    '<google-sheets-html-origin><table><tbody>' +
    '<tr><th rowspan="2">Field &amp; value</th><th colspan="2">Group</th></tr>' +
    '<tr><td>Tokyo\t東京</td><td data-sheets-formula="=UNTRUSTED()"><b>Two</b><br>Lines &quot;quoted&quot;</td></tr>' +
    '<tr><td>Keep<img src="https://example.invalid/secret" onerror="throw 1"><script>secret()</script>' +
    '<style>.secret {color:red}</style><iframe src="https://example.invalid/secret">secret</iframe></td>' +
    '<td><p>First</p><p>Second</p></td><td>&lt;markup&gt;</td></tr>' +
    '</tbody></table></google-sheets-html-origin>',
    document,
  );
  assert.equal(result.merged, true);
  assert.deepEqual(parseCsv(result.text, "\t").rows, [
    ["Field & value", "Group", ""],
    ["", "Tokyo\t東京", 'Two\nLines "quoted"'],
    ["Keep", "First\nSecond", "<markup>"],
  ]);
});

test("spreadsheet paste handles row group spans, rejects unsafe shapes and recognizes quoted plain TSV", () => {
  const grouped = readWorkspaceClipboardTable(
    '<table><thead><tr><th rowspan="0">Title</th><th>A</th></tr><tr><th>B</th></tr></thead>' +
    '<tbody><tr><td>C</td><td>D</td></tr></tbody></table>',
    document,
  );
  assert.deepEqual(parseCsv(grouped.text, "\t").rows, [["Title", "A"], ["", "B"], ["C", "D"]]);
  assert.match(readWorkspaceClipboardTable('<table><tr><td colspan="65">x</td></tr></table>', document).error, /64 columns/);
  assert.match(readWorkspaceClipboardTable('<table><tr><td><table></table></td></tr></table>', document).error, /single spreadsheet range/);
  assert.match(readWorkspaceClipboardTable('<table><tr></tr></table>', document).error, /no cells/);
  assert.match(readWorkspaceClipboardTable("<table>" + " ".repeat(4 * TABLE_WORKSPACE_LIMITS.bytes), document).error, /too large/);
  assert.equal(looksLikeWorkspaceClipboardTsv('One, two, three\t"line 1\nline 2"\n"a\tb"\t"""quoted"""'), true);
  assert.equal(looksLikeWorkspaceClipboardTsv('city,name\n"tab\there",name'), false);
});

test("workspace parsing and TSV detection stop at the logical record budget", () => {
  const gridError = "Use at most 20,000 records, 64 columns, and 250,000 cells, including any header.";
  const oversized = "\n".repeat(TABLE_WORKSPACE_LIMITS.bytes);
  const bounded = parseCsv(oversized, undefined, TABLE_WORKSPACE_LIMITS);
  assert.equal(bounded.limitExceeded, true);
  assert.equal(bounded.rows.length, 20_000);
  assert.deepEqual(parseWorkspaceTable(oversized, "auto", false), { ok: false, error: gridError });
  assert.equal(looksLikeWorkspaceClipboardTsv("\t\n".repeat(20_001)), false);

  const multiline = "a\n".repeat(20_000) + "z";
  const valid = "a\tb\r\n".repeat(19_999) + '"' + multiline + '"\tlast';
  const parsed = parseWorkspaceTable(valid, "auto", false);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.table.rows.length, 20_000);
  assert.deepEqual(parsed.table.rows.at(-1), [multiline, "last"]);
  assert.equal(looksLikeWorkspaceClipboardTsv(valid), true);
  assert.equal(looksLikeWorkspaceClipboardTsv("é".repeat(524_288) + "\tvalue"), false);
});

test("spreadsheet copy generates a safe HTML table for selected columns and all data rows", () => {
  const rows = Array.from({ length: 25 }, (_, row) => [
    "ID " + row, 'a\tb\n<svg onload="secret()"> & \'quote\'', "omitted",
  ]);
  const table = {
    headers: ["ID", "Details", "Ignore"],
    rows,
    columnCount: 3,
    delimiter: "\t",
    warnings: [],
  };
  const rich = buildWorkspaceClipboardHtml(table, [1, 0], true);
  assert.doesNotMatch(rich, /<svg|omitted|Ignore/);
  assert.match(rich, /&lt;svg onload=&quot;secret\(\)&quot;&gt; &amp; &#39;quote&#39;/);
  const imported = readWorkspaceClipboardTable(rich, document);
  assert.deepEqual(parseCsv(imported.text, "\t").rows, [
    ["Details", "ID"],
    ...rows.map(([id, details]) => [details, id]),
  ]);
  const withoutHeader = readWorkspaceClipboardTable(buildWorkspaceClipboardHtml(table, [0], false), document);
  assert.equal(parseCsv(withoutHeader.text, "\t").rows.length, 25);
  assert.match(exportWorkspaceTable(table, [1, 0], { format: "csv", includeHeader: true }), /ID 24\r\n$/);
  assert.match(exportWorkspaceTable(table, [1, 0], { format: "tsv", includeHeader: true }), /ID 24\r\n$/);
  assert.equal(buildWorkspaceClipboardHtml({ ...table, rows: [["&".repeat(TABLE_WORKSPACE_LIMITS.bytes)]] }, [0], false), null);
});

test("workspace reorders duplicate and missing headers with exact CSV and TSV exports", () => {
  const input = '\uFEFFName\tName\t\r"Montréal, QC"\t"Two\rLines"\t"Tokyo\t東京"\r"quoted ""value"""\t😀\r';
  const result = parseWorkspaceTable(input, "\t", true);
  assert.equal(result.ok, true);
  const { table } = result;
  assert.deepEqual(table.headers, ["Name", "Name", ""]);
  assert.deepEqual(table.rows, [["Montréal, QC", "Two\nLines", "Tokyo\t東京"], ['quoted "value"', "😀"]]);
  assert.equal(workspaceColumnLabel(table, 0), "Column 1: Name");
  assert.equal(workspaceColumnLabel(table, 1), "Column 2: Name");
  assert.equal(workspaceColumnLabel(table, 2), "Column 3");

  const original = [{ source: 0, included: true }, { source: 1, included: false }, { source: 2, included: true }];
  const moved = moveWorkspaceColumn(moveWorkspaceColumn(original, 2, -1), 1, -1);
  assert.deepEqual(original.map(({ source }) => source), [0, 1, 2]);
  assert.equal(moveWorkspaceColumn(moved, 0, -1), moved);
  const selected = moved.filter(({ included }) => included).map(({ source }) => source);
  const csv = exportWorkspaceTable(table, selected, { format: "csv", includeHeader: true, bom: true });
  assert.equal(csv, '\uFEFF,Name\r\nTokyo\t東京,"Montréal, QC"\r\n,"quoted ""value"""\r\n');
  assert.deepEqual(parseCsv(csv, ",").rows, [["", "Name"], ["Tokyo\t東京", "Montréal, QC"], ["", 'quoted "value"']]);

  const tsv = exportWorkspaceTable(table, [2, 1, 0], { format: "tsv", includeHeader: false });
  assert.equal(tsv, '"Tokyo\t東京"\t"Two\nLines"\tMontréal, QC\r\n\t😀\t"quoted ""value"""\r\n');
  assert.deepEqual(parseCsv(tsv, "\t").rows, [["Tokyo\t東京", "Two\nLines", "Montréal, QC"], ["", "😀", 'quoted "value"']]);
  assert.equal(exportWorkspaceTable(table, [], { format: "csv", includeHeader: true }), "");
});

test("workspace rejects malformed or oversized sources without an exportable partial table", () => {
  assert.match(parseWorkspaceTable('a,b\nvalid,data\n"unfinished', "auto", true).error, /row 3, column 1/);
  assert.match(parseWorkspaceTable("", ",", false).error, /Paste delimited text/);
  assert.match(parseWorkspaceTable("é".repeat(TABLE_WORKSPACE_LIMITS.bytes), ",", false).error, /1 MiB/);
  assert.match(parseWorkspaceTable("x,".repeat(TABLE_WORKSPACE_LIMITS.columns) + "x", ",", false).error, /64 columns/);
  assert.match(parseWorkspaceTable("x\n".repeat(TABLE_WORKSPACE_LIMITS.records + 1), ",", false).error, /20,000 records/);
  assert.match(parseWorkspaceTable(("x,".repeat(62) + "x\n").repeat(4000), ",", false).error, /250,000 cells/);
  assert.equal(parseWorkspaceTable("x,é\n".repeat(5000), ",", false).table.rows.length, 5000);
});

test("workspace strictly decodes UTF-8 files with BOM, Unicode and CR-only rows", () => {
  const fixture = new TextEncoder().encode("\uFEFFname\tcity\rAda\t東京");
  assert.equal(decodeWorkspaceFile(fixture.buffer), "name\tcity\rAda\t東京");
  assert.throws(() => decodeWorkspaceFile(new Uint8Array([0xff, 0xff]).buffer), /not valid UTF-8/);
  assert.throws(() => decodeWorkspaceFile(new ArrayBuffer(TABLE_WORKSPACE_LIMITS.bytes + 1)), /1 MiB/);
});
