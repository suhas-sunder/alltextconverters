export type ByteResult = {
  output: string;
  warnings: string[];
  errors: string[];
  bytes?: Uint8Array;
};

export type ByteSeparatorMode = "continuous" | "space" | "comma" | "custom";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

export function findLoneSurrogate(text: string): number {
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return index;
      index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      return index;
    }
  }
  return -1;
}

export const utf8Bytes = (text: string) => encoder.encode(String(text ?? ""));

export function encodeUtf8Strict(text: string): ByteResult {
  const value = String(text ?? "");
  const position = findLoneSurrogate(value);
  if (position >= 0) {
    return {
      output: "",
      warnings: [],
      errors: [`Input contains an unpaired UTF-16 surrogate at position ${position + 1}.`],
    };
  }
  return { output: "", warnings: [], errors: [], bytes: utf8Bytes(value) };
}

export function decodeUtf8(bytes: Uint8Array): ByteResult {
  try {
    return { output: decoder.decode(bytes), warnings: [], errors: [], bytes };
  } catch {
    return {
      output: "",
      warnings: [],
      errors: ["The decoded bytes are not valid UTF-8."],
      bytes,
    };
  }
}

export function bytesToBase64(bytes: Uint8Array, urlSafe = false, padding = true): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  let output = btoa(binary);
  if (urlSafe) output = output.replace(/\+/g, "-").replace(/\//g, "_");
  return padding ? output : output.replace(/=+$/g, "");
}

export function base64ToBytes(input: string, urlSafe = true): ByteResult {
  let value = String(input ?? "").replace(/\s/g, "");
  if (urlSafe) value = value.replace(/-/g, "+").replace(/_/g, "/");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    return { output: "", warnings: [], errors: ["Base64 contains a character outside the Base64 alphabet."] };
  }
  if (value.length % 4 === 1) {
    return { output: "", warnings: [], errors: ["Base64 length is invalid."] };
  }
  value += "=".repeat((4 - (value.length % 4)) % 4);
  try {
    const binary = atob(value);
    return {
      output: "",
      warnings: [],
      errors: [],
      bytes: Uint8Array.from(binary, (character) => character.charCodeAt(0)),
    };
  } catch {
    return { output: "", warnings: [], errors: ["Base64 input is malformed."] };
  }
}

export function bytesToHex(
  bytes: Uint8Array,
  options: { uppercase?: boolean; separator?: string; prefix?: boolean } = {},
): string {
  const separator = options.separator ?? " ";
  return Array.from(bytes, (byte) => {
    const rawDigits = byte.toString(16).padStart(2, "0");
    const digits = options.uppercase ? rawDigits.toUpperCase() : rawDigits;
    return `${options.prefix ? "0x" : ""}${digits}`;
  }).join(separator);
}

function error(message: string): ByteResult {
  return { output: "", warnings: [], errors: [message] };
}

function splitSeparatedInput(input: string, mode: Exclude<ByteSeparatorMode, "continuous">, customSeparator = "") {
  const trimmed = input.trim();
  if (mode === "space") return { tokens: trimmed.split(/\s+/), error: null };
  const separator = mode === "comma" ? "," : customSeparator;
  if (!separator) return { tokens: [], error: "Enter a non-empty custom separator." };
  const tokens = trimmed.split(separator).map((token) => token.trim());
  const emptyIndex = tokens.findIndex((token) => token.length === 0);
  if (emptyIndex >= 0) {
    return { tokens: [], error: `Empty value at group ${emptyIndex + 1}. Check the separator.` };
  }
  return { tokens, error: null };
}

export function parseHexBytes(
  input: string,
  options: { mode: ByteSeparatorMode; allowPrefix?: boolean; customSeparator?: string },
): ByteResult {
  const source = String(input ?? "");
  if (!source.trim()) return error("Paste hexadecimal bytes to decode.");
  const allowPrefix = options.allowPrefix ?? false;

  if (options.mode === "continuous") {
    let value = source.trim();
    if (/^0x/i.test(value)) {
      if (!allowPrefix) return error("0x prefixes are disabled for this input.");
      value = value.slice(2);
    }
    const invalid = value.search(/[^0-9a-f]/i);
    if (invalid >= 0) return error(`Invalid hexadecimal character at position ${invalid + 1}.`);
    if (value.length % 2 !== 0) return error("Hex input has an odd number of digits; each byte needs two digits.");
    return { output: "", warnings: [], errors: [], bytes: Uint8Array.from(value.match(/../g) ?? [], (pair) => Number.parseInt(pair, 16)) };
  }

  const split = splitSeparatedInput(source, options.mode, options.customSeparator);
  if (split.error) return error(split.error);
  const values: number[] = [];
  for (let index = 0; index < split.tokens.length; index += 1) {
    let token = split.tokens[index];
    const hasPrefix = /^0x/i.test(token);
    if (hasPrefix && !allowPrefix) return error(`0x prefix is not allowed in group ${index + 1}.`);
    if (hasPrefix) token = token.slice(2);
    if (/^0x/i.test(token) || token.length === 0) return error(`Malformed 0x prefix in group ${index + 1}.`);
    if (token.length !== 2) return error(`Hex group ${index + 1} must contain exactly two digits.`);
    const invalid = token.search(/[^0-9a-f]/i);
    if (invalid >= 0) return error(`Invalid hexadecimal character in group ${index + 1} at digit ${invalid + 1}.`);
    values.push(Number.parseInt(token, 16));
  }
  return { output: "", warnings: [], errors: [], bytes: Uint8Array.from(values) };
}

export function hexToBytes(input: string): ByteResult {
  const mode: ByteSeparatorMode = input.includes(",") ? "comma" : /\s/.test(input.trim()) ? "space" : "continuous";
  return parseHexBytes(input, { mode, allowPrefix: true });
}

export function bytesToBinary(bytes: Uint8Array, separator = " "): string {
  return Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join(separator);
}

export function parseBinaryBytes(
  input: string,
  options: { mode: Exclude<ByteSeparatorMode, "comma">; customSeparator?: string },
): ByteResult {
  const source = String(input ?? "");
  if (!source.trim()) return error("Paste binary bytes to decode.");
  if (options.mode === "continuous") {
    const value = source.trim();
    const invalid = value.search(/[^01]/);
    if (invalid >= 0) return error(`Invalid binary character at position ${invalid + 1}; use only 0 and 1.`);
    if (value.length % 8 !== 0) return error(`Binary input contains ${value.length} bits. Complete bytes require a multiple of 8.`);
    return { output: "", warnings: [], errors: [], bytes: Uint8Array.from(value.match(/.{8}/g) ?? [], (bits) => Number.parseInt(bits, 2)) };
  }

  const split = splitSeparatedInput(source, options.mode, options.customSeparator);
  if (split.error) return error(split.error);
  const values: number[] = [];
  for (let index = 0; index < split.tokens.length; index += 1) {
    const token = split.tokens[index];
    const invalid = token.search(/[^01]/);
    if (invalid >= 0) return error(`Invalid binary character in group ${index + 1} at digit ${invalid + 1}.`);
    if (token.length !== 8) return error(`Binary group ${index + 1} has ${token.length} bits; each group must have exactly 8.`);
    values.push(Number.parseInt(token, 2));
  }
  return { output: "", warnings: [], errors: [], bytes: Uint8Array.from(values) };
}

export function binaryToBytes(input: string): ByteResult {
  return parseBinaryBytes(input, { mode: /\s/.test(input.trim()) ? "space" : "continuous" });
}

export function textToAscii(input: string, separator = " "): ByteResult {
  const values: number[] = [];
  let position = 0;
  for (const character of String(input ?? "")) {
    const value = character.codePointAt(0)!;
    if (value > 127) {
      return error(`“${character}” at character ${position + 1} is outside the ASCII range (0–127). Use Text to Hex for UTF-8 bytes.`);
    }
    values.push(value);
    position += 1;
  }
  return { output: values.join(separator), warnings: [], errors: [] };
}

export function parseAsciiValues(
  input: string,
  options: { mode: "space" | "comma" | "custom"; customSeparator?: string },
): ByteResult & { values?: number[] } {
  const source = String(input ?? "");
  if (!source.trim()) return error("Paste decimal ASCII values to decode.");
  const split = splitSeparatedInput(source, options.mode, options.customSeparator);
  if (split.error) return error(split.error);
  const values: number[] = [];
  for (let index = 0; index < split.tokens.length; index += 1) {
    const token = split.tokens[index];
    if (!/^\d+$/.test(token)) return error(`“${token}” in group ${index + 1} is not a decimal integer.`);
    const value = Number(token);
    if (!Number.isSafeInteger(value) || value < 0 || value > 127) {
      return error(`ASCII value ${token} in group ${index + 1} is outside 0 through 127.`);
    }
    values.push(value);
  }
  const output = String.fromCharCode(...values);
  return {
    output,
    values,
    warnings: values.some((value) => value <= 31 || value === 127)
      ? ["Output includes ASCII control characters, which may not be visible."]
      : [],
    errors: [],
  };
}

export function asciiToText(input: string): ByteResult {
  return parseAsciiValues(input, { mode: input.includes(",") ? "comma" : "space" });
}

const ASCII_CONTROL_NAMES = [
  "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL",
  "BS", "TAB", "LF", "VT", "FF", "CR", "SO", "SI",
  "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB",
  "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US",
] as const;

export function asciiControlName(value: number): string | null {
  if (value === 127) return "DEL";
  return value >= 0 && value <= 31 ? ASCII_CONTROL_NAMES[value] : null;
}
