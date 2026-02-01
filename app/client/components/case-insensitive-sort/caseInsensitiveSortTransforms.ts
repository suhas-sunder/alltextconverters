export type SortDirection = "asc" | "desc";

export type SortOptions = {
  direction: SortDirection;
  unique: boolean;
};

type SortRow = {
  line: string;
  key: string;
  idx: number;
};

function compareCaseInsensitive(a: SortRow, b: SortRow) {
  const keyCmp = a.key.localeCompare(b.key, undefined, { sensitivity: "base" });
  if (keyCmp !== 0) return keyCmp;

  const lineCmp = a.line.localeCompare(b.line, undefined, { sensitivity: "variant" });
  if (lineCmp !== 0) return lineCmp;

  return a.idx - b.idx;
}

export function sortLinesCaseInsensitive(input: string, opts: SortOptions): string {
  const raw = String(input ?? "");
  const lines = raw.split(/\r?\n/);

  const rows: SortRow[] = lines.map((line, idx) => ({
    line,
    key: line.toLocaleLowerCase(),
    idx,
  }));

  rows.sort(compareCaseInsensitive);
  if (opts.direction === "desc") rows.reverse();

  if (!opts.unique) return rows.map((r) => r.line).join("\n");

  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    if (seen.has(r.key)) continue;
    seen.add(r.key);
    out.push(r.line);
  }
  return out.join("\n");
}
