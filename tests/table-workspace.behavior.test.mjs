import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  stdin: {
    contents: [
      'export * from "./app/client/components/csv-to-list/tableWorkspaceData.ts";',
      'export { parseCsv } from "./app/client/text/csv.ts";',
    ].join("\n"),
    resolveDir: fileURLToPath(new URL("..", import.meta.url)),
  },
  bundle: true,
  write: false,
  format: "esm",
});
const {
  decodeWorkspaceFile, exportWorkspaceTable, moveWorkspaceColumn, parseCsv,
  parseWorkspaceTable, TABLE_WORKSPACE_LIMITS, workspaceColumnLabel,
} = await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

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
