export type XmlParserFactory = () => DOMParser;

export type XmlParseResult =
  | { ok: true; document: Document }
  | { ok: false; error: string; unsafe: boolean };

export const XML_INVALID_CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

export function findInvalidXmlControl(value: string): { index: number; codePoint: number } | null {
  const match = XML_INVALID_CONTROL_RE.exec(String(value ?? ""));
  return match ? { index: match.index, codePoint: match[0].codePointAt(0)! } : null;
}

function declarationsOnly(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");
}

export function detectUnsafeXmlDeclaration(source: string): string | null {
  const inspected = declarationsOnly(String(source ?? ""));
  if (/<!\s*DOCTYPE\b/i.test(inspected)) {
    return "External DTDs and entities are not supported.";
  }
  if (/<!\s*ENTITY\b/i.test(inspected) || /<!\s*%/i.test(inspected)) {
    return "This XML contains an unsafe external declaration.";
  }
  const declaration = inspected.match(/<![^>]*(?:SYSTEM|PUBLIC)[^>]*>/i);
  if (declaration) return "This XML contains an unsafe external declaration.";
  return null;
}

export function normalizeXmlParserError(document: Document): string | null {
  const errors = Array.from(document.getElementsByTagName("parsererror"));
  if (!errors.length) return null;
  const message = (errors[0].textContent ?? "Malformed XML.")
    .replace(/\s+/g, " ")
    .trim();
  return message ? `Malformed XML: ${message}` : "Malformed XML.";
}

export function parseXml(source: string, parserFactory?: XmlParserFactory): XmlParseResult {
  const input = String(source ?? "");
  if (!input.trim()) return { ok: false, error: "Paste XML to extract.", unsafe: false };
  const invalid = findInvalidXmlControl(input);
  if (invalid) {
    return {
      ok: false,
      error: `XML contains an invalid control character U+${invalid.codePoint.toString(16).toUpperCase().padStart(4, "0")} at position ${invalid.index + 1}.`,
      unsafe: false,
    };
  }
  const unsafe = detectUnsafeXmlDeclaration(input);
  if (unsafe) return { ok: false, error: unsafe, unsafe: true };
  try {
    const parser = parserFactory ? parserFactory() : new DOMParser();
    const document = parser.parseFromString(input, "application/xml");
    const parserError = normalizeXmlParserError(document);
    if (parserError) return { ok: false, error: parserError, unsafe: false };
    if (!document.documentElement) return { ok: false, error: "Malformed XML: no document element was found.", unsafe: false };
    return { ok: true, document };
  } catch {
    return { ok: false, error: "Malformed XML: the document could not be parsed.", unsafe: false };
  }
}

export function xmlTextNodes(node: Node): Text[] {
  const output: Text[] = [];
  const visit = (current: Node) => {
    if (current.nodeType === 3 || current.nodeType === 4) {
      output.push(current as Text);
      return;
    }
    for (const child of Array.from(current.childNodes)) visit(child);
  };
  visit(node);
  return output;
}

export function normalizeXmlText(value: string): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function elementText(element: Element): string {
  return normalizeXmlText(xmlTextNodes(element).map((node) => node.nodeValue ?? "").join(" "));
}

export function matchesXmlName(element: Element, requestedName: string): boolean {
  const requested = requestedName.trim();
  if (!requested) return false;
  return requested.includes(":")
    ? element.tagName === requested
    : (element.localName || element.tagName.split(":").at(-1)) === requested;
}

export function matchingXmlElements(document: Document, requestedName: string): Element[] {
  return Array.from(document.getElementsByTagName("*")).filter((element) => matchesXmlName(element, requestedName));
}

export function selectedXmlAttribute(element: Element, requestedName: string): string | null {
  const requested = requestedName.trim();
  if (!requested) return null;
  for (const attribute of Array.from(element.attributes)) {
    const matches = requested.includes(":")
      ? attribute.name === requested
      : (attribute.localName || attribute.name.split(":").at(-1)) === requested;
    if (matches) return attribute.value;
  }
  return null;
}

export function isValidXmlElementName(name: string): boolean {
  const value = String(name ?? "").trim();
  return /^[A-Za-z_][A-Za-z0-9._-]*$/.test(value) && !/^xml/i.test(value);
}

export function escapeXmlText(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeXmlAttribute(value: string): string {
  return escapeXmlText(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function validateGeneratedXml(source: string, parserFactory?: XmlParserFactory): string | null {
  const parsed = parseXml(source, parserFactory);
  return parsed.ok ? null : parsed.error;
}
