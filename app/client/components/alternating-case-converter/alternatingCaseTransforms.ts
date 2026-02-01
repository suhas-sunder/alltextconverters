// Deterministic alternating-case conversion.
//
// Rules:
// - Only alphabetic characters are uppercased/lowercased.
// - Digits, punctuation, symbols, and line breaks are preserved.
// - Alternation advances on letters.
// - Optional: if ignoreSpaces === false, regular spaces also advance alternation.
//
// This intentionally avoids language rules or grammar logic.

const isAsciiLetter = (ch: string) => /[A-Za-z]/.test(ch);

export function toAlternatingCase(input: string, ignoreSpaces: boolean): string {
  if (!input) return "";

  let step = 0;
  let out = "";

  for (let i = 0; i < input.length; i++) {
    const ch = input[i] ?? "";

    if (isAsciiLetter(ch)) {
      const makeUpper = step % 2 === 0;
      out += makeUpper ? ch.toUpperCase() : ch.toLowerCase();
      step += 1;
      continue;
    }

    // If the user chooses to count spaces, advance the alternation step on spaces.
    if (!ignoreSpaces && ch === " ") {
      out += ch;
      step += 1;
      continue;
    }

    out += ch;
  }

  return out;
}
