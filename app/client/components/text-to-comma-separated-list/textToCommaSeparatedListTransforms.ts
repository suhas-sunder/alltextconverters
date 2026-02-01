export type SplitMode = "lines" | "commas" | "whitespace" | "auto";

export type TextToCommaOptions = {
  splitMode: SplitMode;
  spaceAfterComma: boolean;
  quoteItems: boolean;
  trimItems: boolean;
  ignoreEmpty: boolean;
};

export type TextToCommaResult = {
  output: string;
  items: string[];
  // stats for UI
  tokensFound: number;
  removedEmptyCount: number;
  trimmedCount: number;
  strippedPrefixCount: number;
};

function stripCommonListPrefixes(line: string) {
  // Remove very common bullet/numbering prefixes so pasted lists convert cleanly.
  // Examples: "- item", "* item", "• item", "1. item", "1) item", "(1) item"
  const original = line;
  let s = line;

  // Bullet-like
  s = s.replace(/^\s*(?:[-*•‣▪◦]+)\s+/, "");
  // Numbered list patterns
  s = s.replace(/^\s*\(?\d+\)?[.)]\s+/, "");
  // Lettered list patterns: a) b) A. etc
  s = s.replace(/^\s*[A-Za-z][.)]\s+/, "");

  return { value: s, changed: s !== original };
}

function splitTokens(input: string, mode: SplitMode) {
  const text = String(input ?? "");

  if (!text) return [];

  switch (mode) {
    case "commas":
      return text.split(",");
    case "whitespace":
      // Split on any run of whitespace
      return text.split(/\s+/);
    case "auto": {
      // Treat commas and line breaks as primary separators, then split leftovers by whitespace.
      // Also handle semicolons which appear in exports.
      const normalized = text.replace(/\r\n/g, "\n");
      const rough = normalized
        .split(/[,;\n]+/g)
        .flatMap((chunk) => chunk.split(/\s+/));
      return rough;
    }
    case "lines":
    default:
      return text.replace(/\r\n/g, "\n").split(/\n/);
  }
}

export function textToCommaSeparatedList(
  input: string,
  opts: TextToCommaOptions,
): TextToCommaResult {
  const normalized = String(input ?? "");
  const rawTokens = splitTokens(normalized, opts.splitMode);

  let removedEmptyCount = 0;
  let trimmedCount = 0;
  let strippedPrefixCount = 0;

  const items: string[] = [];

  for (let token of rawTokens) {
    let original = String(token ?? "");

    // In line-ish modes, strip common bullets/numbering. In commas/whitespace it is less reliable.
    if (opts.splitMode === "lines" || opts.splitMode === "auto") {
      const stripped = stripCommonListPrefixes(original);
      if (stripped.changed) strippedPrefixCount++;
      original = stripped.value;
    }

    let value = original;
    if (opts.trimItems) {
      const trimmed = value.trim();
      if (trimmed !== value) trimmedCount++;
      value = trimmed;
    }

    if (opts.ignoreEmpty && !value) {
      removedEmptyCount++;
      continue;
    }

    if (!value) {
      // If not ignoring empties, keep as-is (but still avoid undefined).
      value = "";
    }

    if (opts.quoteItems) {
      // Basic JSON/CSV-style double quotes escaping
      const escaped = value.replace(/"/g, '\"');
      value = `"${escaped}"`;
    }

    items.push(value);
  }

  const joiner = opts.spaceAfterComma ? ", " : ",";
  const output = items.join(joiner);

  return {
    output,
    items,
    tokensFound: rawTokens.length,
    removedEmptyCount,
    trimmedCount,
    strippedPrefixCount,
  };
}
