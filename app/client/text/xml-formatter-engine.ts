import { findLoneSurrogate, utf8Bytes } from "./bytes";
import { findInvalidXmlControl, type XmlParserFactory } from "./xml";
import { xmlFormatLimits, type XmlFormatOptions, type XmlFormatPosition, type XmlFormatResponse } from "./xml-format-options";

type Kind = "text" | "comment" | "cdata" | "instruction" | "start" | "empty" | "end";
type Token = {
  kind: Kind;
  start: number;
  end: number;
  close?: number;
  hasCharacterData?: boolean;
  hasMarkupChildren?: boolean;
  preserve?: boolean;
};
const xmlNamespace = "http://www.w3.org/XML/1998/namespace";
const includeNamespace = "http://www.w3.org/2001/XInclude";
const layoutIndent = { two: "  ", four: "    ", tab: "\t" };
const xmlSpace = (value: string) => /^[ \t\r\n]*$/.test(value);

class XmlFormatError extends Error {
  constructor(message: string, readonly offset?: number) {
    super(message);
  }
}

function offsetPosition(source: string, offset: number): XmlFormatPosition {
  let line = 1;
  let column = 1;
  for (let index = 0; index < offset; index++) {
    const char = source[index];
    if (char === "\r" || char === "\n") {
      if (char === "\r" && source[index + 1] === "\n") index++;
      line++;
      column = 1;
    } else if (!(char.charCodeAt(0) >= 0xDC00 && char.charCodeAt(0) <= 0xDFFF)) column++;
  }
  return { offset, line, column };
}

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

function boundedScan(source: string, start: number) {
  const tokens: Token[] = [];
  const ancestors: Token[] = [];
  let depth = 0;
  let cursor = start;

  function through(marker: string, from: number, message: string) {
    const found = source.indexOf(marker, from);
    if (found < 0) throw new XmlFormatError(message, cursor);
    return found + marker.length;
  }

  function tagEnd() {
    for (let offset = cursor + 1; offset < source.length; offset++) {
      const char = source[offset];
      if (char === ">") return offset + 1;
      if (char === "<") throw new XmlFormatError("Close this tag before opening another.", offset);
      if (char === '"' || char === "'") {
        const found = source.indexOf(char, offset + 1);
        if (found < 0) throw new XmlFormatError("Close this attribute value with its matching quote.", offset);
        offset = found;
      }
    }
    throw new XmlFormatError("Close this XML tag with >.", cursor);
  }

  while (cursor < source.length) {
    if (tokens.length === xmlFormatLimits.tokens) throw new XmlFormatError("The document exceeds 30,000 XML tokens.");
    const parent = ancestors.at(-1);
    let kind: Kind;
    let end: number;
    if (source[cursor] !== "<") {
      kind = "text";
      const next = source.indexOf("<", cursor);
      end = next < 0 ? source.length : next;
      if (parent && !xmlSpace(source.slice(cursor, end))) parent.hasCharacterData = true;
    } else if (source.startsWith("<!--", cursor)) {
      kind = "comment";
      end = through("-->", cursor + 4, "Close this XML comment with -->.");
    } else if (source.startsWith("<![CDATA[", cursor)) {
      kind = "cdata";
      end = through("]]>", cursor + 9, "Close this CDATA section with ]]>.");
      if (parent) parent.hasCharacterData = true;
    } else if (source.startsWith("<?", cursor)) {
      kind = "instruction";
      end = through("?>", cursor + 2, "Close this processing instruction with ?>.");
      const raw = source.slice(cursor, end);
      const target = /^<\?([^ \t\r\n?]+)/.exec(raw)?.[1];
      if (target?.toLowerCase() === "xml-stylesheet") {
        throw new XmlFormatError("XML stylesheet instructions are disabled.", cursor);
      }
      if (target === "xml") {
        const version = /\bversion\s*=\s*(['"])([^'"]*)\1/.exec(raw)?.[2];
        const encoding = /\bencoding\s*=\s*(['"])([^'"]*)\1/.exec(raw)?.[2];
        if (version && version !== "1.0") throw new XmlFormatError("Only XML 1.0 is supported.", cursor);
        if (encoding && encoding.toLowerCase() !== "utf-8") {
          throw new XmlFormatError("Use a UTF-8 document and a matching XML encoding declaration.", cursor);
        }
      }
    } else if (source.startsWith("<!", cursor)) {
      throw new XmlFormatError("DTD and entity declarations are disabled.", cursor);
    } else {
      end = tagEnd();
      kind = source.startsWith("</", cursor) ? "end" : source[end - 2] === "/" ? "empty" : "start";
    }

    if (parent && (kind === "start" || kind === "empty" || kind === "comment" || kind === "instruction")) parent.hasMarkupChildren = true;
    const token: Token = { kind, start: cursor, end };
    if (kind === "start" || kind === "empty") {
      if (ancestors.length >= xmlFormatLimits.depth) throw new XmlFormatError("The document exceeds 128 nested elements.", cursor);
      depth = Math.max(depth, ancestors.length + 1);
      if (kind === "start") ancestors.push(token);
    } else if (kind === "end") {
      const opening = ancestors.pop();
      if (opening) opening.close = tokens.length;
    }
    tokens.push(token);
    cursor = end;
  }
  return { tokens, depth };
}

function layoutTag(raw: string, kind: Kind, level: number, options: XmlFormatOptions) {
  if (kind === "end") return raw.replace(/[ \t\r\n]+>$/, ">");
  if (kind !== "start" && kind !== "empty") return raw;
  const nameEnd = raw.search(/[ \t\r\n/>]/);
  const start = raw.slice(0, nameEnd);
  const closing = kind === "empty" ? "/>" : ">";
  const attributes: string[] = [];
  // The browser has validated this tag. Capture only separators and names.
  // Quoted attribute values, including whitespace and character refs, are copied exactly.
  const attribute = /[ \t\r\n]+([^ \t\r\n=/>]+)[ \t\r\n]*=[ \t\r\n]*(['"])/y;
  let cursor = nameEnd;
  while (cursor < raw.length - closing.length) {
    attribute.lastIndex = cursor;
    const match = attribute.exec(raw);
    if (!match) break;
    const end = raw.indexOf(match[2], attribute.lastIndex) + 1;
    attributes.push(match[1] + "=" + raw.slice(attribute.lastIndex - 1, end));
    cursor = end;
  }
  if (!xmlSpace(raw.slice(cursor, raw.length - closing.length))) return raw;
  const gap = options.operation === "format" && attributes.length > 1
    ? "\n" + layoutIndent[options.indent].repeat(level + 1) : " ";
  return start + (attributes.length ? gap + attributes.join(gap) : "") + closing;
}

function formatTokens(source: string, tokens: Token[], options: XmlFormatOptions, bom: number) {
  const pretty = options.operation === "format";
  const indent = layoutIndent[options.indent];
  const output: string[] = [];
  let size = 0;
  const sizeError = "The formatted output exceeds 2 MiB. Try compact output or narrower indentation.";

  function write(value: string) {
    size += value.length;
    if (size > xmlFormatLimits.outputBytes) throw new XmlFormatError(sizeError);
    output.push(value);
  }

  function visit(index: number, level: number): number {
    const token = tokens[index];
    const raw = source.slice(token.start, token.end);
    if (token.kind !== "start") {
      write(token.preserve ? raw : layoutTag(raw, token.kind, level, options));
      return index + 1;
    }
    const close = token.close!;
    if (token.preserve || token.hasCharacterData) {
      write(source.slice(token.start, tokens[close].end));
      return close + 1;
    }

    write(layoutTag(raw, token.kind, level, options));
    const structural = options.reindentContent && token.hasMarkupChildren;
    for (let child = index + 1; child < close;) {
      if (structural && tokens[child].kind === "text") {
        // No explicit character data or references exist in this container.
        child++;
        continue;
      }
      if (structural && pretty) write("\n" + indent.repeat(level + 1));
      child = visit(child, level + 1);
    }
    if (structural && pretty) write("\n" + indent.repeat(level));
    const end = tokens[close];
    write(layoutTag(source.slice(end.start, end.end), end.kind, level, options));
    return close + 1;
  }

  if (bom) write(source[0]);
  for (let index = 0; index < tokens.length;) {
    if (tokens[index].kind === "text") { index++; continue; }
    index = visit(index, 0);
    if (pretty) write("\n");
  }
  const result = output.join("");
  const outputBytes = utf8Bytes(result).length;
  if (outputBytes > xmlFormatLimits.outputBytes) throw new XmlFormatError(sizeError);
  return { output: result, outputBytes };
}

export function formatXml(source: string, options: XmlFormatOptions, parserFactory: XmlParserFactory = () => new DOMParser()): XmlFormatResponse {
  const tooLarge = { error: { message: "Use at most 512 KiB of UTF-8 XML." } };
  if (source.length > xmlFormatLimits.inputBytes) return tooLarge;
  const sourceBytes = utf8Bytes(source).length;
  if (sourceBytes > xmlFormatLimits.inputBytes) return tooLarge;
  const invalid = findLoneSurrogate(source);
  if (invalid >= 0) return { error: { message: "The input contains an unpaired UTF-16 surrogate.", position: offsetPosition(source, invalid) } };
  const invalidControl = findInvalidXmlControl(source);
  if (invalidControl) return { error: { message: "This control character is invalid in XML 1.0.", position: offsetPosition(source, invalidControl.index) } };

  const bom = source.startsWith("\uFEFF") ? 1 : 0;
  if (xmlSpace(source.slice(bom))) return { error: { message: "Enter an XML document with one root element." } };
  try {
    const { tokens, depth } = boundedScan(source, bom);
    // Only a bounded, preflighted string reaches the browser's detached XML parser.
    const document = parserFactory().parseFromString(source.slice(bom), "application/xml");
    const nativeError = nativeParserError(document);
    if (nativeError || !document.documentElement) {
      return { error: {
        message: "The XML is not well-formed. Check closing tags, quoted attributes, and namespaces.",
        position: nativeError ? nativeErrorPosition(source, nativeError, bom) : undefined,
      } };
    }

    const elements = Array.from(document.getElementsByTagName("*"));
    const opening = tokens.filter((token) => token.kind === "start" || token.kind === "empty");
    if (elements.length !== opening.length || tokens.some((token) => token.kind === "start" && token.close === undefined)) {
      throw new XmlFormatError("The XML structure could not be verified.");
    }

    for (const [index, element] of elements.entries()) {
      if (element.namespaceURI === includeNamespace) throw new XmlFormatError("XInclude elements are disabled.", opening[index].start);
      const space = element.getAttributeNS(xmlNamespace, "space");
      // Preserve unknown xml:space values conservatively as well.
      if (space !== null && space !== "default") opening[index].preserve = true;
    }

    const protectedSections = opening.filter((token) => token.preserve || token.hasCharacterData).length;
    const content = options.operation === "validate" ? { output: null, outputBytes: null } : formatTokens(source, tokens, options, bom);
    return { result: { ...content, sourceBytes, elements: elements.length, depth, protectedSections } };
  } catch (error) {
    if (!(error instanceof XmlFormatError)) return { error: { message: "The XML document could not be processed locally." } };
    return { error: { message: error.message, position: error.offset === undefined ? undefined : offsetPosition(source, error.offset) } };
  }
}
