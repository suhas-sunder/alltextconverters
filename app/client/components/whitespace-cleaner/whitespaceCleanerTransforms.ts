export type WhitespaceCleanCounts = {
  tabsReplaced: number;
  nbspReplaced: number;
  zeroWidthRemoved: number;
  invisibleRemoved: number;
  totalChanged: number;
};

export type CleanResult = {
  text: string;
  counts: WhitespaceCleanCounts;
};

const ZERO_WIDTH_REGEX = /[\u200B\u200C\u200D\u2060\uFEFF]/g;
// A small, practical set of other invisible characters that commonly sneak into text.
// - soft hyphen (U+00AD) can be invisible in many renderers
// - line separator (U+2028) and paragraph separator (U+2029) can break parsing in some systems
const INVISIBLE_REGEX = /[\u00AD\u2028\u2029]/g;

function countMatches(value: string, re: RegExp): number {
  const m = value.match(re);
  return m ? m.length : 0;
}

export function cleanWhitespace(value: string): CleanResult {
  let text = value ?? "";

  const tabCount = countMatches(text, /\t/g);
  // Replace tabs with a single space to preserve token boundaries.
  text = text.replace(/\t+/g, " ");

  const nbspCount = countMatches(text, /\u00A0/g);
  text = text.replace(/\u00A0/g, " ");

  const zwCount = countMatches(text, ZERO_WIDTH_REGEX);
  text = text.replace(ZERO_WIDTH_REGEX, "");

  const invCount = countMatches(text, INVISIBLE_REGEX);
  text = text.replace(INVISIBLE_REGEX, "");

  const total =
    tabCount + nbspCount + zwCount + invCount;

  return {
    text,
    counts: {
      tabsReplaced: tabCount,
      nbspReplaced: nbspCount,
      zeroWidthRemoved: zwCount,
      invisibleRemoved: invCount,
      totalChanged: total,
    },
  };
}
