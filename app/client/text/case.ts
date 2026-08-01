export type CaseMode = "uppercase" | "lowercase" | "title" | "sentence" | "alternating";
export type AlternatingStart = "lowercase" | "uppercase";
export type AlternatingUnit = "letters" | "graphemes";
export type CaseClassification = "Empty input" | "No cased letters" | "Uncased text" | "Uppercase" | "Lowercase" | "Title-like case" | "Sentence-like case" | "Mixed case";

const MARK_RE = /\p{M}/u;
const LETTER_RE = /\p{L}/u;
const REGIONAL_RE = /\p{Regional_Indicator}/u;
const EMOJI_MODIFIER_RE = /\p{Emoji_Modifier}/u;

/** Intl.Segmenter is preferred. The fallback keeps combining marks, emoji
 * modifiers, variation selectors, ZWJ sequences, and flag pairs intact. */
export function segmentGraphemes(input: string): string[] {
  const text = String(input ?? "");
  if (!text) return [];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (part) => part.segment);
  }
  const result: string[] = [];
  let regionalCount = 0;
  for (const point of Array.from(text)) {
    const previous = result[result.length - 1];
    const joinsPrevious = Boolean(previous) && (MARK_RE.test(point) || EMOJI_MODIFIER_RE.test(point) || /[\uFE0E\uFE0F]/u.test(point) || previous.endsWith("\u200D") || point === "\u200D" || (REGIONAL_RE.test(point) && regionalCount % 2 === 1));
    if (joinsPrevious) result[result.length - 1] += point;
    else result.push(point);
    regionalCount = REGIONAL_RE.test(point) ? regionalCount + 1 : 0;
  }
  return result;
}

export function isCasedGrapheme(grapheme: string): boolean {
  return grapheme.toLowerCase() !== grapheme.toUpperCase();
}

export const toUpperCaseText = (input: string) => String(input ?? "").toUpperCase();
export const toLowerCaseText = (input: string) => String(input ?? "").toLowerCase();

/** Simple title case. Apostrophes stay within a word; hyphens and other
 * punctuation start a new word. Existing acronyms are lowercased after their
 * first cased grapheme because this is not an editorial style-guide engine. */
export function toTitleCase(input: string): string {
  let atWordStart = true;
  return segmentGraphemes(input).map((grapheme) => {
    if (isCasedGrapheme(grapheme)) {
      const result = atWordStart ? grapheme.toUpperCase() : grapheme.toLowerCase();
      atWordStart = false;
      return result;
    }
    if (/['\u2019]/u.test(grapheme)) return grapheme;
    if (/[\p{L}\p{N}\p{M}]/u.test(grapheme)) return grapheme;
    atWordStart = true;
    return grapheme;
  }).join("");
}

const SENTENCE_END_RE = /[.!?\u3002\uFF01\uFF1F]/u;

/** Lowercase cased text, then capitalize the first cased grapheme at a
 * document/line start and after sentence punctuation. Decimal points between
 * digits do not start a sentence. */
export function toSentenceCase(input: string): string {
  const graphemes = segmentGraphemes(toLowerCaseText(input));
  let capitalizeNext = true;
  return graphemes.map((grapheme, index) => {
    if (isCasedGrapheme(grapheme)) {
      const result = capitalizeNext ? grapheme.toUpperCase() : grapheme;
      capitalizeNext = false;
      return result;
    }
    if (/\r|\n/u.test(grapheme)) capitalizeNext = true;
    if (SENTENCE_END_RE.test(grapheme)) {
      const previous = graphemes[index - 1] ?? "";
      const next = graphemes[index + 1] ?? "";
      if (!(grapheme === "." && /\p{N}/u.test(previous) && /\p{N}/u.test(next))) capitalizeNext = true;
    }
    return grapheme;
  }).join("");
}

export function toAlternatingCase(input: string, options: { start?: AlternatingStart; unit?: AlternatingUnit } = {}): string {
  const start = options.start ?? "lowercase";
  const unit = options.unit ?? "letters";
  let step = 0;
  return segmentGraphemes(input).map((grapheme) => {
    const cased = isCasedGrapheme(grapheme);
    const upper = (step % 2 === 0) === (start === "uppercase");
    const result = cased ? (upper ? grapheme.toUpperCase() : grapheme.toLowerCase()) : grapheme;
    if (unit === "graphemes" || cased) step += 1;
    return result;
  }).join("");
}

export function applyCaseTransform(input: string, mode: CaseMode): string {
  if (mode === "uppercase") return toUpperCaseText(input);
  if (mode === "lowercase") return toLowerCaseText(input);
  if (mode === "title") return toTitleCase(input);
  if (mode === "sentence") return toSentenceCase(input);
  return toAlternatingCase(input);
}

export type CaseAnalysis = { classification: CaseClassification; uppercase: number; lowercase: number; totalCased: number; uncasedLettersOrSymbols: number; reason: string };

export function analyzeCase(input: string): CaseAnalysis {
  const text = String(input ?? "");
  let uppercase = 0;
  let lowercase = 0;
  let uncasedLettersOrSymbols = 0;
  let uncasedLetters = 0;
  for (const grapheme of segmentGraphemes(text)) {
    if (isCasedGrapheme(grapheme)) {
      if (grapheme === grapheme.toUpperCase() && grapheme !== grapheme.toLowerCase()) uppercase += 1;
      else if (grapheme === grapheme.toLowerCase() && grapheme !== grapheme.toUpperCase()) lowercase += 1;
      else uncasedLettersOrSymbols += 1;
    } else if (!/^\s+$/u.test(grapheme)) {
      uncasedLettersOrSymbols += 1;
      if (LETTER_RE.test(grapheme)) uncasedLetters += 1;
    }
  }
  const totalCased = uppercase + lowercase;
  let classification: CaseClassification;
  let reason: string;
  if (text === "") [classification, reason] = ["Empty input", "Enter text to analyze its casing."];
  else if (totalCased === 0 && uncasedLetters > 0) [classification, reason] = ["Uncased text", "The text contains letters from scripts without uppercase/lowercase forms."];
  else if (totalCased === 0) [classification, reason] = ["No cased letters", "The text contains no letters with uppercase or lowercase forms."];
  else if (uppercase === totalCased) [classification, reason] = ["Uppercase", "All detected cased graphemes are uppercase."];
  else if (lowercase === totalCased) [classification, reason] = ["Lowercase", "All detected cased graphemes are lowercase."];
  else if (toTitleCase(text) === text && text.trim().split(/\s+/u).length >= 2) [classification, reason] = ["Title-like case", "The text matches this tool's simple per-word title-case pattern."];
  else if (toSentenceCase(text) === text && /\p{Ll}/u.test(text)) [classification, reason] = ["Sentence-like case", "The text matches this tool's deterministic sentence-boundary heuristic."];
  else [classification, reason] = ["Mixed case", "The text contains a mixture that does not match the simple title or sentence heuristics."];
  return { classification, uppercase, lowercase, totalCased, uncasedLettersOrSymbols, reason };
}

export type MatchCaseResult = { output: string; patternLength: number; appliedLetters: number; warning: string | null };

/** The cased pattern repeats over cased target graphemes. */
export function applyMatchCase(patternText: string, target: string): MatchCaseResult {
  const pattern = segmentGraphemes(patternText).filter(isCasedGrapheme).map((grapheme) => grapheme === grapheme.toUpperCase());
  if (!pattern.length) return { output: target, patternLength: 0, appliedLetters: 0, warning: "The case pattern contains no cased letters; the target was preserved." };
  let index = 0;
  const output = segmentGraphemes(target).map((grapheme) => {
    if (!isCasedGrapheme(grapheme)) return grapheme;
    const upper = pattern[index % pattern.length];
    index += 1;
    return upper ? grapheme.toUpperCase() : grapheme.toLowerCase();
  }).join("");
  return { output, patternLength: pattern.length, appliedLetters: index, warning: null };
}
