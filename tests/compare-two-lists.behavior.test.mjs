import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  entryPoints: [fileURLToPath(new URL("../app/client/text/compare-two-lists.ts", import.meta.url))],
  bundle: true, write: false, format: "esm",
});
const { compareTwoLists, comparisonLimits, comparisonText, defaultComparisonOptions } =
  await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

function compare(a, b, options = {}) {
  const response = compareTwoLists({ a, b, options: { ...defaultComparisonOptions, ...options } });
  assert.ok("result" in response, response.error);
  return response.result;
}

function values({ outputs }) {
  return Object.fromEntries(Object.entries(outputs).map(([group, output]) => [group, output.values]));
}

test("default set comparison preserves source order, spelling and side counts across mixed line endings", () => {
  const actual = compare("SKU-12\rSKU-12\r\nCafé\nEast\r\n", "Café\r\nSKU-12\rWest\n");
  assert.deepEqual(values(actual), {
    onlyA: ["East"], onlyB: ["West"], common: ["SKU-12", "Café"], union: ["SKU-12", "Café", "East", "West"],
  });
  assert.deepEqual(actual.outputs.common.preview[0], { key: "SKU-12", value: "SKU-12", counts: { a: 2, b: 1 }, occurrences: 1 });
  assert.deepEqual(actual.included, { a: 4, b: 3 });
  assert.deepEqual(actual.skipped, { a: 0, b: 0 });
});

test("multiset uses matching pairs, keeps excess instances on their original side and maintains source order", () => {
  const actual = compare("Z\nx\nX\nÉ\nx", "x\né\nY\ny", { duplicates: "multiset", ignoreCase: true });
  assert.deepEqual(values(actual), {
    onlyA: ["Z", "X", "x"], onlyB: ["Y", "y"], common: ["x", "É"], union: ["Z", "x", "X", "É", "x", "Y", "y"],
  });
  assert.deepEqual(actual.outputs.onlyA.preview[1], { key: "x", value: "X", counts: { a: 3, b: 1 }, occurrences: 2 });
  assert.equal(actual.outputs.onlyB.distinct, 1);
});

test("normalization for matching is explicit and never rewrites exported values", () => {
  const left = " Café \n👩‍💻\né\nStraße\nA\tB\n\uFEFFx";
  const right = "CAFÉ\n👩💻\ne\u0301\nSTRASSE\nA B\nx";
  assert.equal(compare(left, right).outputs.common.values.length, 0);
  assert.deepEqual(compare(left, right, { ignoreCase: true, trimEdges: true }).outputs.common.values, [" Café ", "\uFEFFx"]);
  assert.equal(comparisonText([" Café ", "😀", ""]), " Café \n😀\n\n");
});

test("empty inputs, terminal LF and preserved blank records are distinct", () => {
  assert.deepEqual(values(compare("", "")), { onlyA: [], onlyB: [], common: [], union: [] });
  assert.equal(comparisonText([]), "");
  assert.deepEqual(values(compare("\n", " ")), { onlyA: [""], onlyB: [" "], common: [], union: ["", " "] });
  assert.equal(comparisonText([""]), "\n");
  const result = compare("x\n\n \n", "\r\r\nx", { ignoreEmpty: true, trimEdges: true });
  assert.deepEqual(result.skipped, { a: 2, b: 2 });
  assert.deepEqual(values(result), { onlyA: [], onlyB: [], common: ["x"], union: ["x"] });
});

test("sorted output uses deterministic keys and preserves source order among matching variations", () => {
  const left = "z\n A \nb\na\n東京";
  const right = "x\na\na";
  const options = { order: "sorted", ignoreCase: true, trimEdges: true, duplicates: "multiset" };
  assert.deepEqual(values(compare(left, right, options)), {
    onlyA: ["b", "z", "東京"], onlyB: ["x"], common: [" A ", "a"], union: [" A ", "a", "b", "x", "z", "東京"],
  });
});

test("UTF-8 byte, record and lone-surrogate limits identify the side without exposing input", () => {
  const request = (a, b) => compareTwoLists({ a, b, options: defaultComparisonOptions });
  assert.match(request("", "é".repeat(comparisonLimits.bytes / 2 + 1)).error, /^List B exceeds 512 KiB/);
  assert.match(request("x".repeat(comparisonLimits.bytes + 1), "").error, /^List A exceeds 512 KiB/);
  assert.match(request("x\n".repeat(comparisonLimits.records + 1), "").error, /^List A exceeds 20,000/);
  assert.match(request("", "private\uD800secret").error, /^List B contains invalid Unicode\..+position 8/);
  assert.doesNotMatch(request("", "private\uD800secret").error, /private|secret/);
  assert.equal(compare("é".repeat(comparisonLimits.bytes / 2), "").outputs.union.values.length, 1);
});

test("the preview cap preserves thousands of complete export records", () => {
  const left = Array.from({ length: comparisonLimits.records }, (_, i) => `A-${i}`);
  const right = Array.from({ length: 3000 }, (_, i) => `A-${i * 2}`);
  const { outputs } = compare(left.join("\n"), right.join("\r"));
  assert.equal(outputs.common.values.length, 3000);
  assert.equal(outputs.onlyA.values.length, 17_000);
  assert.equal(outputs.union.preview.length, comparisonLimits.previewRows);
  assert.equal(outputs.union.distinct, comparisonLimits.records);
  assert.deepEqual(comparisonText(outputs.union.values).trimEnd().split("\n"), left);
});

test("fixed-seed occurrence arithmetic and TXT round trips hold for set and multiset mode", () => {
  const corpus = ["__proto__", "x", "", "Z", "😀", "é", "e\u0301", " "];
  let seed = 2_041_647;
  const random = (mod) => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return (seed >>> 8) % mod;
  };
  const sequence = () => Array.from({ length: random(27) }, () => corpus[random(corpus.length)]);
  for (const duplicates of ["set", "multiset"]) {
    for (let iteration = 0; iteration < 100; iteration++) {
      const a = sequence();
      const b = sequence();
      const result = compare(comparisonText(a), comparisonText(b), { duplicates });
      for (const item of corpus) {
        const size = (entries) => entries.filter((entry) => entry === item).length;
        const left = duplicates === "set" ? Number(a.includes(item)) : size(a);
        const right = duplicates === "set" ? Number(b.includes(item)) : size(b);
        assert.equal(size(result.outputs.onlyA.values), Math.max(left - right, 0));
        assert.equal(size(result.outputs.onlyB.values), Math.max(right - left, 0));
        assert.equal(size(result.outputs.common.values), Math.min(left, right));
        assert.equal(size(result.outputs.union.values), Math.max(left, right));
      }
      assert.deepEqual(
        compare(comparisonText(result.outputs.union.values), "", { duplicates }).outputs.onlyA.values,
        result.outputs.union.values,
      );
    }
  }
});
