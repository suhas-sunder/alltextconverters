import type { WorkspaceTable } from "./tableWorkspaceData";

export type WorkspaceCleanupOptions = {
  excludedRows: string;
  trimCells: boolean;
  blankColumns: number[] | null;
  duplicateKeys: number[] | null;
  sort: { column: number; descending: boolean } | null;
  rename: { column: number; name: string } | null;
};

export type WorkspaceCleanup = {
  table: WorkspaceTable;
  sourceRows: number;
  excluded: number;
  trimmed: number;
  blanks: number;
  duplicates: number;
  reordered: boolean;
  renamed: boolean;
};

export const WORKSPACE_ROW_RANGE_LENGTH = 1024;
export const WORKSPACE_HEADER_LENGTH = 256;

function rowRange(text: string, total: number): Set<number> | { error: string } {
  const excluded = new Set<number>();
  if (!text.trim()) return excluded;
  if (text.length > WORKSPACE_ROW_RANGE_LENGTH) return { error: "Shorten the list of data row ranges." };
  for (const part of text.split(",")) {
    const match = part.trim().match(/^([1-9]\d*)(?:\s*-\s*([1-9]\d*))?$/);
    if (!match) return { error: "Use data row numbers or ranges, for example 2, 5-7." };
    const first = Number(match[1]);
    const last = Number(match[2] ?? match[1]);
    if (first > last || last > total) return { error: "Choose data rows between 1 and " + total + " and put the smaller range number first." };
    for (let row = first; row <= last; row++) excluded.add(row - 1);
  }
  return excluded;
}

function compareText(first = "", second = "", descending: boolean): number {
  const leftBlank = !first.trim();
  const rightBlank = !second.trim();
  if (leftBlank || rightBlank) return Number(leftBlank) - Number(rightBlank);
  const result = first < second ? -1 : first > second ? 1 : 0;
  return descending ? -result : result;
}

export function previewWorkspaceCleanup(
  table: WorkspaceTable,
  options: WorkspaceCleanupOptions,
): WorkspaceCleanup | { error: string } {
  const excluded = rowRange(options.excludedRows, table.rows.length);
  if ("error" in excluded) return excluded;
  const validColumn = (column: number) => Number.isInteger(column) && column >= 0 && column < table.columnCount;
  const { blankColumns, duplicateKeys, sort, rename } = options;
  if (blankColumns && (!blankColumns.length || !blankColumns.every(validColumn))) {
    return { error: "Select at least one valid column for the blank-row filter." };
  }
  if (duplicateKeys && (!duplicateKeys.length || !duplicateKeys.every(validColumn))) {
    return { error: "Select at least one matching column to remove duplicates." };
  }
  if (sort && !validColumn(sort.column)) return { error: "Choose a valid sort column." };
  if (rename && (!table.headers || !validColumn(rename.column) || rename.name.length > WORKSPACE_HEADER_LENGTH
    || /[\uD800-\uDFFF]/u.test(rename.name))) {
    return { error: "Choose an existing header column and a valid UTF-8 name of up to 256 characters." };
  }

  let trimmed = 0;
  let blanks = 0;
  let duplicates = 0;
  const seen = new Set<string>();
  const rows: string[][] = [];
  for (const [index, original] of table.rows.entries()) {
    if (excluded.has(index)) continue;
    let row = original;
    if (options.trimCells) {
      for (const [column, cell] of original.entries()) {
        const text = cell.trim();
        if (text === cell) continue;
        if (row === original) row = original.slice();
        row[column] = text;
        trimmed++;
      }
    }
    if (blankColumns && blankColumns.every((column) => !row[column]?.trim())) {
      blanks++;
      continue;
    }
    if (duplicateKeys) {
      // Missing cells and explicit empty strings have different keys. The text "null" is literal.
      const key = JSON.stringify(duplicateKeys.map((column) => row[column] ?? null));
      if (seen.has(key)) {
        duplicates++;
        continue;
      }
      seen.add(key);
    }
    rows.push(row);
  }

  const sorted = sort ? rows.slice().sort((first, second) => compareText(first[sort.column], second[sort.column], sort.descending)) : rows;
  const reordered = sorted.some((row, index) => row !== rows[index]);
  const renamed = Boolean(rename && table.headers?.[rename.column] !== rename.name);
  const headers = renamed && rename && table.headers ? table.headers.slice() : table.headers;
  if (renamed && rename && headers) headers[rename.column] = rename.name;

  return {
    table: { ...table, rows: sorted, headers },
    sourceRows: table.rows.length,
    excluded: excluded.size,
    trimmed,
    blanks,
    duplicates,
    reordered,
    renamed,
  };
}
