export type AsciiDecodeReport = {
  parsedCount: number;
  convertedCount: number;
  skippedCount: number;
  skippedCodes: number[];
  printableMin: number;
  printableMax: number;
};

const PRINTABLE_MIN = 32;
const PRINTABLE_MAX = 126;

/**
 * Decode decimal ASCII codes to text.
 * - Input is tolerant of spaces, commas, newlines, and other separators.
 * - Only converts printable ASCII (32–126) by design.
 * - Codes outside the printable range are skipped and reported.
 */
export function decodeDecimalAscii(input: string): { output: string; report: AsciiDecodeReport } {
  const matches = input.match(/\d+/g) ?? [];
  const codes = matches
    .map((m) => Number.parseInt(m, 10))
    .filter((n) => Number.isFinite(n));

  const skipped: number[] = [];
  const chars: string[] = [];

  for (const code of codes) {
    if (code >= PRINTABLE_MIN && code <= PRINTABLE_MAX) {
      chars.push(String.fromCharCode(code));
    } else {
      skipped.push(code);
    }
  }

  return {
    output: chars.join(""),
    report: {
      parsedCount: codes.length,
      convertedCount: chars.length,
      skippedCount: skipped.length,
      skippedCodes: skipped.slice(0, 24),
      printableMin: PRINTABLE_MIN,
      printableMax: PRINTABLE_MAX,
    },
  };
}

export function formatSkippedPreview(codes: number[]): string {
  if (!codes.length) return "";
  return codes.join(", ");
}
