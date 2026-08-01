import { decodeUtf8, parseHexBytes, type ByteSeparatorMode } from "../../../text/bytes";

export type HexInputMode = ByteSeparatorMode;
export type HexDecodeOptions = { mode: HexInputMode; allowPrefix: boolean; customSeparator: string };
export type HexDecodeResult = { ok: true; text: string; byteCount: number } | { ok: false; error: string };

export const DEFAULT_HEX_DECODE_OPTIONS: HexDecodeOptions = { mode: "space", allowPrefix: false, customSeparator: "-" };

export function decodeHexToText(raw: string, partial: Partial<HexDecodeOptions> = {}): HexDecodeResult {
  const options = { ...DEFAULT_HEX_DECODE_OPTIONS, ...partial };
  const parsed = parseHexBytes(raw, options);
  if (parsed.errors.length || !parsed.bytes) return { ok: false, error: parsed.errors[0] ?? "Hex input is invalid." };
  const decoded = decodeUtf8(parsed.bytes);
  if (decoded.errors.length) return { ok: false, error: "Invalid UTF-8 byte sequence in hexadecimal input." };
  return { ok: true, text: decoded.output, byteCount: parsed.bytes.length };
}

export function decodeHexToAscii(raw: string): { text: string; warnings: string[] } {
  const result = decodeHexToText(raw, { mode: /\s/.test(raw.trim()) ? "space" : "continuous", allowPrefix: true });
  if (!result.ok) throw new Error(result.error);
  return { text: result.text, warnings: [] };
}
