import type { XmlFormatError, XmlNativeMetadata, XmlValidationShape } from "./xml-format-options";
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


function withoutParsererrorNames(source: string, names: XmlValidationShape["parsererrorNames"]) {
  const used = new Set(source.match(/atc-parser-probe-\d+/g) ?? []);
  let number = 0;
  while (used.has("atc-parser-probe-" + number)) number++;
  const replacement = "atc-parser-probe-" + number;
  const fragments: string[] = [];
  let cursor = 0;
  for (const { start, end } of names) {
    fragments.push(source.slice(cursor, start), replacement);
    cursor = end;
  }
  fragments.push(source.slice(cursor));
  return fragments.join("");
}

export function validateXmlDocument(source: string, bom: number, shape: XmlValidationShape, parserFactory: XmlParserFactory = () => new DOMParser()): { metadata: XmlNativeMetadata } | { error: XmlFormatError } {
  try {
    // The caller's bounded scanner must run first. This detached parser
    // validates well-formedness without evaluating or inserting the document.
    const parser = parserFactory();
    const document = parser.parseFromString(source.slice(bom), "application/xml");
    const elements = document.getElementsByTagName("*");
    const count = elements.length;
    const nativeError = nativeParserError(document);
    let authoredMarker = false;
    if (nativeError && shape.parsererrorNames.length && document.documentElement?.tagName === shape.rootName && count === shape.elementCount) {
      // Browsers return an ordinary XML document containing a parsererror
      // element on failure. Rename only literal element names in a second
      // validation pass so any remaining parsererror is browser-generated.
      // The probe name is absent from the source, so this cannot match a
      // previously mismatched closing tag or alter namespace bindings.
      const probe = withoutParsererrorNames(source, shape.parsererrorNames);
      const checked = parser.parseFromString(probe.slice(bom), "application/xml");
      authoredMarker = Boolean(checked.documentElement && !nativeParserError(checked)
        && checked.getElementsByTagName("*").length === shape.elementCount);
    }
    if ((nativeError && !authoredMarker) || !document.documentElement) {
      return { error: {
        message: "The XML is not well-formed. Check closing tags, quoted attributes, and namespaces.",
        position: nativeError ? nativeErrorPosition(source, nativeError, bom) : undefined,
      } };
    }
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
