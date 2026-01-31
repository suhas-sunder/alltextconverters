export function toTitleCaseSimple(input: string): string {
  // Deterministic, no grammar logic.
  // Rules:
  // - A "word" starts after whitespace or common punctuation.
  // - Apostrophes and hyphens are treated as inside a word (so "don't" -> "Don't", "re-entry" -> "Re-entry").
  // - For each word, the first letter becomes uppercase and the remaining letters become lowercase.
  // - Non-letters are preserved.
  let out = "";
  let inWord = false;
  let firstLetterDone = false;

  const isLetter = (ch: string) => /[A-Za-z]/.test(ch);
  const isDigit = (ch: string) => /[0-9]/.test(ch);
  const isWhitespace = (ch: string) => /\s/.test(ch);

  // Punctuation that keeps you inside the same word.
  const isInnerPunct = (ch: string) => ch === "'" || ch === "’" || ch === "-";

  for (let i = 0; i < input.length; i++) {
    const ch = input[i] ?? "";

    if (!inWord) {
      if (isWhitespace(ch)) {
        out += ch;
        continue;
      }

      // Start a new word on the first non-whitespace char.
      inWord = true;
      firstLetterDone = false;
    }

    if (isWhitespace(ch)) {
      // Word boundary
      out += ch;
      inWord = false;
      firstLetterDone = false;
      continue;
    }

    if (isInnerPunct(ch)) {
      out += ch;
      // Stay in the same word, do not reset firstLetterDone
      continue;
    }

    if (isLetter(ch)) {
      if (!firstLetterDone) {
        out += ch.toUpperCase();
        firstLetterDone = true;
      } else {
        out += ch.toLowerCase();
      }
      continue;
    }

    if (isDigit(ch)) {
      // Digits are part of the word. If a word starts with digits, the first letter later still gets uppercased.
      out += ch;
      continue;
    }

    // Other punctuation ends the current word.
    out += ch;
    inWord = false;
    firstLetterDone = false;
  }

  return out;
}
