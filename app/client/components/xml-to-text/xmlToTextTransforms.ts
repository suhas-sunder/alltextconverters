import {
  elementText,
  matchingXmlElements,
  normalizeXmlText,
  parseXml,
  selectedXmlAttribute,
  xmlTextNodes,
  type XmlParserFactory,
} from "../../text/xml";

export type XmlExtractionMode = "all" | "selected" | "boundaries";

export type XmlToTextOptions = {
  mode: XmlExtractionMode;
  elementName?: string;
  attributeName?: string;
};

export type XmlToTextResult =
  | { ok: true; text: string; matches: number; textNodes: number }
  | { ok: false; text: ""; error: string };

function extractAll(document: Document): { text: string; textNodes: number } {
  const root = document.documentElement;
  const nodes = xmlTextNodes(root).filter((node) => normalizeXmlText(node.nodeValue ?? ""));
  const children = Array.from(root.children);
  if (!children.length) {
    return { text: normalizeXmlText(nodes.map((node) => node.nodeValue ?? "").join(" ")), textNodes: nodes.length };
  }
  const directText = Array.from(root.childNodes)
    .filter((node) => node.nodeType === 3 || node.nodeType === 4)
    .map((node) => normalizeXmlText(node.nodeValue ?? ""))
    .filter(Boolean);
  const blocks = [...directText, ...children.map(elementText).filter(Boolean)];
  return { text: blocks.join("\n").replace(/\n{3,}/g, "\n\n"), textNodes: nodes.length };
}

function extractBoundaries(document: Document): { text: string; matches: number; textNodes: number } {
  const elements = Array.from(document.getElementsByTagName("*")).filter((element) => {
    const hasElementChildren = Array.from(element.children).length > 0;
    const directText = Array.from(element.childNodes).some(
      (node) => (node.nodeType === 3 || node.nodeType === 4) && normalizeXmlText(node.nodeValue ?? ""),
    );
    return !hasElementChildren || directText;
  });
  const lines = elements.map((element) => `<${element.tagName}>: ${elementText(element)}`);
  return {
    text: lines.join("\n"),
    matches: elements.length,
    textNodes: xmlTextNodes(document).filter((node) => normalizeXmlText(node.nodeValue ?? "")).length,
  };
}

export function xmlToText(
  input: string,
  options: XmlToTextOptions,
  parserFactory?: XmlParserFactory,
): XmlToTextResult {
  const parsed = parseXml(input, parserFactory);
  if (!parsed.ok) return { ok: false, text: "", error: parsed.error };

  if (options.mode === "selected") {
    const elementName = String(options.elementName ?? "").trim();
    if (!elementName) return { ok: false, text: "", error: "Enter an element name to extract." };
    const elements = matchingXmlElements(parsed.document, elementName);
    if (!elements.length) {
      return { ok: false, text: "", error: `No elements matched “${elementName}”. Matching is case-sensitive and uses local names unless a prefix is included.` };
    }
    const attributeName = String(options.attributeName ?? "").trim();
    const lines = elements.map((element) => {
      const text = elementText(element);
      if (!attributeName) return text;
      const attribute = selectedXmlAttribute(element, attributeName);
      return `[${attributeName}=${attribute ?? "(missing)"}] ${text}`.trimEnd();
    });
    return {
      ok: true,
      text: lines.join("\n"),
      matches: elements.length,
      textNodes: elements.reduce((count, element) => count + xmlTextNodes(element).length, 0),
    };
  }

  if (options.mode === "boundaries") {
    const result = extractBoundaries(parsed.document);
    return { ok: true, ...result };
  }

  const all = extractAll(parsed.document);
  return { ok: true, text: all.text, matches: 1, textNodes: all.textNodes };
}
