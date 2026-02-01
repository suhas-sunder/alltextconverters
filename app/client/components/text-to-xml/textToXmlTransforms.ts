export type TextToXmlOptions = {
  rootTag: string;
  itemTag: string;
  splitByLines: boolean;
  includeEmptyLines: boolean;
  addIndexAttribute: boolean;
};

export type TextToXmlResult = {
  xml: string;
  warnings: string[];
  stats: {
    inputChars: number;
    lines: number;
    emittedItems: number;
    emptyLinesEmitted: number;
  };
};

const DEFAULTS: TextToXmlOptions = {
  rootTag: "root",
  itemTag: "line",
  splitByLines: true,
  includeEmptyLines: false,
  addIndexAttribute: false,
};

export function getDefaultTextToXmlOptions(): TextToXmlOptions {
  return { ...DEFAULTS };
}

export function escapeXmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

// Very small, deterministic validation. This is not a full XML Name parser.
// It exists to prevent obviously invalid output like spaces and leading digits.
export function isValidXmlTagName(tag: string): boolean {
  const t = (tag || "").trim();
  // Basic rules: start with letter or underscore, then letters/digits/_/-/.
  // Disallow colon to avoid namespace confusion for casual use.
  return /^[A-Za-z_][A-Za-z0-9_.-]*$/.test(t);
}

function normalizeNewlines(s: string): string {
  return (s || "").replace(/\r\n?/g, "\n");
}

export function textToXml(
  input: string,
  opts?: Partial<TextToXmlOptions>,
): TextToXmlResult {
  const options: TextToXmlOptions = { ...DEFAULTS, ...(opts || {}) };
  const warnings: string[] = [];

  const rootTag = (options.rootTag || "").trim() || DEFAULTS.rootTag;
  const itemTag = (options.itemTag || "").trim() || DEFAULTS.itemTag;

  if (!isValidXmlTagName(rootTag)) {
    warnings.push(
      "Root tag name is not a simple valid XML tag. Falling back to \"root\".",
    );
  }
  if (!isValidXmlTagName(itemTag)) {
    warnings.push(
      "Item tag name is not a simple valid XML tag. Falling back to \"line\".",
    );
  }

  const safeRoot = isValidXmlTagName(rootTag) ? rootTag : DEFAULTS.rootTag;
  const safeItem = isValidXmlTagName(itemTag) ? itemTag : DEFAULTS.itemTag;

  const normalized = normalizeNewlines(input || "");
  const stats = {
    inputChars: normalized.length,
    lines: 0,
    emittedItems: 0,
    emptyLinesEmitted: 0,
  };

  const indent = "  ";
  const parts: string[] = [];
  parts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  parts.push(`<${safeRoot}>`);

  if (!options.splitByLines) {
    const text = escapeXmlText(normalized);
    const attr = options.addIndexAttribute ? ` index="1"` : "";
    parts.push(`${indent}<${safeItem}${attr}>${text}</${safeItem}>`);
    stats.lines = normalized ? 1 : 0;
    stats.emittedItems = normalized ? 1 : 0;
    parts.push(`</${safeRoot}>`);
    return { xml: parts.join("\n"), warnings, stats };
  }

  const lines = normalized.split("\n");
  stats.lines = lines.length;

  lines.forEach((raw, idx) => {
    const isEmpty = raw.length === 0;
    if (isEmpty && !options.includeEmptyLines) return;

    const text = escapeXmlText(raw);
    const indexAttr = options.addIndexAttribute ? ` index="${idx + 1}"` : "";
    parts.push(`${indent}<${safeItem}${indexAttr}>${text}</${safeItem}>`);
    stats.emittedItems += 1;
    if (isEmpty) stats.emptyLinesEmitted += 1;
  });

  parts.push(`</${safeRoot}>`);

  if (stats.emittedItems === 0 && normalized.trim().length > 0) {
    warnings.push(
      "No XML items were emitted. Check your settings (for example, include empty lines).",
    );
  }

  return { xml: parts.join("\n"), warnings, stats };
}
