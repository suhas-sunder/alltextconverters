import { parseCsv, serializeCsv } from "../../text/csv";

export const TABLE_WORKSPACE_LIMITS = {
  bytes: 1024 * 1024,
  records: 20_000,
  columns: 64,
  cells: 250_000,
} as const;

export const TABLE_WORKSPACE_SIZE_ERROR = "Use a source no larger than 1 MiB.";

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
  if (input.length > TABLE_WORKSPACE_LIMITS.bytes || new TextEncoder().encode(input).length > TABLE_WORKSPACE_LIMITS.bytes) {
    return { ok: false, error: TABLE_WORKSPACE_SIZE_ERROR };
  }

  const parsed = parseCsv(input, delimiter === "auto" ? undefined : delimiter);
  if ("error" in parsed) return { ok: false, error: parsed.error };
  if (!parsed.rows.length) return { ok: false, error: "Paste delimited text or open a file first." };

  const columnCount = parsed.rows.reduce((count, row) => Math.max(count, row.length), 0);
  if (parsed.rows.length > TABLE_WORKSPACE_LIMITS.records
    || columnCount > TABLE_WORKSPACE_LIMITS.columns
    || parsed.rows.length * columnCount > TABLE_WORKSPACE_LIMITS.cells) {
    return { ok: false, error: "Use at most 20,000 records, 64 columns, and 250,000 cells, including any header." };
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

export function workspaceColumnLabel(table: WorkspaceTable, column: number): string {
  const name = table.headers?.[column]?.trim();
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

export function projectWorkspaceRow(row: string[], columns: number[]): string[] {
  return columns.map((column) => row[column] ?? "");
}

export function exportWorkspaceTable(
  table: WorkspaceTable,
  columns: number[],
  options: { format: WorkspaceFormat; includeHeader: boolean; bom?: boolean },
): string {
  if (!columns.length) return "";
  const rows = table.rows.map((row) => projectWorkspaceRow(row, columns));
  if (options.includeHeader && table.headers) rows.unshift(projectWorkspaceRow(table.headers, columns));
  return serializeCsv(rows, { delimiter: options.format === "tsv" ? "\t" : ",", bom: options.bom });
}
