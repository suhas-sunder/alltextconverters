export function parseLines(input: string): string[] {
  // Deterministic: split on line endings, trim each line, ignore empties.
  return (input || "")
    .split(/\r\n|\n|\r/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function escapeCsvCell(value: string): string {
  // RFC 4180-ish: quote if it contains comma, quote, or line break.
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function listToCommaSeparated(
  input: string,
  opts: { spaceAfterComma: boolean },
): {
  output: string;
  items: string[];
  delimiter: string;
} {
  const items = parseLines(input);
  const delimiter = opts.spaceAfterComma ? ", " : ",";
  return {
    output: items.join(delimiter),
    items,
    delimiter,
  };
}

export function listToCsvSingleColumn(input: string): { csv: string; rows: string[] } {
  const rows = parseLines(input);
  const header = "value";
  const body = rows.map((r) => escapeCsvCell(r)).join("\n");
  const csv = rows.length ? `${header}\n${body}\n` : `${header}\n`;
  return { csv, rows };
}
