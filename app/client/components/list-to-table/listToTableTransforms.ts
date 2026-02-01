export type ParseMode = "whitespace" | "lines";

export function parseListItems(input: string, mode: ParseMode): string[] {
  const raw = String(input ?? "");
  if (!raw.trim()) return [];

  const parts =
    mode === "whitespace"
      ? raw.split(/\s+/g)
      : raw.split(/\r?\n/g);

  return parts.map((s) => s.trim()).filter(Boolean);
}

function escapeHtmlCell(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function toHtmlTable(items: string[]): string {
  const rows = items
    .map((v) => `<tr><td>${escapeHtmlCell(v)}</td></tr>`)
    .join("");
  return `<table><tbody>${rows}</tbody></table>`;
}

function csvEscape(value: string): string {
  const v = String(value ?? "");
  // Quote if it contains comma, quote, or newline
  if (/[",\r\n]/.test(v)) return `"${v.replaceAll('"', '""')}"`;
  return v;
}

export function toCsv(items: string[]): string {
  // Single column CSV, one item per row
  return items.map((v) => csvEscape(v)).join("\n");
}

export function toTsv(items: string[]): string {
  // Single column TSV, one item per row
  // Replace literal tabs/newlines to avoid breaking structure
  const clean = (s: string) => String(s ?? "").replaceAll("\t", " ").replaceAll("\r", " ").replaceAll("\n", " ");
  return items.map((v) => clean(v)).join("\n");
}
