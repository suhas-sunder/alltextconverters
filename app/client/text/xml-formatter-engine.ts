import { findLoneSurrogate, utf8Bytes } from "./bytes";
import { findInvalidXmlControl, type XmlParserFactory } from "./xml";
import { xmlFormatLimits, type XmlFormatError as FormatError, type XmlFormatOptions, type XmlFormatPosition, type XmlFormatResponse, type XmlNativeMetadata, type XmlValidationShape } from "./xml-format-options";
import { validateXmlDocument } from "./xml-formatter-native";

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

function boundedScan(source: string, start: number) {
  const tokens: Token[] = [];
  const ancestors: Token[] = [];
  const shape: XmlValidationShape = { rootName: null, elementCount: 0, parsererrorNames: [] };
  const checkNames = source.includes("parsererror");
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
    const opensElement = kind === "start" || kind === "empty";
    if (opensElement) {
      shape.elementCount++;
      if (ancestors.length >= xmlFormatLimits.depth) throw new XmlFormatError("The document exceeds 128 nested elements.", cursor);
      depth = Math.max(depth, ancestors.length + 1);
      if (kind === "start") ancestors.push(token);
    } else if (kind === "end") {
      const opening = ancestors.pop();
      if (opening) opening.close = tokens.length;
    }
    if ((opensElement && !shape.rootName) || (checkNames && (opensElement || kind === "end"))) {
      const from = cursor + (kind === "end" ? 2 : 1);
      const name = /^[^ \t\r\n/>]+/.exec(source.slice(from, end))?.[0];
      if (name) {
        if (kind !== "end" && !shape.rootName) shape.rootName = name;
        const local = name.slice(name.lastIndexOf(":") + 1);
        if (local === "parsererror") shape.parsererrorNames.push({ start: from + name.length - local.length, end: from + name.length });
      }
    }
    tokens.push(token);
    cursor = end;
  }
  return { tokens, depth, shape };
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

type PreparedXml = { source: string; sourceBytes: number; bom: number; tokens: Token[]; depth: number; options: XmlFormatOptions; shape: XmlValidationShape };

function reportError(source: string, error: unknown): FormatError {
  if (!(error instanceof XmlFormatError)) return { message: "The XML document could not be processed locally." };
  return { message: error.message, position: error.offset === undefined ? undefined : offsetPosition(source, error.offset) };
}

export function prepareXml(source: string, options: XmlFormatOptions): { prepared: PreparedXml } | { error: FormatError } {
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
    const { tokens, depth, shape } = boundedScan(source, bom);
    return { prepared: { source, sourceBytes, bom, tokens, depth, options, shape } };
  } catch (error) {
    return { error: reportError(source, error) };
  }
}

export function finishXml({ source, sourceBytes, bom, tokens, depth, options }: PreparedXml, metadata: XmlNativeMetadata): XmlFormatResponse {
  try {
    const opening = tokens.filter((token) => token.kind === "start" || token.kind === "empty");
    if (metadata.count !== opening.length || tokens.some((token) => token.kind === "start" && token.close === undefined)) {
      throw new XmlFormatError("The XML structure could not be verified.");
    }
    if (metadata.includeIndex !== null) {
      throw new XmlFormatError("XInclude elements are disabled.", opening[metadata.includeIndex].start);
    }
    for (const index of metadata.preserveIndices) opening[index].preserve = true;
    const protectedSections = opening.filter((token) => token.preserve || token.hasCharacterData).length;
    const content = options.operation === "validate" ? { output: null, outputBytes: null } : formatTokens(source, tokens, options, bom);
    return { result: { ...content, sourceBytes, elements: metadata.count, depth, protectedSections } };
  } catch (error) {
    return { error: reportError(source, error) };
  }
}

export function formatXml(source: string, options: XmlFormatOptions, parserFactory?: XmlParserFactory): XmlFormatResponse {
  const result = prepareXml(source, options);
  if ("error" in result) return result;
  const native = validateXmlDocument(source, result.prepared.bom, result.prepared.shape, parserFactory);
  return "error" in native ? native : finishXml(result.prepared, native.metadata);
}
