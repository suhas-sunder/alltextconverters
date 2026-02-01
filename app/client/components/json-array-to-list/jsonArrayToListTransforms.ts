export type JsonArrayToListOptions = {
  ignoreEmpty: boolean;
  stringifyObjects: boolean;
  trimValues: boolean;
};

export type JsonArrayToListResult = {
  ok: true;
  output: string;
  stats: {
    inputChars: number;
    itemsInArray: number;
    linesOut: number;
    ignoredEmpty: number;
    stringifiedComplex: number;
  };
} | {
  ok: false;
  error: string;
};

function isPrimitive(v: unknown) {
  return (
    v === null ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  );
}

export function jsonArrayToList(
  input: string,
  opts: JsonArrayToListOptions,
): JsonArrayToListResult {
  const raw = input ?? "";
  const inputChars = raw.length;

  if (!raw.trim()) {
    return {
      ok: true,
      output: "",
      stats: {
        inputChars,
        itemsInArray: 0,
        linesOut: 0,
        ignoredEmpty: 0,
        stringifiedComplex: 0,
      },
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      error:
        "That does not look like valid JSON. Paste a JSON array like [\"a\", \"b\", \"c\"].",
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      ok: false,
      error:
        "JSON parsed successfully, but it is not an array. This tool expects a top-level JSON array, for example [1, 2, 3].",
    };
  }

  let ignoredEmpty = 0;
  let stringifiedComplex = 0;

  const lines: string[] = [];
  for (const item of parsed) {
    let s = "";

    if (isPrimitive(item)) {
      s = String(item);
    } else if (opts.stringifyObjects) {
      try {
        s = JSON.stringify(item);
        stringifiedComplex += 1;
      } catch {
        s = String(item);
        stringifiedComplex += 1;
      }
    } else {
      // Without stringifying, skip objects/arrays to avoid confusing output.
      continue;
    }

    if (opts.trimValues) s = s.trim();

    if (opts.ignoreEmpty && s.length === 0) {
      ignoredEmpty += 1;
      continue;
    }

    lines.push(s);
  }

  return {
    ok: true,
    output: lines.join("\n"),
    stats: {
      inputChars,
      itemsInArray: parsed.length,
      linesOut: lines.length,
      ignoredEmpty,
      stringifiedComplex,
    },
  };
}
