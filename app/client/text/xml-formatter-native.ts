import type { XmlFormatError, XmlNativeMetadata } from "./xml-format-options";
import type { XmlParserFactory } from "./xml";

const xmlNamespace = "http://www.w3.org/XML/1998/namespace";
const includeNamespace = "http://www.w3.org/2001/XInclude";
function nativeErrorPosition(source: string, message: string, bom: number) {
  const native = /line (\d+) at column (\d+)/i.exec(message);
  const match = native ?? /\b(\d+):(\d+):/.exec(message);
  if (!match) return undefined;
  const line = Number(match[1]);
  const column = Number(match[2]);
  if (line < 1 || column < 1) return undefined;
  const newlines = /\r\n|\r|\n/g;
  let start = bom;
  for (let current = 1; current < line; current++) {
    if (!newlines.exec(source)) return undefined;
    start = newlines.lastIndex;
  }
  if (!native) return { line, column, offset: Math.min(source.length, start + column - 1) };
  // Chromium counts Unicode code points. Textarea selection counts UTF-16 units.
  let offset = start;
  for (let steps = 1; steps < column && offset < source.length; steps++) {
    if (source[offset] === "\n" || source[offset] === "\r") break;
    offset += source.codePointAt(offset)! > 0xFFFF ? 2 : 1;
  }
  return { line, column, offset };
}

function nativeParserError(document: Document) {
  const namespaces = ["http://www.mozilla.org/newlayout/xml/parsererror.xml", "http://www.w3.org/1999/xhtml"];
  for (const namespace of namespaces) {
    const error = Array.from(document.getElementsByTagNameNS(namespace, "parsererror"))
      .find((element) => element.prefix === null);
    if (error) return error.textContent || "Malformed XML.";
  }
  return null;
}


export function validateXmlDocument(source: string, bom: number, parserFactory: XmlParserFactory = () => new DOMParser()): { metadata: XmlNativeMetadata } | { error: XmlFormatError } {
  try {
    // The caller's bounded scanner must run first. This detached parser
    // validates well-formedness without evaluating or inserting the document.
    const document = parserFactory().parseFromString(source.slice(bom), "application/xml");
    const nativeError = nativeParserError(document);
    if (nativeError || !document.documentElement) {
      return { error: {
        message: "The XML is not well-formed. Check closing tags, quoted attributes, and namespaces.",
        position: nativeError ? nativeErrorPosition(source, nativeError, bom) : undefined,
      } };
    }
    const elements = document.getElementsByTagName("*");
    const count = elements.length;
    const include = document.getElementsByTagNameNS(includeNamespace, "*")[0];
    const preserveIndices: number[] = [];
    let includeIndex = null;
    // XML reserves its xml prefix. A document without this literal name
    // has no space flags, so it does not need a JS wrapper for every node.
    const checkSpace = source.includes("xml:space");
    if (include || checkSpace) {
      for (const [index, element] of Array.from(elements).entries()) {
        if (element === include) includeIndex = index;
        const space = checkSpace ? element.getAttributeNS(xmlNamespace, "space") : null;
        if (space !== null && space !== "default") preserveIndices.push(index);
      }
    }
    return { metadata: { count, preserveIndices, includeIndex } };
  } catch {
    return { error: { message: "The XML document could not be processed locally." } };
  }
}
