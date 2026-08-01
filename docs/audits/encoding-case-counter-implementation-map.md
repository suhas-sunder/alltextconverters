# Encoding, case, and counter implementation map

Verified against the route manifest and audit matrices.

| Canonical route(s) | Intent / current risk | Shared engine | Status | Executable coverage |
| --- | --- | --- | --- | --- |
| `/html-to-text`, `/text-to-html` | Safe markup extraction / generation | inert resource-blocked HTML parser + escaping generator | complete for this workstream | blocks, lists, tables, resources, unsafe links, all generation modes, UI actions |
| `/xml-to-text`, `/text-to-xml` | XML extraction / valid generation and parser safety | shared XML parser, traversal, names, escaping, and validation | complete for this workstream | malformed XML, multiple roots, controls, DTD/entity rejection, namespaces, selection, attributes, round trip |
| `/base64-encode`, `/base64-decode` | UTF-8 Base64 | byte engine | previously completed; unchanged except existing shared engine work | existing Unicode and invalid UTF-8 coverage |
| `/url-encode`, `/url-decode` | URL component versus form value | URL engine | complete for this workstream | component/form, literal plus, lone surrogate, malformed percent/UTF-8, mounted UI |
| `/text-to-hex`, `/hex-to-text`, `/text-to-binary`, `/binary-to-text` | UTF-8 bytes | strict byte engine | complete for this workstream | Unicode round trips, separators, prefixes, invalid syntax/UTF-8 |
| `/text-to-ascii`, `/ascii-to-text` | ASCII decimal conversion | strict ASCII engine | complete for this workstream | 0–127, controls, non-ASCII/range/token errors |
| Case routes | Unicode-aware case conversion and analysis | shared `app/client/text/case.ts` engine | complete for this workstream | real engine fixtures plus mounted general/match route cards |
| `/character-counter`, `/word-counter`, `/byte-counter` | Shared Unicode and UTF-8 statistics | shared `app/client/text/metrics.ts` engine | complete for this workstream | exact Unicode fixtures, segmentation cases, size bands, and mounted debounced counter UI |

## Final route settings and defaults

- HTML to Text: preserve paragraph breaks, list markers, table structure, and collapse repeated blank lines on; append safe link URLs off. Script/style/template/frame/object/embed/image/media/link content is ignored in an inert document with a no-resource CSP. Actions: Convert, Copy, Download TXT, Clear, Load example, Reset settings.
- Text to HTML: paragraph mode with internal newlines rendered as `<br>`; BR, PRE, unordered-list, ordered-list, internal-line, full-document, and title controls are explicit. Source is always escaped. Preview renders only a generated fragment. HTML download uses `text/html;charset=utf-8` and `converted-text.html`.
- XML to Text: Extract all text default; one line per selected element and preserve-boundaries modes available. An unprefixed selection matches a case-sensitive local name; a prefixed selection matches the qualified name. One optional attribute uses `[name=value] text`; missing values use `(missing)`. XPath is absent.
- Text to XML: root `root`, child `item`, one child per nonblank line, declaration off, blank records ignored, index off. Single-root-text and paragraph modes are available. Invalid/reserved `xml*` names and XML-invalid controls fail; generated XML is reparsed before success.
- URL Encode and Decode: component mode default; form-value mode explicit. Component decode retains `+`; form decode maps `+` to space. Literal `+` encodes as `%2B`.
- Text to Hex: UTF-8 only, lowercase, two digits per byte, space separator, no prefix. Uppercase, none/comma/custom separator, and per-byte `0x` are formatting controls.
- Hex to Text: space-separated default; continuous, comma, and custom modes explicit; `0x` prefixes opt-in. Separated groups require two digits and output must be valid UTF-8.
- Text to Binary: UTF-8 only, eight bits per byte, one-space separator. None and custom literal separators are available.
- Binary to Text: space-separated eight-bit groups default; continuous and custom modes available. No stripping, padding, seven-bit guessing, or replacement decoding occurs.
- Text to ASCII: decimal, space-separated, strict values 0–127; comma and custom output separators available.
- ASCII to Text: decimal space-separated default; comma and custom input separators available. Values 0–31 and 127 decode accurately and are shown by control name/escape in a details area capped at 200 rows.

## Shared interaction and size policy

All affected tools use explicit conversion. Source and current output are separate. Changing source/settings and every failed regeneration clears stale output, so Copy and Download use only the current successful result. Errors use an alert region; conversion and copy completion use a polite atomic status region. Settings use fieldsets, controls and textareas have visible labels, and primary controls have a 44 CSS-pixel minimum height.

UTF-8 input-size thresholds are 100 KB for the normal interactive band, 1 MB for a prominent warning, and a hard browser-processing limit above 5 MB. Accepted output is complete. Per-record detail/preview is capped at 200 rows with truncation disclosed. Worker processing remains deferred: tests cover up to 5 MB synchronously, and a Worker should be added only after profiling demonstrates a meaningful responsiveness benefit.

No synonym route was added. Static prerendering, root-owned canonicals, sitemap membership, placeholder ads, and browser-local processing remain the foundation.

## Case and counter route decisions

| Route | Previous behavior / risk | Final intent and behavior | Retained / changed / removed | Defaults | Engine / limitations | Tests and status |
| --- | --- | --- | --- | --- | --- | --- |
| `/case-converter` | Mutated one editor while typing and contained private case algorithms | Broad explicit five-mode converter with separate source/output and characters, words, and lines | Retained common modes and copy; added TXT, sample, reset, result invalidation; removed PDF/upload and speculative extra modes from this broad UI | Uppercase | Shared case + metrics; focused routes hold specialist controls | Mounted mode/reset/copy test; complete |
| `/uppercase-converter` | Route-local uppercase logic and oversized file/PDF interface | Direct uppercase conversion preserving non-case content and lines | Retained core transform/copy/download; added source/output, sample, clear; removed unnecessary settings | Uppercase fixed | Shared case engine; Unicode default mapping, no locale selector | Unicode/punctuation/line fixtures; complete |
| `/lowercase-converter` | Route-local lowercase behavior | Direct lowercase conversion preserving non-case content and lines | Same focused simplification as uppercase | Lowercase fixed | Shared case engine; no locale selector | Unicode/punctuation/line fixtures; complete |
| `/title-case-converter` | ASCII-oriented “capitalize every word” behavior was described too broadly as headline correctness | Simple title case: first cased grapheme uppercase, remaining cased graphemes lowercase; apostrophes stay internal and hyphens start segments | Retained one deterministic model; corrected claims; no style presets | Simple title case fixed | Shared case engine; acronyms become ordinary title-cased words; not AP/Chicago/APA/MLA | Apostrophe, hyphen, acronym, punctuation, multiline, Unicode fixtures; complete |
| `/sentence-case-converter` | Lightweight punctuation handling with route-local implementation | Lowercase first, then capitalize first cased grapheme at document/line start and after `.?!。！？`; ignore decimal points between digits | Retained deterministic model; added line, Unicode punctuation, decimal handling; no language presets | Sentence case fixed | Shared case engine; abbreviations, initials, ellipses, and language-specific boundaries remain heuristic | Boundary, quote, decimal, abbreviation, ellipsis, multiline, Unicode fixtures; complete |
| `/alternating-case-converter` | ASCII letters and an “ignore spaces” toggle; no start control | Grapheme-safe starting-case and alternation-unit controls | Retained canonical task and letters-only intent; replaced ambiguous space toggle with letters/every-grapheme mode | Start lowercase; cased letters only | Shared case engine; every-grapheme mode advances on uncased graphemes but only cased text changes | Both starts/modes, emoji, combining, ZWJ, accents, uncased scripts; complete |
| `/text-case-checker` | ASCII-only checks could classify no-letter content ambiguously | Live analysis for empty, no cased letters, uncased text, uppercase, lowercase, title-like, sentence-like, and mixed | Retained analysis workflow; added explicit counts and heuristic wording; removed per-line report expansion | Live, no setting | Shared case engine; title/sentence labels are heuristics | All classifications and Unicode cases; complete |
| `/match-case-converter` | ASCII-only repeating pattern | Repeat only the pattern’s cased-grapheme sequence over only cased target graphemes | Retained repeat policy and two inputs; made mismatch behavior explicit; preserved non-case target content | Repeating pattern | Shared case engine; no-cased pattern preserves target with warning | Short/long/no-case, punctuation, emoji, Unicode fixtures and mounted stale-output test; complete |
| `/character-counter` | UTF-16 units were labeled as characters and “no spaces” removed all whitespace | Visible graphemes, graphemes excluding literal U+0020, words, and lines primary; exact advanced Unicode metrics | Retained copy/upload/TXT/PDF/clear; added sample/reset/advanced; removed case tools, history, time estimates | Live 180 ms debounce | Shared metrics; `Intl.Segmenter` with documented fallback | Exact accents, emoji, ZWJ, flags, whitespace, CRLF fixtures and mounted expansion test; complete |
| `/word-counter` | Whitespace count plus unrelated case/history/time controls | Words, graphemes, literal-space exclusion, and lines primary; paragraphs retained in advanced | Retained copy/upload/TXT/PDF/clear; added sample/reset; removed case, history, reading/speaking recommendations | Live 180 ms debounce | `Intl.Segmenter` word mode; fallback keeps internal apostrophes/hyphens; language boundaries vary | Contractions, hyphens, numbers, CJK, emoji, blank fixtures; complete |
| `/byte-counter` | Minimal live UTF-8 interface | UTF-8 bytes primary with grapheme, code-point, and UTF-16 support plus examples | Retained shared metrics and example; added copy/upload/download/advanced/reset/size policy | UTF-8 only, live 180 ms debounce | Shared metrics; byte count is not formatted-file size | UTF-8 fixtures and shared mounted counter coverage; complete |

The audit does not justify a character-without-spaces synonym route. The existing Character Counter exposes that intent using an exact U+0020 definition. No case-converter synonym route was added.

## Shared case, counter, and performance policy

`Intl.Segmenter` provides grapheme segmentation where available. Its deterministic fallback keeps combining marks, emoji modifiers, variation selectors, ZWJ sequences, and regional-indicator pairs together. Word segmentation uses `Intl.Segmenter`; the fallback counts Unicode letter/number runs with internal apostrophes and hyphens. Neither fallback claims universal linguistic precision.

Counters debounce computation by 180 ms and do not announce each keystroke. The normal band runs through 100 KB, a prominent warning starts at 1 MB, and input above 5 MB is blocked. Tests execute metrics through 1 MB and verify the 5 MB boundary; synchronous 5 MB grapheme/word profiling and a Worker remain deferred until real browser profiling demonstrates a need.
