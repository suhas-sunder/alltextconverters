import { decodeUtf8, parseBinaryBytes } from "../../text/bytes";

export type BinaryInputMode = "continuous" | "space" | "custom";
export type DecodeOptions = { mode: BinaryInputMode; customSeparator: string };
export type DecodeResult =
  | { ok: true; outputText: string; groups: number; byteCount: number }
  | { ok: false; error: string; outputText?: undefined; groups: 0; byteCount: 0 };

export const DEFAULT_BINARY_DECODE_OPTIONS: DecodeOptions = { mode: "space", customSeparator: "|" };

export function decodeBinary(raw: string, partial: Partial<DecodeOptions> = {}): DecodeResult {
  const options = { ...DEFAULT_BINARY_DECODE_OPTIONS, ...partial };
  const parsed = parseBinaryBytes(raw, options);
  if (parsed.errors.length || !parsed.bytes) {
    return { ok: false, error: parsed.errors[0] ?? "Binary input is invalid.", groups: 0, byteCount: 0 };
  }
  const decoded = decodeUtf8(parsed.bytes);
  if (decoded.errors.length) {
    return { ok: false, error: "Invalid UTF-8 byte sequence in binary input.", groups: 0, byteCount: 0 };
  }
  return { ok: true, outputText: decoded.output, groups: parsed.bytes.length, byteCount: parsed.bytes.length };
}

export function bytesToBinaryString(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join(" ");
}
