import { normalizeLineEndings } from "./text-core";

export type CsvParseResult = { rows: string[][]; delimiter: string; warnings: string[] } | { rows: string[][]; delimiter: string; warnings: string[]; error: string };

export function detectDelimiter(input: string): { delimiter: string; confident: boolean } {
  const candidates = [",", ";", "\t", "|"];
  const counts = candidates.map((delimiter) => ({ delimiter, count: 0 }));
  let quoted = false;

  // Count delimiters in the first logical record with any candidates.
  // Escaped quotes flip the state twice and leave the field quoted.
  for (const char of input) {
    if (char === '"') {
      quoted = !quoted;
    } else if (!quoted) {
      if ((char === "\n" || char === "\r") && counts.some(({ count }) => count > 0)) break;
      const candidate = counts.find(({ delimiter }) => delimiter === char);
      if (candidate) candidate.count += 1;
    }
  }

  counts.sort((a, b) => b.count - a.count);
  return { delimiter: counts[0].delimiter, confident: counts[0].count > counts[1].count };
}

/** RFC 4180-style state machine; supports quoted delimiters and quoted newlines. */
export function parseCsv(input: string, suppliedDelimiter?: string): CsvParseResult {
  const source = normalizeLineEndings(input).replace(/^\uFEFF/, "");
  const detected = suppliedDelimiter ? { delimiter: suppliedDelimiter, confident: true } : detectDelimiter(source);
  const { delimiter } = detected;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let state: "start" | "unquoted" | "quoted" | "after-quote" = "start";
  const error = (message: string): CsvParseResult => ({
    rows,
    delimiter,
    warnings: [],
    error: `${message} at row ${rows.length + 1}, column ${row.length + 1}.`,
  });

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (state === "quoted") {
      if (char !== '"') {
        field += char;
      } else if (source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        state = "after-quote";
      }
      continue;
    }
    if (char === delimiter || char === "\n") {
      row.push(field);
      field = "";
      state = "start";
      if (char === "\n") {
        rows.push(row);
        row = [];
      }
      continue;
    }
    if (state === "after-quote") return error("Unexpected character after closing quote");
    if (char === '"') {
      if (state !== "start") return error("Unexpected quote");
      state = "quoted";
    } else {
      field += char;
      state = "unquoted";
    }
  }

  if (state === "quoted") return error("Unterminated quoted field");
  if (state !== "start" || row.length) rows.push([...row, field]);

  const warnings = [];
  if (!detected.confident && source) warnings.push("Delimiter detection is uncertain; choose a delimiter if the preview is wrong.");
  if (rows.some((record) => record.length !== rows[0].length)) {
    warnings.push("Rows have inconsistent column counts; missing cells are kept empty.");
  }
  return { rows, delimiter, warnings };
}

export function serializeCsv(rows: string[][], options: { delimiter?: string; lineEnding?: "LF" | "CRLF"; alwaysQuote?: boolean; bom?: boolean } = {}): string {
  const delimiter = options.delimiter ?? ",";
  const lineEnding = options.lineEnding === "LF" ? "\n" : "\r\n";
  const quote = (value: string, singleColumn: boolean) => {
    // Distinguish a one-field empty record from a blank line.
    const needsQuote = options.alwaysQuote || (singleColumn && value === "") || value.includes(delimiter) || /["\r\n]/.test(value) || /^\s|\s$/.test(value);
    return needsQuote ? `"${value.replace(/"/g, '""')}"` : value;
  };
  return `${options.bom ? "\uFEFF" : ""}${rows.map((row) => row.map((cell) => quote(String(cell ?? ""), row.length === 1)).join(delimiter)).join(lineEnding)}${rows.length ? lineEnding : ""}`;
}
