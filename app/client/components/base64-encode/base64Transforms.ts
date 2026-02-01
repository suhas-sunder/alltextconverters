// Unicode-safe Base64 encoding for browsers.
// Uses TextEncoder to convert JS strings to UTF-8 bytes, then encodes bytes to Base64.
//
// Notes:
// - btoa expects a "binary string" (Latin1). We build that from bytes.
// - For large inputs, we chunk to avoid call stack / argument size limits.

export function encodeToBase64Unicode(input: string): { ok: true; value: string } | { ok: false; error: string } {
  try {
    // Normalize to a JS string (input already is).
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);

    // Convert bytes to binary string in chunks.
    const chunkSize = 0x8000; // 32KB-ish chunk to be safe across browsers
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      binary += String.fromCharCode(...Array.from(chunk));
    }

    const b64 = btoa(binary);
    return { ok: true, value: b64 };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
      error:
        "Encoding failed in this browser. Try a smaller input, or make sure your environment supports TextEncoder and Base64 APIs.",
    };
  }
}

export type AppliedOperation = {
  label: string;
  detail?: string;
};

export function base64EncodeWithSummary(input: string): {
  ok: true;
  output: string;
  ops: AppliedOperation[];
} | {
  ok: false;
  error: string;
  ops: AppliedOperation[];
} {
  const ops: AppliedOperation[] = [
    { label: "UTF-8 encode (Unicode-safe)", detail: "TextEncoder" },
    { label: "Base64 encode", detail: "btoa(byte stream)" },
  ];

  const trimmed = input;
  const res = encodeToBase64Unicode(trimmed);
  if (!res.ok) return { ok: false, error: res.error, ops };
  return { ok: true, output: res.value, ops };
}
