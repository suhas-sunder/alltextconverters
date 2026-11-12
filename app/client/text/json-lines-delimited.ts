import { serializeCsv } from "./csv";
import { jsonObjectEntries } from "./json-lexemes";
import { readJsonLinesRecords } from "./json-lines";
import { startsLikeSpreadsheetFormula } from "./spreadsheet-formula";

const maxColumns = 128;
const maxCells = 500_000;
const loneSurrogate = /[\uD800-\uDFFF]/u;

type Cell = { text: string; isString: boolean };
type DelimitedOptions = { format: "csv" | "tsv"; includeHeader: boolean; prefixFormulas: boolean };
type DelimitedResult =
  | { ok: true; output: string; count: number; columnCount: number; formulaCells: number }
  | { ok: false; error: string };

function readObjectFields(source: string, line: number): { fields: Map<string, Cell> } | { error: string } {
  if (!source.trimStart().startsWith("{")) return { error: "Line " + line + " must contain a JSON object for table export." };
  const fields = new Map<string, Cell>();
  for (const [key, raw] of jsonObjectEntries(source)) {
    if (fields.has(key)) return { error: "Line " + line + " contains a duplicate top-level key." };
    if (fields.size === maxColumns) return { error: "Use at most 128 distinct columns." };
    const isString = raw.startsWith('"');
    const text: string = isString ? JSON.parse(raw) : raw;
    if (loneSurrogate.test(key) || loneSurrogate.test(text)) {
      return { error: "Line " + line + " contains a key or string that cannot be written as valid UTF-8." };
    }
    fields.set(key, { text, isString });
  }
  return { fields };
}

export function convertJsonLinesToDelimited(input: string, options: DelimitedOptions): DelimitedResult {
  const result = readJsonLinesRecords(input);
  if (!result.ok) return result;
  if (!result.records.length) return { ok: false, error: "Enter at least one JSON object, one per line." };

  const keys = new Set<string>();
  const data: Array<Map<string, Cell>> = [];
  for (const [index, record] of result.records.entries()) {
    const parsed = readObjectFields(record, index + 1);
    if ("error" in parsed) return { ok: false, error: parsed.error };
    for (const key of parsed.fields.keys()) keys.add(key);
    if (keys.size > maxColumns) return { ok: false, error: "Use at most 128 distinct columns." };
    data.push(parsed.fields);
  }
  if (!keys.size) return { ok: false, error: "Add at least one top-level key to define the table columns." };
  if ((data.length + Number(options.includeHeader)) * keys.size > maxCells) {
    return { ok: false, error: "Use at most 500,000 output cells, including any header." };
  }

  let formulaCells = 0;
  function formatText(text: string) {
    if (!startsLikeSpreadsheetFormula(text)) return text;
    formulaCells++;
    return options.prefixFormulas ? "'" + text : text;
  }

  const columns = [...keys];
  const rows = data.map((record) => columns.map((key) => {
    const cell = record.get(key);
    if (!cell) return "";
    return cell.isString ? formatText(cell.text) : cell.text;
  }));
  if (options.includeHeader) rows.unshift(columns.map(formatText));
  return {
    ok: true,
    count: data.length,
    columnCount: columns.length,
    formulaCells,
    output: serializeCsv(rows, { delimiter: options.format === "tsv" ? "\t" : "," }),
  };
}
