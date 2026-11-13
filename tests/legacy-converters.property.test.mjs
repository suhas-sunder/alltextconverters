import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  stdin: {
    contents: [
      'export * from "./app/client/text/bytes.ts";',
      'export * from "./app/client/text/csv.ts";',
      'export * from "./app/client/text/list-core.ts";',
    ].join("\n"),
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true, write: false, format: "esm", platform: "node",
});
const {
  base64ToBytes, binaryToBytes, bytesToBase64, bytesToBinary, bytesToHex, decodeUtf8,
  encodeUtf8Strict, hexToBytes, parseCsv, removeDuplicateItems, serializeCsv,
} = await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

function sampleGenerator(seed) {
  let state = seed;
  return range => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state >>> 8) % range;
  };
}
const corpus = ["a", "A", "é", "e\u0301", "\uFEFF", "👩🏽‍💻", "東京", ",", ";", "\t", "|", "\"", " ", "\r\n", "\r", "\n", "a=b", "١", "مرحبا\u200F"];
function textSample(next) {
  return Array.from({ length: next(10) }, () => corpus[next(corpus.length)]).join("");
}

test("seeded CSV round trips preserve ragged fields and normalize only documented cell line endings", () => {
  const next = sampleGenerator(0xabc182a);
  for (let iteration = 0; iteration < 240; iteration++) {
    const delimiter = [",", ";", "\t", "|"][next(4)];
    const rows = Array.from({ length: next(6) }, () => Array.from({ length: 1 + next(7) }, () => textSample(next)));
    const encoded = serializeCsv(rows, { delimiter, lineEnding: next(2) ? "CRLF" : "LF", alwaysQuote: Boolean(next(2)), bom: Boolean(next(2)) });
    const actual = parseCsv(encoded, delimiter);
    const expected = rows.map(row => row.map(value => value.replace(/\r\n|\r/g, "\n")));
    assert.ok(!("error" in actual), "CSV seed 0xabc182a iteration " + iteration);
    assert.deepEqual(actual.rows, expected, "CSV seed 0xabc182a iteration " + iteration);
  }
});

test("seeded dedupe keeps the exact first spelling and whitespace with each option combination", () => {
  const next = sampleGenerator(0x631eba);
  for (let iteration = 0; iteration < 180; iteration++) {
    const pool = Array.from({ length: 8 }, () => textSample(next));
    const inputs = Array.from({ length: 30 }, () => next(2) ? pool[next(pool.length)] : " " + pool[next(pool.length)].toUpperCase() + "\t");
    for (const [caseInsensitive, trimBeforeComparison] of [[true, true], [false, true], [true, false], [false, false]]) {
      const key = value => {
        const trimmed = trimBeforeComparison ? value.trim() : value;
        return caseInsensitive ? trimmed.toLocaleLowerCase() : trimmed;
      };
      const expected = inputs.filter((value, index) => inputs.findIndex(first => key(first) === key(value)) === index);
      const result = removeDuplicateItems(inputs, { caseInsensitive, trimBeforeComparison });
      assert.deepEqual(result, { items: expected, removed: inputs.length - expected.length }, "list seed 0x631eba iteration " + iteration);
    }
  }
});

test("seeded UTF-8 and binary data round-trip through original Base64, hex and binary engines", () => {
  const next = sampleGenerator(0x1126aa);
  for (let iteration = 0; iteration < 180; iteration++) {
    const text = textSample(next);
    const data = Uint8Array.from({ length: next(128) }, () => next(256));
    const label = "encoding seed 0x1126aa iteration " + iteration;
    assert.equal(decodeUtf8(encodeUtf8Strict(text).bytes).output, text, label);
    for (const urlSafe of [false, true]) {
      for (const padding of [false, true]) {
        assert.deepEqual(base64ToBytes(bytesToBase64(data, urlSafe, padding), urlSafe).bytes, data, label);
      }
    }
    if (data.length) {
      assert.deepEqual(hexToBytes(bytesToHex(data, { separator: " ", uppercase: true, prefix: true })).bytes, data, label);
      assert.deepEqual(binaryToBytes(bytesToBinary(data)).bytes, data, label);
    }
  }
});
