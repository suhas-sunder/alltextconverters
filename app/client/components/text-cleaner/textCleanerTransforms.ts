export type AppliedOperation = {
  key:
    | "trim"
    | "line_endings"
    | "collapse_spaces"
    | "remove_zero_width";
  label: string;
  detail: string;
  count?: number;
};

export type CleanResult = {
  output: string;
  applied: AppliedOperation[];
};

function countMatches(haystack: string, re: RegExp): number {
  const m = haystack.match(re);
  return m ? m.length : 0;
}

export function cleanText(
  input: string,
  options?: { collapseSpaces?: boolean },
): CleanResult {
  const applied: AppliedOperation[] = [];
  let text = input ?? "";

  // 1) Remove zero-width characters (common copy-paste artifacts)
  const zeroWidthRe = /[\u200B-\u200D\uFEFF]/g;
  const zwCount = countMatches(text, zeroWidthRe);
  if (zwCount > 0) {
    text = text.replace(zeroWidthRe, "");
    applied.push({
      key: "remove_zero_width",
      label: "Removed zero-width characters",
      detail:
        "Strips invisible characters that can break searches, slugs, and form validation.",
      count: zwCount,
    });
  }

  // 2) Normalize line endings to \n (handles Windows and old Mac)
  const crlfCount = countMatches(text, /\r\n/g);
  const crOnlyCount = countMatches(text, /\r(?!\n)/g);
  if (crlfCount > 0 || crOnlyCount > 0) {
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    applied.push({
      key: "line_endings",
      label: "Normalized line endings",
      detail:
        "Converts Windows (CRLF) and old Mac (CR) line endings into a consistent LF format.",
      count: crlfCount + crOnlyCount,
    });
  }

  // 3) Collapse repeated spaces (and tabs) inside lines
  const shouldCollapse = options?.collapseSpaces !== false;
  if (shouldCollapse) {
    const spaceRuns = countMatches(text, /[ \t]{2,}/g);
    if (spaceRuns > 0) {
      text = text.replace(/[ \t]{2,}/g, " ");
      applied.push({
        key: "collapse_spaces",
        label: "Collapsed repeated spaces",
        detail:
          "Turns 2+ spaces (or tabs) into a single space while leaving newlines intact.",
        count: spaceRuns,
      });
    }
  }

  // 4) Trim leading and trailing whitespace for the whole block
  const beforeTrim = text;
  const trimmed = text.trim();
  if (trimmed !== beforeTrim) {
    text = trimmed;
    applied.push({
      key: "trim",
      label: "Trimmed leading and trailing whitespace",
      detail:
        "Removes extra whitespace at the very start and end of your text block.",
    });
  }

  return { output: text, applied };
}
