export type Base64DecodeResult =
  | { ok: true; value: string; warnings?: string[] }
  | { ok: false; error: string };

function normalizeBase64(input: string) {
  // Allow users to paste multi-line base64 and data URLs.
  let s = (input || "").trim();

  // If it's a data URL, keep only the payload after the first comma.
  const commaIdx = s.indexOf(",");
  if (s.startsWith("data:") && commaIdx !== -1) {
    s = s.slice(commaIdx + 1).trim();
  }

  // Remove whitespace (spaces, newlines, tabs).
  s = s.replace(/[\s\r\n\t]+/g, "");

  // Convert URL-safe base64 to standard base64.
  s = s.replace(/-/g, "+").replace(/_/g, "/");

  // Pad to a multiple of 4.
  const mod = s.length % 4;
  if (mod === 2) s += "==";
  else if (mod === 3) s += "=";
  else if (mod === 1) {
    // This is never valid base64 length.
    // Leave as-is so the decoder throws and we can show a helpful message.
  }

  return s;
}

function atobBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function decodeBase64ToText(input: string): Base64DecodeResult {
  const trimmed = (input || "").trim();
  if (!trimmed) return { ok: true, value: "" };

  const normalized = normalizeBase64(trimmed);

  try {
    // Decode into bytes then convert to UTF-8 text (Unicode-safe).
    const bytes = atobBytes(normalized);

    // TextDecoder is supported in modern browsers.
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const text = decoder.decode(bytes);

    const warnings: string[] = [];
    // Heuristic: if the decoded result contains many replacement chars,
    // warn the user that the source might not be UTF-8 text.
    const replacementCount = (text.match(/\uFFFD/g) || []).length;
    if (replacementCount >= 3) {
      warnings.push(
        "Decoded bytes do not look like clean UTF-8 text. The Base64 may represent binary data or a different encoding.",
      );
    }

    return { ok: true, value: text, warnings: warnings.length ? warnings : undefined };
  } catch {
    return {
      ok: false,
      error:
        "That does not look like valid Base64. Remove any non-Base64 characters, make sure the input is complete, and try again.",
    };
  }
}
