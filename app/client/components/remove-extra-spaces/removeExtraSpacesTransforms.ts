export type RemoveSpacesOptions = {
  preserveLineBreaks: boolean;
};

export type RemoveSpacesResult = {
  output: string;
  stats: {
    collapsedRuns: number;
    removedZeroWidth: number;
    replacedTabs: number;
    preserveLineBreaks: boolean;
  };
};

const ZERO_WIDTH_RE = /[\u200B\u200C\u200D\u2060\uFEFF]/g;

export function removeExtraSpaces(
  input: string,
  options: RemoveSpacesOptions,
): RemoveSpacesResult {
  const preserveLineBreaks = !!options.preserveLineBreaks;

  let s = String(input ?? "");

  // Remove zero-width characters that can create confusing spacing artifacts.
  const beforeZW = s;
  s = s.replace(ZERO_WIDTH_RE, "");
  const removedZeroWidth = beforeZW.length - s.length;

  // Normalize NBSP to regular space so collapsing behaves predictably.
  s = s.replace(/\u00A0/g, " ");

  // Replace tabs with spaces (a tab often appears as misaligned spacing on paste).
  const beforeTabs = s;
  s = s.replace(/\t/g, " ");
  const replacedTabs = (beforeTabs.match(/\t/g) || []).length;

  let collapsedRuns = 0;

  if (preserveLineBreaks) {
    // Keep line breaks, collapse repeated spaces per-line.
    s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = s.split("\n");
    const cleanedLines = lines.map((line) => {
      const before = line;
      const after = line.replace(/ {2,}/g, (m) => {
        collapsedRuns += 1;
        return " ";
      });
      return after;
    });
    return {
      output: cleanedLines.join("\n"),
      stats: { collapsedRuns, removedZeroWidth, replacedTabs, preserveLineBreaks },
    };
  }

  // Collapse across the whole text, including newlines.
  // This is useful when you want a single-flow paragraph.
  s = s.replace(/\s+/g, (m) => {
    if (m.length > 1) collapsedRuns += 1;
    return " ";
  });

  return {
    output: s.trim(),
    stats: { collapsedRuns, removedZeroWidth, replacedTabs, preserveLineBreaks },
  };
}
