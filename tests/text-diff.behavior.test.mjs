import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  stdin: {
    contents: [
      'export * from "./app/client/text/text-diff-engine.ts";',
      'export * from "./app/client/text/text-diff-model.ts";',
      'export * from "./app/client/text/text-editor-newlines.ts";',
    ].join("\n"),
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true,
  write: false,
  format: "esm",
});
const {
  applyEditorEdit, compareText, decodeDiffFile, describeLine, diffLimits, editorValue, replaceDisplayedRange, splitDiffLines,
} = await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const compare = (original, revised, highlightWords = false) => compareText({ original, revised, highlightWords });

test("line tokenization preserves all newline forms and distinguishes the missing last newline", () => {
  const source = "one\r\n\r\ntwo\r\rthree\n\nfin";
  assert.deepEqual(splitDiffLines(source), ["one\r\n", "\r\n", "two\r", "\r", "three\n", "\n", "fin"]);
  assert.equal(splitDiffLines(source).join(""), source);
  assert.equal(splitDiffLines("").length, 0);
  assert.deepEqual(["x\r\n", "\r", "\n", "x"].map(describeLine), [
    { text: "x", ending: "CRLF" }, { text: "", ending: "CR" }, { text: "", ending: "LF" }, { text: "x", ending: "No ending" },
  ]);
  const { result } = compare("A\r\nB\rC\n", "A\nB\rC");
  assert.deepEqual(result.groups.map(({ removed, added }) => [removed, added]), [
    [["A\r\n"], ["A\n"]], [["C\n"], ["C"]],
  ]);
  assert.ok(result.report.includes('- 1 [CRLF] "A"\n+ 1 [LF] "A"'));
  assert.ok(result.report.includes('- 3 [LF] "C"\n+ 3 [No ending] "C"'));
});

test("insertions, deletions and replacements have stable original and revised line numbers", () => {
  const original = "header\nsame\nrepeat\nold words\nrepeat\nlast\n";
  const revised = "intro\nheader\nsame\nrepeat\nnew words\nrepeat\n";
  const { result } = compare(original, revised, true);
  assert.deepEqual(result.groups.map((group) => [group.originalStart, group.revisedStart, group.removed, group.added]), [
    [1, 1, [], ["intro\n"]],
    [4, 5, ["old words\n"], ["new words\n"]],
    [6, 7, ["last\n"], []],
  ]);
  assert.deepEqual(result.groups[1].before.map(({ original, revised }) => [original, revised]), [[2, 3], [3, 4]]);
  assert.deepEqual(result.groups[1].after.map(({ original, revised }) => [original, revised]), [[5, 6]]);
  assert.deepEqual(result.groups[1].words, {
    original: [{ text: "old", changed: true }, { text: " words", changed: false }],
    revised: [{ text: "new", changed: true }, { text: " words", changed: false }],
  });
  assert.equal(result.unchanged, 4);
  assert.equal(result.added, 2);
  assert.equal(result.removed, 2);
});

test("combining sequences, emoji, markup and tabs survive word details and full report", () => {
  const original = "cafe\u0301 👩‍💻 <img src=/x>\t\n";
  const revised = "café 👩‍💻 <img src=/x> \n";
  const { result } = compare(original, revised, true);
  const [{ words }] = result.groups;
  assert.equal(words.original.map((part) => part.text).join(""), original.slice(0, -1));
  assert.equal(words.revised.map((part) => part.text).join(""), revised.slice(0, -1));
  assert.ok(words.original.some((part) => part.changed && part.text === "cafe\u0301"));
  assert.ok(words.revised.some((part) => part.changed && part.text === "café"));
  assert.ok(result.report.includes("<img src=/x>\\t"));
  assert.equal(compare(original, revised, false).result.groups[0].words, undefined);
});

test("empty, blank and equal texts have accurate counts and one-sided comparisons allow the full limit", () => {
  assert.deepEqual(compare("", "").result.groups, []);
  assert.equal(compare(" ", " ").result.unchanged, 1);
  assert.equal(compare("\n", "").result.removed, 1);
  assert.equal(compare("", "\r").result.added, 1);
  const source = "line\n".repeat(diffLimits.lines - 1) + "final";
  const { result } = compare("", source);
  assert.equal(result.added, diffLimits.lines);
  assert.equal(result.groups[0].added.join(""), source);
  assert.ok(result.report.endsWith('+ 12000 [No ending] "final"\n'));
});

test("seeded repeated-line edits reconstruct revised text exactly", () => {
  let seed = 74321;
  function next(max) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % max;
  }
  const entries = ["red\n", "blue\r\n", "repeat\r", "\n", "東京\n", "e\u0301\n", "  \t\r\n"];
  for (let run = 0; run < 100; run += 1) {
    const original = Array.from({ length: next(45) }, () => entries[next(entries.length)]).join("");
    const modified = splitDiffLines(original);
    for (let edit = 0; edit < 7; edit += 1) modified.splice(next(modified.length + 1), next(3), entries[next(entries.length)]);
    const revised = modified.join("") + (run % 2 ? "終" : "");
    const { result } = compare(original, revised);
    const originalLines = splitDiffLines(original);
    const output = [];
    let cursor = 0;
    for (const group of result.groups) {
      const start = group.originalStart - 1;
      output.push(...originalLines.slice(cursor, start));
      assert.deepEqual(group.removed, originalLines.slice(start, start + group.removed.length));
      output.push(...group.added);
      cursor = start + group.removed.length;
    }
    output.push(...originalLines.slice(cursor));
    assert.equal(output.join(""), revised);
    assert.equal(result.removed + result.unchanged, originalLines.length);
    assert.equal(result.added + result.unchanged, splitDiffLines(revised).length);
  }
});

test("UTF-8 files and normalized editor selections retain BOM and unchanged mixed line endings", () => {
  const file = new TextEncoder().encode("\uFEFFé\r\n中\rfin\n");
  assert.equal(decodeDiffFile(file.buffer), "\uFEFFé\r\n中\rfin\n");
  assert.throws(() => decodeDiffFile(new Uint8Array([0xff]).buffer), /not valid UTF-8/);
  assert.throws(() => decodeDiffFile(new Uint8Array([0]).buffer), /null characters/);
  assert.throws(() => decodeDiffFile(new ArrayBuffer(diffLimits.bytes + 1)), /512 KiB/);
  assert.equal(editorValue("abc\r\ndef\rghi\n"), "abc\ndef\nghi\n");
  assert.equal(replaceDisplayedRange("abc\r\ndef\rghi\n", 4, 7, "new\r\nline"), "abc\r\nnew\r\nline\rghi\n");
  assert.equal(applyEditorEdit("one\r\nold\rfinal\n", "one\nnew\nfinal\n"), "one\r\nnew\rfinal\n");
  assert.equal(applyEditorEdit("a\r\nb", "ab"), "ab");
  assert.equal(replaceDisplayedRange("\r\n\r\n\r\n", 1, 2, "X"), "\r\nX\r\n");
  assert.equal(editorValue(replaceDisplayedRange("x\ry", 2, 2, "\n")), "x\n\ny");
  assert.equal(editorValue(replaceDisplayedRange("x\ny", 1, 1, "\r")), "x\n\ny");
  assert.equal(editorValue(replaceDisplayedRange("x\rZ\ny", 2, 3, "")), "x\n\ny");
  assert.ok(compare("\uFEFFalpha", "alpha").result.report.includes('"\\ufeffalpha"'));
  assert.ok(compare("left\u202eright", "left right").result.report.includes('"left\\u202eright"'));
});

test("size, line, Unicode and pathological edits fail before yielding partial output", () => {
  assert.match(compare("é".repeat(diffLimits.bytes / 2 + 1), "").error, /Original text exceeds 512 KiB/);
  assert.match(compare("", "\n".repeat(diffLimits.lines + 1)).error, /Revised text exceeds 12,000 lines/);
  assert.match(compare("\u0000", "x").error, /null character/);
  assert.match(compare("\uD800", "x").error, /incomplete Unicode/);
  const result = compare("repeat\n".repeat(6000), "different\n".repeat(6000));
  assert.match(result.error, /time or edit limit/);
  assert.equal("result" in result, false);
});
