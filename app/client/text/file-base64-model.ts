export const fileBase64Limits = {
  binaryBytes: 12 * 1024 * 1024,
  textFileBytes: 17 * 1024 * 1024,
  pastedCharacters: 512 * 1024,
  previewCharacters: 2_048,
  timeoutMs: 30_000,
};

export type Base64Format = "standard" | "url-safe" | "data-uri";
export type Base64Alphabet = Exclude<Base64Format, "data-uri">;

export const knownMedia = {
  "application/octet-stream": "bin",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/json": "json",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "text/plain": "txt",
  "text/csv": "csv",
} as const;

export type KnownMedia = keyof typeof knownMedia;
export type FileExtension = (typeof knownMedia)[KnownMedia];

export type FileBase64Request =
  | { mode: "encode"; file: Blob; format: Base64Format; media: KnownMedia }
  | { mode: "decode"; input: string | Blob; alphabet: Base64Alphabet };

export type FileBase64Result =
  | { mode: "encode"; blob: Blob; preview: string; byteCount: number }
  | { mode: "decode"; blob: Blob; declaredMedia: string | null };

export type FileBase64Message =
  | { kind: "progress"; percent: number }
  | { kind: "result"; result: FileBase64Result }
  | { kind: "error"; error: string };

export function isKnownMedia(type: string): type is KnownMedia {
  return Object.hasOwn(knownMedia, type);
}

export function chooseExtension(media: string | null): FileExtension {
  return media && isKnownMedia(media) ? knownMedia[media] : "bin";
}

export function safeFileStem(value: string, fallback: string) {
  const normalized = value.slice(0, 180).normalize("NFC");
  const cleaned = Array.from(normalized
    .replace(/[\u0000-\u001f\u007f-\u009f\u061c\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff<>:"/\\|?*.]/g, "_")
    .replace(/[\ud800-\udfff]/gu, "_")
    .replace(/\s+/g, " ")
    .replace(/^[ _]+|[ _]+$/g, ""))
    .slice(0, 56).join("").trimEnd();
  // Windows device names are reserved even when followed by a file extension.
  if (!cleaned || /^(?:con|prn|aux|nul|conin\$|conout\$|com[1-9¹²³]|lpt[1-9¹²³])$/i.test(cleaned)) return fallback;
  return cleaned;
}
