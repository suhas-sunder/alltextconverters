import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { strFromU8, unzipSync } from "fflate";

async function loadEngine(filename) {
  const entry = fileURLToPath(new URL("../app/client/components/batch-text/" + filename, import.meta.url));
  const bundle = await build({
    entryPoints: [entry],
    bundle: true,
    platform: "browser",
    format: "esm",
    write: false,
  });
  return import("data:text/javascript;base64," + Buffer.from(bundle.outputFiles[0].contents).toString("base64"));
}

const { batchLimits, batchOutputs, convertBatchFile, planBatch } = await loadEngine("batch-text.ts");
const { createBatchZip } = await loadEngine("batch-zip.ts");

test("batch planning limits files and bytes and gives duplicate names safe distinct outputs", () => {
  const small = new Uint8Array(batchLimits.fileBytes);
  const files = [
    new File(["x"], "../unsafe\\folder\u202ee.txt"),
    new File(["x"], "Résumé.TXT"),
    new File(["x"], "Re\u0301sume\u0301.txt"),
    new File(["x"], "wrong.csv"),
    new File([new Uint8Array(batchLimits.fileBytes + 1)], "too-big.txt"),
    ...Array.from({ length: 31 }, (_, index) => new File([small], index + ".txt")),
  ];
  const planned = planBatch(files);

  assert.equal(planned.length, 32);
  assert.doesNotMatch(planned[0].outputName, /[\\/\u202e]/);
  assert.equal(planned[1].outputName, "Résumé-processed.txt");
  assert.equal(planned[2].outputName, "Résumé-processed-2.txt");
  assert.match(planned[3].issue, /\.txt/);
  assert.match(planned[4].issue, /1 MiB/);
  assert.equal(planned.filter((item) => !item.issue).reduce((total, item) => total + item.file.size, 0), 15 * batchLimits.fileBytes + 3);
  assert.equal(planned.filter((item) => /batch limit/.test(item.issue ?? "")).length, 12);
});

test("batch transformations preserve UTF-8 characters, line order and terminal newline rules", async () => {
  const [file] = planBatch([new File(["\ufeff  Αθήνα  \t\r\n東京\r東京\n"], "multi.txt")]);
  for (const [operation, expected] of [
    ["normalize-lines", "  Αθήνα  \t\n東京\n東京\n"],
    ["trim-lines", "Αθήνα\n東京\n東京\n"],
    ["clean-spaces", " Αθήνα \t\n東京\n東京\n"],
    ["deduplicate-lines", "  Αθήνα  \t\n東京\n"],
  ]) {
    const result = await convertBatchFile(file, operation);
    assert.equal(result.state, "ready");
    assert.equal(result.blob.type, "text/plain;charset=utf-8");
    assert.equal(await result.blob.text(), expected);
  }
});

test("a 24-file batch preserves valid outputs when reads or UTF-8 decoding fail", async () => {
  const unreadable = new File(["x"], "unreadable.txt");
  unreadable.arrayBuffer = async () => { throw new Error("read interrupted"); };
  const files = planBatch([
    new File([new Uint8Array([0xc3, 0x28])], "malformed.txt"),
    new File(["hello\0world"], "nul.txt"),
    unreadable,
    new File([], "empty.txt"),
    ...Array.from({ length: 20 }, (_, index) => new File(["α\r\nβ\r\n"], "list-" + index + ".txt")),
  ]);
  const results = {};
  for (const item of files) results[item.id] = await convertBatchFile(item, "normalize-lines");

  assert.match(results[0].message, /Invalid UTF-8/);
  assert.match(results[1].message, /NUL characters/);
  assert.match(results[2].message, /Could not read/);
  assert.equal(results[3].blob.size, 0);
  assert.equal(await results[23].blob.text(), "α\nβ\n");

  // Simulate a stopped run. The archive must omit cancelled and failed rows.
  results[23] = { state: "cancelled" };
  const zip = await createBatchZip(batchOutputs(files, results));
  const entries = unzipSync(new Uint8Array(await zip.arrayBuffer()));
  assert.equal(zip.type, "application/zip");
  assert.equal(Object.keys(entries).length, 20);
  assert.equal(strFromU8(entries["list-0-processed.txt"]), "α\nβ\n");
  assert.equal(entries["empty-processed.txt"].length, 0);
  assert.equal(entries["list-19-processed.txt"], undefined);
  assert.equal(entries["malformed-processed.txt"], undefined);
});
