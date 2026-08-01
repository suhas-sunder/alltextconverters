# Encoding and text-metrics policies

Modern text conversion uses UTF-8 bytes by default. JavaScript UTF-16 code units, Unicode code points, grapheme clusters, UTF-8 bytes, ASCII values, hexadecimal byte notation, binary byte notation, and Base64 are different measurements or representations.

- Base64 encodes UTF-8 bytes for text; it is not encryption. Decode uses fatal UTF-8 decoding and reports invalid byte sequences.
- Hex and binary represent UTF-8 bytes. Hex accepts only a selected continuous/separated format and optional `0x`; odd lengths, bad widths, empty tokens, non-hex input, and invalid UTF-8 fail. Binary requires complete eight-bit bytes and rejects invalid characters, empty groups, incomplete bytes, and invalid UTF-8.
- ASCII routes accept decimal values and characters only from 0 through 127. Non-ASCII characters are rejected rather than transliterated or mislabeled. ASCII 0–31 and 127 decode accurately and are named in the UI because they may be invisible.
- URL tools use URL-component percent encoding by default. Form-value `+` handling is a distinct mode. Encode rejects unpaired surrogates; decode rejects malformed percent pairs and malformed UTF-8 without partial success.
- HTML is parsed inertly with remote resource types blocked; user markup is never mounted or executed. Text-to-HTML always escapes the source, and preview renders generated HTML only.
- XML is separate from HTML parsing. External DTD/entity, `SYSTEM`, `PUBLIC`, and parameter-entity declarations are rejected before parsing. Generated XML uses validated non-namespace names, escapes text/attributes, rejects XML-invalid controls, and is reparsed before success.
- Counters label UTF-16 code units explicitly. Grapheme count uses `Intl.Segmenter` where available and otherwise uses the documented combining-mark/emoji-sequence fallback; UTF-8 byte count is not a general saved-file size.
- Inputs, outputs, file names, and clipboard content remain local. No converter data is put in URLs, sent to analytics/ads, logged by converter code, or sent to a conversion server.

## XML behavior

XML-to-text supports all-text extraction, boundary-labeled extraction, and one line per selected element. Unprefixed selectors match case-sensitive local names, including namespaced elements; prefixed selectors match qualified names. One optional attribute may be included as `[name=value] text`, with `(missing)` used predictably. XPath and external resource resolution are unsupported.

Text-to-XML defaults to `root` / `item`, one child per nonblank line, no declaration, no blank record, and no index attribute. Single-element and paragraph modes are explicit. Names beginning with any case variation of `xml` are reserved and rejected. Invalid names never fall back silently.

## Input and preview limits

Explicit HTML, XML, URL, hex, binary, and ASCII conversions measure size in UTF-8 bytes: normal interactive input through 100 KB, a visible warning at 1 MB, and a hard limit above 5 MB. Accepted output remains complete. Per-value details or previews show at most 200 rows and disclose truncation. Processing is synchronous and browser-local. Worker work is deferred until profiling demonstrates a meaningful need; no remote processing fallback is permitted.

## Case conversion policy

All case routes use `app/client/text/case.ts`. Grapheme-sensitive operations use `Intl.Segmenter`; the fallback keeps combining marks, emoji modifiers, variation selectors, joined emoji sequences, and flag pairs together. Scripts without case remain unchanged.

- Title Case is simple per-word capitalization, not an editorial style. It uppercases the first cased grapheme, lowercases later cased graphemes, keeps apostrophes internal, and starts a new segment after hyphens or other punctuation. Acronyms are not specially preserved.
- Sentence Case lowercases cased text first and capitalizes document, logical-line, and deterministic punctuation starts. It recognizes `.`, `?`, `!`, `。`, `？`, and `！`, and ignores decimal points between digits. Abbreviations, initials, ellipses, and language-specific boundaries remain heuristic.
- Alternating Case defaults to lowercase first and cased-letters-only advancement. Every-grapheme mode advances on every grapheme but changes only text with casing.
- Match Case repeats the pattern's cased-grapheme sequence over cased target graphemes. A pattern without cased letters preserves the target and produces a warning.
- Case checking distinguishes empty input, no cased letters, uncased-script text, uppercase, lowercase, title-like, sentence-like, and mixed text. Title-like and sentence-like are heuristic labels.

## Counter policy

Counter definitions are shared by Character Counter, Word Counter, and Byte Counter. Primary visible characters are grapheme clusters. “Excluding spaces” removes only literal U+0020. “Excluding all Unicode whitespace” uses the Unicode whitespace class. Logical lines return zero for empty input and retain a final empty line after a trailing newline.

Word count uses `Intl.Segmenter` word-like segments. The deterministic fallback counts Unicode letter/number runs and retains internal apostrophes and hyphens; neither method claims universal linguistic precision. UTF-8 bytes are never labeled as characters or as a complete formatted-file size.

Counters update after a 180 ms debounce, do not render one row per character, and do not announce each edit through `aria-live`. They use the same size bands: normal through 100 KB, a warning from 1 MB, and a hard limit above 5 MB. Worker processing remains deferred pending browser profiling.

## Permanent invariants

- All case routes use the shared case engine.
- UTF-16 code units are never labeled simply as characters.
- Alternating and match-case processing must not split grapheme sequences.
- Title and sentence behavior must not claim unsupported linguistic or style-guide precision.
- All counter routes use the shared metrics engine.

External DTD/entity declarations must be rejected. Generated XML is reparsed. Component/form URL behavior remains distinct. Hex/binary use UTF-8 bytes. Malformed encoded input is never silently discarded. ASCII is 0–127. Route controls have executable behavioral coverage. Conversion remains browser-local. Static prerendering remains intact.
