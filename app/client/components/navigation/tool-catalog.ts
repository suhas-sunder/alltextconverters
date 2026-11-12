import type { indexablePaths, noindexCanonicalPaths } from "../../../site-config";
import type { SearchableTool } from "./tool-search";

export const toolDirectoryPath = "/tools/";

export const taskGroups = [
  {
    id: "review",
    label: "Compare revisions and lists",
    description: "Check which lines changed between drafts or reconcile two sets of names and IDs.",
  },
  {
    id: "measure",
    label: "Count and inspect text",
    description: "Check word limits, UTF-8 byte size, or the characters hidden inside pasted text.",
  },
  {
    id: "cleanup",
    label: "Clean or format text",
    description: "Remove unwanted spacing, wraps, duplicates, or formatting before pasting or exporting.",
  },
  {
    id: "case",
    label: "Change letter case",
    description: "Apply a capitalization style or check which pattern the original text uses.",
  },
  {
    id: "tables",
    label: "Prepare lists and spreadsheets",
    description: "Extract a column, reconcile table formats, or turn lines of text into a list.",
  },
  {
    id: "encoding",
    label: "Encode text and URLs",
    description: "Work with Base64, URL escaping, query parameters, hexadecimal, binary, and ASCII.",
  },
  {
    id: "documents",
    label: "Convert structured text",
    description: "Format JSON or XML, convert HTML and Markdown, or extract readable text from markup.",
  },
] as const;

type CanonicalPath = (typeof indexablePaths)[number] | (typeof noindexCanonicalPaths)[number];
type UtilityPath = Exclude<CanonicalPath, "/" | "/tools" | "/about" | "/contact" | "/privacy-policy" | "/terms-of-service" | "/cookies-policy">;

export interface CatalogTool extends SearchableTool {
  href: UtilityPath;
  group: (typeof taskGroups)[number]["id"];
  primary?: boolean;
  purpose?: string;
}

// The legacy entries keep their order and search terms for finder and favorite continuity.
export const toolCatalog: readonly CatalogTool[] = [
  {
    label: "Word Counter",
    href: "/word-counter",
    group: "measure",
    keywords: ["words", "count words", "word count", "essay", "writing"],
    primary: true,
  },
  {
    label: "Character Counter",
    href: "/character-counter",
    group: "measure",
    keywords: ["characters", "char count", "letters", "length"],
    purpose: "Check a text length limit.",
    primary: true,
  },
  {
    label: "Case Converter",
    href: "/case-converter",
    group: "case",
    keywords: ["case", "uppercase", "lowercase", "title case", "sentence case", "swap case"],
    purpose: "Choose among several capitalization styles.",
    primary: true,
  },
  {
    label: "Text Cleaner",
    href: "/text-cleaner",
    group: "cleanup",
    keywords: ["clean", "normalize", "cleanup", "sanitize", "format"],
    purpose: "Clean spacing and formatting in one editor.",
    primary: true,
  },
  {
    label: "UTF-8 Byte Counter",
    href: "/byte-counter",
    group: "measure",
    keywords: ["utf8", "byte size", "string length", "encoding", "bytes"],
    purpose: "Measure the size of text in UTF-8.",
  },
  {
    label: "CSV to List",
    href: "/csv-to-list",
    group: "tables",
    keywords: ["extract spreadsheet column", "spreadsheet rows", "csv", "tsv"],
    purpose: "Extract one column from delimited data.",
  },
  {
    label: "List to CSV",
    href: "/list-to-csv",
    group: "tables",
    keywords: ["spreadsheet export", "one column", "list to csv", "rows"],
    purpose: "Export one item per row as a single CSV column.",
  },
  {
    label: "Uppercase Converter",
    href: "/uppercase-converter",
    group: "case",
    keywords: ["upper", "caps", "to uppercase"],
  },
  {
    label: "Lowercase Converter",
    href: "/lowercase-converter",
    group: "case",
    keywords: ["lower", "to lowercase"],
  },
  {
    label: "Title Case Converter",
    href: "/title-case-converter",
    group: "case",
    keywords: ["title case", "headline", "capitalize words"],
  },
  {
    label: "Sentence Case Converter",
    href: "/sentence-case-converter",
    group: "case",
    keywords: ["sentence case", "capitalize sentences"],
  },
  {
    label: "Alternating Case Converter",
    href: "/alternating-case-converter",
    group: "case",
    keywords: ["alternating", "spongebob", "mocking case"],
  },
  {
    label: "Text Case Checker",
    href: "/text-case-checker",
    group: "case",
    keywords: ["detect case", "case check"],
  },
  {
    label: "Match Case Converter",
    href: "/match-case-converter",
    group: "case",
    keywords: ["match case", "copy case", "apply casing"],
  },
  {
    label: "Remove Extra Spaces",
    href: "/remove-extra-spaces",
    group: "cleanup",
    keywords: ["spaces", "trim", "double spaces", "extra whitespace"],
  },
  {
    label: "Whitespace Cleaner",
    href: "/whitespace-cleaner",
    group: "cleanup",
    keywords: ["whitespace", "tabs", "spaces", "trim"],
  },
  {
    label: "Line Break Remover",
    href: "/line-break-remover",
    group: "cleanup",
    keywords: ["remove line breaks", "newlines", "join lines", "preserve paragraphs"],
    purpose: "Join wrapped lines and optionally keep paragraph breaks.",
  },
  {
    label: "Remove Duplicate Lines",
    href: "/remove-duplicate-lines",
    group: "cleanup",
    keywords: ["dedupe", "duplicate", "unique lines"],
  },
  {
    label: "Remove All Styling From Text",
    href: "/remove-all-styling-from-text",
    group: "cleanup",
    keywords: ["strip formatting", "plain text", "remove formatting"],
  },
  {
    label: "Case Insensitive Sort",
    href: "/case-insensitive-sort",
    group: "tables",
    keywords: ["sort", "alphabetize", "ignore case"],
  },
  {
    label: "Base64 Encode",
    href: "/base64-encode",
    group: "encoding",
    keywords: ["base64", "encode", "b64"],
    purpose: "Encode UTF-8 text as Base64.",
  },
  {
    label: "Base64 Decode",
    href: "/base64-decode",
    group: "encoding",
    keywords: ["base64", "decode", "b64"],
    purpose: "Read Base64 as UTF-8 text.",
  },
  {
    label: "URL Encode",
    href: "/url-encode",
    group: "encoding",
    keywords: ["url encode", "percent encode", "escape url"],
    purpose: "Escape a URL or an individual URL component.",
  },
  {
    label: "URL Decode",
    href: "/url-decode",
    group: "encoding",
    keywords: ["url decode", "percent decode", "unescape url"],
    purpose: "Read percent-encoded text.",
  },
  {
    label: "ASCII to Text",
    href: "/ascii-to-text",
    group: "encoding",
    keywords: ["ascii", "code to text"],
  },
  {
    label: "Text to ASCII",
    href: "/text-to-ascii",
    group: "encoding",
    keywords: ["ascii", "text to code"],
  },
  {
    label: "JSON to Text",
    href: "/json-to-text",
    group: "documents",
    keywords: ["json", "format json", "pretty"],
  },
  {
    label: "Text to JSON",
    href: "/text-to-json",
    group: "documents",
    keywords: ["json", "parse", "convert to json"],
  },
  {
    label: "XML to Text",
    href: "/xml-to-text",
    group: "documents",
    keywords: ["xml", "strip tags", "extract text"],
  },
  {
    label: "Text to XML",
    href: "/text-to-xml",
    group: "documents",
    keywords: ["xml", "wrap", "convert to xml"],
  },
  {
    label: "HTML to Text",
    href: "/html-to-text",
    group: "documents",
    keywords: ["html", "strip tags", "remove html"],
  },
  {
    label: "Text to HTML",
    href: "/text-to-html",
    group: "documents",
    keywords: ["html", "wrap", "convert to html", "escape"],
  },
  {
    label: "Comma Separated to List",
    href: "/comma-separated-to-list",
    group: "tables",
    keywords: ["csv", "commas", "split"],
  },
  {
    label: "List to Comma Separated",
    href: "/list-to-comma-separated",
    group: "tables",
    keywords: ["csv", "commas", "join"],
  },
  {
    label: "List to Table",
    href: "/list-to-table",
    group: "tables",
    keywords: ["table", "columns", "rows"],
    purpose: "Create a one-column table from a list.",
  },
  {
    label: "Table to List",
    href: "/table-to-list",
    group: "tables",
    keywords: ["table", "flatten", "extract spreadsheet column", "excel", "tsv"],
    purpose: "Flatten a pasted table into a list.",
  },
  {
    label: "Comma to JSON Array",
    href: "/comma-to-json-array",
    group: "documents",
    keywords: ["json array", "comma", "csv"],
  },
  {
    label: "JSON Array to List",
    href: "/json-array-to-list",
    group: "documents",
    keywords: ["json array", "list"],
    purpose: "Turn an array into a list, or work with JSON Lines.",
  },
  {
    label: "Text to Comma Separated List",
    href: "/text-to-comma-separated-list",
    group: "tables",
    keywords: ["comma", "csv", "join"],
  },
  {
    label: "Text to Bulleted Text List",
    href: "/text-to-bulleted-text-list",
    group: "tables",
    keywords: ["bullets", "bullet list", "markdown"],
  },
  {
    label: "Text to Ordered List",
    href: "/text-to-ordered-list",
    group: "tables",
    keywords: ["numbered list", "ordered", "steps"],
  },
  {
    label: "Binary to Text",
    href: "/binary-to-text",
    group: "encoding",
    keywords: ["binary", "bits", "decode binary"],
  },
  {
    label: "Text to Binary",
    href: "/text-to-binary",
    group: "encoding",
    keywords: ["binary", "bits", "encode binary"],
  },
  {
    label: "Hex to Text",
    href: "/hex-to-text",
    group: "encoding",
    keywords: ["hex", "hexadecimal", "decode hex"],
  },
  {
    label: "Text to Hex",
    href: "/text-to-hex",
    group: "encoding",
    keywords: ["hex", "hexadecimal", "encode hex"],
  },
  {
    label: "Text Diff Checker",
    href: "/text-diff",
    group: "review",
    keywords: ["compare versions", "compare text", "draft revisions", "line difference", "diff"],
    purpose: "Review changes between two versions line by line.",
  },
  {
    label: "Compare Two Lists",
    href: "/compare-two-lists",
    group: "review",
    keywords: ["compare lists", "reconcile ids", "find overlap", "intersection", "duplicate ids"],
    purpose: "Find shared entries and entries unique to each list.",
  },
  {
    label: "Unicode Inspector",
    href: "/unicode-inspector",
    group: "measure",
    keywords: ["invisible characters", "graphemes", "zero width", "code points", "unicode"],
    purpose: "Find code points, combining marks, and invisible characters.",
  },
  {
    label: "Batch Text File Converter",
    href: "/batch-text-files",
    group: "cleanup",
    keywords: ["batch files", "clean text files", "zip", "bulk normalize"],
    purpose: "Apply one cleanup to several TXT files.",
  },
  {
    label: "CSV and JSON Converter",
    href: "/csv-json-converter",
    group: "tables",
    keywords: ["convert csv json", "tsv json", "spreadsheet objects", "json records"],
    purpose: "Convert a multi-column table to or from JSON.",
  },
  {
    label: "Markdown Table Converter",
    href: "/markdown-table-converter",
    group: "tables",
    keywords: ["markdown csv", "markdown tsv", "pipe table", "spreadsheet"],
    purpose: "Convert a Markdown table to or from CSV or TSV.",
  },
  {
    label: "URL Query Builder",
    href: "/url-query-builder",
    group: "encoding",
    keywords: ["query parameters", "query string", "utm", "repeated keys", "url params"],
    purpose: "Read or edit URL parameters while keeping repeated keys.",
  },
  {
    label: "HTML and Markdown Converter",
    href: "/html-markdown-converter",
    group: "documents",
    keywords: ["html to markdown", "markdown to html", "rich text", "convert headings", "simple tables"],
    purpose: "Move headings, lists, code, and simple tables between HTML and Markdown.",
  },
  {
    label: "JSON Formatter",
    href: "/json-formatter",
    group: "documents",
    keywords: ["format json", "pretty print json", "minify json", "json validation", "syntax error"],
    purpose: "Indent, minify, or validate JSON while preserving exact numbers and escapes.",
  },
  {
    label: "XML Formatter",
    href: "/xml-formatter",
    group: "documents",
    keywords: ["format xml", "pretty print xml", "compact xml", "xml validation", "well formed"],
    purpose: "Indent, compact, or validate XML while preserving mixed text.",
  },
  {
    label: "File Base64 Converter",
    href: "/file-base64-converter",
    group: "encoding",
    keywords: ["file to base64", "base64 to file", "binary file", "data uri", "url safe base64"],
    purpose: "Encode local file bytes or decode Base64 into a downloadable file.",
  },
];

export const primaryTools = toolCatalog.filter((tool) => tool.primary);
