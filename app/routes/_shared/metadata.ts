import { canonicalUrl, siteConfig } from "../../site-config";

const searchPresentation: Record<string, Pick<PageMetaOptions, "title" | "description">> = {
  "/line-break-remover": { title: "Line Break Remover - Remove Newlines Online", description: "Remove unwanted line breaks, join wrapped lines, preserve paragraphs, or replace newlines with a custom separator. Processing stays in your browser." },
  "/html-to-text": { title: "HTML to Text Converter - Strip HTML Tags", description: "Extract readable text from inert HTML with paragraph, list, table, and safe-link controls. Scripts and remote resources are ignored locally." },
  "/text-to-html": { title: "Text to HTML Converter - Convert Plain Text to HTML", description: "Convert escaped plain text to HTML paragraphs, line breaks, preformatted text, lists, or a complete HTML document in your browser." },
  "/xml-to-text": { title: "XML to Text Converter - Extract Text from XML", description: "Extract all XML text, selected elements, boundaries, and one attribute. External DTD and entity declarations are rejected in your browser." },
  "/text-to-xml": { title: "Text to XML Converter - Convert Lines to XML", description: "Generate validated XML from text, lines, or paragraphs with selected names, declarations, blank records, and numeric indexes." },
  "/url-encode": { title: "URL Encode - Component or Form Value", description: "Percent-encode text in URL component or form-value mode. Component spaces become %20; form spaces become +. Runs locally." },
  "/url-decode": { title: "URL Decode - Component or Form Value", description: "Strictly decode percent-encoded UTF-8 in component or form-value mode, with visible errors for malformed escapes. Runs locally." },
  "/text-to-hex": { title: "Text to Hex Converter - UTF-8 Text to Hex", description: "Convert Unicode text to lowercase or uppercase UTF-8 hexadecimal bytes with spaces, commas, no separator, or a custom separator." },
  "/hex-to-text": { title: "Hex to Text Converter - Decode Hexadecimal", description: "Decode continuous, spaced, comma-separated, prefixed, or custom-separated hexadecimal bytes as strict UTF-8 text." },
  "/text-to-binary": { title: "Text to Binary Converter - UTF-8 Bytes", description: "Convert text to complete eight-bit UTF-8 binary bytes with spaces, no separator, or a custom literal separator." },
  "/binary-to-text": { title: "Binary to Text Converter - Decode UTF-8 Bytes", description: "Decode continuous, space-separated, or custom-separated eight-bit binary bytes as strict UTF-8 with visible validation errors." },
  "/text-to-ascii": { title: "Text to ASCII Converter - Decimal Values", description: "Convert strict ASCII text to decimal values from 0 through 127. Non-ASCII characters are rejected without transliteration." },
  "/ascii-to-text": { title: "ASCII to Text Converter - Decode Decimal Values", description: "Strictly decode decimal ASCII values from 0 through 127, including accurately labeled control characters, in your browser." },
  "/list-to-csv": { title: "List to CSV Converter - Convert Lines to CSV", description: "Convert one item per line into a correctly escaped one-column CSV. Choose a header, delimiter, line ending, and Excel BOM locally." },
  "/csv-to-list": { title: "CSV to List Converter - Extract a CSV Column", description: "Extract a selected column from quoted CSV or delimited text into a list, entirely in your browser." },
  "/byte-counter": { title: "Byte Counter - Count UTF-8 Bytes", description: "Count UTF-8 bytes, grapheme clusters, Unicode code points, and UTF-16 code units locally in your browser." },
};

type PageMetaOptions = {
  title: string;
  description: string;
  pathname: string;
  indexable?: boolean;
};

export function createPageMeta({
  title,
  description,
  pathname,
  indexable = true,
}: PageMetaOptions) {
  const presentation = searchPresentation[pathname];
  title = presentation?.title ?? title;
  description = presentation?.description ?? description;
  const canonical = canonicalUrl(pathname);
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "robots", content: indexable ? "index,follow" : "noindex,follow" },
  ];

  if (siteConfig.socialImageUrl) {
    meta.push({ property: "og:image", content: siteConfig.socialImageUrl });
    meta.push({ name: "twitter:image", content: siteConfig.socialImageUrl });
  }

  return meta;
}

export function createCanonicalMeta(pathname: string) {
  return { tagName: "link", rel: "canonical", href: canonicalUrl(pathname) };
}
