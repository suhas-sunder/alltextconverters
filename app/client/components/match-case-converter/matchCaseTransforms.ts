export type MatchCaseOptions = {
  // If true, we treat only A–Z letters as case-bearing and ignore punctuation/digits
  // in the reference pattern.
  referenceLettersOnly?: boolean;
};

type CaseBit = 0 | 1;

function isAsciiLetter(ch: string) {
  const c = ch.charCodeAt(0);
  return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}

function isUpperAsciiLetter(ch: string) {
  const c = ch.charCodeAt(0);
  return c >= 65 && c <= 90;
}

function toUpperAscii(ch: string) {
  const c = ch.charCodeAt(0);
  if (c >= 97 && c <= 122) return String.fromCharCode(c - 32);
  return ch;
}

function toLowerAscii(ch: string) {
  const c = ch.charCodeAt(0);
  if (c >= 65 && c <= 90) return String.fromCharCode(c + 32);
  return ch;
}

export function buildCasePattern(reference: string, opts?: MatchCaseOptions) {
  const lettersOnly = opts?.referenceLettersOnly ?? true;
  const bits: CaseBit[] = [];
  for (let i = 0; i < reference.length; i++) {
    const ch = reference[i] ?? "";
    if (lettersOnly && !isAsciiLetter(ch)) continue;
    if (!isAsciiLetter(ch)) continue;
    bits.push(isUpperAsciiLetter(ch) ? 1 : 0);
  }
  return bits;
}

export function applyMatchCase(reference: string, target: string, opts?: MatchCaseOptions) {
  const pattern = buildCasePattern(reference, opts);
  if (pattern.length === 0) {
    return {
      output: target,
      patternLength: 0,
      appliedLetters: 0,
      warning: "Reference text contains no A–Z letters to infer a case pattern.",
    };
  }

  let out = "";
  let p = 0;
  let applied = 0;

  for (let i = 0; i < target.length; i++) {
    const ch = target[i] ?? "";
    if (!isAsciiLetter(ch)) {
      out += ch;
      continue;
    }

    const bit = pattern[p % pattern.length] ?? 0;
    out += bit ? toUpperAscii(ch) : toLowerAscii(ch);
    p++;
    applied++;
  }

  return {
    output: out,
    patternLength: pattern.length,
    appliedLetters: applied,
    warning: null as string | null,
  };
}
