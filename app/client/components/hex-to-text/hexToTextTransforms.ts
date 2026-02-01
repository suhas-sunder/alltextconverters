export type HexDecodeResult =
  | { ok: true; text: string; bytes: number; warnings: string[] }
  | { ok: false; error: string };

const HEX_ONLY_RE = /^[0-9a-fA-F]+$/;

function stripAllowedDecorators(raw: string): string {
  // Allow common prefixes and separators users paste from logs or debuggers:
  // 0x41 0x42, \x41\x42, AA:BB:CC, AA-BB-CC, underscores, commas, whitespace.
  let s = raw ?? "";
  s = s.replace(/\\x/gi, ""); // \x41
  s = s.replace(/0x/gi, "");   // 0x41
  s = s.replace(/[\s,;:_\-]+/g, ""); // separators
  return s;
}

export function decodeHexToAscii(raw: string): HexDecodeResult {
  const cleaned = stripAllowedDecorators(raw);

  if (!cleaned) {
    return { ok: false, error: "Paste some hexadecimal bytes to decode." };
  }

  if (!HEX_ONLY_RE.test(cleaned)) {
    return {
      ok: false,
      error:
        "Invalid hex: only 0–9 and A–F are allowed (plus spaces/commas/0x/\\x separators).",
    };
  }

  if (cleaned.length % 2 !== 0) {
    return {
      ok: false,
      error:
        "Invalid hex length: expected an even number of hex characters (full bytes).",
    };
  }

  const warnings: string[] = [];
  const out: string[] = [];

  for (let i = 0; i < cleaned.length; i += 2) {
    const byteStr = cleaned.slice(i, i + 2);
    const byte = Number.parseInt(byteStr, 16);

    if (!Number.isFinite(byte) || Number.isNaN(byte)) {
      return { ok: false, error: "Invalid hex: could not parse a byte." };
    }

    // ASCII is 0..127. If you need extended encodings, use a dedicated tool.
    if (byte > 0x7f) {
      return {
        ok: false,
        error:
          `Non-ASCII byte detected: 0x${byteStr.toUpperCase()} (decimal ${byte}). ` +
          "This page intentionally outputs ASCII only.",
      };
    }

    // Control characters: keep common whitespace; replace others with a visible escape.
    if (byte === 0x0a) out.push("\n");
    else if (byte === 0x0d) out.push("\r");
    else if (byte === 0x09) out.push("\t");
    else if (byte < 0x20) {
      out.push(`\\x${byteStr.toLowerCase()}`);
      warnings.push(
        "Some bytes are ASCII control characters. They are shown as escapes like \\x1b.",
      );
    } else if (byte === 0x7f) {
      out.push("\\x7f");
      warnings.push(
        "DEL (0x7F) is not printable ASCII. It is shown as an escape.",
      );
    } else {
      out.push(String.fromCharCode(byte));
    }
  }

  // If we inserted \n or \r escapes, explain what that means.
  if (out.includes("\n") || out.includes("\r") || out.includes("\t")) {
    warnings.push(
      "Line breaks and tabs are represented as visible escapes (\n, \r, \t) so the output stays copy-safe.",
    );
  }

  // De-dupe warnings while preserving order.
  const dedupedWarnings = Array.from(new Set(warnings));

  return { ok: true, text: out.join(""), bytes: cleaned.length / 2, warnings: dedupedWarnings };
}
