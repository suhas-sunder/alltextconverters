import { parseCsv, serializeCsv } from "../../text/csv";
import { startsLikeSpreadsheetFormula } from "../../text/spreadsheet-formula";

export const TABLE_WORKSPACE_LIMITS = {
  bytes: 1024 * 1024,
  records: 20_000,
  columns: 64,
  cells: 250_000,
} as const;

export const TABLE_WORKSPACE_SIZE_ERROR = "Use a source no larger than 1 MiB.";
const gridSizeError = "Use at most 20,000 records, 64 columns, and 250,000 cells, including any header.";

export function workspaceSourceFits(input: string): boolean {
  return input.length <= TABLE_WORKSPACE_LIMITS.bytes && new TextEncoder().encode(input).byteLength <= TABLE_WORKSPACE_LIMITS.bytes;
}

export type WorkspaceFormat = "csv" | "tsv";

export type WorkspaceTable = {
  headers: string[] | null;
  rows: string[][];
  columnCount: number;
  delimiter: string;
  warnings: string[];
};

export type WorkspaceColumn = { source: number; included: boolean };

type WorkspaceResult = { ok: true; table: WorkspaceTable } | { ok: false; error: string };

export function decodeWorkspaceFile(bytes: ArrayBuffer): string {
  if (bytes.byteLength > TABLE_WORKSPACE_LIMITS.bytes) throw new Error(TABLE_WORKSPACE_SIZE_ERROR);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("This file is not valid UTF-8. Save it as UTF-8 and try again.");
  }
}

export function parseWorkspaceTable(input: string, delimiter: string, hasHeader: boolean): WorkspaceResult {
  if (!workspaceSourceFits(input)) {
    return { ok: false, error: TABLE_WORKSPACE_SIZE_ERROR };
  }

  const parsed = parseCsv(input, delimiter === "auto" ? undefined : delimiter, TABLE_WORKSPACE_LIMITS);
  if ("error" in parsed) return { ok: false, error: parsed.limitExceeded ? gridSizeError : parsed.error };
  if (!parsed.rows.length) return { ok: false, error: "Paste delimited text or open a file first." };

  const columnCount = parsed.rows.reduce((count, row) => Math.max(count, row.length), 0);
  if (parsed.rows.length * columnCount > TABLE_WORKSPACE_LIMITS.cells) {
    return { ok: false, error: gridSizeError };
  }

  return {
    ok: true,
    table: {
      headers: hasHeader ? parsed.rows[0] : null,
      rows: hasHeader ? parsed.rows.slice(1) : parsed.rows,
      columnCount,
      delimiter: parsed.delimiter,
      warnings: parsed.warnings,
    },
  };
}

function protectWorkspaceText(text: string, prefixFormulas: boolean): string {
  return prefixFormulas && startsLikeSpreadsheetFormula(text) ? "'" + text : text;
}

export function workspaceColumnLabel(table: WorkspaceTable, column: number, prefixFormulas = false): string {
  const name = protectWorkspaceText(table.headers?.[column] ?? "", prefixFormulas).trim();
  if (!name) return "Column " + (column + 1);
  const summary = name.replace(/\s+/g, " ");
  return "Column " + (column + 1) + ": " + (summary.length > 80 ? summary.slice(0, 80) + "…" : summary);
}

export function moveWorkspaceColumn(columns: WorkspaceColumn[], from: number, delta: -1 | 1): WorkspaceColumn[] {
  const to = from + delta;
  if (from < 0 || from >= columns.length || to < 0 || to >= columns.length) return columns;
  const moved = columns.slice();
  [moved[from], moved[to]] = [moved[to], moved[from]];
  return moved;
}

export function projectWorkspaceRow(row: string[], columns: number[], prefixFormulas = false): string[] {
  return columns.map((column) => protectWorkspaceText(row[column] ?? "", prefixFormulas));
}

export function countWorkspaceFormulaCells(table: WorkspaceTable, columns: number[], includeHeader: boolean): number {
  let count = 0;
  const countRow = (row: string[]) => {
    for (const column of columns) {
      if (startsLikeSpreadsheetFormula(row[column] ?? "")) count++;
    }
  };
  if (includeHeader && table.headers) countRow(table.headers);
  for (const row of table.rows) countRow(row);
  return count;
}

export function exportWorkspaceTable(
  table: WorkspaceTable,
  columns: number[],
  options: { format: WorkspaceFormat; includeHeader: boolean; bom?: boolean; prefixFormulas?: boolean },
): string {
  if (!columns.length) return "";
  const rows = table.rows.map((row) => projectWorkspaceRow(row, columns, options.prefixFormulas));
  if (options.includeHeader && table.headers) rows.unshift(projectWorkspaceRow(table.headers, columns, options.prefixFormulas));
  return serializeCsv(rows, { delimiter: options.format === "tsv" ? "\t" : ",", bom: options.bom });
}
