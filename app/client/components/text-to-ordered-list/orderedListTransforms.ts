export type SplitMode = "lines" | "commas";
export type MarkerStyle =
  | "numeric"
  | "alpha-lower"
  | "alpha-upper"
  | "roman-lower"
  | "roman-upper";

export type OrderedListOptions = {
  splitMode: SplitMode;
  markerStyle: MarkerStyle;
  startAt: number;
  trimItems: boolean;
  ignoreEmpty: boolean;
};

export type OrderedListResult = {
  output: string;
  itemCount: number;
  removedEmptyCount: number;
  applied: string[];
};

const PRINTABLE_DELIM = ". ";

function normalizeLineEndings(s: string) {
  return (s || "").replace(/\r\n?/g, "\n");
}

function extractItems(input: string, mode: SplitMode): string[] {
  const normalized = normalizeLineEndings(input);
  if (mode === "commas") {
    return normalized.split(",");
  }
  return normalized.split("\n");
}

function toExcelColumn(n: number): string {
  let x = Math.floor(n);
  if (!Number.isFinite(x) || x <= 0) return "";
  let out = "";
  while (x > 0) {
    x -= 1;
    out = String.fromCharCode(65 + (x % 26)) + out;
    x = Math.floor(x / 26);
  }
  return out;
}

function toRoman(n: number): string {
  const x = Math.floor(n);
  if (!Number.isFinite(x) || x <= 0 || x > 3999) return "";
  const pairs: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = x;
  let out = "";
  for (const [val, sym] of pairs) {
    while (remaining >= val) {
      out += sym;
      remaining -= val;
    }
  }
  return out;
}

function markerFor(index1: number, style: MarkerStyle): string {
  switch (style) {
    case "alpha-lower": {
      const col = toExcelColumn(index1);
      return col ? col.toLowerCase() : String(index1);
    }
    case "alpha-upper": {
      const col = toExcelColumn(index1);
      return col || String(index1);
    }
    case "roman-lower": {
      const r = toRoman(index1);
      return r ? r.toLowerCase() : String(index1);
    }
    case "roman-upper": {
      const r = toRoman(index1);
      return r || String(index1);
    }
    case "numeric":
    default:
      return String(index1);
  }
}

export function convertTextToOrderedList(
  input: string,
  options: OrderedListOptions,
): OrderedListResult {
  const applied: string[] = [];

  const startAtSafe =
    Number.isFinite(options.startAt) && options.startAt > 0
      ? Math.floor(options.startAt)
      : 1;

  applied.push(
    options.splitMode === "lines"
      ? "Split input by line breaks"
      : "Split input by commas",
  );
  if (options.trimItems) applied.push("Trim whitespace around each item");
  if (options.ignoreEmpty) applied.push("Ignore empty items");
  applied.push(
    `Numbering style: ${options.markerStyle.replace("-", " ")}, start at ${startAtSafe}`,
  );

  const rawItems = extractItems(input, options.splitMode);
  let removedEmpty = 0;

  const cleaned = rawItems
    .map((s) => (options.trimItems ? (s || "").trim() : String(s ?? "")))
    .filter((s) => {
      if (!options.ignoreEmpty) return true;
      const keep = s.length > 0;
      if (!keep) removedEmpty += 1;
      return keep;
    });

  const lines: string[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const ordinal = startAtSafe + i;
    const marker = markerFor(ordinal, options.markerStyle);
    const prefix = (marker || String(ordinal)) + PRINTABLE_DELIM;
    lines.push(prefix + cleaned[i]);
  }

  return {
    output: lines.join("\n"),
    itemCount: cleaned.length,
    removedEmptyCount: removedEmpty,
    applied,
  };
}
