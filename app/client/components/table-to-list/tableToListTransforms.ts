export type ParsedTable = {
  rows: string[][];
  detectedFormat: "html" | "tsv" | "csv" | "unknown";
  maxColumns: number;
};

export type TableToListOptions = {
  columnIndex: number; // 0-based
  trimCells: boolean;
  ignoreEmpty: boolean;
};

export type TableToListResult = {
  output: string;
  detectedFormat: ParsedTable["detectedFormat"];
  maxColumns: number;
  totalRows: number;
  extractedCount: number;
  skippedEmptyCount: number;
};

function stripBOM(s: string) {
  return s.replace(/^\uFEFF/, "");
}

function normalizeNewlines(s: string) {
  return s.replace(/\r\n?/g, "\n");
}

function isLikelyHtmlTable(s: string) {
  const lower = s.toLowerCase();
  return lower.includes("<table") && lower.includes("<tr");
}

function parseHtmlTable(html: string): string[][] {
  // Client-only parsing; caller must ensure this runs in browser.
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const table = doc.querySelector("table");
    if (!table) return [];

    const rows: string[][] = [];
    const trNodes = Array.from(table.querySelectorAll("tr"));
    for (const tr of trNodes) {
      const cells = Array.from(tr.querySelectorAll("th,td")).map((td) =>
        (td.textContent ?? "").replace(/\s+/g, " ").trim(),
      );
      if (cells.length) rows.push(cells);
    }
    return rows;
  } catch {
    return [];
  }
}

function parseCsvLine(line: string, delimiter: "," | "\t"): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i] ?? "";

    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && ch === delimiter) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}

function parseDelimited(text: string, delimiter: "," | "\t"): string[][] {
  const lines = normalizeNewlines(text)
    .split("\n")
    .map((l) => l.replace(/\uFEFF/g, ""));

  const rows: string[][] = [];
  for (const line of lines) {
    // Keep row count stable; do not drop empty rows here.
    const cells = parseCsvLine(line, delimiter);
    rows.push(cells);
  }
  return rows;
}

export function parseTableInput(inputRaw: string): ParsedTable {
  const input = normalizeNewlines(stripBOM(String(inputRaw ?? ""))).trim();
  if (!input) return { rows: [], detectedFormat: "unknown", maxColumns: 0 };

  if (isLikelyHtmlTable(input) && typeof DOMParser !== "undefined") {
    const rows = parseHtmlTable(input);
    const maxColumns = rows.reduce((m, r) => Math.max(m, r.length), 0);
    return { rows, detectedFormat: "html", maxColumns };
  }

  if (input.includes("\t")) {
    const rows = parseDelimited(input, "\t");
    const maxColumns = rows.reduce((m, r) => Math.max(m, r.length), 0);
    return { rows, detectedFormat: "tsv", maxColumns };
  }

  if (input.includes(",")) {
    const rows = parseDelimited(input, ",");
    const maxColumns = rows.reduce((m, r) => Math.max(m, r.length), 0);
    return { rows, detectedFormat: "csv", maxColumns };
  }

  // Fallback: treat whitespace-separated columns.
  const rows = normalizeNewlines(input)
    .split("\n")
    .map((line) => line.trim())
    .map((line) => (line ? line.split(/\s+/g) : [""]));

  const maxColumns = rows.reduce((m, r) => Math.max(m, r.length), 0);
  return { rows, detectedFormat: "unknown", maxColumns };
}

export function tableToList(
  inputRaw: string,
  opts: Partial<TableToListOptions> = {},
): TableToListResult {
  const options: TableToListOptions = {
    columnIndex: Math.max(0, opts.columnIndex ?? 0),
    trimCells: opts.trimCells ?? true,
    ignoreEmpty: opts.ignoreEmpty ?? true,
  };

  const parsed = parseTableInput(inputRaw);
  const col = Math.min(options.columnIndex, Math.max(0, parsed.maxColumns - 1));

  const items: string[] = [];
  let skippedEmptyCount = 0;

  for (const row of parsed.rows) {
    const cell = row[col] ?? "";
    const v = options.trimCells ? String(cell).trim() : String(cell);

    if (options.ignoreEmpty && !v) {
      skippedEmptyCount++;
      continue;
    }

    items.push(v);
  }

  // Normalize output to LF newlines.
  const output = items.join("\n");

  return {
    output,
    detectedFormat: parsed.detectedFormat,
    maxColumns: parsed.maxColumns,
    totalRows: parsed.rows.length,
    extractedCount: items.length,
    skippedEmptyCount,
  };
}
