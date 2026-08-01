import {
  escapeXmlAttribute,
  escapeXmlText,
  findInvalidXmlControl,
  isValidXmlElementName,
  validateGeneratedXml,
  type XmlParserFactory,
} from "../../text/xml";

export type TextToXmlMode = "single" | "lines" | "paragraphs";

export type TextToXmlOptions = {
  mode: TextToXmlMode;
  rootTag: string;
  itemTag: string;
  includeDeclaration: boolean;
  preserveBlankLines: boolean;
  addIndexAttribute: boolean;
};

export type TextToXmlResult =
  | { ok: true; xml: string; warnings: string[]; stats: { emittedItems: number; inputChars: number } }
  | { ok: false; xml: ""; error: string; warnings: string[]; stats: { emittedItems: 0; inputChars: number } };

const DEFAULTS: TextToXmlOptions = {
  mode: "lines",
  rootTag: "root",
  itemTag: "item",
  includeDeclaration: false,
  preserveBlankLines: false,
  addIndexAttribute: false,
};

export function getDefaultTextToXmlOptions(): TextToXmlOptions {
  return { ...DEFAULTS };
}

export { escapeXmlText, isValidXmlElementName as isValidXmlTagName };

function fail(error: string, inputChars: number): TextToXmlResult {
  return { ok: false, xml: "", error, warnings: [], stats: { emittedItems: 0, inputChars } };
}

export function textToXml(
  input: string,
  partialOptions: Partial<TextToXmlOptions> = {},
  parserFactory?: XmlParserFactory,
): TextToXmlResult {
  const options = { ...DEFAULTS, ...partialOptions };
  const normalized = String(input ?? "").replace(/\r\n|\r/g, "\n");
  const invalid = findInvalidXmlControl(normalized);
  if (invalid) {
    return fail(`Input contains XML-invalid control character U+${invalid.codePoint.toString(16).toUpperCase().padStart(4, "0")} at position ${invalid.index + 1}.`, normalized.length);
  }
  const rootTag = options.rootTag.trim();
  const itemTag = options.itemTag.trim();
  if (!isValidXmlElementName(rootTag)) {
    return fail("Root element name is invalid. Use a simple XML name that does not begin with xml.", normalized.length);
  }
  if (options.mode !== "single" && !isValidXmlElementName(itemTag)) {
    return fail("Child element name is invalid. Use a simple XML name that does not begin with xml.", normalized.length);
  }

  const lines: string[] = [];
  if (options.includeDeclaration) lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  let emittedItems = 0;
  if (options.mode === "single") {
    lines.push(`<${rootTag}>${escapeXmlText(normalized)}</${rootTag}>`);
    emittedItems = 1;
  } else {
    const records = options.mode === "lines"
      ? normalized.split("\n")
      : normalized.split(/\n[\t ]*\n+/);
    const selected = options.preserveBlankLines ? records : records.filter((record) => record.trim().length > 0);
    lines.push(`<${rootTag}>`);
    selected.forEach((record, index) => {
      const attribute = options.addIndexAttribute
        ? ` index="${escapeXmlAttribute(String(index + 1))}"`
        : "";
      lines.push(`  <${itemTag}${attribute}>${escapeXmlText(record)}</${itemTag}>`);
    });
    lines.push(`</${rootTag}>`);
    emittedItems = selected.length;
  }

  const xml = lines.join("\n");
  const validationError = validateGeneratedXml(xml, parserFactory);
  if (validationError) return fail(`Generated XML did not validate: ${validationError}`, normalized.length);
  return { ok: true, xml, warnings: [], stats: { emittedItems, inputChars: normalized.length } };
}
