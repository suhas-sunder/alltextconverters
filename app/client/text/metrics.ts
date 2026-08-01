import { segmentGraphemes } from "./case";
import { splitLines } from "./text-core";

export type TextMetrics = { utf16CodeUnits: number; codePoints: number; graphemes: number; utf8Bytes: number; withoutLiteralSpaces: number; withoutWhitespace: number; words: number; lines: number; nonblankLines: number; paragraphs: number };

function countWords(text: string): number {
  if (!text.trim()) return 0;
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    let words = 0;
    for (const part of new Intl.Segmenter(undefined, { granularity: "word" }).segment(text)) if (part.isWordLike) words += 1;
    return words;
  }
  return (text.match(/[\p{L}\p{N}]+(?:['\u2019-][\p{L}\p{N}]+)*/gu) ?? []).length;
}

function countGraphemeMetrics(text: string) {
  let graphemes = 0;
  let withoutLiteralSpaces = 0;
  let withoutWhitespace = 0;
  const segments = typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)
    : segmentGraphemes(text).map((segment) => ({ segment }));
  for (const part of segments) {
    graphemes += 1;
    if (part.segment !== " ") withoutLiteralSpaces += 1;
    if (!/^\p{White_Space}+$/u.test(part.segment)) withoutWhitespace += 1;
  }
  return { graphemes, withoutLiteralSpaces, withoutWhitespace };
}

export function getTextMetrics(input: string): TextMetrics {
  const text = String(input ?? "");
  const lines = text ? splitLines(text) : [];
  const graphemeMetrics = countGraphemeMetrics(text);
  let codePoints = 0;
  for (const _point of text) codePoints += 1;
  return {
    utf16CodeUnits: text.length,
    codePoints,
    graphemes: graphemeMetrics.graphemes,
    utf8Bytes: new TextEncoder().encode(text).length,
    withoutLiteralSpaces: graphemeMetrics.withoutLiteralSpaces,
    withoutWhitespace: graphemeMetrics.withoutWhitespace,
    words: countWords(text),
    lines: lines.length,
    nonblankLines: lines.filter((line) => line.trim().length > 0).length,
    paragraphs: text.trim() ? text.trim().split(/(?:\r\n|\r|\n)[\t \u00a0]*(?:\r\n|\r|\n)+/u).filter((part) => part.trim()).length : 0,
  };
}

export function formatMetricNumber(value: number): string {
  return value.toLocaleString("en-US");
}
