import { asciiControlName, parseAsciiValues } from "../../text/bytes";

export type AsciiSeparatorMode = "space" | "comma" | "custom";
export type AsciiDecodeOptions = { mode: AsciiSeparatorMode; customSeparator: string };
export type AsciiControlDetail = { group: number; value: number; name: string; escaped: string };
export type AsciiDecodeResult =
  | { ok: true; output: string; count: number; warning: string | null; controls: AsciiControlDetail[] }
  | { ok: false; output: ""; error: string; controls: [] };

export const DEFAULT_ASCII_DECODE_OPTIONS: AsciiDecodeOptions = { mode: "space", customSeparator: "|" };

function escapedControl(value: number): string {
  if (value === 9) return "\\t";
  if (value === 10) return "\\n";
  if (value === 13) return "\\r";
  return `\\x${value.toString(16).toUpperCase().padStart(2, "0")}`;
}

export function decodeDecimalAscii(input: string, partial: Partial<AsciiDecodeOptions> = {}): AsciiDecodeResult {
  const options = { ...DEFAULT_ASCII_DECODE_OPTIONS, ...partial };
  const parsed = parseAsciiValues(input, options);
  if (parsed.errors.length || !parsed.values) return { ok: false, output: "", error: parsed.errors[0] ?? "ASCII input is invalid.", controls: [] };
  const controls = parsed.values.flatMap((value, index) => {
    const name = asciiControlName(value);
    return name ? [{ group: index + 1, value, name, escaped: escapedControl(value) }] : [];
  });
  return {
    ok: true,
    output: parsed.output,
    count: parsed.values.length,
    warning: controls.length ? "Output includes ASCII control characters, which may not be visible." : null,
    controls,
  };
}

export function formatSkippedPreview(): string { return ""; }
