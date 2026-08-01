import { parseCsv } from "../../text/csv";
export type CommaToJsonArrayResult = { items: string[]; ignoredEmpty: number; totalTokens: number; error?: string };
export function parseCommaSeparatedValues(input: string): CommaToJsonArrayResult {
  const parsed = parseCsv(input, ",");
  if ("error" in parsed) return { items: [], ignoredEmpty: 0, totalTokens: 0, error: parsed.error };
  const raw = parsed.rows.flat(); const items = raw.map((item) => item.trim()).filter(Boolean);
  return { items, ignoredEmpty: raw.length - items.length, totalTokens: raw.length };
}
export function toJsonArrayString(items: string[]): string { return JSON.stringify(items); }
