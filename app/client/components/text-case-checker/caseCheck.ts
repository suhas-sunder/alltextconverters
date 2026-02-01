export type CaseLabel =
  | "Uppercase"
  | "Lowercase"
  | "Mixed"
  | "Title-like"
  | "Sentence-like"
  | "No letters";

export type CaseCheckSummary = {
  label: CaseLabel;
  reason: string;
  letters: number;
  upperLetters: number;
  lowerLetters: number;
  words: number;
  lines: number;
  sentenceStarts: number;
  sentenceStartsUpper: number;
  titleWordCount: number;
  titleWordLike: number;
};

export type LineLabel = {
  lineNumber: number;
  label: CaseLabel;
};

const ZERO_WIDTH_RE = /[\u200B\u200C\u200D\u2060\uFEFF\u180E\u00AD\u034F]/g;

function isLetter(ch: string) {
  return /[A-Za-z]/.test(ch);
}

function isUpper(ch: string) {
  return /[A-Z]/.test(ch);
}

function isLower(ch: string) {
  return /[a-z]/.test(ch);
}

function splitWords(s: string) {
  // "word-like tokens": sequences that include letters or digits.
  return s
    .split(/[^A-Za-z0-9]+/g)
    .map((w) => w.trim())
    .filter(Boolean);
}

function isTitleWordLike(word: string) {
  // Simple deterministic rule:
  // - First letter (if any) is uppercase
  // - Remaining letters (if any) are lowercase
  // - Non-letters are ignored in the check
  let firstLetter: string | null = null;
  const restLetters: string[] = [];
  for (const ch of word) {
    if (!isLetter(ch)) continue;
    if (!firstLetter) firstLetter = ch;
    else restLetters.push(ch);
  }
  if (!firstLetter) return false;
  if (!isUpper(firstLetter)) return false;
  return restLetters.every((c) => isLower(c));
}

function sentenceStartsUpperScore(text: string) {
  // Counts likely sentence starts: start of text or after . ! ?
  // Then checks whether first following letter is uppercase.
  let starts = 0;
  let startsUpper = 0;

  const s = text || "";
  const len = s.length;

  const isBoundary = (idx: number) => {
    if (idx < 0) return true;
    const ch = s[idx] ?? "";
    return ch === "." || ch === "!" || ch === "?";
  };

  for (let i = 0; i < len; i++) {
    // detect start-of-text or after punctuation
    const prev = i - 1;
    if (i === 0 || isBoundary(prev)) {
      // skip spaces/quotes/brackets
      let j = i;
      while (j < len && /[\s"'“”‘’()\[\]{}<>]/.test(s[j] ?? "")) {
        j++;
      }
      if (j < len && isLetter(s[j] ?? "")) {
        starts++;
        if (isUpper(s[j] ?? "")) startsUpper++;
      }
    }
  }

  return { starts, startsUpper };
}

export function checkTextCase(input: string): {
  summary: CaseCheckSummary;
  perLine: LineLabel[];
  cleanedForScan: string;
} {
  const original = input ?? "";
  // Clean zero-width for analysis only (do not mutate user text).
  const cleanedForScan = original.replace(ZERO_WIDTH_RE, "");

  let letters = 0;
  let upperLetters = 0;
  let lowerLetters = 0;

  for (const ch of cleanedForScan) {
    if (!isLetter(ch)) continue;
    letters++;
    if (isUpper(ch)) upperLetters++;
    else if (isLower(ch)) lowerLetters++;
  }

  const linesArr = cleanedForScan.split(/\r?\n/);
  const lines = linesArr.length;
  const words = splitWords(cleanedForScan).length;

  const { starts: sentenceStarts, startsUpper: sentenceStartsUpper } =
    sentenceStartsUpperScore(cleanedForScan);

  const wordTokens = splitWords(cleanedForScan);
  const titleWordCount = wordTokens.length;
  const titleWordLike = wordTokens.filter(isTitleWordLike).length;

  let label: CaseLabel = "Mixed";
  let reason = "Text contains both uppercase and lowercase letters.";

  if (letters === 0) {
    label = "No letters";
    reason = "";
  } else if (upperLetters === letters) {
    label = "Uppercase";
    reason = "All detected letters are uppercase.";
  } else if (lowerLetters === letters) {
    label = "Lowercase";
    reason = "All detected letters are lowercase.";
  } else {
    const titleRatio = titleWordCount > 0 ? titleWordLike / titleWordCount : 0;

    const sentenceRatio =
      sentenceStarts > 0 ? sentenceStartsUpper / sentenceStarts : 0;

    // Title-like: most words match "TitleWordLike"
    if (titleWordCount >= 2 && titleRatio >= 0.8) {
      label = "Title-like";
      reason =
        "Most words start with an uppercase letter and continue in lowercase (simple title-like pattern).";
    } else if (
      sentenceStarts >= 1 &&
      sentenceRatio >= 0.75 &&
      lowerLetters >= upperLetters
    ) {
      label = "Sentence-like";
      reason =
        "Sentence starts usually begin with uppercase letters, while most other letters are lowercase.";
    } else {
      label = "Mixed";
      reason =
        "Casing is mixed or does not match simple title/sentence patterns.";
    }
  }

  // Per-line labeling (bounded to prevent huge UI cost).
  const maxLinesToLabel = 2000;
  const perLine: LineLabel[] = linesArr
    .slice(0, maxLinesToLabel)
    .map((ln, i) => {
      const r = checkTextCaseLine(ln);
      return { lineNumber: i + 1, label: r };
    });

  return {
    summary: {
      label,
      reason,
      letters,
      upperLetters,
      lowerLetters,
      words,
      lines,
      sentenceStarts,
      sentenceStartsUpper,
      titleWordCount,
      titleWordLike,
    },
    perLine,
    cleanedForScan,
  };
}

function checkTextCaseLine(line: string): CaseLabel {
  const s = (line ?? "").replace(ZERO_WIDTH_RE, "");
  let letters = 0;
  let upperLetters = 0;
  let lowerLetters = 0;

  for (const ch of s) {
    if (!isLetter(ch)) continue;
    letters++;
    if (isUpper(ch)) upperLetters++;
    else if (isLower(ch)) lowerLetters++;
  }

  if (letters === 0) return "No letters";
  if (upperLetters === letters) return "Uppercase";
  if (lowerLetters === letters) return "Lowercase";

  const tokens = splitWords(s);
  const titleLike =
    tokens.length >= 2
      ? tokens.filter(isTitleWordLike).length / tokens.length >= 0.8
      : false;

  const { starts, startsUpper } = sentenceStartsUpperScore(s);
  const sentenceLike =
    starts >= 1 && startsUpper / starts >= 0.75 && lowerLetters >= upperLetters;

  if (titleLike) return "Title-like";
  if (sentenceLike) return "Sentence-like";
  return "Mixed";
}

export function formatCaseReport(
  summary: CaseCheckSummary,
  perLine: LineLabel[],
) {
  const lines: string[] = [];
  lines.push(`Text Case Checker Report`);
  lines.push(`Label: ${summary.label}`);
  lines.push(`Reason: ${summary.reason}`);
  lines.push(``);
  lines.push(`Stats`);
  lines.push(`- Lines: ${summary.lines}`);
  lines.push(`- Words (rough): ${summary.words}`);
  lines.push(`- Letters: ${summary.letters}`);
  lines.push(`- Uppercase letters: ${summary.upperLetters}`);
  lines.push(`- Lowercase letters: ${summary.lowerLetters}`);
  lines.push(`- Sentence starts detected: ${summary.sentenceStarts}`);
  lines.push(`- Sentence starts uppercase: ${summary.sentenceStartsUpper}`);
  lines.push(
    `- Title-like words: ${summary.titleWordLike}/${summary.titleWordCount}`,
  );
  lines.push(``);
  lines.push(`Per-line labels (first ${Math.min(perLine.length, 50)} lines):`);
  for (const item of perLine.slice(0, 50)) {
    lines.push(`- Line ${item.lineNumber}: ${item.label}`);
  }
  if (perLine.length > 50)
    lines.push(`- … (${perLine.length - 50} more lines)`);
  return lines.join("\n");
}
