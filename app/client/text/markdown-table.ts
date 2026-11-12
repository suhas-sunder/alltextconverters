import { parseCsv, serializeCsv } from "./csv";
import { normalizeLineEndings } from "./text-core";

export const tableInputLimit = 512 * 1024;
const columnLimit = 256;
const cellLimit = 50_000;

export type TableFormat = "markdown" | "csv" | "tsv";
type DelimitedFormat = Exclude<TableFormat, "markdown">;
export type Alignment = "default" | "left" | "center" | "right";

export type TableConversionOptions =
  | { source: "markdown"; target: DelimitedFormat }
  | { source: DelimitedFormat; firstRowHeader: boolean; alignment: Alignment };

type TableCells = { header: string[]; rows: string[][]; alignment: Alignment[] };
type ConversionError = { error: string };
export type TableConversion = (TableCells & { output: string; warnings: string[] }) | ConversionError;

const alignmentMarkers = {
  default: "---",
  left: ":---",
  center: ":---:",
  right: "---:",
} satisfies Record<Alignment, string>;

const trimCell = (value: string) => value.replace(/^[ \t]+|[ \t]+$/g, "");
const cellTokens = /\\([!-/:-@[-\x60{-~])|&#(9|10|32|92|124);/g;
const escapeForMarkdown = /[\\|*_[\]<>!&~\x60]/g;

function splitRow(line: string): string[] {
  const cells: string[] = [];
  const source = trimCell(line);
  let start = source.startsWith("|") ? 1 : 0;

  for (let index = start; index < source.length; index += 1) {
    // GFM scans an immediately preceding backslash as part of a pipe cell.
    if (source[index] === "|" && source[index - 1] !== "\\") {
      cells.push(trimCell(source.slice(start, index)));
      start = index + 1;
    }
  }
  if (start < source.length || cells.length === 0) {
    cells.push(trimCell(source.slice(start)));
  }
  return cells;
}

function decodeCell(cell: string): string {
  return cell.replace(/\\\|/g, "|").replace(cellTokens, (_, escaped: string | undefined, code: string | undefined) =>
    escaped ?? String.fromCharCode(Number(code)),
  );
}

function encodeCell(cell: string): string {
  return cell
    .replace(escapeForMarkdown, (character) => character === "\\" ? "&#92;" : "\\" + character)
    .replace(/\t/g, "&#9;")
    .replace(/\n/g, "&#10;")
    .replace(/^ +| +$/g, (spaces) => "&#32;".repeat(spaces.length));
}

function readMarkdown(source: string): TableCells | ConversionError {
  const lines = normalizeLineEndings(source).replace(/^\uFEFF/, "").split("\n");
  const first = lines.findIndex((line) => trimCell(line).length > 0);
  while (lines.length > 0 && !trimCell(lines[lines.length - 1])) lines.pop();
  if (first < 0 || lines.length < first + 2) {
    return { error: "Paste one Markdown pipe table with a header and a delimiter row." };
  }

  const header = splitRow(lines[first]).map(decodeCell);
  const markers = splitRow(lines[first + 1]);
  if (markers.length !== header.length || markers.some((cell) => !/^:?-+:?$/.test(cell)) ||
      (!/(^|[^\\])\|/.test(lines[first]) && !lines[first + 1].includes("|"))) {
    return { error: "The Markdown delimiter row must have one dash marker for each header cell." };
  }
  if (header.length > columnLimit || header.length * (lines.length - first - 1) > cellLimit) {
    return { error: "Use at most 256 columns and 50,000 cells, including the header." };
  }

  const alignment: Alignment[] = markers.map((marker) => {
    if (marker.startsWith(":")) return marker.endsWith(":") ? "center" : "left";
    return marker.endsWith(":") ? "right" : "default";
  });
  const rows: string[][] = [];
  for (let index = first + 2; index < lines.length; index += 1) {
    if (!trimCell(lines[index])) return { error: "Unexpected blank line at line " + (index + 1) + ". Paste one table at a time." };
    const cells = splitRow(lines[index]).map(decodeCell);
    if (cells.length > header.length) {
      return { error: "Line " + (index + 1) + " has more cells than the header. Escape literal pipes with a backslash." };
    }
    rows.push(cells);
  }
  return { header, rows, alignment };
}

function buildOutput({ header, rows, alignment }: TableCells, target: TableFormat): TableConversion {
  const warnings = [];
  if (rows.some((row) => row.length !== header.length)) {
    warnings.push("Short rows were padded with empty cells.");
  }
  const rectangular = rows.map((row) => Array.from({ length: header.length }, (_, index) => row[index] ?? ""));
  let output: string;
  if (target === "markdown") {
    const row = (cells: string[]) => "| " + cells.join(" | ") + " |";
    output = [
      row(header.map(encodeCell)),
      row(alignment.map((key) => alignmentMarkers[key])),
      ...rectangular.map((cells) => row(cells.map(encodeCell))),
    ].join("\n") + "\n";
  } else {
    const records = [header, ...rectangular];
    if (records.some((row) => row.some((cell) => /^[\t\r\n]|^[ \t]*[=+@-]/.test(cell)))) {
      warnings.push("Some values may be interpreted as formulas by spreadsheets. Import those cells as text if needed.");
    }
    output = serializeCsv(records, { delimiter: target === "csv" ? "," : "\t" });
  }
  if (output.length > tableInputLimit) {
    return { error: "The converted table exceeds 524,288 characters. Split the input into smaller tables." };
  }
  return { output, header, rows: rectangular, alignment, warnings };
}

export function convertTable(input: string, options: TableConversionOptions): TableConversion {
  if (!input) return { error: "Enter a Markdown, CSV, or TSV table." };
  if (input.length > tableInputLimit) return { error: "Use up to 524,288 characters of pasted text." };
  if (input.includes("\0")) return { error: "Remove null characters from the input." };
  if (options.source === "markdown") {
    const parsed = readMarkdown(input);
    return "error" in parsed ? parsed : buildOutput(parsed, options.target);
  }

  const parsed = parseCsv(input, options.source === "csv" ? "," : "\t");
  if ("error" in parsed) return { error: parsed.error };
  if (parsed.rows.length === 0) return { error: "Enter at least one row of delimited text." };
  const columns = parsed.rows[0].length;
  if (columns > columnLimit || columns * (parsed.rows.length + (options.firstRowHeader ? 0 : 1)) > cellLimit) {
    return { error: "Use at most 256 columns and 50,000 cells, including the header." };
  }
  const extra = parsed.rows.findIndex((row) => row.length > columns);
  if (extra >= 0) return { error: "Row " + (extra + 1) + " has more columns than the first row." };
  const header = options.firstRowHeader ? parsed.rows[0] : Array.from({ length: columns }, (_, index) => "Column " + (index + 1));
  const rows = options.firstRowHeader ? parsed.rows.slice(1) : parsed.rows;
  return buildOutput({ header, rows, alignment: header.map(() => options.alignment) }, "markdown");
}
