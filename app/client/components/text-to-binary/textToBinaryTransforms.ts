export type BitWidth = 7 | 8;

export type TextToBinaryResult =
  | { ok: true; value: string; stats: { chars: number; bits: BitWidth } }
  | { ok: false; error: string };

/**
 * Encodes ASCII text into space-separated binary groups.
 * ASCII-only: any code point > 127 is rejected with a clear error.
 */
export function textToBinary(input: string, bits: BitWidth): TextToBinaryResult {
  const s = String(input ?? "");
  if (!s) return { ok: true, value: "", stats: { chars: 0, bits } };

  // Explicit ASCII-only behavior (no Unicode / UTF-8 bitstream here).
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code > 127) {
      return {
        ok: false,
        error:
          "This tool is ASCII-only. Your text contains at least one non-ASCII character (code point > 127). Remove or replace those characters, or use a Unicode/UTF-8 encoder instead.",
      };
    }
  }

  const out: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    const bin = code.toString(2).padStart(bits, "0");
    out.push(bin);
  }

  return { ok: true, value: out.join(" "), stats: { chars: s.length, bits } };
}
