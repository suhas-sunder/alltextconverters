export function toSentenceCase(input: string): string {
  // Deterministic, lightweight rules:
  // 1) Lowercase everything.
  // 2) Capitalize the first letter of the text, and the first letter after . ! ?
  // No grammar, no language parsing, no acronym preservation logic.
  const s = String(input ?? "").toLowerCase();
  if (!s) return "";

  let out = "";
  let capNext = true;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i] ?? "";

    // If we're waiting to capitalize and we hit a letter, capitalize that letter once.
    if (capNext && /\p{L}/u.test(ch)) {
      out += ch.toUpperCase();
      capNext = false;
      continue;
    }

    out += ch;

    // After sentence-ending punctuation, set capNext for the next letter.
    // We keep capNext true across whitespace/quotes until we meet a letter.
    if (ch === "." || ch === "!" || ch === "?") {
      capNext = true;
    }
  }

  return out;
}
