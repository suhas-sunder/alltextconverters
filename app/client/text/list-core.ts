import { isBlankLine, splitLines } from "./text-core";

export type ListInputFormat = "lines" | "comma" | "semicolon" | "tab" | "pipe" | "custom";
export type ListOptions = { format?: ListInputFormat; delimiter?: string; trim?: boolean; keepEmpty?: boolean };

export function parseSimpleList(input: string, options: ListOptions = {}): string[] {
  const format = options.format ?? "lines";
  const delimiter = format === "lines" ? "\n" : format === "comma" ? "," : format === "semicolon" ? ";" : format === "tab" ? "\t" : format === "pipe" ? "|" : options.delimiter ?? "";
  const pieces = format === "lines" ? splitLines(input) : delimiter ? String(input ?? "").split(delimiter) : [String(input ?? "")];
  return pieces.map((item) => (options.trim ?? true ? item.trim() : item)).filter((item) => options.keepEmpty ? true : !isBlankLine(item, true));
}

export function removeDuplicateItems(items: string[], options: { caseInsensitive?: boolean; trimBeforeComparison?: boolean } = {}): { items: string[]; removed: number } {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items) {
    let key = options.trimBeforeComparison ? item.trim() : item;
    if (options.caseInsensitive) key = key.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key); result.push(item);
  }
  return { items: result, removed: items.length - result.length };
}

export function stableSort(items: string[], direction: "asc" | "desc" = "asc", caseInsensitive = true): string[] {
  return items.map((item, index) => ({ item, index })).sort((a, b) => {
    const result = a.item.localeCompare(b.item, undefined, { sensitivity: caseInsensitive ? "base" : "variant" });
    return (result || a.index - b.index) * (direction === "desc" ? -1 : 1);
  }).map(({ item }) => item);
}
