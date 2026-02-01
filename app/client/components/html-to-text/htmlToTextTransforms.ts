export type HtmlToTextOptions = {
  collapseRepeatedSpaces: boolean;
  preserveLineBreaks: boolean;
  removeZeroWidth: boolean;
  collapseBlankLines: boolean;
};

export type HtmlToTextStats = {
  removedZeroWidth: number;
  inputLength: number;
  outputLength: number;
  strippedNodes: number;
};

const ZERO_WIDTH_RE =
  /[\u200B\u200C\u200D\u2060\uFEFF\u00AD\u180E]/g; // zwsp/zwj/zwnj/word-joiner/bom/soft-hyphen/mvs

function countMatches(s: string, re: RegExp) {
  const m = s.match(re);
  return m ? m.length : 0;
}

export function htmlToText(
  html: string,
  opts: HtmlToTextOptions,
): { text: string; stats: HtmlToTextStats } {
  const input = String(html ?? "");
  const stats: HtmlToTextStats = {
    removedZeroWidth: 0,
    inputLength: input.length,
    outputLength: 0,
    strippedNodes: 0,
  };

  // Parse HTML safely (no execution). DOMParser creates a detached document.
  let doc: Document;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(input, "text/html");
  } catch {
    return {
      text: "",
      stats: { ...stats, outputLength: 0 },
    };
  }

  // Remove content that is never useful for text extraction.
  const selectors = ["script", "style", "noscript", "template"];
  for (const sel of selectors) {
    const nodes = Array.from(doc.querySelectorAll(sel));
    stats.strippedNodes += nodes.length;
    nodes.forEach((n) => n.remove());
  }

  // Prefer innerText for human-readable line breaks. Fall back to textContent.
  let raw = "";
  const body = doc.body;
  if (body && typeof (body as any).innerText === "string") {
    raw = (body as any).innerText as string;
  } else {
    raw = body?.textContent ?? doc.documentElement?.textContent ?? "";
  }

  // Normalize line endings early.
  raw = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  if (opts.removeZeroWidth) {
    stats.removedZeroWidth = countMatches(raw, ZERO_WIDTH_RE);
    raw = raw.replace(ZERO_WIDTH_RE, "");
  }

  let out = raw;

  if (opts.preserveLineBreaks) {
    const lines = out.split("\n").map((line) => {
      let x = line;
      if (opts.collapseRepeatedSpaces) {
        // Collapse tabs + repeated spaces within the line.
        x = x.replace(/[\t ]{2,}/g, " ").replace(/\t/g, " ");
      }
      return x.trimEnd();
    });

    out = lines.join("\n");

    if (opts.collapseBlankLines) {
      // Collapse 3+ blank lines down to 2, then trim outer whitespace.
      out = out.replace(/\n{3,}/g, "\n\n").trim();
    } else {
      out = out.trim();
    }
  } else {
    // Collapse all whitespace to a single space.
    out = out.replace(/\s+/g, " ");
    out = opts.collapseRepeatedSpaces ? out.replace(/ {2,}/g, " ") : out;
    out = out.trim();
  }

  stats.outputLength = out.length;
  return { text: out, stats };
}
