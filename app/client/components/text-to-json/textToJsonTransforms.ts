export type TextToJsonMode = "lines" | "keyValue";

export type TextToJsonOptions = {
  mode: TextToJsonMode;
  ignoreEmptyLines: boolean;
  trimValues: boolean;
  prettyPrint: boolean;
  allowDuplicateKeys: boolean;
};

export type TextToJsonResult = {
  json: string;
  value: unknown;
  warnings: string[];
  stats: {
    inputLines: number;
    keptLines: number;
    parsedPairs: number;
    skippedLines: number;
    duplicateKeys: number;
  };
};

function safeTrim(s: string) {
  return s.replace(/^\s+|\s+$/g, "");
}

function parseLinesToArray(raw: string, ignoreEmpty: boolean) {
  const lines = raw.split(/\r?\n/);
  const arr: string[] = [];
  let kept = 0;
  let skipped = 0;

  for (const line of lines) {
    const trimmed = safeTrim(line);
    if (!trimmed) {
      if (!ignoreEmpty) {
        arr.push("");
        kept += 1;
      } else {
        skipped += 1;
      }
      continue;
    }
    arr.push(trimmed);
    kept += 1;
  }

  return { value: arr, keptLines: kept, skippedLines: skipped, inputLines: lines.length };
}

function parseKeyValueToObject(
  raw: string,
  ignoreEmpty: boolean,
  trimValues: boolean,
  allowDuplicateKeys: boolean,
) {
  const lines = raw.split(/\r?\n/);
  const obj: Record<string, string | string[]> = {};
  const unparsed: string[] = [];

  let kept = 0;
  let skipped = 0;
  let parsedPairs = 0;
  let dupes = 0;

  for (const line of lines) {
    const original = line;
    const trimmedLine = safeTrim(original);

    if (!trimmedLine) {
      if (!ignoreEmpty) {
        unparsed.push("");
        kept += 1;
      } else {
        skipped += 1;
      }
      continue;
    }

    const idx = trimmedLine.indexOf(":");
    if (idx <= 0) {
      unparsed.push(trimmedLine);
      kept += 1;
      continue;
    }

    const key = safeTrim(trimmedLine.slice(0, idx));
    let value = trimmedLine.slice(idx + 1);
    value = trimValues ? safeTrim(value) : value;

    if (!key) {
      unparsed.push(trimmedLine);
      kept += 1;
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      dupes += 1;
      if (!allowDuplicateKeys) {
        // overwrite (most predictable for quick conversions)
        obj[key] = value;
      } else {
        const existing = obj[key];
        if (Array.isArray(existing)) {
          existing.push(value);
          obj[key] = existing;
        } else {
          obj[key] = [existing, value];
        }
      }
    } else {
      obj[key] = value;
    }

    parsedPairs += 1;
    kept += 1;
  }

  const valueOut: any = obj;
  if (unparsed.some((s) => s !== "")) {
    valueOut._unparsed = unparsed.filter((s) => s !== "");
  } else if (!ignoreEmpty && unparsed.length) {
    // preserve that there were empty lines when user asked to keep them
    valueOut._unparsed = unparsed;
  }

  return {
    value: valueOut,
    keptLines: kept,
    skippedLines: skipped,
    inputLines: lines.length,
    parsedPairs,
    duplicateKeys: dupes,
    skippedUnparsed: unparsed.length,
  };
}

export function convertTextToJson(
  input: string,
  options: TextToJsonOptions,
): TextToJsonResult {
  const warnings: string[] = [];
  const raw = String(input ?? "");

  if (!raw.trim()) {
    return {
      json: "",
      value: options.mode === "lines" ? [] : {},
      warnings: [],
      stats: {
        inputLines: 0,
        keptLines: 0,
        parsedPairs: 0,
        skippedLines: 0,
        duplicateKeys: 0,
      },
    };
  }

  try {
    if (options.mode === "lines") {
      const { value, keptLines, skippedLines, inputLines } = parseLinesToArray(
        raw,
        options.ignoreEmptyLines,
      );

      const json = options.prettyPrint
        ? JSON.stringify(value, null, 2)
        : JSON.stringify(value);

      return {
        json,
        value,
        warnings,
        stats: {
          inputLines,
          keptLines,
          parsedPairs: 0,
          skippedLines,
          duplicateKeys: 0,
        },
      };
    }

    const parsed = parseKeyValueToObject(
      raw,
      options.ignoreEmptyLines,
      options.trimValues,
      options.allowDuplicateKeys,
    );

    if (parsed.skippedUnparsed > 0) {
      warnings.push(
        "Some lines did not look like key:value pairs and were placed under _unparsed.",
      );
    }

    if (parsed.duplicateKeys > 0 && !options.allowDuplicateKeys) {
      warnings.push(
        "Duplicate keys were detected. The last value wins (enable the duplicate-keys option to keep all values).",
      );
    }

    const json = options.prettyPrint
      ? JSON.stringify(parsed.value, null, 2)
      : JSON.stringify(parsed.value);

    return {
      json,
      value: parsed.value,
      warnings,
      stats: {
        inputLines: parsed.inputLines,
        keptLines: parsed.keptLines,
        parsedPairs: parsed.parsedPairs,
        skippedLines: parsed.skippedLines,
        duplicateKeys: parsed.duplicateKeys,
      },
    };
  } catch {
    // should never happen, but return safe output
    return {
      json: "",
      value: options.mode === "lines" ? [] : {},
      warnings: ["Conversion failed unexpectedly. Try smaller input."],
      stats: {
        inputLines: raw.split(/\r?\n/).length,
        keptLines: 0,
        parsedPairs: 0,
        skippedLines: 0,
        duplicateKeys: 0,
      },
    };
  }
}
