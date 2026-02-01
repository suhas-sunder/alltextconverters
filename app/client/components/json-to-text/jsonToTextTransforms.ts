export type JsonToTextOptions = {
  separator: "newline" | "space";
  includeKeys: boolean;
};

export type JsonToTextResult = {
  ok: boolean;
  text: string;
  extractedCount: number;
  skippedCount: number;
  error?: string;
};

const DEFAULT_OPTIONS: JsonToTextOptions = {
  separator: "newline",
  includeKeys: false,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function stringifyPrimitive(v: unknown) {
  if (v === null) return "null";
  if (v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return "";
}

export function jsonToText(
  raw: string,
  options?: Partial<JsonToTextOptions>,
): JsonToTextResult {
  const opts: JsonToTextOptions = { ...DEFAULT_OPTIONS, ...(options ?? {}) };
  const sep = opts.separator === "space" ? " " : "\n";

  if (!raw || !raw.trim()) {
    return { ok: true, text: "", extractedCount: 0, skippedCount: 0 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      text: "",
      extractedCount: 0,
      skippedCount: 0,
      error: "Invalid JSON. Paste a JSON object or array (or upload a .json file).",
    };
  }

  const out: string[] = [];
  let extracted = 0;
  let skipped = 0;

  const visit = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) visit(value[i], path ? `${path}[${i}]` : `[${i}]`);
      return;
    }

    if (isPlainObject(value)) {
      for (const [k, v] of Object.entries(value)) {
        const nextPath = path ? `${path}.${k}` : k;
        visit(v, nextPath);
      }
      return;
    }

    const s = stringifyPrimitive(value);
    if (s === "") {
      skipped += 1;
      return;
    }

    extracted += 1;
    if (opts.includeKeys && path) out.push(`${path}: ${s}`);
    else out.push(s);
  };

  visit(parsed, "");

  // Normalize whitespace in extracted fragments for "space" output mode.
  const cleaned = out
    .map((v) => (opts.separator === "space" ? v.replace(/\s+/g, " ").trim() : v))
    .filter((v) => v.length > 0);

  return {
    ok: true,
    text: cleaned.join(sep),
    extractedCount: extracted,
    skippedCount: skipped,
  };
}
