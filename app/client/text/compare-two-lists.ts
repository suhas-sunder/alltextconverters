import { encodeUtf8Strict } from "./bytes";
import { splitLines } from "./text-core";

export const comparisonLimits = { bytes: 512 * 1024, records: 20_000, previewRows: 30 } as const;
export type ListSide = "A" | "B";
export type ComparisonOptions = {
  duplicates: "set" | "multiset";
  order: "source" | "sorted";
  ignoreCase: boolean;
  trimEdges: boolean;
  ignoreEmpty: boolean;
};
export const defaultComparisonOptions: ComparisonOptions = {
  duplicates: "set", order: "source", ignoreCase: false, trimEdges: false, ignoreEmpty: false,
};

export const comparisonGroups = ["onlyA", "onlyB", "common", "union"] as const;
export type ComparisonGroup = (typeof comparisonGroups)[number];
type Counts = { a: number; b: number };
type RecordEntry = { key: string; value: string };
type ParsedList = { entries: RecordEntry[]; skipped: number };
type GroupRow = { key: string; value: string; counts: Counts; occurrences: number };
export type ComparisonOutput = {
  values: string[];
  preview: GroupRow[];
  distinct: number;
};
export type ComparisonResult = {
  outputs: Record<ComparisonGroup, ComparisonOutput>;
  included: Counts;
  skipped: Counts;
};
export type ComparisonRequest = { a: string; b: string; options: ComparisonOptions };
export type ComparisonResponse = { result: ComparisonResult } | { error: string };

function readList(input: string, side: ListSide, options: ComparisonOptions): ParsedList | { error: string } {
  const sizeError = { error: `List ${side} exceeds 512 KiB of UTF-8 text.` };
  if (input.length > comparisonLimits.bytes) return sizeError;
  const encoded = encodeUtf8Strict(input);
  if (!encoded.bytes) return { error: `List ${side} contains invalid Unicode. ${encoded.errors[0]}` };
  if (encoded.bytes.length > comparisonLimits.bytes) return sizeError;

  const lines = input ? splitLines(input) : [];
  // A final line ending terminates the last entry without adding a new one.
  if (lines.at(-1) === "") lines.pop();
  if (lines.length > comparisonLimits.records) {
    return { error: `List ${side} exceeds 20,000 input lines.` };
  }

  const entries: RecordEntry[] = [];
  let skipped = 0;
  for (const value of lines) {
    const trimmed = options.trimEdges ? value.trim() : value;
    if (options.ignoreEmpty && trimmed === "") {
      skipped++;
      continue;
    }
    entries.push({ value, key: options.ignoreCase ? trimmed.toLowerCase() : trimmed });
  }
  return { entries, skipped };
}

function compareKeys(left: { key: string }, right: { key: string }) {
  return left.key < right.key ? -1 : left.key > right.key ? 1 : 0;
}

function prepareOutput(entries: RecordEntry[], totals: Map<string, Counts>, order: ComparisonOptions["order"]): ComparisonOutput {
  if (order === "sorted") entries.sort(compareKeys);
  const byKey = new Map<string, GroupRow>();
  for (const entry of entries) {
    const row = byKey.get(entry.key);
    if (row) row.occurrences++;
    else byKey.set(entry.key, { ...entry, counts: totals.get(entry.key)!, occurrences: 1 });
  }
  return {
    values: entries.map(({ value }) => value),
    preview: Array.from(byKey.values()).slice(0, comparisonLimits.previewRows),
    distinct: byKey.size,
  };
}

export function compareTwoLists({ a, b, options }: ComparisonRequest): ComparisonResponse {
  const left = readList(a, "A", options);
  if ("error" in left) return left;
  const right = readList(b, "B", options);
  if ("error" in right) return right;

  const totals = new Map<string, Counts>();
  for (const [side, entries] of [["a", left.entries], ["b", right.entries]] as const) {
    for (const { key } of entries) {
      const counts = totals.get(key) ?? { a: 0, b: 0 };
      counts[side]++;
      totals.set(key, counts);
    }
  }

  const buckets: Record<ComparisonGroup, RecordEntry[]> = { onlyA: [], onlyB: [], common: [], union: [] };
  const setMode = options.duplicates === "set";
  for (const [side, entries] of [["a", left.entries], ["b", right.entries]] as const) {
    const visited = new Map<string, number>();
    for (const entry of entries) {
      const index = visited.get(entry.key) ?? 0;
      if (setMode && index > 0) continue;
      visited.set(entry.key, index + 1);
      const otherCount = totals.get(entry.key)![side === "a" ? "b" : "a"];
      const paired = index < otherCount;
      if (side === "a") {
        buckets[paired ? "common" : "onlyA"].push(entry);
        buckets.union.push(entry);
      } else if (!paired) {
        buckets.onlyB.push(entry);
        buckets.union.push(entry);
      }
    }
  }

  return {
    result: {
      included: { a: left.entries.length, b: right.entries.length },
      skipped: { a: left.skipped, b: right.skipped },
      outputs: {
        onlyA: prepareOutput(buckets.onlyA, totals, options.order),
        onlyB: prepareOutput(buckets.onlyB, totals, options.order),
        common: prepareOutput(buckets.common, totals, options.order),
        union: prepareOutput(buckets.union, totals, options.order),
      },
    },
  };
}

/** A terminating LF preserves empty entries when the text is read as a list. */
export function comparisonText(values: string[]) {
  return values.length ? values.join("\n") + "\n" : "";
}
