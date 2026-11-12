import { diffArrays } from "diff";
import { describeLine, diffLimits, splitDiffLines } from "./text-diff-model";
import type { DiffGroup, DiffRequest, DiffResponse, LineContext, WordSegment } from "./text-diff-model";

const timeoutError = "The comparison exceeded the time or edit limit. Compare smaller sections.";
const encoder = new TextEncoder();

function checkedLines(text: string, side: string) {
  if (text.length > diffLimits.bytes || encoder.encode(text).byteLength > diffLimits.bytes) {
    throw new Error(side + " text exceeds 512 KiB of UTF-8.");
  }
  if (text.includes("\0")) throw new Error(side + " text contains a null character.");
  if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(text)) {
    throw new Error(side + " text contains an incomplete Unicode character.");
  }
  const lines = splitDiffLines(text);
  if (lines.length > diffLimits.lines) throw new Error(side + " text exceeds 12,000 lines.");
  return lines;
}

function context(lines: string[], original: number, revised: number): LineContext[] {
  return lines.map((raw, index) => ({ raw, original: original + index, revised: revised + index }));
}

function wordsForPair(group: DiffGroup, segmenter: Intl.Segmenter, timeMs: number) {
  if (group.removed.length !== 1 || group.added.length !== 1) return;
  const before = describeLine(group.removed[0]).text;
  const after = describeLine(group.added[0]).text;
  if (before === after || before.length + after.length > 4_096) return;
  const tokens = (text: string) => Array.from(segmenter.segment(text), (part) => part.segment);
  const changes = diffArrays(tokens(before), tokens(after), { timeout: timeMs, maxEditLength: 120 });
  if (!changes) return;
  const original: WordSegment[] = [];
  const revised: WordSegment[] = [];
  for (const part of changes) {
    const text = part.value.join("");
    if (!part.added) original.push({ text, changed: part.removed });
    if (!part.removed) revised.push({ text, changed: part.added });
  }
  group.words = { original, revised };
}

function reportLine(raw: string, sign: string, number: number) {
  const { text, ending } = describeLine(raw);
  const quoted = JSON.stringify(text).replace(/[\u061c\u200e\u200f\u2028-\u202e\u2066-\u2069\uFEFF]/g,
    (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0"));
  return sign + " " + number + " [" + ending + "] " + quoted;
}

export function compareText({ original, revised, highlightWords }: DiffRequest): DiffResponse {
  try {
    const before = checkedLines(original, "Original");
    const after = checkedLines(revised, "Revised");
    const changes = original === revised
      ? [{ value: before, added: false, removed: false }]
      : before.length === 0
        ? [{ value: after, added: true, removed: false }]
        : after.length === 0
          ? [{ value: before, added: false, removed: true }]
          : diffArrays(before, after, { timeout: diffLimits.timeMs, maxEditLength: diffLimits.edits });
    if (!changes) return { error: timeoutError };

    const groups: DiffGroup[] = [];
    let current: DiffGroup | undefined;
    let previous: LineContext[] = [];
    let originalLine = 1;
    let revisedLine = 1;
    let unchanged = 0;
    let removed = 0;
    let added = 0;
    for (const part of changes) {
      const count = part.value.length;
      if (!part.added && !part.removed) {
        if (current) {
          current.after = context(part.value.slice(0, 2), originalLine, revisedLine);
          groups.push(current);
          current = undefined;
        }
        const tail = part.value.slice(-2);
        previous = context(tail, originalLine + count - tail.length, revisedLine + count - tail.length);
        originalLine += count;
        revisedLine += count;
        unchanged += count;
        continue;
      }

      current ??= { originalStart: originalLine, revisedStart: revisedLine, removed: [], added: [], before: previous, after: [] };
      if (part.removed) {
        current.removed = current.removed.concat(part.value);
        originalLine += count;
        removed += count;
      } else {
        current.added = current.added.concat(part.value);
        revisedLine += count;
        added += count;
      }
    }
    if (current) groups.push(current);

    if (highlightWords && typeof Intl.Segmenter === "function") {
      const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
      const deadline = performance.now() + 120;
      for (const group of groups) {
        const remaining = deadline - performance.now();
        if (remaining <= 0) break;
        wordsForPair(group, segmenter, Math.min(12, remaining));
      }
    }

    const report = [
      "Text comparison",
      groups.length ? "Change groups: " + groups.length : "The two texts are identical.",
      "Removed: " + removed + " · Added: " + added + " · Unchanged: " + unchanged,
      ...groups.flatMap((group, index) => [
        "",
        "Change " + (index + 1) + " · Original position " + group.originalStart + " · Revised position " + group.revisedStart,
        ...group.removed.map((line, offset) => reportLine(line, "-", group.originalStart + offset)),
        ...group.added.map((line, offset) => reportLine(line, "+", group.revisedStart + offset)),
      ]),
    ].join("\n") + "\n";
    return { result: { groups, unchanged, removed, added, report } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The texts could not be compared." };
  }
}
