export type CommaToJsonArrayResult = {
  items: string[];
  ignoredEmpty: number;
  totalTokens: number;
};

/**
 * Convert comma-separated values into a JSON array of strings.
 *
 * Rules:
 * - Split on commas and line breaks
 * - Trim whitespace around each token
 * - Drop empty tokens
 *
 * This does not parse quoted CSV.
 */
export function parseCommaSeparatedValues(
  input: string,
): CommaToJsonArrayResult {
  const raw = String(input ?? "");
  const tokens = raw.split(/[,]+/g);

  let ignoredEmpty = 0;
  const items: string[] = [];

  for (const t of tokens) {
    const v = t.trim();
    if (!v) {
      ignoredEmpty += 1;
      continue;
    }
    items.push(v);
  }

  return { items, ignoredEmpty, totalTokens: tokens.length };
}

export function toJsonArrayString(items: string[]): string {
  return JSON.stringify(items);
}
