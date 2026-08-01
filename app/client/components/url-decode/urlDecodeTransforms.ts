export type UrlDecodeResult = { ok: true; value: string } | { ok: false; error: string };
export type UrlDecodingMode = "component" | "form";

export function decodeUrlEncodedText(input: string, mode: UrlDecodingMode = "component"): UrlDecodeResult {
  const source = String(input ?? "");
  const malformed = /%(?![0-9a-f]{2})/i.exec(source);
  if (malformed) {
    return { ok: false, error: `Invalid percent escape at position ${malformed.index + 1}; % must be followed by two hexadecimal digits.` };
  }
  const value = mode === "form" ? source.replace(/\+/g, " ") : source;
  try {
    return { ok: true, value: decodeURIComponent(value) };
  } catch {
    return { ok: false, error: "The percent escapes do not form a valid UTF-8 sequence." };
  }
}
