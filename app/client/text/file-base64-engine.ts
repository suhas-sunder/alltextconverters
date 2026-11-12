import { base64ToBytes, bytesToBase64 } from "./bytes";
import { fileBase64Limits, isKnownMedia } from "./file-base64-model";
import type { Base64Alphabet, FileBase64Request, FileBase64Result } from "./file-base64-model";

const bytesPerChunk = 48 * 1024; // An exact multiple of three keeps padding at the end.
const charactersPerChunk = 64 * 1024; // An exact multiple of four for each decode.
const asciiWhitespace = /[\t\n\f\r ]/g;
const standardAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const urlAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const mediaTypePattern = /^[a-z0-9][a-z0-9!#$&^_.+-]{0,63}\/[a-z0-9][a-z0-9!#$&^_.+-]{0,63}$/i;
const mediaParameterPattern = /^[a-z0-9!#$&^_.+-]{1,32}=[a-z0-9!#$&^_.+-]{1,64}$/i;

type Progress = (percent: number) => void;

async function encode({ file, format, media }: Extract<FileBase64Request, { mode: "encode" }>, progress: Progress): Promise<FileBase64Result> {
  if (file.size > fileBase64Limits.binaryBytes) throw new Error("Choose a binary file up to 12 MiB.");
  const type = isKnownMedia(media) ? media : "application/octet-stream";
  const parts: string[] = [format === "data-uri" ? "data:" + type + ";base64," : ""];
  let preview = parts[0];
  for (let offset = 0; offset < file.size; offset += bytesPerChunk) {
    const end = Math.min(offset + bytesPerChunk, file.size);
    const bytes = new Uint8Array(await file.slice(offset, end).arrayBuffer());
    const urlSafe = format === "url-safe";
    const text = bytesToBase64(bytes, urlSafe, !urlSafe);
    parts.push(text);
    const remaining = fileBase64Limits.previewCharacters - preview.length;
    if (remaining > 0) preview += text.slice(0, remaining);
    progress(Math.floor(end * 100 / file.size));
  }
  return { mode: "encode", blob: new Blob(parts, { type: "text/plain" }), preview, byteCount: file.size };
}

async function readSource(input: string | Blob) {
  if (typeof input === "string") {
    if (input.length > fileBase64Limits.pastedCharacters) throw new Error("Paste up to 524,288 characters, or open a Base64 text file for larger input.");
    return input;
  }
  if (input.size > fileBase64Limits.textFileBytes) throw new Error("Choose a Base64 text file up to 17 MiB.");
  const bytes = await input.arrayBuffer();
  try {
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new Error("The Base64 text file is not valid UTF-8.");
  }
}

function readPayload(source: string, alphabet: Base64Alphabet) {
  const input = source.replace(/^\uFEFF/, "").replace(/^[\t\n\f\r ]+/, "");
  if (/^data:/i.test(input)) {
    const comma = input.indexOf(",");
    if (comma < 0 || comma > 256) throw new Error("The data URI needs a short media header followed by a comma.");
    const parts = input.slice(5, comma).split(";");
    if (parts.length < 2 || parts.pop()?.toLowerCase() !== "base64") {
      throw new Error("Use a data URI ending its header with ;base64 before the comma.");
    }
    const media = parts.shift() ?? "";
    if ((media && !mediaTypePattern.test(media)) || parts.some((part) => !mediaParameterPattern.test(part))) {
      throw new Error("The data URI contains an unsupported media header. Use a simple type and unquoted parameters.");
    }
    return { payload: input.slice(comma + 1), alphabet: "standard" as const, media: media.toLowerCase() || "text/plain" };
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(input)) {
    throw new Error("Paste Base64 text or a Base64 data URI. External URLs cannot be opened here.");
  }
  return { payload: input, alphabet, media: null };
}

function checkPayload(payload: string, alphabet: Base64Alphabet) {
  const compact = payload.replace(asciiWhitespace, "");
  const valid = alphabet === "standard" ? /^[A-Za-z0-9+/]*={0,2}$/ : /^[A-Za-z0-9_-]*={0,2}$/;
  if (!valid.test(compact)) {
    throw new Error("The input contains characters outside the selected Base64 alphabet or padding in the wrong place.");
  }
  const padding = compact.endsWith("==") ? 2 : compact.endsWith("=") ? 1 : 0;
  const digits = compact.length - padding;
  const remainder = digits % 4;
  if (remainder === 1 || (padding > 0 && (compact.length % 4 !== 0 || padding !== 4 - remainder))) {
    throw new Error("The Base64 length or padding is invalid.");
  }
  const table = alphabet === "standard" ? standardAlphabet : urlAlphabet;
  const last = table.indexOf(compact.charAt(digits - 1));
  if ((remainder === 2 && (last & 15) !== 0) || (remainder === 3 && (last & 3) !== 0)) {
    throw new Error("The Base64 value has non-zero trailing bits and is not canonical.");
  }
  if (Math.floor(digits * 3 / 4) > fileBase64Limits.binaryBytes) {
    throw new Error("The decoded file would exceed 12 MiB.");
  }
  return compact;
}

async function decode({ input, alphabet }: Extract<FileBase64Request, { mode: "decode" }>, progress: Progress): Promise<FileBase64Result> {
  const payload = readPayload(await readSource(input), alphabet);
  const compact = checkPayload(payload.payload, payload.alphabet);
  const parts: BlobPart[] = [];
  for (let offset = 0; offset < compact.length; offset += charactersPerChunk) {
    const end = Math.min(offset + charactersPerChunk, compact.length);
    const { bytes } = base64ToBytes(compact.slice(offset, end), payload.alphabet === "url-safe");
    if (!bytes) throw new Error("The Base64 input is malformed.");
    parts.push(new Uint8Array(bytes));
    progress(Math.floor(end * 100 / compact.length));
  }
  return { mode: "decode", blob: new Blob(parts, { type: "application/octet-stream" }), declaredMedia: payload.media };
}

export function convertFileBase64(request: FileBase64Request, progress: Progress = () => {}): Promise<FileBase64Result> {
  return request.mode === "encode" ? encode(request, progress) : decode(request, progress);
}
