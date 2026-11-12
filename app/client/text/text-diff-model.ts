export const diffLimits = { bytes: 512 * 1024, lines: 12_000, timeMs: 750, watchdogMs: 2_500, edits: 2_000 };
export type DiffEnding = "CRLF" | "CR" | "LF" | "No ending";
export type LineContext = { original: number; revised: number; raw: string };
export type WordSegment = { text: string; changed: boolean };
export type DiffGroup = {
  originalStart: number;
  revisedStart: number;
  removed: string[];
  added: string[];
  before: LineContext[];
  after: LineContext[];
  words?: { original: WordSegment[]; revised: WordSegment[] };
};
export type DiffResult = {
  groups: DiffGroup[];
  unchanged: number;
  removed: number;
  added: number;
  report: string;
};
export type DiffRequest = { original: string; revised: string; highlightWords: boolean };
export type DiffResponse = { result: DiffResult } | { error: string };

export function splitDiffLines(input: string) {
  return input.match(/[^\r\n]*(?:\r\n|\r|\n)|[^\r\n]+$/g) ?? [];
}

export function describeLine(raw: string): { text: string; ending: DiffEnding } {
  if (raw.endsWith("\r\n")) return { text: raw.slice(0, -2), ending: "CRLF" };
  if (raw.endsWith("\r")) return { text: raw.slice(0, -1), ending: "CR" };
  if (raw.endsWith("\n")) return { text: raw.slice(0, -1), ending: "LF" };
  return { text: raw, ending: "No ending" };
}

export function decodeDiffFile(bytes: ArrayBuffer) {
  if (bytes.byteLength > diffLimits.bytes) throw new Error("Choose a UTF-8 text file up to 512 KiB.");
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw new Error("This file is not valid UTF-8 text.");
  }
  if (text.includes("\0")) throw new Error("This file contains null characters. Choose a plain-text file.");
  return text;
}
