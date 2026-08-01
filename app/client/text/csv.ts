import { normalizeLineEndings } from "./text-core";

export type CsvParseResult = { rows: string[][]; delimiter: string; warnings: string[] } | { rows: string[][]; delimiter: string; warnings: string[]; error: string };

export function detectDelimiter(input: string): { delimiter: string; confident: boolean } {
  const line = normalizeLineEndings(input).split("\n").find((value) => value.length > 0) ?? "";
  const candidates = [",", ";", "\t", "|"];
  const counts = candidates.map((delimiter) => ({ delimiter, count: line.split(delimiter).length - 1 })).sort((a, b) => b.count - a.count);
  return { delimiter: counts[0]?.count ? counts[0].delimiter : ",", confident: Boolean(counts[0]?.count && counts[0].count > (counts[1]?.count ?? 0)) };
}

/** RFC 4180-style state machine; supports quoted delimiters and quoted newlines. */
export function parseCsv(input: string, suppliedDelimiter?: string): CsvParseResult {
  const source = normalizeLineEndings(String(input ?? "")).replace(/^\uFEFF/, "");
  const detected = suppliedDelimiter ? { delimiter: suppliedDelimiter, confident: true } : detectDelimiter(source);
  const delimiter = detected.delimiter;
  const rows: string[][] = []; let row: string[] = []; let field = ""; let quoted = false; let atStart = true;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') { if (source[index + 1] === '"') { field += '"'; index += 1; } else quoted = false; }
      else field += char;
      continue;
    }
    if (char === '"' && atStart) { quoted = true; atStart = false; continue; }
    if (char === delimiter) { row.push(field); field = ""; atStart = true; continue; }
    if (char === "\n") { row.push(field); rows.push(row); row = []; field = ""; atStart = true; continue; }
    if (char === '"') return { rows, delimiter, warnings: [], error: `Unexpected quote at row ${rows.length + 1}, column ${row.length + 1}.` };
    field += char; atStart = false;
  }
  if (quoted) return { rows, delimiter, warnings: [], error: `Unterminated quoted field at row ${rows.length + 1}, column ${row.length + 1}.` };
  if (source.length || field || row.length) { row.push(field); rows.push(row); }
  const widths = new Set(rows.map((record) => record.length));
  const warnings = [!detected.confident && !suppliedDelimiter && source ? "Delimiter detection is uncertain; choose a delimiter if the preview is wrong." : "", widths.size > 1 ? "Rows have inconsistent column counts; missing cells are kept empty." : ""].filter(Boolean);
  return { rows, delimiter, warnings };
}

export function serializeCsv(rows: string[][], options: { delimiter?: string; lineEnding?: "LF" | "CRLF"; alwaysQuote?: boolean; bom?: boolean } = {}): string {
  const delimiter = options.delimiter ?? ","; const lineEnding = options.lineEnding === "LF" ? "\n" : "\r\n";
  const quote = (value: string) => {
    const needsQuote = options.alwaysQuote || value.includes(delimiter) || /["\r\n]/.test(value) || /^\s|\s$/.test(value);
    return needsQuote ? `"${value.replace(/"/g, '""')}"` : value;
  };
  return `${options.bom ? "\uFEFF" : ""}${rows.map((row) => row.map((cell) => quote(String(cell ?? ""))).join(delimiter)).join(lineEnding)}${rows.length ? lineEnding : ""}`;
}
