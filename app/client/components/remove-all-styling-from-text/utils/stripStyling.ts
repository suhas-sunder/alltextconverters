export type StripOptions = {
  trim: boolean;
  trimLines: boolean;
  removeWhitespace: boolean;
  stripHtmlTags: boolean;
  stripExtraSpaces: boolean;
  stripEmptyLines: boolean;
  stripTabs: boolean;
  removeNonAlphanumeric: boolean;
  removeEmojis: boolean;
  removePunctuation: boolean;
};

export const DEFAULT_OPTS: StripOptions = {
  trim: true,
  trimLines: false,
  removeWhitespace: false,
  stripHtmlTags: true,
  stripExtraSpaces: true,
  stripEmptyLines: false,
  stripTabs: true,
  removeNonAlphanumeric: false,
  removeEmojis: false,
  removePunctuation: false,
};

function normalizeNewlines(text: string) {
  return text.replace(/\r?\n/g, "\n");
}

function isProbablyHtml(input: string) {
  const s = input.trim();
  if (!s) return false;
  return /<\s*\/?\s*[a-zA-Z][^>]*>/.test(s);
}

function trimLineEnds(text: string) {
  return text
    .split("\n")
    .map((l) => l.replace(/[\t \u00a0]+$/g, ""))
    .join("\n");
}

function trimLinesBothSides(text: string) {
  return text
    .split("\n")
    .map((l) =>
      l.replace(/^[\t \u00a0]+/g, "").replace(/[\t \u00a0]+$/g, ""),
    )
    .join("\n");
}

function collapseBlankLines(text: string) {
  // Keep at most two consecutive newlines (paragraph break)
  return text.replace(/\n{3,}/g, "\n\n");
}

function collapseExtraSpaces(text: string) {
  let t = text.replace(/\u00a0/g, " ");
  t = t.replace(/[ \t]{2,}/g, " ");
  t = t.replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n");
  return t;
}

function stripEmptyLines(text: string) {
  const lines = text.split("\n");
  const kept = lines.filter((l) => l.trim().length > 0);
  return kept.join("\n");
}

function removeWhitespaceExceptNewlines(text: string) {
  // Remove spaces/tabs but preserve newlines (core behavior)
  return text.replace(/[ \t\u00a0]+/g, "");
}

function stripEmojis(text: string) {
  try {
    // Includes most emoji/pictographic symbols.
    return text.replace(/\p{Extended_Pictographic}/gu, "");
  } catch {
    return text;
  }
}

function stripPunctuation(text: string) {
  try {
    return text.replace(/\p{P}+/gu, "");
  } catch {
    return text.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+/g, "");
  }
}

function stripNonAlphanumeric(text: string) {
  try {
    // Keep letters, numbers, and whitespace (including newlines)
    return text.replace(/[^\p{L}\p{N}\s]+/gu, "");
  } catch {
    return text.replace(/[^a-zA-Z0-9\s]+/g, "");
  }
}

function applyPostFilters(text: string, opts: StripOptions) {
  let t = normalizeNewlines(text || "").replace(/\u00a0/g, " ");

  if (opts.stripTabs) t = t.replace(/\t/g, " ");

  if (opts.removeEmojis) t = stripEmojis(t);
  if (opts.removePunctuation) t = stripPunctuation(t);
  if (opts.removeNonAlphanumeric) t = stripNonAlphanumeric(t);

  if (opts.stripExtraSpaces) t = collapseExtraSpaces(t);

  if (opts.trimLines) t = trimLinesBothSides(t);
  else t = trimLineEnds(t);

  if (opts.stripEmptyLines) t = stripEmptyLines(t);
  if (opts.removeWhitespace) t = removeWhitespaceExceptNewlines(t);

  if (opts.trim) t = t.trim();
  return t;
}

function ensureEndsWithNewline(out: string[], count: number) {
  const current = out.join("");
  let tail = 0;
  for (let i = current.length - 1; i >= 0; i--) {
    if (current[i] !== "\n") break;
    tail++;
  }
  const needed = count - tail;
  if (needed <= 0) return;
  out.push("\n".repeat(needed));
}

function walkNode(node: Node, out: string[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const v = (node.nodeValue ?? "").replace(/\u00a0/g, " ");
    out.push(v);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  if (tag === "script" || tag === "style" || tag === "noscript") return;

  if (tag === "br") {
    out.push("\n");
    return;
  }

  const isBlock =
    tag === "p" ||
    tag === "div" ||
    tag === "section" ||
    tag === "article" ||
    tag === "header" ||
    tag === "footer" ||
    tag === "main" ||
    tag === "aside" ||
    tag === "nav" ||
    tag === "blockquote" ||
    tag === "pre" ||
    tag === "table" ||
    tag === "thead" ||
    tag === "tbody" ||
    tag === "tfoot" ||
    tag === "tr" ||
    tag === "ul" ||
    tag === "ol" ||
    tag === "li" ||
    tag === "hr" ||
    /^h[1-6]$/.test(tag);

  if (tag === "li") {
    // Preserve line breaks and paragraph breaks, but do not emit any bullet marker.
    ensureEndsWithNewline(out, 1);
    for (const child of Array.from(el.childNodes)) walkNode(child, out);
    ensureEndsWithNewline(out, 1);
    return;
  }

  if (tag === "pre") {
    ensureEndsWithNewline(out, 1);
    const t = (el.textContent ?? "").replace(/\u00a0/g, " ");
    out.push(normalizeNewlines(t));
    ensureEndsWithNewline(out, 1);
    return;
  }

  if (tag === "hr") {
    ensureEndsWithNewline(out, 2);
    return;
  }

  if (isBlock) {
    ensureEndsWithNewline(out, tag === "p" ? 2 : 1);
  }

  for (const child of Array.from(el.childNodes)) {
    walkNode(child, out);
  }

  if (isBlock) {
    ensureEndsWithNewline(out, tag === "p" ? 2 : 1);
  }
}

export function stripAllStylingToText(
  input: string,
  options?: Partial<StripOptions>,
): { text: string; info?: string } {
  const opts: StripOptions = { ...DEFAULT_OPTS, ...(options ?? {}) };
  const raw = normalizeNewlines(input || "");
  if (!raw.trim()) return { text: "" };

  // If user disables HTML stripping, treat everything as plain text and apply filters only.
  if (!opts.stripHtmlTags) {
    const t = applyPostFilters(raw, opts);
    const finalText = opts.stripEmptyLines ? collapseBlankLines(t) : t;
    return { text: finalText };
  }

  // If it does not look like HTML, still apply filters (this is where symbol characters are removed when selected).
  if (typeof DOMParser === "undefined" || !isProbablyHtml(raw)) {
    let t = applyPostFilters(raw, opts);
    if (opts.stripEmptyLines === false) {
      // Still cap runaway blank lines for a cleaner result while preserving paragraphs.
      t = collapseBlankLines(t);
    }
    return { text: t };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "text/html");
  const out: string[] = [];
  const body = doc.body;

  for (const child of Array.from(body.childNodes)) {
    walkNode(child, out);
  }

  let text = out.join("");
  text = normalizeNewlines(text);

  text = applyPostFilters(text, opts);

  // Always prevent extreme paragraph spam while preserving intended breaks.
  text = collapseBlankLines(text);

  return {
    text,
    info:
      "Formatting stripped locally. HTML tags, inline styles, classes, and font markup were removed.",
  };
}
