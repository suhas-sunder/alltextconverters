import { findLoneSurrogate } from "../../text/bytes";

export type UrlEncodingMode = "component" | "form";
export type UrlEncodeResult = { ok: true; value: string } | { ok: false; error: string };

export function encodeUrlText(input: string, mode: UrlEncodingMode = "component"): UrlEncodeResult {
  const value = String(input ?? "");
  const surrogate = findLoneSurrogate(value);
  if (surrogate >= 0) return { ok: false, error: `Input contains an unpaired surrogate at position ${surrogate + 1}.` };
  try {
    const encoded = encodeURIComponent(value);
    return { ok: true, value: mode === "form" ? encoded.replace(/%20/g, "+") : encoded };
  } catch {
    return { ok: false, error: "The input could not be URL-encoded." };
  }
}

export function toUrlEncoded(input: string, mode: UrlEncodingMode = "component"): string {
  const result = encodeUrlText(input, mode);
  if (!result.ok) throw new Error(result.error);
  return result.value;
}
