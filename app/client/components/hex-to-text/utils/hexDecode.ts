export type HexDecodeResult = {
  text: string;
  warnings: string[];
};

type NormalizeResult =
  | { ok: true; normalized: string }
  | { ok: false; error: string };

function normalizeHex(raw: string): NormalizeResult {
  const src = String(raw ?? "");

  if (!src.trim()) {
    return { ok: false, error: "Paste hex to decode." };
  }

  // Allow: hex digits, whitespace, separators, and optional 0x/0X prefixes.
  // Reject everything else so users get a clear error instead of silent corruption.
  const allowed = /^[0-9a-fA-FxX\s,;:_\-]+$/;
  if (!allowed.test(src)) {
    return {
      ok: false,
      error:
        "Invalid characters found. Use only hex digits (0-9, a-f) plus spaces or separators.",
    };
  }

  // Remove common prefixes like 0x, then strip separators and whitespace.
  // Keep only hex digits for decoding.
  const withoutPrefix = src.replace(/0x/gi, "");
  const hexOnly = withoutPrefix.replace(/[^0-9a-fA-F]/g, "");

  if (!hexOnly) {
    return { ok: false, error: "No hex digits found." };
  }

  if (hexOnly.length % 2 !== 0) {
    return {
      ok: false,
      error:
        "Hex length must be even (two hex digits per byte). Add a leading 0 if needed.",
    };
  }

  return { ok: true, normalized: hexOnly.toLowerCase() };
}

function bytesFromHex(normalized: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < normalized.length; i += 2) {
    const pair = normalized.slice(i, i + 2);
    const value = Number.parseInt(pair, 16);
    bytes.push(value);
  }
  return bytes;
}

// ASCII-focused decode:
// - Preserves tab/newline/CR
// - Replaces other control bytes and non-ASCII bytes with U+FFFD
export function decodeHexToAscii(raw: string): HexDecodeResult {
  const norm = normalizeHex(raw);
  if (!norm.ok) {
    throw new Error(norm.error);
  }

  const bytes = bytesFromHex(norm.normalized);
  const warnings: string[] = [];

  let hadNonAscii = false;
  let hadControls = false;

  const outChars = bytes.map((b) => {
    if (b === 9 || b === 10 || b === 13) return String.fromCharCode(b); // \t, \n, \r
    if (b < 32) {
      hadControls = true;
      return "�";
    }
    if (b > 127) {
      hadNonAscii = true;
      return "�";
    }
    return String.fromCharCode(b);
  });

  if (hadControls) {
    warnings.push(
      "Some control bytes were replaced with �. (Only tab/newline are preserved.)",
    );
  }
  if (hadNonAscii) {
    warnings.push("Some non-ASCII bytes were replaced with �.");
  }

  return { text: outChars.join(""), warnings };
}
