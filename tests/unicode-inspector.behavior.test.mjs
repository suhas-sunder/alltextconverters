import assert from "node:assert/strict";
import test from "node:test";
import { inspectUnicode, inspectorByteLimit, inspectorPreviewLimit, previewUnicodeCleanup, safeTextPreview } from "../app/client/text/unicode-inspector.ts";

const defaultOptions = { normalization: "", removeBom: false, removeZwsp: false, replaceNbsp: false };

test("Unicode inspection reports exact bytes, offsets, scalar and grapheme counts", () => {
  const source = "A\r\n👩🏽‍💻e\u0301漢❤️";
  const { result, report } = inspectUnicode(source, true);
  assert.equal(result.segmentation, "grapheme");
  assert.equal(result.groups, 6);
  assert.equal(result.points, 12);
  assert.equal(result.bytes, Buffer.byteLength(source));
  assert.equal(result.units, source.length);
  assert.equal(result.preview.find(row => row.code === "U+1F469").utf16Offset, 3);
  assert.equal(result.preview.find(row => row.code === "U+1F4BB").grapheme, 2);
  assert.equal(result.preview.find(row => row.code === "U+6F22").utf8Offset, Buffer.byteLength("A\r\n👩🏽‍💻e\u0301"));
  assert.deepEqual(report.map(line => JSON.parse(line)), result.preview);
  assert.equal(result.preview[0].glyph, "A");
  assert.equal(result.preview[1].glyph, "\\u{000D}");
  assert.equal(result.preview.at(-1).description, "Variation selector");
});

test("Unicode inspection escapes directional controls and flags shaped or invisible characters", () => {
  const source = "\uFEFFa\u00A0\u202Eb\u2069\u200B\u200C\u200D\u{E0100}\u2800\u115F";
  const { result } = inspectUnicode(source);
  assert.equal(result.directional, 2);
  assert.deepEqual(result.flaggedPreview.slice(0, 8).map(row => row.code), ["U+FEFF", "U+00A0", "U+202E", "U+2069", "U+200B", "U+200C", "U+200D", "U+E0100"]);
  assert.equal(result.preview.find(row => row.code === "U+202E").glyph, "\\u{202E}");
  assert.equal(result.preview.find(row => row.code === "U+202E").warning, "Bidirectional control");
  assert.equal(result.preview.find(row => row.code === "U+00A0").description, "No-break space");
  assert.deepEqual(safeTextPreview("a\u202E\\u x", 4), { text: "a\\u{202E}\\\\u", truncated: true });
});

test("flagged preview finds a late invisible character and full report keeps every record", () => {
  const source = "x".repeat(5000) + "\u200B";
  const { result, report } = inspectUnicode(source, true);
  assert.equal(result.preview.length, inspectorPreviewLimit);
  assert.equal(result.flaggedPreview.length, 1);
  assert.equal(result.flaggedPreview[0].utf16Offset, 5000);
  assert.equal(report.length, 5001);
  assert.equal(JSON.parse(report.at(-1)).code, "U+200B");
  assert.equal(inspectUnicode(source).report.length, 0);
});

test("cleanup removes only opted-in targets and keeps shaping controls and mid-string BOMs", () => {
  const source = "\uFEFFe\u0301\u00A0\u200B👩🏽‍💻\u2067\uFEFF\r\n";
  assert.equal(previewUnicodeCleanup(source, defaultOptions), source);
  assert.equal(previewUnicodeCleanup(source, { normalization: "NFC", removeBom: true, removeZwsp: true, replaceNbsp: true }), "é 👩🏽‍💻\u2067\uFEFF\r\n");
  assert.equal(previewUnicodeCleanup("é漢", { ...defaultOptions, normalization: "NFD" }), "e\u0301漢");
});

test("inspector bounds UTF-8 work and rejects unpaired surrogates", () => {
  assert.equal(inspectUnicode("💡".repeat(inspectorByteLimit / 4)).result.bytes, inspectorByteLimit);
  assert.throws(() => inspectUnicode("é".repeat(inspectorByteLimit / 2 + 1)), /32 KiB/);
  assert.throws(() => inspectUnicode("a\uD800"), /unpaired/);
  assert.equal(inspectUnicode("").result.points, 0);
});

test("fallback uses exact code points and explicitly avoids claiming grapheme boundaries", () => {
  const descriptor = Object.getOwnPropertyDescriptor(Intl, "Segmenter");
  try {
    Object.defineProperty(Intl, "Segmenter", { value: undefined, configurable: true });
    const { result } = inspectUnicode("e\u0301💡");
    assert.equal(result.segmentation, "code-point");
    assert.equal(result.groups, 3);
    assert.deepEqual(result.preview.map(row => row.utf16Offset), [0, 1, 2]);
  } finally {
    Object.defineProperty(Intl, "Segmenter", descriptor);
  }
});
