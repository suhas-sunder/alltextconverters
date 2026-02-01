export type DecodeOk = {
  ok: true;
  text: string;
  warnings: string[];
};

export type DecodeErr = {
  ok: false;
  error: string;
};

export type DecodeResult = DecodeOk | DecodeErr;

function isHexChar(c: string) {
  const code = c.charCodeAt(0);
  const isNum = code >= 48 && code <= 57;
  const isUpper = code >= 65 && code <= 70;
  const isLower = code >= 97 && code <= 102;
  return isNum || isUpper || isLower;
}

export function decodeHexToAscii(raw: string): DecodeResult {
  const input = String(raw ?? "");
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, text: "", warnings: [] };

  // Space tolerant: drop all whitespace. Also tolerate a leading 0x.
  let cleaned = trimmed.replace(/^0x/i, "");
  cleaned = cleaned.replace(/\s+/g, "");

  if (!cleaned) return { ok: true, text: "", warnings: [] };

  // Validate hex characters.
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i] ?? "";
    if (!isHexChar(ch)) {
      return {
        ok: false,
        error:
          "Invalid hex input. Only 0-9 and A-F are allowed (spaces/newlines are OK).",
      };
    }
  }

  if (cleaned.length % 2 !== 0) {
    return {
      ok: false,
      error:
        "Hex bytes must come in pairs (2 characters per byte). Your input has an odd number of hex characters.",
    };
  }

  const warnings: string[] = [];

  let output = "";
  let nonAsciiCount = 0;
  let controlCount = 0;

  for (let i = 0; i < cleaned.length; i += 2) {
    const pair = cleaned.slice(i, i + 2);
    const byte = parseInt(pair, 16);

    if (Number.isNaN(byte)) {
      return {
        ok: false,
        error:
          "Could not parse one of the byte pairs. Double-check your hex formatting.",
      };
    }

    if (byte > 127) {
      nonAsciiCount++;
      // ASCII-only output requirement: replace with a safe placeholder.
      output += "�";
      continue;
    }

    // Keep common whitespace readable.
    if (byte === 9) {
      output += "\t";
      continue;
    }
    if (byte === 10) {
      output += "\n";
      continue;
    }
    if (byte === 13) {
      output += "\r";
      continue;
    }

    if (byte < 32 || byte === 127) {
      controlCount++;
      // Preserve as-is; it may not render visibly, but it's still the correct byte.
      output += String.fromCharCode(byte);
      continue;
    }

    output += String.fromCharCode(byte);
  }

  if (nonAsciiCount) {
    warnings.push(
      `${nonAsciiCount} byte(s) were outside ASCII (0–127) and were replaced with a placeholder character.`,
    );
  }
  if (controlCount) {
    warnings.push(
      `${controlCount} control byte(s) were decoded. They may not display visibly in the preview.`,
    );
  }

  return { ok: true, text: output, warnings };
}
