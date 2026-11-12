import MarkdownIt from "markdown-it";
import TurndownService from "turndown";
import { contentByteLimit, type ContentDirection } from "./html-markdown-model";

const outputLimit = 1024 * 1024;
const encoder = new TextEncoder();
const allowed = new Set("a article b blockquote br caption code dd del div dl dt em h1 h2 h3 h4 h5 h6 hr i li main ol p pre s section span strong table tbody td th thead tfoot tr u ul".split(" "));
const discarded = new Set("applet audio base button embed form head iframe input link math meta noscript object optgroup option picture script select source style svg template textarea title track video".split(" "));
const htmlNamespace = "http://www.w3.org/1999/xhtml";
type Notes = Set<string>;

function safeHref(value: string) {
  if (!value || /[\s\\\u0000-\u001F\u007F<>]/u.test(value) || value.startsWith("//")) return false;
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(value)?.[1];
  return !scheme || /^(https?|mailto)$/i.test(scheme);
}

function keepAttribute(element: Element, name: string, value: string, preview: boolean) {
  const tag = element.localName;
  if (tag === "a" && name === "href") return !preview && safeHref(value);
  if (tag === "a" && name === "title") return !/[\r\n]/.test(value);
  if (tag === "ol" && name === "start") return /^\d{1,9}$/.test(value);
  if (tag === "code" && name === "class") return /^language-[\w+-]{1,40}$/.test(value);
  if (tag !== "td" && tag !== "th") return false;
  if (name === "align") return /^(left|center|right)$/i.test(value);
  return name === "style" && /^text-align:\s*(left|center|right)\s*;?$/i.test(value);
}

function inertMarkup(document: Document, source: string, notes: Notes, preview = false) {
  // Template contents have an inert owner document. Never mount user-supplied nodes.
  const template = document.createElement("template");
  template.innerHTML = source;
  const stack = Array.from(template.content.childNodes, node => ({ node, depth: 0 }));
  let count = 0;
  while (stack.length) {
    const { node, depth } = stack.pop()!;
    if (++count > 10000 || depth > 48) throw new Error("Simplify the document to at most 10,000 nodes and 48 levels of nesting.");
    if (node.nodeType === 3) continue;
    if (node.nodeType !== 1) {
      node.parentNode?.removeChild(node);
      continue;
    }
    const element = node as Element;
    const tag = element.localName;
    if (element.namespaceURI !== htmlNamespace || discarded.has(tag)) {
      element.remove();
      notes.add("Embedded content, form elements and active markup were removed.");
      continue;
    }
    if (tag === "img") {
      element.replaceWith(element.ownerDocument.createTextNode(element.getAttribute("alt") ?? ""));
      notes.add("Images were replaced by their alternative text when available.");
      continue;
    }
    for (const child of element.childNodes) stack.push({ node: child, depth: depth + 1 });
    if (!allowed.has(tag)) {
      element.replaceWith(...element.childNodes);
      notes.add("Unsupported HTML elements were reduced to their content.");
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      if (keepAttribute(element, attribute.name, attribute.value, preview)) continue;
      if (!preview && tag === "a" && attribute.name === "href") notes.add("Unsupported link destinations were removed.");
      if (attribute.name === "rowspan" || attribute.name === "colspan") notes.add("Merged table cells were flattened.");
      element.removeAttribute(attribute.name);
    }
  }
  return template;
}

function markdownRenderer(notes: Notes) {
  const parser = new MarkdownIt({ html: false, linkify: false, maxNesting: 64 });
  parser.validateLink = safeHref;
  parser.renderer.rules.image = (tokens, index) => {
    notes.add("Images were replaced by their alternative text when available.");
    return parser.utils.escapeHtml(tokens[index].content);
  };
  return parser;
}

function tableCell(value: string) {
  // A table delimiter needs an odd count of preceding backslashes.
  return value.replace(/(\\*)\|/g, (_match, slashes: string) => slashes + (slashes.length % 2 ? "" : "\\") + "|")
    .replace(/(?:[ \t]*\r?\n)+[ \t]*/g, " ");
}

function renderPre(node: HTMLElement) {
  const literal = node.textContent ?? "";
  const language = node.firstElementChild?.getAttribute("class")?.match(/^language-(.*)$/)?.[1] ?? "";
  let length = 3;
  for (const run of literal.matchAll(/^ {0,3}(~{3,})/gm)) length = Math.max(length, run[1].length + 1);
  const fence = "~".repeat(length);
  return "\n\n" + fence + language + "\n" + literal + (literal && !literal.endsWith("\n") ? "\n" : "") + fence + "\n\n";
}

function markdownConverter(notes: Notes) {
  const converter = new TurndownService({
    headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-", preformattedCode: true,
    blankReplacement: (_content, node: HTMLElement & { isBlock?: boolean }) => {
      if (node.localName === "pre") return renderPre(node);
      return node.isBlock ? "\n\n" : "";
    },
  });
  const escape = converter.escape.bind(converter);
  converter.escape = value => escape(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  converter.addRule("explicit-link", {
    filter: "a",
    replacement: (content, node) => {
      const href = node.getAttribute("href");
      if (!href || !content) return content;
      const title = node.getAttribute("title");
      const destination = href.replaceAll("&", "&amp;");
      const label = title?.replaceAll("&", "&amp;").replace(/[\\"]/g, "\\$&");
      return "[" + content + "](<" + destination + ">" + (label ? ' "' + label + '"' : "") + ")";
    },
  });
  converter.addRule("strike", {
    filter: ["del", "s"],
    replacement: content => content ? "~~" + content + "~~" : "",
  });
  converter.addRule("literal-pre", {
    filter: "pre",
    replacement: (_content, node) => renderPre(node),
  });
  converter.addRule("simple-table", {
    filter: "table",
    replacement: (_content, node) => {
      const rows = Array.from((node as HTMLTableElement).rows);
      if (!rows.length) return "";
      if (rows.length > 500 || rows.some(row => row.cells.length > 60)) throw new Error("Use at most 500 rows and 60 columns per table.");
      if (node.querySelector("table")) throw new Error("Split nested tables into separate simple tables before conversion.");
      const width = Math.max(...rows.map(row => row.cells.length));
      if (!width) return "";
      const hasHeader = Array.from(rows[0].cells).some(cell => cell.localName === "th");
      if (!hasHeader) notes.add("A blank Markdown header was added to a table without header cells.");
      if (rows.slice(1).some(row => Array.from(row.cells).some(cell => cell.localName === "th"))) notes.add("Additional header rows were treated as regular data rows.");
      const rowText = (row: HTMLTableRowElement | undefined) => "| " + Array.from({ length: width }, (_, column) => {
        const cell = row?.cells[column];
        return cell ? tableCell(converter.turndown(cell)) : "";
      }).join(" | ") + " |";
      const divider = "| " + Array.from({ length: width }, (_, column) => {
        const cell = rows[0].cells[column];
        const align = (cell?.getAttribute("align") ?? cell?.style.textAlign ?? "").toLowerCase();
        return align === "left" ? ":---" : align === "center" ? ":---:" : align === "right" ? "---:" : "---";
      }).join(" | ") + " |";
      const caption = (node as HTMLTableElement).caption;
      return "\n\n" + (caption ? converter.turndown(caption) + "\n\n" : "") +
        [rowText(hasHeader ? rows[0] : undefined), divider, ...rows.slice(hasHeader ? 1 : 0).map(rowText)].join("\n") + "\n\n";
    },
  });
  return converter;
}

export function convertRichText(source: string, direction: ContentDirection, document: Document) {
  if (source.length > contentByteLimit || encoder.encode(source).length > contentByteLimit) throw new Error("Use at most 128 KiB of UTF-8 source.");
  if (/[\u0000\uD800-\uDFFF]/u.test(source)) throw new Error("Remove null characters or unpaired UTF-16 surrogates before conversion.");
  const notes: Notes = new Set();
  const render = markdownRenderer(notes);
  const output = direction === "html-to-markdown"
    ? markdownConverter(notes).turndown(inertMarkup(document, source, notes).content)
    : inertMarkup(document, render.render(source), notes).innerHTML;
  if (output.length > outputLimit || encoder.encode(output).length > outputLimit) throw new Error("The generated output exceeds 1 MiB.");
  const preview = inertMarkup(document, direction === "html-to-markdown" ? render.render(output) : output, notes, true).innerHTML;
  return { output, preview, notes: Array.from(notes) };
}
