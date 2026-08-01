export type HtmlToTextOptions = {
  preserveParagraphs: boolean;
  preserveListMarkers: boolean;
  preserveTableStructure: boolean;
  appendLinkUrls: boolean;
  collapseBlankLines: boolean;
};

export type HtmlToTextStats = { inputLength: number; outputLength: number; strippedNodes: number };

const ignored = new Set([
  "script", "style", "template", "noscript", "iframe", "frame", "object", "embed",
  "meta", "link", "head", "img", "picture", "source", "audio", "video",
]);
const blocks = new Set([
  "address", "article", "aside", "blockquote", "div", "dl", "fieldset", "figcaption",
  "figure", "footer", "header", "h1", "h2", "h3", "h4", "h5", "h6", "main", "nav",
  "p", "pre", "section",
]);

export const DEFAULT_HTML_TO_TEXT_OPTIONS: HtmlToTextOptions = {
  preserveParagraphs: true,
  preserveListMarkers: true,
  preserveTableStructure: true,
  appendLinkUrls: false,
  collapseBlankLines: true,
};

export function isSafeLinkUrl(href: string): boolean {
  const value = href.trim();
  if (!value) return false;
  const scheme = value.match(/^([A-Za-z][A-Za-z0-9+.-]*):/)?.[1]?.toLowerCase();
  if (scheme && !["http", "https", "mailto", "tel"].includes(scheme)) return false;
  return /^(?:https?:|mailto:|tel:|\/|#|\.|[A-Za-z0-9])/i.test(value);
}

export function htmlToText(html: string, partialOptions: Partial<HtmlToTextOptions> = {}) {
  const input = String(html ?? "");
  const options = { ...DEFAULT_HTML_TO_TEXT_OPTIONS, ...partialOptions };
  const stats: HtmlToTextStats = { inputLength: input.length, outputLength: 0, strippedNodes: 0 };
  if (!input) return { text: "", stats };
  if (typeof DOMParser === "undefined") throw new Error("HTML parsing is unavailable in this browser.");

  const csp = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src \'none\'; media-src \'none\'; frame-src \'none\'; style-src \'none\'">';
  const document = new DOMParser().parseFromString(`${csp}${input}`, "text/html");
  const output: string[] = [];
  const trailingBreaks = () => output.join("").match(/\n*$/)?.[0].length ?? 0;
  const addBreak = (count = 1) => {
    const missing = count - trailingBreaks();
    if (missing > 0) output.push("\n".repeat(missing));
  };

  const walk = (node: Node, orderedIndex = 1) => {
    if (node.nodeType === 3) { output.push(node.nodeValue ?? ""); return; }
    if (node.nodeType !== 1) return;
    const element = node as Element;
    const tag = element.tagName.toLowerCase();
    if (ignored.has(tag) || element.hasAttribute("hidden") || element.getAttribute("aria-hidden") === "true") {
      stats.strippedNodes += 1;
      return;
    }
    if (tag === "br") { addBreak(); return; }
    if (tag === "tr") addBreak();
    if ((tag === "td" || tag === "th") && options.preserveTableStructure && output.length && trailingBreaks() === 0) output.push("\t");
    if (tag === "li") {
      addBreak();
      if (options.preserveListMarkers) output.push(element.parentElement?.tagName.toLowerCase() === "ol" ? `${orderedIndex}. ` : "- ");
    }
    if (blocks.has(tag)) addBreak(tag === "p" && options.preserveParagraphs ? 2 : 1);
    let listIndex = 1;
    for (const child of Array.from(element.childNodes)) {
      walk(child, listIndex);
      if ((child as Element).tagName?.toLowerCase() === "li") listIndex += 1;
    }
    if (tag === "a" && options.appendLinkUrls) {
      const href = element.getAttribute("href");
      if (href && isSafeLinkUrl(href)) output.push(` (${href})`);
    }
    if (tag === "tr" || tag === "li" || blocks.has(tag)) addBreak(tag === "p" && options.preserveParagraphs ? 2 : 1);
  };

  for (const node of Array.from(document.body.childNodes)) walk(node);
  let text = output.join("").replace(/\r\n|\r/g, "\n");
  text = text.replace(/[ \f\v]{2,}/g, " ").split("\n").map((line) => line.replace(/[ \t]+$/g, "")).join("\n");
  if (options.collapseBlankLines) text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();
  stats.outputLength = text.length;
  return { text, stats };
}
