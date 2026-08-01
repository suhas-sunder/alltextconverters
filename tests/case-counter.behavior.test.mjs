import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = new Map();
async function importTypeScript(relativePath) {
  if (cache.has(relativePath)) return cache.get(relativePath);
  const built = await build({ entryPoints: [resolve(root, relativePath)], bundle: true, platform: "node", format: "esm", write: false });
  const module = await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString("base64")}`);
  cache.set(relativePath, module);
  return module;
}

test("shared uppercase and lowercase preserve non-case content and support Unicode", async () => {
  const { toUpperCaseText, toLowerCaseText } = await importTypeScript("app/client/text/case.ts");
  assert.equal(toUpperCaseText("Café 123!\nγειά 漢字 😀"), "CAFÉ 123!\nΓΕΙΆ 漢字 😀");
  assert.equal(toLowerCaseText("CAFÉ 123!\nΓΕΙΆ 漢字 😀"), "café 123!\nγειά 漢字 😀");
  assert.equal(toUpperCaseText(""), "");
  assert.equal(toLowerCaseText(" \n\t"), " \n\t");
});

test("simple title case has documented word, punctuation, acronym, and Unicode behavior", async () => {
  const { toTitleCase } = await importTypeScript("app/client/text/case.ts");
  assert.equal(toTitleCase("the rise-and-fall of NASA"), "The Rise-And-Fall Of Nasa");
  assert.equal(toTitleCase("don't STOP o'neill"), "Don't Stop O'neill");
  assert.equal(toTitleCase('"hello," (WORLD) 42nd'), '"Hello," (World) 42Nd');
  assert.equal(toTitleCase("élan déjà\nпривет МИР"), "Élan Déjà\nПривет Мир");
  assert.equal(toTitleCase("漢字 😀"), "漢字 😀");
});

test("sentence case handles boundaries, lines, quotes, decimals, ellipses, and Unicode punctuation", async () => {
  const { toSentenceCase } = await importTypeScript("app/client/text/case.ts");
  assert.equal(toSentenceCase('HELLO. "WORLD!" (HOW ARE YOU?)'), 'Hello. "World!" (How are you?)');
  assert.equal(toSentenceCase("VALUE 3.14 IS PI. NEXT"), "Value 3.14 is pi. Next");
  assert.equal(toSentenceCase("FIRST LINE\r\nSECOND LINE"), "First line\r\nSecond line");
  assert.equal(toSentenceCase("WAIT... WHAT? YES!"), "Wait... What? Yes!");
  assert.equal(toSentenceCase("DR. SMITH LEFT. OK"), "Dr. Smith left. Ok");
  assert.equal(toSentenceCase("ПРИВЕТ。 КАК ДЕЛА？ ХОРОШО！"), "Привет。 Как дела？ Хорошо！");
});

test("alternating case is grapheme-safe in both modes and start settings", async () => {
  const { toAlternatingCase, segmentGraphemes } = await importTypeScript("app/client/text/case.ts");
  assert.equal(toAlternatingCase("a b-c1!d", { start: "lowercase", unit: "letters" }), "a B-c1!D");
  assert.equal(toAlternatingCase("a b-c1!d", { start: "uppercase", unit: "letters" }), "A b-C1!d");
  assert.equal(toAlternatingCase("ab 😀c", { start: "lowercase", unit: "graphemes" }), "aB 😀c");
  const decomposed = "e\u0301x";
  assert.deepEqual(segmentGraphemes(decomposed), ["e\u0301", "x"]);
  assert.equal(toAlternatingCase(decomposed, { start: "uppercase", unit: "letters" }), "E\u0301x");
  const family = "👨‍👩‍👧‍👦aB";
  assert.equal(segmentGraphemes(family).length, 3);
  assert.equal(toAlternatingCase(family, { start: "lowercase", unit: "letters" }), "👨‍👩‍👧‍👦aB");
  assert.equal(toAlternatingCase("漢a字b", { start: "uppercase", unit: "letters" }), "漢A字b");
});

test("case analysis distinguishes empty, uncased, no-cased, and heuristic cases", async () => {
  const { analyzeCase } = await importTypeScript("app/client/text/case.ts");
  assert.equal(analyzeCase("").classification, "Empty input");
  assert.equal(analyzeCase(" \n\t").classification, "No cased letters");
  assert.equal(analyzeCase("123 !!! 😀").classification, "No cased letters");
  assert.equal(analyzeCase("漢字").classification, "Uncased text");
  assert.equal(analyzeCase("CAFÉ ΓΕΙΆ").classification, "Uppercase");
  assert.equal(analyzeCase("café γειά").classification, "Lowercase");
  assert.equal(analyzeCase("This Is Title-Like").classification, "Title-like case");
  assert.equal(analyzeCase("This is sentence-like. Another one!").classification, "Sentence-like case");
  assert.equal(analyzeCase("mIxEd NASA text").classification, "Mixed case");
});

test("match case repeats cased pattern over cased target graphemes", async () => {
  const { applyMatchCase } = await importTypeScript("app/client/text/case.ts");
  assert.equal(applyMatchCase("AbC", "example target").output, "ExAMpLE tARgET");
  assert.equal(applyMatchCase("aB", "Café déjà").output, "cAfÉ dÉjÀ");
  assert.equal(applyMatchCase("A- b!", "x 1-y 😀z").output, "X 1-y 😀Z");
  assert.equal(applyMatchCase("AbCdEf", "xy").output, "Xy");
  const noPattern = applyMatchCase("123 😀", "Keep 漢字 As-Is");
  assert.equal(noPattern.output, "Keep 漢字 As-Is");
  assert.match(noPattern.warning, /no cased letters/i);
  assert.equal(applyMatchCase("Ab", "漢字 😀 123").appliedLetters, 0);
  assert.equal(applyMatchCase("", "").output, "");
});

test("shared metrics distinguish graphemes, code points, code units, bytes, spaces, and lines", async () => {
  const { getTextMetrics } = await importTypeScript("app/client/text/metrics.ts");
  assert.deepEqual(getTextMetrics(""), { utf16CodeUnits: 0, codePoints: 0, graphemes: 0, utf8Bytes: 0, withoutLiteralSpaces: 0, withoutWhitespace: 0, words: 0, lines: 0, nonblankLines: 0, paragraphs: 0 });
  const ascii = getTextMetrics("A B\tC\n");
  assert.equal(ascii.graphemes, 6); assert.equal(ascii.withoutLiteralSpaces, 5); assert.equal(ascii.withoutWhitespace, 3); assert.equal(ascii.words, 3); assert.equal(ascii.lines, 2); assert.equal(ascii.nonblankLines, 1);
  const nbsp = getTextMetrics("A\u00a0B"); assert.equal(nbsp.withoutLiteralSpaces, 3); assert.equal(nbsp.withoutWhitespace, 2);
  const precomposed = getTextMetrics("é"); assert.deepEqual([precomposed.graphemes, precomposed.codePoints, precomposed.utf16CodeUnits, precomposed.utf8Bytes], [1, 1, 1, 2]);
  const decomposed = getTextMetrics("e\u0301"); assert.deepEqual([decomposed.graphemes, decomposed.codePoints, decomposed.utf16CodeUnits, decomposed.utf8Bytes], [1, 2, 2, 3]);
  const emoji = getTextMetrics("😀"); assert.deepEqual([emoji.graphemes, emoji.codePoints, emoji.utf16CodeUnits, emoji.utf8Bytes], [1, 1, 2, 4]);
  const skin = getTextMetrics("👍🏽"); assert.deepEqual([skin.graphemes, skin.codePoints, skin.utf16CodeUnits, skin.utf8Bytes], [1, 2, 4, 8]);
  const family = getTextMetrics("👨‍👩‍👧‍👦"); assert.deepEqual([family.graphemes, family.codePoints, family.utf16CodeUnits, family.utf8Bytes], [1, 7, 11, 25]);
  const flag = getTextMetrics("🇺🇸"); assert.deepEqual([flag.graphemes, flag.codePoints, flag.utf16CodeUnits, flag.utf8Bytes], [1, 2, 4, 8]);
  assert.equal(getTextMetrics("漢").utf8Bytes, 3);
  assert.equal(getTextMetrics("a\r\nb").lines, 2);
  assert.equal(getTextMetrics("a\n").lines, 2);
  assert.equal(getTextMetrics(" \t\n\u00a0").words, 0);
});

test("word segmentation handles prose, contractions, punctuation, numbers, CJK, and emoji", async () => {
  const { getTextMetrics } = await importTypeScript("app/client/text/metrics.ts");
  assert.equal(getTextMetrics("Hello, world! 42").words, 3);
  assert.equal(getTextMetrics("don't stop").words, 2);
  assert.equal(getTextMetrics("re-enter").words, 2);
  assert.ok(getTextMetrics("你好世界").words >= 1);
  assert.equal(getTextMetrics("😀 🎉").words, 0);
  assert.equal(getTextMetrics("\n\t").words, 0);
});

test("counter engine and size policy cover representative browser-local inputs", async () => {
  const { getTextMetrics } = await importTypeScript("app/client/text/metrics.ts");
  const { assessInputSize } = await importTypeScript("app/client/text/input-size.ts");
  for (const size of [0, 10 * 1024, 100 * 1024, 1024 * 1024]) assert.equal(getTextMetrics("a".repeat(size)).utf8Bytes, size);
  assert.equal(assessInputSize("a".repeat(5 * 1024 * 1024)).level, "warning");
  assert.equal(assessInputSize("a".repeat(5 * 1024 * 1024 + 1)).level, "blocked");
});
