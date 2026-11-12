import { findLoneSurrogate, utf8Bytes } from "./bytes";

export const jsonFormatLimits = { inputBytes: 1024 * 1024, outputBytes: 4 * 1024 * 1024, depth: 128, entries: 40, preview: 16 * 1024 } as const;
export type JsonIndent = "two" | "four" | "tab";
export type JsonOperation = "format" | "minify" | "validate";
export type JsonFormatRequest = { source: string; operation: JsonOperation; indent: JsonIndent };
export type JsonValueType = "object" | "array" | "string" | "number" | "boolean" | "null";
type Position = { offset: number; line: number; column: number };
type StructureEntry = { name: string; type: JsonValueType; start: number; end: number };
export type JsonFormatResult = {
  output: string | null;
  sourceBytes: number;
  outputBytes: number | null;
  root: JsonValueType;
  topLevelCount: number;
  entries: StructureEntry[];
  depth: number;
  duplicates: number;
};
export type JsonFormatResponse = { result: JsonFormatResult } | { error: { message: string; position?: Position } };

class JsonFormatError extends Error {
  constructor(message: string, readonly offset?: number) {
    super(message);
  }
}

function positionAt(source: string, offset: number): Position {
  let line = 1;
  let column = 1;
  for (let index = 0; index < offset; index++) {
    const character = source[index];
    if (character === "\r" || character === "\n") {
      if (character === "\r" && source[index + 1] === "\n") index++;
      line++;
      column = 1;
    } else column++;
  }
  return { offset, line, column };
}

const indentation: Record<JsonIndent, string> = { two: "  ", four: "    ", tab: "\t" };
const isDigit = (character: string) => character >= "0" && character <= "9";
const expansionError = "The result exceeds 4 MiB. Try minifying the document or using a narrower indentation.";

/**
 * Validate the RFC 8259 grammar while emitting only original token spans and
 * formatting whitespace. Never round-trip the document through JS values.
 */
function scanJson({ source, operation, indent }: JsonFormatRequest, sourceBytes: number): JsonFormatResult {
  let index = 0;
  let depth = 0;
  let duplicates = 0;
  let topLevelCount = 0;
  const entries: StructureEntry[] = [];
  const chunks: string[] = [];
  let chunk = "";
  let outputSize = 0;

  function fail(message: string, offset = index): never {
    throw new JsonFormatError(message, offset);
  }

  function write(text: string) {
    if (operation === "validate") return;
    outputSize += text.length;
    if (outputSize > jsonFormatLimits.outputBytes) {
      throw new JsonFormatError(expansionError);
    }
    chunk += text;
    if (chunk.length >= 8192) {
      chunks.push(chunk);
      chunk = "";
    }
  }

  function newline(level: number) {
    if (operation === "format") write("\n" + indentation[indent].repeat(level));
  }

  function whitespace() {
    while (source[index] === " " || source[index] === "\t" || source[index] === "\r" || source[index] === "\n") index++;
  }

  function requireCharacter(character: string, message: string) {
    if (source[index] !== character) fail(message);
    index++;
  }

  function readString() {
    const start = index;
    requireCharacter('"', "Use double quotes around object keys.");
    while (index < source.length) {
      const character = source[index++];
      if (character === '"') return source.slice(start, index);
      if (character < " ") fail("Escape control characters inside strings.", index - 1);
      if (character !== "\\") continue;

      const escape = source[index++];
      if (escape === "u") {
        for (let digit = 0; digit < 4; digit++) {
          if (index >= source.length || !/[0-9A-Fa-f]/.test(source[index])) {
            fail("A Unicode escape needs four hexadecimal digits.");
          }
          index++;
        }
      } else if (!escape || !'"\\/bfnrt'.includes(escape)) {
        fail("This string contains an invalid escape.", index - 1);
      }
    }
    return fail("Close this string with a double quote.");
  }

  function requireDigits(message: string) {
    if (!isDigit(source[index])) fail(message);
    do index++; while (isDigit(source[index]));
  }

  function readNumber() {
    const start = index;
    if (source[index] === "-") index++;
    if (source[index] === "0") {
      index++;
      if (isDigit(source[index])) fail("A number cannot begin with a leading zero.");
    } else requireDigits("A number needs at least one digit.");
    if (source[index] === ".") {
      index++;
      requireDigits("A decimal point must be followed by a digit.");
    }
    if (source[index] === "e" || source[index] === "E") {
      index++;
      if (source[index] === "+" || source[index] === "-") index++;
      requireDigits("An exponent must contain at least one digit.");
    }
    write(source.slice(start, index));
  }

  function readLiteral(literal: "true" | "false" | "null") {
    for (const character of literal) requireCharacter(character, "Use a complete true, false, or null value.");
    write(literal);
  }

  function readCollection(level: number, object: boolean) {
    if (level >= jsonFormatLimits.depth) fail("The document exceeds 128 nested containers.");
    depth = Math.max(depth, level + 1);
    const closing = object ? "}" : "]";
    const keys = object ? new Set<string>() : null;
    write(source[index++]);
    whitespace();
    let count = 0;

    if (source[index] !== closing) {
      while (true) {
        newline(level + 1);
        let name = String(count);
        if (keys) {
          const raw = readString();
          // Only the key token is decoded to detect equivalent escaped names.
          // The original token is emitted and no property is assigned to an object.
          const key: string = JSON.parse(raw);
          if (keys.has(key)) duplicates++;
          else keys.add(key);
          name = raw;
          write(raw);
          whitespace();
          requireCharacter(":", "Put a colon after the object key.");
          write(operation === "format" ? ": " : ":");
          whitespace();
        }
        const start = index;
        const type = readValue(level + 1);
        if (level === 0 && entries.length < jsonFormatLimits.entries) {
          const clipped = name.length > 96 ? name.slice(0, 95).replace(/[\uD800-\uDBFF]$/, "") + "…" : name;
          entries.push({ name: clipped, type, start, end: index });
        }
        count++;
        whitespace();
        if (source[index] === closing) break;
        requireCharacter(",", object ? "Separate object members with a comma or close the object." : "Separate array items with a comma or close the array.");
        write(",");
        whitespace();
        if (source[index] === closing) fail("Remove the trailing comma.");
      }
      newline(level);
    }
    write(source[index++]);
    if (level === 0) topLevelCount = count;
  }

  function readValue(level: number): JsonValueType {
    const character = source[index];
    if (character === "{") { readCollection(level, true); return "object"; }
    if (character === "[") { readCollection(level, false); return "array"; }
    if (character === '"') { write(readString()); return "string"; }
    if (character === "-" || isDigit(character)) { readNumber(); return "number"; }
    if (character === "t" || character === "f") {
      readLiteral(character === "t" ? "true" : "false");
      return "boolean";
    }
    if (character === "n") { readLiteral("null"); return "null"; }
    return fail("Expected a JSON value.");
  }

  whitespace();
  if (source[index] === "\uFEFF") fail("Remove the leading byte order mark before validating this JSON.");
  const root = readValue(0);
  whitespace();
  if (index !== source.length) fail("Unexpected content after the JSON value.");
  if (operation === "format") write("\n");
  const output = operation === "validate" ? null : chunks.join("") + chunk;
  const outputBytes = output === null ? null : utf8Bytes(output).length;
  if (outputBytes !== null && outputBytes > jsonFormatLimits.outputBytes) {
    throw new JsonFormatError(expansionError);
  }
  return { output, outputBytes, sourceBytes, root, topLevelCount, entries, depth, duplicates };
}

export function formatJson(request: JsonFormatRequest): JsonFormatResponse {
  const { source } = request;
  const sizeError = { error: { message: "Use at most 1 MiB of UTF-8 JSON input." } };
  if (source.length > jsonFormatLimits.inputBytes) return sizeError;
  const invalid = findLoneSurrogate(source);
  if (invalid >= 0) {
    return { error: { message: "The input contains an unpaired UTF-16 surrogate.", position: positionAt(source, invalid) } };
  }
  const sourceBytes = utf8Bytes(source).length;
  if (sourceBytes > jsonFormatLimits.inputBytes) return sizeError;
  try {
    return { result: scanJson(request, sourceBytes) };
  } catch (error) {
    if (!(error instanceof JsonFormatError)) throw error;
    return {
      error: {
        message: error.message,
        position: error.offset === undefined ? undefined : positionAt(source, error.offset),
      },
    };
  }
}
