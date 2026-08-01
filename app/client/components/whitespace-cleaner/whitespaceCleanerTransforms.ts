import { cleanUnicodeWhitespace } from "../../text/text-core";

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

const ZERO_WIDTH_REGEX = /[\u200B\uFEFF]/g;
// A small, practical set of other invisible characters that commonly sneak into text.
// - soft hyphen (U+00AD) can be invisible in many renderers
// - line separator (U+2028) and paragraph separator (U+2029) can break parsing in some systems
const INVISIBLE_REGEX = /[\u00AD\u2028\u2029]/g;

function countMatches(value: string, re: RegExp): number {
  const m = value.match(re);
  return m ? m.length : 0;
}

export function cleanWhitespace(value: string): CleanResult {
  const original = value ?? "";
  const result = cleanUnicodeWhitespace(original, { normalizeTabs: false, removeSoftHyphen: false });
  let text = result.output;

  const tabCount = 0;

  const nbspCount = countMatches(original, /\u00A0/g);

  const zwCount = countMatches(original, ZERO_WIDTH_REGEX);

  const invCount = countMatches(original, /[\u2028\u2029]/g);

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
