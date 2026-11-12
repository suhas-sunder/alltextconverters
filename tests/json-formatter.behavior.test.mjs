import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles: [bundle] } = await build({
  entryPoints: [fileURLToPath(new URL("../app/client/text/json-formatter.ts", import.meta.url))],
  bundle: true, write: false, format: "esm",
});
const { formatJson, jsonFormatLimits } = await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));

const execute = (source, operation = "format", indent = "two") => formatJson({ source, operation, indent });
function run(source, operation, indent) {
  const response = execute(source, operation, indent);
  assert.ok("result" in response, response.error?.message);
  return response.result;
}

test("JSON formatting changes structure whitespace while retaining exact numeric and string lexemes", () => {
  const source = String.raw`{"10" : 900719925474099312345, "2": -0, "Z":[1.2300E+09,1e400,"\u00E9","a\/b","東京 😀"],"active":true}`;
  const expected = [
    "{", '  "10": 900719925474099312345,', '  "2": -0,', '  "Z": [',
    "    1.2300E+09,", "    1e400,", String.raw`    "\u00E9",`, String.raw`    "a\/b",`, '    "東京 😀"',
    "  ],", '  "active": true', "}", "",
  ].join("\n");
  const result = run(source);
  assert.equal(result.output, expected);
  assert.equal(result.sourceBytes, Buffer.byteLength(source));
  assert.equal(result.outputBytes, Buffer.byteLength(expected));
  assert.equal(run(source, "minify").output, String.raw`{"10":900719925474099312345,"2":-0,"Z":[1.2300E+09,1e400,"\u00E9","a\/b","東京 😀"],"active":true}`);
  assert.equal(run(source, "validate").output, null);
});

test("all indentation styles handle nested empty values and scalar roots", () => {
  const source = '{ "a": { "x": [] }, "b": [ {}, null, false ] }';
  assert.match(run(source, "format", "two").output, /\n  "a": \{\n    "x": \[\]\n  \}/);
  assert.match(run(source, "format", "four").output, /\n    "a": \{\n        "x": \[\]\n    \}/);
  assert.match(run(source, "format", "tab").output, /\n\t"a": \{\n\t\t"x": \[\]\n\t\}/);
  for (const [source, type] of [["null", "null"], ["true", "boolean"], ["-0", "number"], ['"safe"', "string"]]) {
    assert.equal(run(source).root, type);
    assert.equal(run(source).output, source + "\n");
  }
  assert.equal(run(" [ ] ").output, "[]\n");
  assert.equal(run(" { } ").output, "{}\n");
});

test("duplicate decoded key names retain all raw spellings, order, and source locations", () => {
  const source = String.raw`{"a":0,"\u0061":-0,"__proto__":{"isSafe":true},"nested":{"v":2,"v":3},"constructor":null}`;
  const result = run(source, "minify");
  assert.equal(result.output, source);
  assert.equal(result.duplicates, 2);
  assert.equal(result.depth, 2);
  assert.equal(result.topLevelCount, 5);
  assert.deepEqual(result.entries.map(({ name, type }) => [name, type]), [
    ['"a"', "number"], [String.raw`"\u0061"`, "number"], ['"__proto__"', "object"], ['"nested"', "object"], ['"constructor"', "null"],
  ]);
  assert.deepEqual(result.entries.map(({ start, end }) => source.slice(start, end)), ["0", "-0", '{"isSafe":true}', '{"v":2,"v":3}', "null"]);
  assert.equal({}.isSafe, undefined);
});

test("structure preview caps rows and long key labels without losing offset coverage", () => {
  const source = "{" + Array.from({ length: 90 }, (_, i) => `"field-${i}-${"x".repeat(150)}":${i}`).join(",") + "}";
  const result = run(source, "validate");
  assert.equal(result.topLevelCount, 90);
  assert.equal(result.entries.length, jsonFormatLimits.entries);
  assert.match(result.entries[0].name, /…$/u);
  assert.equal(result.outputBytes, null);
  const array = run("[true,false,{},[]]", "validate");
  assert.deepEqual(array.entries.map(({ name, type }) => [name, type]), [
    ["0", "boolean"], ["1", "boolean"], ["2", "object"], ["3", "array"],
  ]);
});

test("invalid JSON reports the first useful offset and safe line and column across line endings", () => {
  const fixtures = [
    ['{\r\n  "record": 1,\r\n}', 3, 1, /trailing comma/],
    ['{\r  noQuotes: true\r}', 2, 3, /double quotes/],
    ['[\n  4E-\n]', 2, 6, /exponent/],
    ['[3.]', 1, 4, /decimal point/],
    ['[01]', 1, 3, /leading zero/],
    [String.raw`"\q"`, 1, 3, /invalid escape/],
    [String.raw`"\u00GX"`, 1, 6, /hexadecimal/],
    ['"a\u0001b"', 1, 3, /control/],
    ["true extra", 1, 6, /Unexpected content/],
    ['{ "a" 2 }', 1, 7, /colon/],
    ["[1 2]", 1, 4, /comma/],
    ["\uFEFF{}", 1, 1, /byte order mark/],
    ["", 1, 1, /Expected a JSON value/],
  ];
  for (const [source, line, column, message] of fixtures) {
    assert.throws(() => JSON.parse(source));
    const { error } = execute(source);
    assert.match(error.message, message);
    assert.equal(error.position.line, line);
    assert.equal(error.position.column, column);
    assert.ok(error.position.offset >= 0 && error.position.offset <= source.length);
  }
  assert.doesNotMatch(execute('{"a": privateValue}').error.message, /privateValue/);
});

test("bounds apply to UTF-8 bytes, depth, and formatted expansion independently", () => {
  const max = jsonFormatLimits.inputBytes;
  const exact = '"' + "é".repeat((max - 2) / 2) + '"';
  assert.equal(run(exact, "validate").sourceBytes, max);
  assert.match(execute(exact + " ").error.message, /1 MiB/);
  assert.match(execute('"\uD800"').error.message, /surrogate/);
  assert.deepEqual(execute('["first",\r\n"\uD800"]').error.position, { offset: 12, line: 2, column: 2 });
  assert.equal(run(String.raw`"\uD800"`, "minify").output, String.raw`"\uD800"`);
  assert.equal(run("[".repeat(128) + "null" + "]".repeat(128), "validate").depth, 128);
  assert.match(execute("[".repeat(129) + "0" + "]".repeat(129)).error.message, /128 nested/);
  const expanded = "[".repeat(120) + "1,".repeat(10_000) + "0" + "]".repeat(120);
  assert.match(execute(expanded, "format", "four").error.message, /4 MiB/);
  assert.equal(run(expanded, "validate").depth, 120);
  assert.equal(run(expanded, "minify").output, expanded);
});

test("300 seeded generated JSON documents round-trip and keep their compact lexical form", () => {
  let seed = 0x9e3779b9;
  function random(mod) {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
    return (seed >>> 8) % mod;
  }
  const atoms = [null, true, false, 0, -0.123, 8e20, "é\n", "東京", 'quote"and\\slash', "👩‍💻", "\u2028"];
  function document(depth) {
    const type = random(depth ? 5 : 2);
    if (type < 2) return atoms[random(atoms.length)];
    if (type === 2) return Array.from({ length: random(5) }, () => document(depth - 1));
    return Object.fromEntries(Array.from({ length: random(5) }, (_, index) => ["k_" + index + atoms[random(atoms.length)], document(depth - 1)]));
  }
  for (let index = 0; index < 300; index++) {
    const value = document(5);
    const source = " \r\n" + JSON.stringify(value, null, 2) + "\r\n ";
    const pretty = run(source, "format", ["two", "four", "tab"][index % 3]).output;
    assert.deepEqual(JSON.parse(pretty), value);
    assert.equal(run(pretty, "minify").output, JSON.stringify(value));
  }
});
