import { parseCsv, serializeCsv } from "./csv";
import { jsonArrayValues, jsonObjectEntries } from "./json-lexemes";
import { locateJsonSyntaxError } from "./json-syntax-position";
import { startsLikeSpreadsheetFormula } from "./spreadsheet-formula";

export const csvJsonLimits = { bytes: 1024 * 1024, records: 20_000, columns: 128, cells: 250_000 } as const;
const maxOutputBytes = 8 * csvJsonLimits.bytes;
const loneSurrogate = /[\uD800-\uDFFF]/u;

type CommonOptions = { includeHeader: boolean; sortRows: boolean };
type FromDelimited = CommonOptions & {
  delimiter: string;
  interpretJson: boolean;
  outputShape: "objects" | "arrays";
};
type FromJson = CommonOptions & { delimiter: string; allowNested: boolean; prefixFormulas: boolean };
type Failure = { ok: false; error: string };
export type CsvJsonResult = {
  ok: true;
  output: string;
  rows: number;
  columns: number;
  notices: string[];
  formulaCells: number;
} | Failure;

export type CsvJsonRequest =
  | { direction: "csv-to-json"; input: string; options: FromDelimited }
  | { direction: "json-to-csv"; input: string; options: FromJson };

export function convertCsvJson(request: CsvJsonRequest): CsvJsonResult {
  return request.direction === "csv-to-json"
    ? delimitedToJson(request.input, request.options)
    : jsonToDelimited(request.input, request.options);
}

function fail(error: string): Failure {
  return { ok: false, error };
}

function checkSource(input: string): Failure | undefined {
  if (input.length > csvJsonLimits.bytes || new TextEncoder().encode(input).byteLength > csvJsonLimits.bytes) {
    return fail("Use at most 1 MiB of UTF-8 source text.");
  }
  if (loneSurrogate.test(input)) return fail("The source contains text that cannot be written as valid UTF-8.");
}

const columnName = (index: number) => "Column " + (index + 1);

function buildHeaders(original: string[], width: number) {
  const reserved = new Set(original.filter((value) => value.trim() !== ""));
  const used = new Set<string>();
  const nextSuffix = new Map<string, number>();
  const headers = Array.from({ length: width }, (_, index) => {
    const value = original[index];
    if (value?.trim() && !used.has(value)) {
      used.add(value);
      return value;
    }
    const base = value?.trim() ? value : columnName(index);
    let header = base;
    let suffix = nextSuffix.get(base) ?? 2;
    while (reserved.has(header) || used.has(header)) header = base + "_" + suffix++;
    nextSuffix.set(base, suffix);
    used.add(header);
    return header;
  });
  return headers;
}

function cellAsJson(value: string, interpretJson: boolean) {
  if (interpretJson) {
    const trimmed = value.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, "");
    if (/^[{\["\-0-9tfn]/.test(trimmed)) {
      try {
        JSON.parse(trimmed);
        return trimmed;
      } catch {
        // Keep cells that are not JSON values as their original strings.
      }
    }
  }
  return JSON.stringify(value);
}

function compareCells(first: string, second: string) {
  return first < second ? -1 : first > second ? 1 : 0;
}

function overCellLimit(rows: number, width: number) {
  return rows * width > csvJsonLimits.cells;
}

export function delimitedToJson(input: string, options: FromDelimited): CsvJsonResult {
  const sourceError = checkSource(input);
  if (sourceError) return sourceError;
  const parsed = parseCsv(input, options.delimiter === "auto" ? undefined : options.delimiter, csvJsonLimits);
  if ("error" in parsed) {
    const bounds = parsed.error.startsWith("Record limit") ? " Use at most 20,000 records."
      : parsed.error.startsWith("Column limit") ? " Use at most 128 columns." : "";
    return fail(parsed.error + bounds);
  }
  if (!parsed.rows.length) return fail("Paste or open a delimited table.");
  const width = parsed.rows.reduce((maximum, row) => Math.max(maximum, row.length), 0);
  if (overCellLimit(parsed.rows.length, width)) return fail("Use at most 250,000 table cells.");
  const [first] = parsed.rows;
  const rows = options.includeHeader ? parsed.rows.slice(1) : parsed.rows;
  if (options.sortRows) rows.sort((a, b) => compareCells(a[0] ?? "", b[0] ?? ""));

  const notices = parsed.warnings.filter((warning) => !warning.startsWith("Rows have inconsistent"));
  if (rows.some((row) => row.length !== width)) notices.push("Short records use null for missing cells.");
  const headers = buildHeaders(options.includeHeader ? first : [], width);
  if (options.outputShape === "objects" && options.includeHeader && headers.some((header, index) => header !== first[index])) {
    notices.push("Blank, duplicate, or missing headers received unique names.");
  }
  const keys = headers.map((header) => JSON.stringify(header) + ": ");
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let bytes = 3;
  for (const row of rows) {
    const fields = headers.map((_, index) => {
      const value = index < row.length ? cellAsJson(row[index], options.interpretJson) : "null";
      return options.outputShape === "objects" ? keys[index] + value : value;
    });
    const content = options.outputShape === "objects" ? "  {" + fields.join(", ") + "}" : "  [" + fields.join(", ") + "]";
    bytes += encoder.encode(content).byteLength + 2;
    if (bytes > maxOutputBytes) return fail("The JSON output exceeds 8 MiB. Use fewer rows or shorter headers.");
    parts.push(content);
  }
  const output = parts.length ? "[\n" + parts.join(",\n") + "\n]\n" : "[]\n";
  return { ok: true, output, rows: rows.length, columns: width, notices, formulaCells: 0 };
}

type Cell = { text: string; isString: boolean };
type Row = Map<string, Cell>;

function jsonCell(raw: string, allowNested: boolean, location: string): Cell | Failure {
  if (!allowNested && (raw[0] === "{" || raw[0] === "[")) return fail("Nested JSON at " + location + ".");
  if (raw[0] !== '"') return { text: raw, isString: false };
  const text: string = JSON.parse(raw);
  if (loneSurrogate.test(text)) return fail("A string at " + location + " cannot be written as valid UTF-8.");
  return { text, isString: true };
}

function invalidJson(source: string): Failure {
  const position = locateJsonSyntaxError(source);
  const precedingLines = source.slice(0, position).split(/\r\n|\r|\n/);
  const lastLine = precedingLines.at(-1) ?? "";
  return fail("Invalid JSON at line " + precedingLines.length + ", column " + (lastLine.length + 1) + ".");
}

export function jsonToDelimited(input: string, options: FromJson): CsvJsonResult {
  const sourceError = checkSource(input);
  if (sourceError) return sourceError;
  const source = input.replace(/^\uFEFF/, "");
  try {
    JSON.parse(source);
  } catch {
    return invalidJson(source);
  }
  if (!source.trimStart().startsWith("[")) return fail("Enter a JSON array of objects or a JSON array of arrays.");

  let shape: "{" | "[" | undefined;
  const keys = new Set<string>();
  const records: Row[] = [];
  for (const record of jsonArrayValues(source)) {
    const row = records.length + 1;
    if (row > csvJsonLimits.records) return fail("Use at most 20,000 records.");
    const kind = record[0];
    if (kind !== "{" && kind !== "[") return fail("Record " + row + " must be an object or an array.");
    shape ??= kind;
    if (kind !== shape) return fail("Record " + row + " has a different shape. Use all objects or all arrays.");
    const fields: Row = new Map();
    const entries = kind === "{" ? jsonObjectEntries(record) : jsonArrayValues(record);
    for (const entry of entries) {
      const [key, raw] = typeof entry === "string" ? [columnName(fields.size), entry] : entry;
      const location = "record " + row + ", column " + (fields.size + 1);
      if (fields.has(key)) return fail("Duplicate key at " + location + ".");
      if (loneSurrogate.test(key)) return fail("A key at " + location + " cannot be written as valid UTF-8.");
      keys.add(key);
      if (keys.size > csvJsonLimits.columns) return fail("Use at most 128 distinct columns.");
      if (overCellLimit(row + Number(options.includeHeader), keys.size)) return fail("Use at most 250,000 table cells.");
      const cell = jsonCell(raw, options.allowNested, location);
      if ("error" in cell) return cell;
      fields.set(key, cell);
    }
    if (overCellLimit(row + Number(options.includeHeader), keys.size)) return fail("Use at most 250,000 table cells.");
    records.push(fields);
  }
  if (!keys.size) return fail("Add at least one record with a field to define the columns.");
  const columns = [...keys];
  if (options.sortRows) records.sort((a, b) => compareCells(a.get(columns[0])?.text ?? "", b.get(columns[0])?.text ?? ""));

  let formulaCells = 0;
  function formatText(text: string) {
    if (!startsLikeSpreadsheetFormula(text)) return text;
    formulaCells++;
    return options.prefixFormulas ? "'" + text : text;
  }
  const outputRows = records.map((record) => columns.map((key) => {
    const cell = record.get(key);
    if (!cell) return "";
    return cell.isString ? formatText(cell.text) : cell.text;
  }));
  if (options.includeHeader) outputRows.unshift(columns.map(formatText));
  const output = serializeCsv(outputRows, { delimiter: options.delimiter });
  return { ok: true, output, rows: records.length, columns: columns.length, notices: [], formulaCells };
}
