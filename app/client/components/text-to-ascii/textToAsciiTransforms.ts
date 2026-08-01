import { textToAscii as strictAscii } from "../../text/bytes";

export type AsciiDelimiter = "space" | "comma" | "custom";
export type TextToAsciiOptions = { delimiter: AsciiDelimiter; customSeparator?: string };
export type TextToAsciiResult = { ok: true; output: string; characterCount: number } | { ok: false; output: ""; error: string };

export const DEFAULT_TEXT_TO_ASCII_OPTIONS: TextToAsciiOptions = { delimiter: "space", customSeparator: "|" };

export function textToAscii(input: string, partial: Partial<TextToAsciiOptions> = {}): TextToAsciiResult {
  const options = { ...DEFAULT_TEXT_TO_ASCII_OPTIONS, ...partial };
  if (options.delimiter === "custom" && !options.customSeparator) return { ok: false, output: "", error: "Enter a non-empty custom separator." };
  const separator = options.delimiter === "comma" ? "," : options.delimiter === "custom" ? options.customSeparator! : " ";
  const result = strictAscii(input, separator);
  if (result.errors.length) return { ok: false, output: "", error: result.errors[0] };
  return { ok: true, output: result.output, characterCount: Array.from(input).length };
}

export function summarizeSkipped() { return [] as [string, number][]; }
