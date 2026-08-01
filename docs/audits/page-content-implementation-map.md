# Page content implementation map

Status: implemented editorial baseline, 2026-08-01. The canonical route registry in `app/site-config.ts` remains the source of truth. This map intentionally records route intent and visible behaviour; it does not create alternate query URLs.

## Field definitions

- **Input → output / settings** records the expected user workflow. Page copy must not promise another format, upload, download, server process, or control.
- **Metadata** records the search presentation target. `Current` refers to the pre-pass static output; `final` is the current route metadata or the target wording used by the shared presentation pass.
- **Content** records the required unique explanation, example, FAQ/trust status, related links, required action, and final verification state in one compact field: `guide/example/limits/links: verified` means all four are present and related links are canonical.
- **Evidence** uses the completed query-intent and competitor audits. `Q` means query-intent support; `C` means competitor terminology/expected workflow support.

| Route | Page type / indexability | Primary intent and variants | Input → output / key settings | Metadata (current → final) | Content / examples / FAQ / trust / related links | Evidence / action / verification |
|---|---|---|---|---|---|---|
| `/` | Directory / indexable | broad text converter | text → visible conversion; focused tool links | broad converter → Browser-Based Text Converters | concise directory, workflow FAQ, trust and canonical category links | Q/C; substantial rewrite; verified |
| `/word-counter` | Counter / indexable | count words | text → word, character, line metrics | Word Counter → Word Counter | segmentation example, limitation, counter links | Q/C; targeted edit; verified |
| `/character-counter` | Counter / indexable | count characters excluding spaces | text → graphemes, literal-space exclusion, lines, bytes | Character Counter → Character Counter - Count Characters Without Spaces | `A B` example, metric definition, counter links | Q/C; targeted edit; verified |
| `/byte-counter` | Counter / indexable | UTF-8 byte counter | text → UTF-8 bytes and Unicode metrics | UTF-8 Byte Counter → Byte Counter - Count UTF-8 Bytes | Unicode example, metric limits, byte links | Q/C; targeted edit; verified |
| `/case-converter` | Transform / indexable | change text case | text → selected case | Case Converter → Case Converter | case example, deterministic limitation, case links | Q/C; targeted edit; verified |
| `/uppercase-converter` | Transform / indexable | uppercase converter | text → uppercase | Uppercase Converter → Uppercase Converter - Convert Text to Uppercase | Unicode example and locale limit | Q/C; targeted edit; verified |
| `/lowercase-converter` | Transform / indexable | lowercase converter | text → lowercase | Lowercase Converter → Lowercase Converter - Convert Text to Lowercase | Unicode example and locale limit | Q/C; targeted edit; verified |
| `/title-case-converter` | Transform / indexable | simple title case | text → simple title case | Simple Title Case → Title Case Converter | exact title-case example and editorial-style limit | Q/C; targeted edit; verified |
| `/sentence-case-converter` | Transform / indexable | sentence case | text → sentence case | Sentence Case → Sentence Case Converter | punctuation example and heuristic limit | Q/C; targeted edit; verified |
| `/alternating-case-converter` | Transform / indexable | alternating case converter | text → grapheme-safe alternating case | Alternating Case → Alternating Case Converter - Generate aLtErNaTiNg Text | exact example, cased-letter rule, case links | Q/C; targeted edit; verified |
| `/text-cleaner` | Transform / indexable | clean text | text → selected cleanup | Text Cleaner → Text Cleaner | cleanup example, no-rewrite limit, cleanup links | Q/C; targeted edit; verified |
| `/remove-extra-spaces` | Transform / indexable | remove extra spaces | text → normalized spaces | Remove Extra Spaces → Remove Extra Spaces | spacing example, code-layout caution | Q/C; targeted edit; verified |
| `/whitespace-cleaner` | Transform / indexable | remove hidden whitespace | text → selected whitespace cleanup | Whitespace Cleaner → Whitespace Cleaner | non-breaking-space note, review limit | Q/C; targeted edit; verified |
| `/line-break-remover` | Transform / indexable | line removal / remove newlines | text → joined lines; separator and paragraph settings | Line Break Remover → Line Break Remover - Remove Newlines Online | exact newline example, soft-wrap guidance, cleanup links | Q/C; substantial rewrite; verified |
| `/remove-duplicate-lines` | Transform / indexable | deduplicate lines | lines → unique lines; comparison settings | Remove Duplicate Lines → Remove Duplicate Lines | repeated-line example and equality limit | Q/C; targeted edit; verified |
| `/case-insensitive-sort` | Transform / indexable | alphabetical line sort | lines → sorted lines | Case-Insensitive Sort → Case-Insensitive Sort | sort example, collation limit | Q/C; targeted edit; verified |
| `/base64-encode` | Encoding / indexable | Base64 encode | UTF-8 text → Base64 | Base64 Encoder → Base64 Encode Text | `hello` example, encoding-not-encryption limit | Q/C; targeted edit; verified |
| `/base64-decode` | Encoding / indexable | Base64 to text | Base64 → text | Base64 Decoder → Base64 to Text Decoder | exact decode example, trust limit | Q/C; targeted edit; verified |
| `/url-encode` | Encoding / indexable | URL encode | text → component/form value | URL Encode → URL Encode - Component or Form Value | `%20`/`+` example and no-navigation limit | Q/C; targeted edit; verified |
| `/url-decode` | Encoding / indexable | URL decode | percent text → UTF-8 text | URL Decode → URL Decode - Component or Form Value | plus-mode example, strict-error limit | Q/C; targeted edit; verified |
| `/text-case-checker` | Analyzer / indexable | detect text case | text → case analysis | Text Case Checker → Text Case Checker | pattern example and intentional-mixed-case limit | Q/C; targeted edit; verified |
| `/match-case-converter` | Transform / indexable | match casing pattern | pattern + text → matched case | Match Case → Match Case Converter | pattern example and mechanical-rule limit | Q/C; targeted edit; verified |
| `/ascii-to-text` | Encoding / indexable | ASCII decimal to text | decimal 0–127 → ASCII; separators | ASCII Decimal → ASCII to Text Converter | `72 105` example, controls and range limit | Q/C; targeted edit; verified |
| `/text-to-ascii` | Encoding / indexable | text to ASCII | ASCII text → decimal 0–127 | Text to ASCII → Text to ASCII Converter | `Hi` example, no transliteration limit | Q/C; targeted edit; verified |
| `/json-to-text` | Structured / indexable | JSON to text | JSON → selected text | JSON to Text → JSON to Text Converter | JSON example, parse/no-fetch limit | Q/C; targeted edit; verified |
| `/text-to-json` | Structured / indexable | text to JSON | text → valid JSON; selected mode | Text to JSON → Text to JSON Converter | line-array example, schema limit | Q/C; targeted edit; verified |
| `/xml-to-text` | Structured / indexable | XML to text | XML → all/selected text and optional attribute | XML to Text → XML to Text Converter - Extract Text from XML | selected-element example, DTD/entity rejection, XML links | Q/C; targeted edit; verified |
| `/text-to-xml` | Structured / indexable | text to XML | text → validated XML; mode, names, declaration, blanks, index | Text to XML → Text to XML Converter - Convert Lines to XML | XML example, name/control validation, XML links | Q/C; targeted edit; verified |
| `/html-to-text` | Structured / indexable | HTML to text | inert HTML → readable text; structure/safe links | HTML to Text → HTML to Text Converter - Strip HTML Tags | tag example, inert-parser rule, HTML links | Q/C; targeted edit; verified |
| `/text-to-html` | Structured / indexable | text to HTML | text → escaped HTML; mode/document settings | Text to HTML → Text to HTML Converter - Convert Plain Text to HTML | escaped-tag example, generated-preview rule | Q/C; targeted edit; verified |
| `/comma-separated-to-list` | List / indexable | comma to lines | simple delimiter text → lines | Comma to List → Comma-Separated to List | delimiter example, CSV distinction | Q/C; targeted edit; verified |
| `/list-to-comma-separated` | List / indexable | list to comma | lines → joined text | List to Comma → List to Comma-Separated | join example, CSV distinction | Q/C; targeted edit; verified |
| `/list-to-csv` | CSV / indexable | list to CSV online | lines → escaped one-column CSV; header/delimiter/EOL/BOM | List to CSV → List to CSV Converter - Convert Lines to CSV | CSV example, one-column limit | Q/C; targeted edit; verified |
| `/csv-to-list` | CSV / indexable | CSV to list / extract column | quoted CSV → selected line list; header/delimiter/quote | CSV to List → CSV to List Converter - Extract a CSV Column | column example, strict parsing limit | Q/C; targeted edit; verified |
| `/list-to-table` | List / indexable | list to table | lines → table format | List to Table → List to Table Converter | table example and no-live-sheet limit | Q/C; targeted edit; verified |
| `/table-to-list` | List / indexable | table to list | table text → selected lines | Table to List → Table to List Converter | column example and pasted-text limit | Q/C; targeted edit; verified |
| `/comma-to-json-array` | Structured / indexable | comma to JSON array | delimiter text → JSON array | Comma to JSON → Comma to JSON Array | JSON example, quoted-CSV limit | Q/C; targeted edit; verified |
| `/json-array-to-list` | Structured / indexable | JSON array to list | JSON array → lines | JSON Array to List → JSON Array to List | array example, nested-value limit | Q/C; targeted edit; verified |
| `/text-to-comma-separated-list` | List / indexable | text to comma separated list | lines → joined text | Text to Comma List → Text to Comma-Separated List - Join Lines | exact lines example, CSV distinction | Q/C; targeted edit; verified |
| `/text-to-bulleted-text-list` | List / indexable | text to bullets | lines → bullets; visible bullet setting | Text to Bulleted List → Text to Bulleted List | bullet example, plain-text limit | Q/C; targeted edit; verified |
| `/text-to-ordered-list` | List / indexable | text to ordered list | lines → numbered text; visible numbering setting | Text to Ordered List → Text to Ordered List | numbering example, plain-text limit | Q/C; targeted edit; verified |
| `/binary-to-text` | Encoding / indexable | binary to text | eight-bit UTF-8 groups → text; format/separator | Binary to Text → Binary to Text Converter - Decode UTF-8 Bytes | `01001000` example, strict-byte limit | Q/C; targeted edit; verified |
| `/text-to-binary` | Encoding / indexable | text to binary | UTF-8 text → eight-bit groups; separator | Text to Binary → Text to Binary Converter - UTF-8 Bytes | `Hi` example, UTF-8-byte distinction | Q/C; targeted edit; verified |
| `/hex-to-text` | Encoding / indexable | hex to text | hex bytes → UTF-8 text; selected format/prefix | Hex to Text → Hex to Text Converter - Decode Hexadecimal | `48 69` example, no-Latin-1 limit | Q/C; targeted edit; verified |
| `/text-to-hex` | Encoding / indexable | text to hex | UTF-8 text → hex bytes; case/separator/prefix | Text to Hex → Text to Hex Converter - UTF-8 Text to Hex | byte example, code-point distinction | Q/C; targeted edit; verified |
| `/remove-all-styling-from-text` | Transform / indexable | plain text converter / remove formatting | formatted text → plain text | Remove All Styling → Plain Text Converter - Remove Text Formatting | markup example, no-rewrite limit | Q/C; targeted edit; verified |
| `/about` | Trust / indexable | maintainer and scope | site information → trust context | About → About AllTextConverters | maintainer context, factual scope, policy links | Q; targeted edit; verified |
| `/contact` | Trust / indexable | contact / correction | issue report → contact channel | Contact → Contact AllTextConverters | safe reproduction guidance and policy links | Q; leave unchanged; verified |
| `/privacy-policy` | Policy / noindex | privacy information | policy text → user information | Privacy Policy → Privacy Policy | factual policy content and footer links | N/A; noindex content only; verified |
| `/terms-of-service` | Policy / noindex | terms information | policy text → user information | Terms → Terms of Service | factual policy content and footer links | N/A; noindex content only; verified |
| `/cookies-policy` | Policy / noindex | cookie information | policy text → user information | Cookies → Cookies Policy | factual policy content and footer links | N/A; noindex content only; verified |

## Verification rules

1. Static output must retain exactly one title, description, H1, and canonical for every canonical route.
2. Every link in the shared page-content registry must point at a path in the canonical registry; redirect-style URLs are not used.
3. Page-specific claims are limited to visible controls and converter behaviour. No page claims a ranking, AdSense approval, no advertising, absolute privacy, a remote upload, or a server conversion.
4. The page content registry is intentionally content-only. It does not introduce loaders, actions, server functions, advertising code, or new URLs.
