export interface SearchableTool {
  label: string;
  href: string;
  keywords: readonly string[];
}

const tokens = (value: string): string[] => value.toLowerCase().normalize("NFKD")
  .replace(/\p{M}/gu, "").match(/[\p{L}\p{N}]+/gu) ?? [];

export function searchTools<T extends SearchableTool>(tools: readonly T[], query: string): T[] {
  const terms = tokens(query);
  if (!terms.length) return [...tools];
  return tools.flatMap((tool) => {
    const label = tokens(tool.label);
    const words = [...label, ...tokens(tool.href), ...tokens(tool.keywords.join(" "))];
    if (!terms.every((term) => words.some((word) => word.includes(term)))) return [];
    const phrase = terms.join(" ");
    const name = label.join(" ");
    const score = name === phrase ? 100 : name.startsWith(phrase) ? 50 :
      terms.reduce((total, term) => total + (label.includes(term) ? 4 : label.some((word) => word.startsWith(term)) ? 2 : 0), 0);
    return [{ tool, score }];
  }).sort((a, b) => b.score - a.score).map(({ tool }) => tool);
}

export function parseToolFavorites(raw: string | null, tools: readonly SearchableTool[]): string[] {
  if (!raw || raw.length > 16_384) return [];
  try {
    const values: unknown = JSON.parse(raw);
    if (!Array.isArray(values)) return [];
    const validPaths = new Set(tools.map((tool) => tool.href));
    return [...new Set(values.filter((value): value is string => typeof value === "string" && validPaths.has(value)))];
  } catch {
    return [];
  }
}
