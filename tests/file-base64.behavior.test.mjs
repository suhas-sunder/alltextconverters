import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  stdin: {
    contents: [
      'export * from "./app/client/text/file-base64-engine.ts";',
      'export * from "./app/client/text/file-base64-model.ts";',
    ].join("\n"),
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true,
  write: false,
  format: "esm",
});
const { convertFileBase64, chooseExtension, fileBase64Limits, safeFileStem } =
  await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const encode = (bytes, format = "standard", media = "application/octet-stream", progress) =>
  convertFileBase64({ mode: "encode", file: new Blob([bytes]), format, media }, progress);
const decode = (input, alphabet = "standard", progress) =>
  convertFileBase64({ mode: "decode", input, alphabet }, progress);

test("canonical standard output matches the RFC test vectors and Node independently", async () => {
  const rfcVectors = [["", ""], ["f", "Zg=="], ["fo", "Zm8="], ["foo", "Zm9v"], ["foob", "Zm9vYg=="], ["fooba", "Zm9vYmE="], ["foobar", "Zm9vYmFy"]];
  for (const [plain, encoded] of rfcVectors) {
    const output = await encode(Buffer.from(plain));
    assert.equal(await output.blob.text(), encoded);
    assert.equal(output.byteCount, plain.length);
    assert.equal(output.blob.type, "text/plain");
    assert.deepEqual(Buffer.from(await (await decode(encoded)).blob.arrayBuffer()), Buffer.from(plain));
    assert.deepEqual(Buffer.from(await (await decode(encoded.replace(/=+$/, ""))).blob.arrayBuffer()), Buffer.from(plain));
  }
});

test("arbitrary binary round trips across chunk, byte and Base64 quantum boundaries", async () => {
  for (const length of [1, 2, 3, 255, 256, 257, 49_151, 49_152, 49_153, 98_303, 98_304, 98_305, 230_079]) {
    const bytes = Buffer.alloc(length);
    for (let n = 0; n < bytes.length; n += 1) bytes[n] = n % 256;
    for (const [format, algorithm] of [["standard", "base64"], ["url-safe", "base64url"]]) {
      const changes = [];
      const result = await encode(bytes, format, "application/octet-stream", (percent) => changes.push(percent));
      const text = await result.blob.text();
      assert.equal(text, bytes.toString(algorithm));
      assert.equal(result.preview, text.slice(0, fileBase64Limits.previewCharacters));
      assert.equal(changes.at(-1), 100);
      assert.ok(changes.every((percent, index) => !index || percent >= changes[index - 1]));
      const decoded = await decode(text, format);
      assert.deepEqual(Buffer.from(await decoded.blob.arrayBuffer()), bytes);
      assert.equal(decoded.blob.type, "application/octet-stream");
    }
  }
});

test("strict alphabets reject mixed punctuation, misplaced padding and nonzero unused bits", async () => {
  for (const [value, alphabet, match] of [
    ["AAAA====", "standard", /padding in the wrong place/], ["AB==", "standard", /trailing bits/],
    ["AAB=", "standard", /trailing bits/], ["AB", "standard", /trailing bits/],
    ["Zg=", "standard", /length or padding/], ["A", "standard", /length or padding/],
    ["A=AA", "standard", /padding in the wrong place/], ["A\u00a0A", "standard", /outside the selected/],
    ["+-_/", "standard", /outside the selected/], ["+-_/", "url-safe", /outside the selected/],
    ["//8=", "url-safe", /outside the selected/], ["__8", "standard", /outside the selected/],
  ]) {
    await assert.rejects(decode(value, alphabet), match);
  }
  for (const value of ["__8=", "__8"]) {
    const result = await decode(value, "url-safe");
    assert.deepEqual(Buffer.from(await result.blob.arrayBuffer()), Buffer.from([255, 255]));
  }
  const wrapped = await decode("\uFEFF / \t/8 \r\n= \f");
  assert.deepEqual(Buffer.from(await wrapped.blob.arrayBuffer()), Buffer.from([255, 255]));
});

test("data URI inputs use the standard alphabet and treat type metadata as an inert label", async () => {
  const payload = Buffer.from([0, 0, 255, 60, 62, 10]);
  const encoded = await encode(payload, "data-uri", "image/png");
  assert.equal(await encoded.blob.text(), "data:image/png;base64," + payload.toString("base64"));
  const imported = await decode(new Blob([" DATA:Image/PNG;foo=bar;BASE64," + payload.toString("base64")]), "url-safe");
  assert.equal(imported.declaredMedia, "image/png");
  assert.deepEqual(Buffer.from(await imported.blob.arrayBuffer()), payload);
  const empty = await decode("data:;charset=utf-8;base64,");
  assert.equal(empty.blob.size, 0);
  assert.equal(empty.declaredMedia, "text/plain");
  const html = await decode("data:text/html;base64,PHNjcmlwdD4=");
  assert.equal(html.declaredMedia, "text/html");
  assert.equal(chooseExtension(html.declaredMedia), "bin");
  assert.equal(html.blob.type, "application/octet-stream");
  assert.equal(await html.blob.text(), "<script>");
});

test("data URI header, external addresses and percent-encoded payloads have explicit boundaries", async () => {
  for (const [input, error] of [
    ["https://example.test/file", /External URLs/], ["blob:https://example.test/id", /External URLs/],
    ["file:///C:/file", /External URLs/], ["javascript:alert(1)", /External URLs/],
    ["data:text/plain,abc", /ending its header with ;base64/], ["data:base64,AA==", /ending its header with ;base64/],
    ["data:text/plain;base64,%41A==", /outside the selected/], ["data:text/plain;base64,__8", /outside the selected/],
    ["data:text/html;evil=\"value\";base64,AA==", /unsupported media header/],
    ["data:" + "x".repeat(300) + ";base64,AA==", /short media header/],
  ]) {
    await assert.rejects(decode(input, "url-safe"), error);
  }
});

test("download stems are bounded, Unicode-safe and free of extension, traversal and device-name tricks", () => {
  for (const input of ["../evil.exe", "C:\\\\dir\\file\u202epdf", "a/b?c\u0000d", "z".repeat(1024), "\uD800x"]) {
    const stem = safeFileStem(input, "fallback");
    assert.doesNotMatch(stem, /[.<>:"/\\|?*\u0000\u202e\uD800]/);
    assert.ok(Array.from(stem).length <= 56);
  }
  for (const input of ["NUL", "CON", "COM¹", "LPT9", "CONIN$", "CONOUT$", "...", "  "]) {
    assert.equal(safeFileStem(input, "fallback"), "fallback");
  }
  assert.equal(safeFileStem("Re\u0301née 東京😀", "fallback"), "Rénée 東京😀");
  assert.equal(chooseExtension("application/pdf"), "pdf");
  assert.equal(chooseExtension("text/html"), "bin");
  assert.equal(chooseExtension("__proto__"), "bin");
});

test("size limits and malformed text files fail before exposing a partial output", async () => {
  await assert.rejects(encode(new Uint8Array(fileBase64Limits.binaryBytes + 1)), /up to 12 MiB/);
  await assert.rejects(decode("A".repeat(fileBase64Limits.pastedCharacters + 1)), /524,288 characters/);
  await assert.rejects(decode(new Blob([new Uint8Array(fileBase64Limits.textFileBytes + 1)])), /up to 17 MiB/);
  await assert.rejects(decode(new Blob([new Uint8Array([0xff])])), /not valid UTF-8/);
  await assert.rejects(decode(new Blob(["A".repeat(fileBase64Limits.binaryBytes * 4 / 3 + 4)])), /decoded file would exceed 12 MiB/);
});
