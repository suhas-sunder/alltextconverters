export type XmlToTextOptions = {
  collapseWhitespace: boolean;
  keepLineBreaks: boolean;
};

export type XmlToTextResult = {
  text: string;
  stats: {
    inputChars: number;
    outputChars: number;
    textNodes: number;
    parseOk: boolean;
    collapsedWhitespace: boolean;
    keptLineBreaks: boolean;
  };
};

const ZERO_WIDTH_RE =
  /[\u200B\u200C\u200D\u200E\u200F\u2060\uFEFF]/g;

function normalizeWhitespace(s: string, collapse: boolean, keepLineBreaks: boolean) {
  let v = s.replace(ZERO_WIDTH_RE, "");

  if (!keepLineBreaks) {
    // Replace all line breaks with spaces before collapsing.
    v = v.replace(/\r?\n/g, " ");
  }

  if (collapse) {
    // Collapse runs of whitespace (space, tabs, newlines) into a single space.
    v = v.replace(/\s+/g, " ").trim();
  } else {
    // Still trim the outer edges but keep internal spacing as-is.
    v = v.trim();
  }

  return v;
}

function extractTextFromXmlDocument(doc: Document): { raw: string; textNodes: number } {
  // Use a TreeWalker to gather text nodes only.
  const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  let nodeCount = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const value = (node?.nodeValue ?? "").toString();
    if (!value) continue;

    nodeCount += 1;
    parts.push(value);
  }

  return { raw: parts.join("\n"), textNodes: nodeCount };
}

export function xmlToText(input: string, opts: XmlToTextOptions): XmlToTextResult {
  const src = String(input ?? "");
  const inputChars = src.length;

  if (!src.trim()) {
    return {
      text: "",
      stats: {
        inputChars,
        outputChars: 0,
        textNodes: 0,
        parseOk: true,
        collapsedWhitespace: opts.collapseWhitespace,
        keptLineBreaks: opts.keepLineBreaks,
      },
    };
  }

  let parseOk = true;
  let raw = "";
  let textNodes = 0;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(src, "application/xml");

    // Detect parser errors
    const errors = doc.getElementsByTagName("parsererror");
    if (errors && errors.length > 0) {
      parseOk = false;
    } else {
      const extracted = extractTextFromXmlDocument(doc);
      raw = extracted.raw;
      textNodes = extracted.textNodes;
    }
  } catch {
    parseOk = false;
  }

  const normalized = parseOk
    ? normalizeWhitespace(raw, opts.collapseWhitespace, opts.keepLineBreaks)
    : "";

  return {
    text: normalized,
    stats: {
      inputChars,
      outputChars: normalized.length,
      textNodes,
      parseOk,
      collapsedWhitespace: opts.collapseWhitespace,
      keptLineBreaks: opts.keepLineBreaks,
    },
  };
}
