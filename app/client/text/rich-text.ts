import { normalizeLineEndings } from "./text-core";

export type RichTextOptions = { preserveListMarkers?: boolean; appendLinkUrls?: boolean; preserveParagraphs?: boolean; normalizeNbsp?: boolean; trimLineEnds?: boolean; removeZeroWidthSpace?: boolean };
const hidden = new Set(["script", "style", "template", "noscript", "iframe", "object", "embed", "svg", "canvas", "head", "meta", "link"]);
const blocks = new Set(["p", "div", "section", "article", "header", "footer", "main", "aside", "blockquote", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "tr"]);

export function richHtmlToPlainText(html: string, options: RichTextOptions = {}): string {
  if (typeof DOMParser === "undefined") return normalizeLineEndings(html);
  const document = new DOMParser().parseFromString(html, "text/html"); const out: string[] = [];
  const newline = (count = 1) => { const existing = out.join("").match(/\n*$/)?.[0].length ?? 0; if (existing < count) out.push("\n".repeat(count - existing)); };
  const walk = (node: Node) => { if (node.nodeType === Node.TEXT_NODE) { out.push(node.nodeValue ?? ""); return; } if (node.nodeType !== Node.ELEMENT_NODE) return; const element = node as Element; const tag = element.tagName.toLowerCase(); if (hidden.has(tag) || element.hasAttribute("hidden") || element.getAttribute("aria-hidden") === "true") return; if (tag === "br") { newline(); return; } if (tag === "li") { newline(); if (options.preserveListMarkers ?? true) out.push("- "); } if (blocks.has(tag)) newline(tag === "p" && (options.preserveParagraphs ?? true) ? 2 : 1); for (const child of Array.from(element.childNodes)) walk(child); if (tag === "a" && options.appendLinkUrls) { const href = element.getAttribute("href"); if (href) out.push(` (${href})`); } if (tag === "li" || blocks.has(tag)) newline(tag === "p" && (options.preserveParagraphs ?? true) ? 2 : 1); };
  for (const child of Array.from(document.body.childNodes)) walk(child);
  let result = normalizeLineEndings(out.join("")); if (options.normalizeNbsp ?? true) result = result.replace(/\u00a0/g, " "); if (options.removeZeroWidthSpace) result = result.replace(/\u200B/g, ""); result = result.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n"); if (options.trimLineEnds ?? true) result = result.split("\n").map((line) => line.replace(/[ \t]+$/g, "")).join("\n"); return result.trim();
}
