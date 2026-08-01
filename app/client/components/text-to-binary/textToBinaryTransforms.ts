import { bytesToBinary, encodeUtf8Strict } from "../../text/bytes";

export type BinarySeparatorMode = "space" | "none" | "custom";
export type TextToBinaryOptions = { separatorMode: BinarySeparatorMode; customSeparator: string };
export type TextToBinaryResult = { ok: true; value: string; stats: { chars: number; bits: 8; bytes: number } } | { ok: false; error: string };

export const DEFAULT_TEXT_TO_BINARY_OPTIONS: TextToBinaryOptions = { separatorMode: "space", customSeparator: "|" };

export function textToBinary(input: string, partial: Partial<TextToBinaryOptions> = {}): TextToBinaryResult {
  const options = { ...DEFAULT_TEXT_TO_BINARY_OPTIONS, ...partial };
  if (options.separatorMode === "custom" && !options.customSeparator) return { ok: false, error: "Enter a non-empty custom separator." };
  const encoded = encodeUtf8Strict(input);
  if (encoded.errors.length || !encoded.bytes) return { ok: false, error: encoded.errors[0] ?? "UTF-8 encoding failed." };
  const separator = options.separatorMode === "none" ? "" : options.separatorMode === "custom" ? options.customSeparator : " ";
  return { ok: true, value: bytesToBinary(encoded.bytes, separator), stats: { chars: Array.from(input).length, bits: 8, bytes: encoded.bytes.length } };
}
