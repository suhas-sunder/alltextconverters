export type BitWidth = 7 | 8;

export type DecodeEncoding = "utf-8" | "iso-8859-1" | "windows-1252";
export type OutputKind = "text" | "decimal" | "hex" | "octal";

export type DecodeOptions = {
  bitMode: "auto" | BitWidth;
  output: OutputKind;
  encoding: DecodeEncoding;
  delimiter: string; // used between numeric values, and optionally between characters if provided
  insertDelimiterBetweenChars: boolean;
};

export type DecodeResult = {
  ok: boolean;
  error?: string;
  chosenWidth?: BitWidth;
  cleanedBits?: string; // only 0/1
  originalLength: number;
  cleanedLength: number;
  groups: number;
  droppedNonBits: number;
  droppedTrailingBits: number;
  printableScore7?: number;
  printableScore8?: number;
  outputText?: string;
};

/** Keep only 0 and 1. Also track how many chars were dropped. */
export function cleanBinaryInput(raw: string): {
  bits: string;
  dropped: number;
  originalLength: number;
} {
  const originalLength = raw.length;
  let dropped = 0;
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "0" || ch === "1") out += ch;
    else dropped++;
  }
  return { bits: out, dropped, originalLength };
}

function scorePrintableAscii(bytes: number[]): number {
  // Score bytes that map to printable ASCII plus common whitespace.
  // Printable ASCII: 32..126; allow \n (10), \r (13), \t (9)
  let score = 0;
  for (const b of bytes) {
    if (b >= 32 && b <= 126) score += 2;
    else if (b === 9 || b === 10 || b === 13) score += 1;
    else score -= 2;
  }
  return score;
}

function bitsToNumbers(bits: string, width: BitWidth): { nums: number[]; droppedTrailing: number } {
  const usable = bits.length - (bits.length % width);
  const droppedTrailing = bits.length - usable;
  const nums: number[] = [];
  for (let i = 0; i < usable; i += width) {
    const chunk = bits.slice(i, i + width);
    nums.push(parseInt(chunk, 2));
  }
  return { nums, droppedTrailing };
}

function autoDetectWidth(bits: string): { chosen: BitWidth; score7: number; score8: number } {
  const can7 = bits.length >= 7 && bits.length % 7 === 0;
  const can8 = bits.length >= 8 && bits.length % 8 === 0;

  // If only one fits perfectly, pick it.
  if (can7 && !can8) {
    const nums7 = bitsToNumbers(bits, 7).nums;
    return { chosen: 7, score7: scorePrintableAscii(nums7), score8: -Infinity };
  }
  if (can8 && !can7) {
    const nums8 = bitsToNumbers(bits, 8).nums;
    return { chosen: 8, score7: -Infinity, score8: scorePrintableAscii(nums8) };
  }

  // If both fit (or neither), score both with truncation and pick best score.
  const nums7 = bitsToNumbers(bits, 7).nums;
  const nums8 = bitsToNumbers(bits, 8).nums;
  const score7 = scorePrintableAscii(nums7);
  const score8 = scorePrintableAscii(nums8);

  // Tie-break: prefer 8-bit because binary files and bytes are overwhelmingly 8-bit.
  if (score8 >= score7) return { chosen: 8, score7, score8 };
  return { chosen: 7, score7, score8 };
}

function decodeBytesToString(bytes: number[], encoding: DecodeEncoding): string {
  // For 7-bit, bytes are 0..127 which is valid ASCII subset.
  // For 8-bit, bytes are 0..255. TextDecoder helps interpret multi-byte encodings (utf-8) or single-byte (latin1).
  try {
    const u8 = new Uint8Array(bytes);
    // Some browsers do not support windows-1252; guard and fall back.
    // eslint-disable-next-line no-new
    const dec = new TextDecoder(encoding, { fatal: false });
    return dec.decode(u8);
  } catch {
    // Safe fallback: map each byte to a code point directly.
    return bytes.map((b) => String.fromCharCode(b)).join("");
  }
}

function formatNumbers(nums: number[], kind: OutputKind, delimiter: string): string {
  const sep = delimiter ?? "";
  switch (kind) {
    case "decimal":
      return nums.map((n) => String(n)).join(sep);
    case "hex":
      return nums.map((n) => n.toString(16).toUpperCase().padStart(2, "0")).join(sep);
    case "octal":
      return nums.map((n) => n.toString(8)).join(sep);
    case "text":
    default:
      return nums.map((n) => String(n)).join(sep);
  }
}

export function decodeBinary(raw: string, options: DecodeOptions): DecodeResult {
  const cleaned = cleanBinaryInput(raw);
  const bits = cleaned.bits;

  if (!bits) {
    return {
      ok: false,
      error: "Paste binary containing at least one 0 or 1.",
      originalLength: cleaned.originalLength,
      cleanedLength: 0,
      groups: 0,
      droppedNonBits: cleaned.dropped,
      droppedTrailingBits: 0,
      cleanedBits: "",
    };
  }

  const detect = autoDetectWidth(bits);
  const width: BitWidth = options.bitMode === "auto" ? detect.chosen : options.bitMode;

  const { nums, droppedTrailing } = bitsToNumbers(bits, width);
  if (!nums.length) {
    return {
      ok: false,
      error: "Not enough bits to form a full character. Add more binary digits or switch 7-bit/8-bit mode.",
      originalLength: cleaned.originalLength,
      cleanedLength: bits.length,
      groups: 0,
      droppedNonBits: cleaned.dropped,
      droppedTrailingBits: droppedTrailing,
      cleanedBits: bits,
      chosenWidth: width,
      printableScore7: detect.score7,
      printableScore8: detect.score8,
    };
  }

  let output = "";
  if (options.output === "text") {
    const decoded = decodeBytesToString(nums, options.encoding);
    if (options.insertDelimiterBetweenChars && options.delimiter) {
      output = Array.from(decoded).join(options.delimiter);
    } else {
      output = decoded;
    }
  } else {
    // Numeric outputs use delimiter as a separator between values.
    const sep = options.delimiter || " ";
    output = formatNumbers(nums, options.output, sep);
  }

  return {
    ok: true,
    chosenWidth: width,
    cleanedBits: bits,
    originalLength: cleaned.originalLength,
    cleanedLength: bits.length,
    groups: nums.length,
    droppedNonBits: cleaned.dropped,
    droppedTrailingBits: droppedTrailing,
    printableScore7: detect.score7,
    printableScore8: detect.score8,
    outputText: output,
  };
}

export function bytesToBinaryString(bytes: Uint8Array): string {
  const parts: string[] = [];
  for (const b of bytes) parts.push(b.toString(2).padStart(8, "0"));
  return parts.join(" ");
}
