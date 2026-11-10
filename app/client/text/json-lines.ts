export type JsonLinesDirection = "array-to-lines" | "lines-to-array";
export const jsonLinesMaxBytes = 2 * 1024 * 1024;
const maxRecords = 20_000;

type Result = { ok: true; output: string; count: number } | { ok: false; error: string };

function trimJsonWhitespace(value: string) {
  return value.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, "");
}

function linesToArray(input: string): Result {
  const records = input === "" ? [] : input.split(/\r?\n/);
  if (records.at(-1) === "") records.pop();
  if (records.length > maxRecords) return { ok: false, error: "Use at most 20,000 records." };

  for (const [index, record] of records.entries()) {
    try {
      JSON.parse(record);
    } catch {
      return { ok: false, error: `Line ${index + 1} must contain one valid JSON value.` };
    }
  }

  const output = records.length ? `[\n${records.join(",\n")}\n]` : "[]";
  return { ok: true, output, count: records.length };
}

function arrayToLines(input: string): Result {
  const source = trimJsonWhitespace(input);
  if (!source.startsWith("[")) return { ok: false, error: "Enter a JSON array." };
  try {
    JSON.parse(source);
  } catch {
    return { ok: false, error: "The input is not a valid JSON array." };
  }

  // Split the validated array without reserializing numbers, object keys or strings.
  const records: string[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let segmentStart = 1;
  let fragments: string[] = [];

  for (let index = 1; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "[" || character === "{") depth += 1;
    else if (depth > 0 && (character === "]" || character === "}")) depth -= 1;
    else if (depth === 0 && (character === "," || character === "]")) {
      fragments.push(source.slice(segmentStart, index));
      const record = trimJsonWhitespace(fragments.join(""));
      if (record) records.push(record);
      if (records.length > maxRecords) return { ok: false, error: "Use at most 20,000 records." };
      fragments = [];
      segmentStart = index + 1;
    } else if (character === "\n" || character === "\r") {
      fragments.push(source.slice(segmentStart, index));
      segmentStart = index + 1;
    }
  }

  return { ok: true, output: records.length ? `${records.join("\n")}\n` : "", count: records.length };
}

export function convertJsonLines(input: string, direction: JsonLinesDirection): Result {
  if (input.length > jsonLinesMaxBytes || new TextEncoder().encode(input).length > jsonLinesMaxBytes) {
    return { ok: false, error: "Use at most 2 MiB of UTF-8 text." };
  }
  return direction === "array-to-lines" ? arrayToLines(input) : linesToArray(input);
}
