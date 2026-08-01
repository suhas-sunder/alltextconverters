import { bytesToHex, encodeUtf8Strict } from "../../text/bytes";

export type HexSeparatorMode = "space" | "none" | "comma" | "custom";
export type TextToHexOptions = { uppercase: boolean; separatorMode: HexSeparatorMode; customSeparator: string; prefix0x: boolean };
export type HexConversionResult = { ok: true; hex: string; byteCount: number } | { ok: false; error: string };

export const DEFAULT_TEXT_TO_HEX_OPTIONS: TextToHexOptions = {
  uppercase: false, separatorMode: "space", customSeparator: "-", prefix0x: false,
};

export function hexSeparator(options: TextToHexOptions): string {
  if (options.separatorMode === "none") return "";
  if (options.separatorMode === "comma") return ",";
  if (options.separatorMode === "custom") return options.customSeparator;
  return " ";
}

export function convertTextToHex(text: string, partial: Partial<TextToHexOptions> = {}): HexConversionResult {
  const options = { ...DEFAULT_TEXT_TO_HEX_OPTIONS, ...partial };
  if (options.separatorMode === "custom" && !options.customSeparator) return { ok: false, error: "Enter a non-empty custom separator." };
  const encoded = encodeUtf8Strict(text);
  if (encoded.errors.length || !encoded.bytes) return { ok: false, error: encoded.errors[0] ?? "UTF-8 encoding failed." };
  return {
    ok: true,
    hex: bytesToHex(encoded.bytes, { uppercase: options.uppercase, separator: hexSeparator(options), prefix: options.prefix0x }),
    byteCount: encoded.bytes.length,
  };
}
