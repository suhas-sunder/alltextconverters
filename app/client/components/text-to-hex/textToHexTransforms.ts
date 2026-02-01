export type TextEncoding = "ascii" | "utf8" | "latin1";

export type HexFormatOptions = {
  uppercase: boolean;
  delimiter: "" | " " | "\n" | ", ";
  prefix0x: boolean;
};

export type TextToHexOptions = {
  encoding: TextEncoding;
  format: HexFormatOptions;
};

export type HexConversionResult = {
  hex: string;
  byteCount: number;
  encodingUsed: TextEncoding;
};

function toHexByte(b: number, uppercase: boolean) {
  const s = b.toString(16).padStart(2, "0");
  return uppercase ? s.toUpperCase() : s.toLowerCase();
}

function encodeAsciiStrict(text: string): Uint8Array {
  // ASCII only, explicit and strict.
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0x7f) {
      throw new Error(
        "This tool is configured for ASCII, but your input contains non-ASCII characters. Switch encoding to UTF-8 or Latin-1, or remove non-ASCII characters.",
      );
    }
    bytes.push(code);
  }
  return new Uint8Array(bytes);
}

function encodeLatin1(text: string): Uint8Array {
  // ISO-8859-1 style: map codepoints 0..255 directly, error otherwise.
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0xff) {
      throw new Error(
        "Latin-1 encoding supports only code points 0 to 255. Your input includes characters outside that range. Use UTF-8 instead.",
      );
    }
    bytes.push(code);
  }
  return new Uint8Array(bytes);
}

function encodeUtf8(text: string): Uint8Array {
  // Unicode-safe encoding via browser API
  return new TextEncoder().encode(text);
}

export function encodeTextToBytes(text: string, encoding: TextEncoding): Uint8Array {
  switch (encoding) {
    case "ascii":
      return encodeAsciiStrict(text);
    case "latin1":
      return encodeLatin1(text);
    case "utf8":
    default:
      return encodeUtf8(text);
  }
}

export function bytesToHex(bytes: Uint8Array, format: HexFormatOptions): string {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const hx = toHexByte(bytes[i], format.uppercase);
    parts.push(format.prefix0x ? `0x${hx}` : hx);
  }
  const delim = format.delimiter === "\n" ? "\n" : format.delimiter;
  return parts.join(delim);
}

export function convertTextToHex(
  text: string,
  opts: TextToHexOptions,
): HexConversionResult {
  const bytes = encodeTextToBytes(text, opts.encoding);
  const hex = bytesToHex(bytes, opts.format);
  return { hex, byteCount: bytes.length, encodingUsed: opts.encoding };
}

export function bytesFromBinFile(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer);
}
