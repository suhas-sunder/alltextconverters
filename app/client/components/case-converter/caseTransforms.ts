export type CaseMode =
  | "UPPERCASE"
  | "Title Case"
  | "lowercase"
  | "Title Case"
  | "Sentence case"
  | "aLtErNaTiNg cAsE";

export const CASE_MODES: CaseMode[] = [
  "UPPERCASE",
  "lowercase",
  "Title Case",
  "Sentence case",
  "aLtErNaTiNg cAsE",
];

export function applyCaseTransform(input: string, mode: CaseMode): string {
  switch (mode) {
    case "UPPERCASE":
      return input.toUpperCase();
    case "lowercase":
      return input.toLowerCase();
    case "Title Case":
      return toTitleCase(input);
    case "Sentence case":
      return toSentenceCase(input);
    case "aLtErNaTiNg cAsE":
      return toAlternatingCase(input);
    default:
      return input;
  }
}

function toTitleCase(text: string): string {
  // Title-case words separated by whitespace while preserving original whitespace.
  // This avoids collapsing spacing in pasted text.
  return text.replace(/\S+/g, (token) => {
    const lower = token.toLowerCase();
    // Keep leading punctuation attached, but title-case the first letter of the word-ish part.
    // Examples: "hello," -> "Hello,"  ""quote" -> ""Quote"
    const m = lower.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9])(.*)$/);
    if (!m) return token;
    const [, prefix, first, rest] = m;
    return `${prefix}${first.toUpperCase()}${rest}`;
  });
}

function toSentenceCase(text: string): string {
  // Sentence case: lowercase everything then capitalize first non-space after a sentence boundary.
  // Boundaries: start, after . ! ? plus optional quotes/brackets and whitespace.
  const lower = text.toLowerCase();
  let out = "";
  let capNext = true;

  for (let i = 0; i < lower.length; i++) {
    const ch = lower[i];
    if (capNext && /[\p{L}\p{N}]/u.test(ch)) {
      out += ch.toUpperCase();
      capNext = false;
      continue;
    }
    out += ch;

    if (ch === "." || ch === "!" || ch === "?") {
      capNext = true;
    }
  }

  return out;
}

function toAlternatingCase(text: string): string {
  // Alternate only letters/numbers, keep punctuation and whitespace unchanged.
  let flip = true;
  let out = "";

  for (const ch of text) {
    if (/[\p{L}\p{N}]/u.test(ch)) {
      out += flip ? ch.toUpperCase() : ch.toLowerCase();
      flip = !flip;
    } else {
      out += ch;
    }
  }

  return out;
}
