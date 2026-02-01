export type UrlDecodeResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function decodeUrlEncodedText(input: string): UrlDecodeResult {
  const raw = String(input ?? "");

  // decodeURIComponent throws URIError on malformed escape sequences.
  // We keep logic deterministic and minimal: no grammar, no auto-fixing.
  try {
    return { ok: true, value: decodeURIComponent(raw) };
  } catch {
    return {
      ok: false,
      error:
        "Invalid URL-encoded input. Check for incomplete % sequences (like '%2') or non-hex escapes (like '%ZZ').",
    };
  }
}
