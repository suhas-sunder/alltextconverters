export const inspectorByteLimit = 32 * 1024;
export const inspectorPreviewLimit = 120;
const encoder = new TextEncoder();

const named = new Map<number, string>([
  [0x0000, "Null"], [0x0009, "Tab"], [0x000A, "Line feed"], [0x000D, "Carriage return"],
  [0x0020, "Space"], [0x007F, "Delete"], [0x0085, "Next line"], [0x00A0, "No-break space"],
  [0x00AD, "Soft hyphen"], [0x034F, "Combining grapheme joiner"], [0x061C, "Arabic letter mark"],
  [0x180E, "Mongolian vowel separator"], [0x200B, "Zero width space"], [0x200C, "Zero width non-joiner"],
  [0x200D, "Zero width joiner"], [0x200E, "Left-to-right mark"], [0x200F, "Right-to-left mark"],
  [0x2028, "Line separator"], [0x2029, "Paragraph separator"], [0x202A, "Left-to-right embedding"],
  [0x202B, "Right-to-left embedding"], [0x202C, "Pop directional formatting"], [0x202D, "Left-to-right override"],
  [0x202E, "Right-to-left override"], [0x202F, "Narrow no-break space"], [0x2060, "Word joiner"],
  [0x2066, "Left-to-right isolate"], [0x2067, "Right-to-left isolate"], [0x2068, "First strong isolate"],
  [0x2069, "Pop directional isolate"], [0x2800, "Braille pattern blank"], [0xFEFF, "Byte order mark / zero width no-break space"],
]);

const categories: [RegExp, string][] = [
  [/\p{L}/u, "Letter"], [/\p{N}/u, "Number"], [/\p{M}/u, "Combining mark"],
  [/\p{P}/u, "Punctuation"], [/\p{S}/u, "Symbol"], [/\p{Z}/u, "Separator"],
  [/\p{Cc}/u, "Control"], [/\p{Cf}/u, "Format"], [/\p{Co}/u, "Private use"], [/\p{Cs}/u, "Surrogate"],
];
const invisible = /[\p{Default_Ignorable_Code_Point}\p{Cc}\p{Cf}\p{Z}\u2800]/u;
const bidi = /\p{Bidi_Control}/u;
const variation = /\p{Variation_Selector}/u;
const mark = /\p{M}/u;
const surrogate = /[\uD800-\uDFFF]/u;

function codePoint(point: string) {
  return point.codePointAt(0)!;
}
function hexadecimal(point: string) {
  return codePoint(point).toString(16).toUpperCase().padStart(4, "0");
}
function describePoint(point: string) {
  if (named.has(codePoint(point))) return named.get(codePoint(point))!;
  if (variation.test(point)) return "Variation selector";
  return categories.find(([pattern]) => pattern.test(point))?.[1] ?? "Unassigned";
}
function warningFor(point: string) {
  if (bidi.test(point)) return "Bidirectional control";
  if (variation.test(point)) return "Variation selector";
  if (point !== " " && invisible.test(point)) return "Invisible or nonstandard whitespace";
  if (mark.test(point)) return "Combining mark";
  return null;
}
function safeGlyph(point: string) {
  return invisible.test(point) || mark.test(point) || surrogate.test(point) ? "\\u{" + hexadecimal(point) + "}" : point;
}
export function safeTextPreview(source: string, maxPoints = 240) {
  let output = "";
  let count = 0;
  for (const point of source) {
    if (count++ === maxPoints) return { text: output, truncated: true };
    output += point === " " ? " " : point === "\\" ? "\\\\" : safeGlyph(point);
  }
  return { text: output, truncated: false };
}
export function assertInspectorInput(source: string) {
  if (source.length > inspectorByteLimit || encoder.encode(source).length > inspectorByteLimit) {
    throw new Error("Use at most 32 KiB of UTF-8 text.");
  }
  if (surrogate.test(source)) throw new Error("The input contains an unpaired UTF-16 surrogate.");
}

export type PointRecord = {
  grapheme: number;
  point: number;
  utf16Offset: number;
  utf8Offset: number;
  utf16Units: number;
  utf8Bytes: number;
  code: string;
  glyph: string;
  description: string;
  warning: string | null;
};
export type Inspection = {
  segmentation: "grapheme" | "code-point";
  groups: number;
  points: number;
  bytes: number;
  units: number;
  flagged: number;
  directional: number;
  preview: PointRecord[];
  flaggedPreview: PointRecord[];
};
export type Cleanup = { normalization: "" | "NFC" | "NFD"; removeBom: boolean; removeZwsp: boolean; replaceNbsp: boolean };

function* codePointSegments(source: string) {
  for (const segment of source) yield { segment };
}

export function inspectUnicode(source: string, exportRecords = false) {
  assertInspectorInput(source);
  const segmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  const segments = segmenter ? segmenter.segment(source) : codePointSegments(source);
  const result: Inspection = {
    segmentation: segmenter ? "grapheme" : "code-point",
    groups: 0, points: 0, bytes: 0, units: 0, flagged: 0, directional: 0, preview: [], flaggedPreview: [],
  };
  const report: string[] = [];
  for (const { segment } of segments) {
    for (const point of segment) {
      const code = codePoint(point);
      const byteLength = code <= 0x7F ? 1 : code <= 0x7FF ? 2 : code <= 0xFFFF ? 3 : 4;
      const warning = warningFor(point);
      const inPreview = result.preview.length < inspectorPreviewLimit;
      const inFlagged = warning !== null && result.flaggedPreview.length < inspectorPreviewLimit;
      if (inPreview || inFlagged || exportRecords) {
        const record: PointRecord = {
          grapheme: result.groups, point: result.points, utf16Offset: result.units, utf8Offset: result.bytes,
          utf16Units: point.length, utf8Bytes: byteLength, code: "U+" + hexadecimal(point),
          glyph: safeGlyph(point), description: describePoint(point), warning,
        };
        if (inPreview) result.preview.push(record);
        if (inFlagged) result.flaggedPreview.push(record);
        if (exportRecords) report.push(JSON.stringify(record) + "\n");
      }
      if (warning) result.flagged++;
      if (bidi.test(point)) result.directional++;
      result.points++;
      result.bytes += byteLength;
      result.units += point.length;
    }
    result.groups++;
  }
  return { result, report };
}

export function previewUnicodeCleanup(source: string, options: Cleanup) {
  assertInspectorInput(source);
  let cleaned = options.removeBom && source.startsWith("\uFEFF") ? source.slice(1) : source;
  if (options.removeZwsp) cleaned = cleaned.replaceAll("\u200B", "");
  if (options.replaceNbsp) cleaned = cleaned.replaceAll("\u00A0", " ");
  if (options.normalization) cleaned = cleaned.normalize(options.normalization);
  return cleaned;
}
