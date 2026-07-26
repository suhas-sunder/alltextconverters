# Current implementation plan

This plan contains only work required for the current growth, CTR, trust, technical SEO, accessibility, performance, and AdSense-readiness phase. It preserves the existing visual system, framework, local-processing model, and public route vocabulary except for repairing legacy redirects and consolidating one proven duplicate after search-data review.

Global prerequisite: obtain and import `alltextconverters.com_SearchPerformanceOverview_All_7_12_2026.csv` and the approximately 884-query GSC/Bing exports. Until those files exist, leave metrics unknown and do not make CTR-driven redirect, title, or new-page decisions. Technical defects do not depend on those exports.

## Prompt 1 — Sitewide foundation, trust, ads, and technical SEO

Recommended Codex model: GPT-5.6 Sol  
Reasoning level: High

### Priority and dependencies

Critical. This prompt must precede ad activation and content/CTR work. Principal scored tasks: redirect loop 100.00; soft 404 62.50; canonicals/cookies 62.50; unsupported About claims 31.25; consent/ads 11.11 (critical dependency despite score); dependency/typecheck remediation 20.83.

### Exact routes affected

- Sitewide content routes: `/`, `/word-counter`, `/character-counter`, `/case-converter`, `/uppercase-converter`, `/lowercase-converter`, `/title-case-converter`, `/sentence-case-converter`, `/alternating-case-converter`, `/text-cleaner`, `/remove-extra-spaces`, `/whitespace-cleaner`, `/line-break-remover`, `/remove-duplicate-lines`, `/case-insensitive-sort`, `/base64-encode`, `/base64-decode`, `/url-encode`, `/url-decode`, `/text-case-checker`, `/match-case-converter`, `/ascii-to-text`, `/text-to-ascii`, `/json-to-text`, `/text-to-json`, `/xml-to-text`, `/text-to-xml`, `/html-to-text`, `/text-to-html`, `/comma-separated-to-list`, `/list-to-comma-separated`, `/list-to-table`, `/table-to-list`, `/comma-to-json-array`, `/json-array-to-list`, `/text-to-comma-separated-list`, `/text-to-bulleted-text-list`, `/text-to-ordered-list`, `/binary-to-text`, `/text-to-binary`, `/hex-to-text`, `/text-to-hex`, `/remove-all-styling-from-text`, `/privacy-policy`, `/terms-of-service`, `/cookies-policy`, `/contact`, `/about`.
- Legacy routes: `/sort-list`, `/deduplicate-list`.
- Wildcard unmatched URLs.

### Exact components or systems affected

- `app/root.tsx`, `app/routes.ts`, `app/routes/not-found.tsx`, `app/routes/sort-list.tsx`, `app/routes/deduplicate-list.tsx`.
- Every route `meta` implementation under `app/routes/*.tsx`; preferably one typed shared metadata factory under `app/routes/_shared/`.
- `app/client/components/navigation/Navbar.tsx`, `Footer.tsx`, breadcrumb components, shared `FaqSection`/JSON-LD patterns, root error boundary, and HelpfulTools placement.
- `app/routes/about.tsx`, About components/schema, `/contact`, all three policy files.
- `public/sitemap.xml`, `public/robots.txt`, `public/ads.txt`, `_redirects`, Netlify/Express canonical-host handling.
- New shared systems only: `AdSlot`, placement/density policy, consent/ad-loading boundary, local-only analytics contract, reviewed/issue-report component, and test fixtures.
- Package versions/types for React Router/Vite/jsPDF/mammoth and confirmation/removal of unused legacy `@remix-run/netlify` only if truly unused.

### Required behavior

1. Make `https://www.alltextconverters.com` with no trailing slash the sole canonical host/path convention.
2. Emit a real self-referential canonical link on every indexable content page. Never canonicalize `/cookies-policy` to `/cookies`.
3. Make `/sort-list` permanently redirect in one hop to `/case-insensitive-sort`; keep `/deduplicate-list` one-hop to `/remove-duplicate-lines`.
4. Unmatched URLs return HTTP 404 with the existing plain not-found design. Replace the five broken suggestions with actual routes.
5. Generate the sitemap from the canonical indexable route registry. Exclude redirects and noindex policy pages. Emit truthful lastmod or omit it.
6. Replace missing social-image references with one real optimized asset or omit the tags until it exists. Asset requests must return the expected image MIME type, never the SPA HTML fallback.
7. Remove duplicate BreadcrumbList output and unsupported FAQ JSON-LD. Keep visible FAQs. Use factual WebSite/Organization and About Person data only.
8. Rewrite About to the owner-supplied facts only: Suhas Sunder; builds/maintains the tools; bachelor's degree in Engineering and Management; master's degree in Electrical and Computer Engineering; portfolio; LinkedIn; testing methodology; contact path. Do not reference the missing photo until it is supplied.
9. Remove the unsupported response-time claim from Contact. Add a redacted reproduction template and warn not to send sensitive converted content.
10. Update home/policy/footer claims so they do not say “no ads” and do not promise “no tracking” if consented analytics/AdSense may run. State exactly that conversion input/output is not collected by application telemetry.
11. Integrate a Google-certified CMP/TCF-compatible consent path before calling ad tags where required. Ads and nonessential analytics must respect the signal.
12. Add the six requested slot capabilities, not six mandatory simultaneous ads. Enforce page eligibility, density cap, breakpoints, reserved dimensions, and suppression described in the audit.
13. Side rails are static and visible only at very wide desktop. No ad may split a tool's input, output, controls, primary action, or result.
14. Fix TypeScript; add a declaration/typed adapter for mammoth's browser entry and correct CaseMode values without changing visible case names.
15. Update vulnerable direct dependencies within the current architecture, inspect changelogs, and keep the lockfile reproducible. Do not perform a framework rewrite.

### Ad settings and defaults

- Top slot: responsive desktop 970×90, tablet 728×90, mobile 320×50/100; static; home/tool pages only by default.
- Side rails: 160×600 static at approximately 1600 px or wider with at least 24 px gutter; otherwise absent; one rail if two cannot fit without narrowing content.
- Below-utility and before-All-Tools banners: responsive sizes as above, 24 px or more from adjacent content.
- Information square: 300×250 between complete explanatory subsections only.
- Visible label: `Advertisement`; slot is not styled/focused as a control.
- Density default: no more than three in-content/banner impressions on a normal tool page, plus at most one side rail. Short pages show fewer.
- No requested/filled slot collapses after it has shifted content. Ineligible/no-request slots are omitted before layout.

### Edge cases

- HTTP/HTTPS, apex/`www`, trailing slash, percent-encoded paths, case variants, query strings, and unknown nested paths.
- A no-fill ad response, denied consent, late consent change, blocked ad script, 200%/400% zoom, 320 px reflow, and a viewport between sidebar breakpoints.
- Missing social asset and asset fallback rewrite.
- Structured data when a maintainer photo is absent.
- Error boundary responses versus wildcard 404 response.
- CMP disabled, nonpersonalized/limited ads, and tags that must not fire before consent state.

### SEO requirements

- One unique H1, title, description, canonical, and BreadcrumbList per content URL.
- Canonical/internal-link/sitemap/redirect signals agree.
- No FAQ rich-result markup; validate retained schema in Google's Rich Results Test/schema validator as appropriate.
- Policies remain `noindex, follow` unless the owner explicitly chooses indexing; they are excluded from sitemap.
- Do not change tool titles for CTR in this prompt except to remove false/unsupported claims.

### Accessibility requirements

- Add a skip-to-tool/main link; maintain visible focus.
- Mobile navigation behaves as a dialog: programmatic name, focus trap, Escape, focus return, inert background.
- Search has a label and keyboard result behavior.
- Ads have visible/programmatic labels and never interrupt focus order.
- Consent UI is keyboard/screen-reader operable, choice-neutral, re-openable, and does not block essential local tools after a nonessential-cookie refusal.
- About image, when supplied, has intrinsic dimensions and useful alt text.

### Tests

- Route integration tests for every exact route, both aliases, wildcard 404, trailing slash, canonical host, status, Location, robots, title, H1, canonical, and schema count.
- Sitemap test against the canonical indexable route registry; no noindex/redirect/404 URL.
- Asset smoke test validates 200 image MIME and dimensions.
- Consent/ad unit tests ensure tags do not load before eligible state and slot eligibility/density/breakpoints are deterministic.
- Accessibility tests for nav, consent, skip link, schema-free visible FAQs, ads, and About/contact.
- Typecheck, production build, package audit review, and a crawl-link checker with zero internal 4xx/loop/soft-404 suggestions.

### Non-goals

- No redesign, new visual system, category pages, new converters, account system, remote content fetching, server-side text processing, or CTR title experiment.
- Do not show all six ad slots on every page.
- Do not add unsupported credentials or generic E-E-A-T language.

### Acceptance criteria

- All declared URLs and unknown URLs return the intended status; no redirect loop or chain beyond one hop for aliases.
- Every indexable content page renders the correct self-canonical; `/cookies` is not referenced.
- Sitemap/robots/index directives are consistent.
- No broken social/profile image response and no duplicate/unsupported structured data.
- About, policy, contact, home, and footer claims are factual and internally consistent.
- CMP/ad tags and six placement primitives satisfy the documented eligibility/CLS/accessibility constraints.
- Typecheck/build pass; direct dependency advisories have an explicit resolved/accepted record.

## Prompt 2 — Text cleanup, line, list, and CSV tools

Recommended Codex model: GPT-5.6 Sol  
Reasoning level: High

### Priority

Critical/High. Shared CSV parser correctness scores 15.63; rich clipboard behavior 20.83; line controls 10.67; duplicate merge 7.11 but is data-gated.

### Exact routes affected

- Cleanup: `/text-cleaner`, `/remove-extra-spaces`, `/whitespace-cleaner`, `/line-break-remover`, `/remove-duplicate-lines`, `/remove-all-styling-from-text`.
- Lists/tables/CSV: `/case-insensitive-sort`, `/comma-separated-to-list`, `/list-to-comma-separated`, `/list-to-table`, `/table-to-list`, `/comma-to-json-array`, `/json-array-to-list`, `/text-to-comma-separated-list`, `/text-to-bulleted-text-list`, `/text-to-ordered-list`.
- Redirect destination/source only if the search-data gate passes: `/text-to-comma-separated-list` to `/list-to-comma-separated`.

### Exact components or systems affected

- Corresponding `app/client/components/<route>/ToolCard.tsx`, transforms, HowItWorks, FAQ, route metadata, and upload/download handlers.
- New shared local modules: logical-line parser, RFC-compatible delimited-text parser/serializer, bounded preview, file reader/size guard, transformation result/status type, and safe rich-clipboard extractor.
- Shared accessible ToolCard field/fieldset/status/copy/download components created in prompt 1.

### Required behavior and defaults

#### Line and whitespace

- `/line-break-remover`: default replace logical CRLF/LF/CR with one space; preserve paragraphs on; presets for nothing, space, comma-space, semicolon-space, and tab; custom delimiter; explicit repeated-break and whitespace-only-line handling; optional trim-each-line and remove/collapse blank lines. Do not capitalize, add punctuation, or indent.
- `/remove-extra-spaces`: collapse horizontal space runs, preserve line breaks on, trim-each-line advanced off. Do not remove tabs/line breaks silently.
- `/whitespace-cleaner`: specialize in NBSP, zero-width, BOM/soft-hyphen, and unusual separators. Normalize U+2028/U+2029 to line breaks rather than delete/concatenate. Preserve tabs by default; offer explicit tab normalization.
- `/text-cleaner`: keep a one-click, disclosed safe preset (outer trim, line-ending normalization, repeated horizontal-space collapse, zero-width removal). It is not an advanced pipeline builder.
- `/remove-duplicate-lines`: exact matching default; preserve first-seen order on; case-insensitive optional; define blank-line behavior and Unicode normalization policy.
- `/case-insensitive-sort`: A–Z default, locale-aware deterministic comparison, stable ordering for equal folds, dedupe off.

#### Rich formatting

- `/remove-all-styling-from-text`: inspect `text/html` and `text/plain` on paste, sanitize/parse detached content, and produce plain text. Preserve paragraphs and list markers by default; preserve link URLs advanced off; collapse repeated spaces on; trim on; tabs preserved; destructive non-alphanumeric/emoji/punctuation removal is removed from this page or moved to a clearly separate advanced cleanup preset without changing the route's primary job.
- Raw HTML input remains supported but links to `/html-to-text` for advanced HTML extraction.

#### Lists and CSV

- Implement one local parser supporting comma/tab/semicolon/custom delimiter, quoted values, escaped quotes, quoted multiline values, CRLF/LF/CR, empty records, and clear unterminated-quote errors with row/column.
- `/comma-separated-to-list`: comma default with safe detection/override; output one item per line; trim unquoted outer padding by default; preserve quoted content; ignore empty records on with a visible toggle.
- `/list-to-comma-separated`: one line per item default; readable inline comma-space mode; custom delimiter; valid CSV mode with automatic quoting/escaping; optional custom header off; UTF-8 BOM off advanced; bounded preview.
- `/list-to-table`: line splitting default; whitespace splitting advanced; one-column preview; optional header off; HTML/CSV/TSV downloads.
- `/table-to-list`: detected input type shown; manual delimiter override; header-row toggle; choose column by header/name or index; trim on; ignore empty on; bounded preview.
- `/comma-to-json-array`: use the same CSV parser and produce JSON strings by default. Never infer booleans/numbers silently.
- `/json-array-to-list`: require top-level array; stringify objects on; define null/empty handling; show actionable JSON parse location.
- `/text-to-bulleted-text-list` and `/text-to-ordered-list`: keep existing workflows/settings except shared correctness/accessibility/file guards.
- `/text-to-comma-separated-list`: after actual GSC/Bing landing-page review, move any unique useful preset to `/list-to-comma-separated`, 301 to the selected canonical, remove it from sitemap/navigation, and retain no duplicate content. If search data shows the reverse URL is materially stronger, reverse the target while keeping one canonical implementation.

### File behavior

- Only accept relevant text/CSV/TSV/HTML formats on these routes. Remove PDF/DOCX upload where document text extraction changes list/CSV semantics or cannot be explained.
- Enforce size thresholds before reading; stream or worker-process large delimited input; provide progress/cancel; never send content to a server.
- CSV downloads use Blob, `text/csv;charset=utf-8`, predictable filenames, optional BOM only when selected, and formula-injection warning when spreadsheet-bound values begin with `=`, `+`, `-`, or `@`. Do not mutate user values silently.

### Edge cases

- CRLF/LF/CR mixtures; whitespace-only lines; tabs/indentation; Unicode whitespace; zero-width/BOM; emoji and combining marks.
- Values containing delimiters, quotes, embedded CRLF, empty quoted strings, trailing delimiters, blank rows, duplicate headers, uneven row widths, invalid CSV quotes, and very long cells.
- Rich clipboard lists, nested lists, paragraphs, links, scripts/styles, hidden elements, malformed fragments, and browsers that expose only `text/plain`.
- Stable sorting, locale/case folds, normalization-equivalent strings, and empty input.

### SEO requirements

- Do not add synonym routes.
- Titles/H1/copy say “CSV” only where the parser/output is CSV-correct.
- Give each cleanup route one distinct job in title, first paragraph, example, related tools, and metadata.
- The duplicate route merge uses one 301, one canonical, one sitemap URL, and updated internal links.
- Add concise examples that cover quoted commas/newlines and paragraph preservation; no generic filler.

### Accessibility requirements

- Every input/output/select/check group has label/legend/description.
- Conversion errors identify row/column and are announced; output update/copy/download success uses a polite status region.
- Preview tables use semantic table markup with captions/headers and remain horizontally scrollable without page overflow.
- Keyboard users can reach preset/custom controls, preview, result, and copy in logical order. Controls meet touch-size and focus requirements.

### Tests

- Unit/property tests for logical lines, every newline convention, whitespace-only lines, custom delimiters, and paragraph preservation.
- RFC CSV fixture matrix: delimiters, quotes, doubled quotes, multiline values, empty rows/cells, BOM, invalid quotes, uneven rows, round-trip parse/serialize.
- Clipboard tests for HTML/plain fallbacks, list/paragraph/link preservation, scripts/styles, malformed HTML, and no live DOM execution.
- Route/component tests for defaults, previews, file filters, size guards, errors/live announcements, copy/download MIME/filename, and no content network calls.
- Redirect/canonical/link test only after the search-data gate passes.

### Non-goals

- No spreadsheet editor, multi-column transformation language, batch file processing, pipeline builder, remote URL import, sorting controls duplicated on every list page, or synonym pages.
- No destructive text rewriting hidden under formatting removal.

### Acceptance criteria

- All settings/defaults in the matrix are implemented or explicitly rejected with evidence.
- CSV claims round-trip the fixture corpus without corruption.
- Rich clipboard paste yields readable plain text with paragraphs/lists preserved by default.
- Cleanup routes produce visibly different, documented outcomes.
- Large inputs do not lock the UI beyond the measured budget and can be canceled where worker processing is used.
- No route merge occurs without restored landing-page data; once approved, only one indexable list-to-comma URL remains.

## Prompt 3 — HTML, XML, encoding, case, and counter tools

Recommended Codex model: GPT-5.6 Sol  
Reasoning level: High

### Priority

Critical/High. Counter semantics 20.83; Base64 byte correctness 15.63; XML and encoding correctness are release-blocking where silent corruption is possible.

### Exact routes affected

- HTML/XML/JSON: `/html-to-text`, `/text-to-html`, `/xml-to-text`, `/text-to-xml`, `/json-to-text`, `/text-to-json`.
- Base/URL/number encoding: `/base64-encode`, `/base64-decode`, `/url-encode`, `/url-decode`, `/ascii-to-text`, `/text-to-ascii`, `/binary-to-text`, `/text-to-binary`, `/hex-to-text`, `/text-to-hex`.
- Case: `/case-converter`, `/uppercase-converter`, `/lowercase-converter`, `/title-case-converter`, `/sentence-case-converter`, `/alternating-case-converter`, `/text-case-checker`, `/match-case-converter`.
- Counters: `/word-counter`, `/character-counter`.

### Exact components or systems affected

- Corresponding ToolCards, transform modules, route metadata, examples, HowItWorks/FAQ content, and file handlers.
- Shared byte encoding/decoding adapter using `TextEncoder`/fatal `TextDecoder`; strict Base64/Base64URL parser; hex/binary token parser; Unicode counter module; bounded worker protocol.
- Detached HTML/XML parsing utilities and validation result type.
- CaseMode types/maps and tested case transformation library.

### Required behavior and defaults

#### HTML/XML/JSON

- `/html-to-text`: detached parse; remove script/style/noscript/template; decode entities; preserve block separation/list markers; preserve line breaks on; collapse repeated spaces/blank lines on; zero-width cleanup on; preserve link URLs advanced off. Never execute pasted HTML.
- `/text-to-html`: escape all input; paragraph mode default; BR/PRE modes; fragment default; full-document advanced with explicit charset/title fields only if selected.
- `/xml-to-text`: parse errors with line/column when available; reject DOCTYPE/ENTITY declarations; collapse whitespace on; keep-line-breaks off and logically compatible; extract text namespace-agnostically; never resolve external entities.
- `/text-to-xml`: `root`/`line` defaults; validate XML names; split lines on; include empty off; index off; escape content; reject invalid XML control characters with positions.
- `/json-to-text`: preserve arbitrary-JSON flattening scope, newline separator, keys off, stable path representation when keys enabled.
- `/text-to-json`: lines-to-array default, key:value mode explicit, trim/ignore empty/pretty on, duplicate keys rejected with source line. Do not silently overwrite.

#### Encoding

- Base64 encode: UTF-8 standard default; URL-safe and padding advanced; MIME wrap advanced only; raw byte mode for files; data URL advanced only when file MIME is known.
- Base64 decode: strict alphabet/length/padding validation; auto-detect Base64URL with visible status; fatal UTF-8 decode; if bytes are not valid text, preserve them and offer binary Blob download rather than replacement characters.
- URL encode/decode: label current default as URI component; form `+` behavior advanced; clear invalid percent error; do not add a misleading full-URL parser.
- Text-to-hex: UTF-8 default; ASCII/Latin-1 advanced; retain case/separator/prefix formatting.
- Hex-to-text: UTF-8 default; ASCII/Latin-1 advanced; accept documented whitespace/optional prefix; reject odd digits/invalid bytes; no silent replacement.
- Text-to-binary: UTF-8 byte mode default for the generic route; ASCII 7/8-bit mode explicit.
- Binary-to-text: strict grouping; UTF-8 byte decoding default; ASCII modes explicit; rename “insert delimiters” to clear grouping behavior.
- ASCII routes remain limited to ASCII and say so. Printable 32–126 default; control 0–127 advanced; reject out-of-range input with positions.

#### Case

- Fix CaseMode value/type mismatch first.
- Keep uppercase/lowercase/alternating/focused workflows visually unchanged.
- Distinguish “Capitalize Each Word” from editorial title case. If the `/title-case-converter` name remains, implement and document one deterministic editorial rule set with fixtures; otherwise make visible behavior wording exact without route renaming.
- Sentence case must handle leading quotes/brackets, CRLF, ellipses, abbreviations limitations, and Unicode letters deterministically; document limitations rather than claiming language intelligence.

#### Counters

- Always separate: UTF-16 code units including whitespace; excluding literal U+0020; excluding all Unicode whitespace; Unicode code points; grapheme clusters; UTF-8 bytes; words; logical lines.
- Use `Intl.Segmenter` for graphemes/words where supported with a documented fallback. Do not call code units or bytes “characters” without a qualifier.
- Empty text has zero lines; nonempty logical line count handles CRLF/LF/CR consistently.
- Sentence, reading, and speaking results are labeled estimates and disclose their rates/heuristics.

### File and large-input behavior

- Base64 file mode reads raw ArrayBuffer; other text encoders accept text files only unless a raw-byte workflow exists.
- Remove PDF/DOCX extraction from byte encoders and simple counters unless there is a clearly labeled “extract document text” mode with size limit; it must never masquerade as raw file encoding.
- Worker-process large counting/encoding/HTML/XML tasks above measured thresholds. Provide progress/cancel and retain source input on error.

### Edge cases

- Malformed HTML/XML, fragments/full documents, entities, scripts/styles, list nesting, links, namespaces, DTD/entity declarations, invalid XML code points.
- Unicode astral characters, combining marks, ZWJ emoji, invalid UTF-8 byte sequences, BOM, NUL/control characters, lone surrogates.
- Base64URL, omitted/incorrect padding, whitespace, data URLs, binary image/document bytes, invalid alphabet.
- Hex `0x`, separators, odd length, casing, invalid digits; binary continuous/grouped bits and nonmultiple widths.
- Case around punctuation, quotes, apostrophes, acronyms, numbers, line starts, empty input, Turkish/locale-sensitive letters (use locale-independent defaults unless explicitly labeled).

### SEO requirements

- Titles/H1/descriptions state exact encoding/output: UTF-8 bytes, ASCII decimal, Base64 text/raw file, component encoding, HTML fragment/document.
- Do not create Unicode-code-point or byte-count pages; cover them on `/character-counter` until data proves a different workflow.
- Add small tested examples and limitations; remove internal package/build references and unsupported safety absolutes.
- Keep directional canonical routes; do not merge only because a competitor offers a swap control.

### Accessibility requirements

- Exact metric labels are visible and programmatically associated.
- Errors announce the invalid token/byte/row and position without dumping sensitive input.
- Encoding/settings groups use fieldsets; advanced controls have an accessible disclosure state.
- Output encoding/status is announced politely after explicit conversion, not on every keystroke for huge input.
- Grapheme/code-point explanations are reachable from labels via `aria-describedby`.

### Tests

- Golden fixtures from Unicode, Base64, URI, HTML, XML, JSON, CSV, and ASCII standards; round-trip properties for supported modes.
- Fatal decoder and byte-preservation tests; raw files hash-equal after Base64 round trip.
- XSS/DOM tests prove scripts/events are never executed; XML DTD/entity tests reject safely.
- Counter fixtures for ASCII, NBSP, tabs/newlines, surrogate pairs, combining marks, emoji ZWJ, flags, and empty input.
- Case fixtures for each mode and title/sentence edge cases.
- Worker parity/cancel tests, size thresholds, file filters, Blob MIME/filename, and accessibility announcements.

### Non-goals

- No code-point conversion route, charset encyclopedia, arbitrary charset library, XML namespace builder, XSLT, HTML readability/article extractor, remote URL fetch, multi-file batch, cryptography, or language-aware AI rewriting.

### Acceptance criteria

- No supported transformation silently replaces invalid bytes or emits invalid XML/JSON/CSV.
- Generic text encoding defaults to UTF-8; ASCII is exact and explicitly limited.
- Counter labels and results match their technical definitions across the fixture suite.
- HTML/XML inputs cannot execute or resolve external content.
- Focused case routes retain their simple UI and all transformations pass typecheck/tests.

## Prompt 4 — Search presentation and page-content pass

Recommended Codex model: GPT-5.6 Sol  
Reasoning level: High

### Priority and data gate

High after prompts 1–3. This is the only prompt that may diagnose CTR/snippet/landing-page problems. It must begin by ingesting the missing GSC and Bing exports. If they remain unavailable, perform only copy-to-behavior corrections and do not claim CTR optimization or redirect/new-page evidence.

### Exact routes affected

- All indexable routes from the prompt 1 canonical registry: `/` and all 42 standalone tool routes plus `/about` and `/contact`.
- Policy routes only for factual consistency, not search targeting: `/privacy-policy`, `/terms-of-service`, `/cookies-policy`.
- Redirect source `/text-to-comma-separated-list` only if the data-gated merge was not already completed in prompt 2.

### Exact components or systems affected

- Route metadata factory and per-route title/description/H1 inputs.
- Tool intro, example, HowItWorks, limitations, FAQs (visible only), reviewed/issue-report line, contextual related links, footer/HelpfulTools ordering.
- A reproducible search-data import/cluster script and generated audit snapshot; no production query data or user text is exposed.

### Required behavior

1. Parse every supplied GSC/Bing row, retain source and landing page, normalize only for clustering, and assign every query to an intent or irrelevant/accidental bucket. Reconcile duplicate query rows by source/date/page without double-counting.
2. Compute impressions, clicks, weighted CTR, and position using source-appropriate weighting. Do not average CTR percentages directly.
3. For each high-impression/low-CTR cluster, classify: ranking problem, snippet problem, intent mismatch, weak page, wrong landing page, cannibalization, or not worth targeting. Record why.
4. Map one primary landing page per intent; allow multiple pages only where input/output/validation/workflow differs. Do not create synonym pages.
5. Update titles/H1/descriptions only where actual query/landing evidence and implemented behavior align. Titles remain concise and unique; descriptions are specific rather than keyword lists.
6. Rewrite priority copy to answer input/output/defaults, one example, relevant edge cases, privacy boundary, and related tools. Remove duplicate paragraphs, boilerplate, internal package names, false feature/privacy/ad claims, filler, and controls not present.
7. Add compact 3–5 same-intent internal links based on workflow, not repeated keywords. Keep the categorized footer. Put unrelated external projects after internal related tools and suppress them on policies/404.
8. Add an actual reviewed date only after behavior/tests were reviewed, not a perpetually auto-updated date.

### Settings/default content requirements

- Explain current defaults from the settings matrix exactly. Do not mention a control before it exists.
- Explain literal-space/all-whitespace/code-unit/code-point/grapheme/byte metrics separately.
- Explain CSV quoting and Base64/text-vs-file semantics with tested examples.
- Keep advanced settings explanations concise and below the tool; no word-count target.

### Edge cases

- Same query maps to multiple landing pages; branded queries; zero-click rows; privacy/irrelevant queries; Bing/GSC naming differences; encoded/trailing-slash URLs; query rows without page data.
- Search terms sharing one word but different transformations, including all examples in the audit.
- Google rewriting titles/snippets: evaluate evidence but do not promise a rendered snippet.

### SEO requirements

- Apply official Google title/snippet guidance; no FAQ rich-result promises.
- One canonical landing page per synonymous direct-conversion cluster.
- New indexable pages require different input, output, transform, controls, validation, edge cases, or workflow and must be approved as current-scope. Expected result for this phase is few or no new pages.
- Preserve noindex policies and canonical registry.

### Accessibility requirements

- Rewritten content keeps heading hierarchy, meaningful link text, accessible examples/code wrapping, and no keyword-stuffed screen-reader experience.
- Reviewed/issue links and related-tool cards have distinct names and visible focus.

### Tests

- Query import count equals source-row count; every row assigned exactly once; cluster sums reconcile to source totals by engine.
- Weighted CTR/position calculation tests and duplicate-source fixtures.
- Snapshot/lint for duplicate titles/descriptions/H1s, missing metadata, forbidden unsupported claims/package names, broken links, and controls mentioned but absent.
- Crawl verifies one canonical/H1, correct indexability, and contextual links for every indexable route.

### Non-goals

- No generic blog, programmatic SEO, synonym pages, localization, broad category expansion, fake review dates, FAQ schema, or titles changed solely to insert more keywords.

### Acceptance criteria

- Every supplied query is parsed/assigned and totals reconcile.
- Every priority cluster has one documented landing strategy and diagnosis.
- Every content statement matches implemented behavior and privacy/ad reality.
- No duplicate title/description/H1 or broken internal link remains.
- If search exports are still missing, the prompt stops short of metric-based decisions and records the blocker explicitly.

## Prompt 5 — Final correctness, SEO, performance, accessibility, and AdSense audit

Recommended Codex model: GPT-5.6 Sol  
Reasoning level: High

### Priority

Critical release gate. This prompt fixes only defects found while verifying prompts 1–4; it does not expand scope.

### Exact routes affected

- Every final exact public route in the canonical registry, both legacy redirects, and wildcard 404.
- Every breakpoint/ad-eligible page type and every file-capable tool route.

### Exact components or systems affected

- Production build/server, route registry, metadata/schema/sitemap/robots, all ToolCards/transforms/workers, shared file/clipboard/download/status components, nav/footer/consent/ads, About/policies/contact, tests and CI scripts.

### Required audit behavior

1. Run a production-mode crawl of every route: status, redirect chain, title, description, H1, canonical, robots, schema, OG asset, internal links, SSR text, trailing slash, host, and unknown URL.
2. Execute the full transformation fixture suite and round-trip/property tests; manually spot-check every tool default and setting against `settings-decision-matrix.csv`.
3. Verify no application request, analytics event, error payload, or log includes input/output/filename/clipboard text.
4. Profile representative small, 1 MB, and configured maximum inputs on mid-tier desktop/mobile emulation. Record initial and route-specific JS, long tasks, INP interactions, memory, worker/cancel behavior, font/image loading, and file parse time. Fix measured regressions without redesign.
5. Run Lighthouse/axe plus keyboard, VoiceOver/NVDA, zoom/reflow, touch-target, contrast, focus, status/error/copy, reduced-motion, and mobile drawer tests.
6. Exercise each ad slot at every breakpoint with consent granted/denied, ad blocked, slow fill, no fill, and zoom. Confirm density, reserved size, labels, and that tool/result controls remain contiguous.
7. Review AdSense readiness: `ads.txt`, ownership/contact/About, useful original tool content, navigation, policies, CMP signals, prohibited placements, no empty page/slot walls, no ads under footer.
8. Verify Core Web Vitals with available field data if connected; otherwise report lab measurements as lab only.
9. Re-run dependency/typecheck/build/audit and document any explicitly accepted residual advisory with reason/mitigation.

### Edge cases

- JavaScript disabled for crawlable explanatory content; hydration errors; offline/slow network after initial page; ad/CMP third-party failures.
- 320 px viewport, landscape phone, tablet, 200%/400% zoom, 1600+ px side rails, reduced motion/high contrast.
- Clipboard denial, file cancellation, zero-byte/oversize file, malformed PDF/DOCX/CSV/HTML/XML/encoding, worker crash/cancel.
- Back/forward navigation retains or intentionally resets input without leaking it into URL/history/storage.

### SEO requirements

- Zero soft 404s, redirect loops, accidental noindex, canonical conflicts, sitemap noncanonical URLs, broken internal links, duplicate metadata, unsupported structured data, or HTML-served image URLs.
- Query/landing map reflects the final canonical routes and any approved merge.
- Search copy remains visible in SSR HTML and tool remains above information/ads.

### Accessibility requirements

- No critical/serious automated violations, while acknowledging automation is incomplete.
- Complete keyboard operation and predictable focus; all fields/controls/status/errors/ads named and announced correctly.
- Content reflows without horizontal page scrolling; only bounded data previews may scroll within a named region.
- Third-party consent/ad UI does not negate site accessibility.

### Tests and evidence package

- CI: typecheck, unit/property, component/accessibility, route integration, production build, production crawl, link/schema/sitemap assertions.
- Manual checklist with route/settings coverage count, browser/device matrix, screenshots only where needed to prove layout, and before/after performance table.
- Reconcile public URL count, query row/cluster count, competitor/settings evidence references, redirects, and sitemap count with audit artifacts.

### Non-goals

- No new tools, new page types, redesign, API, extension, localization, accounts, server storage, pipeline builder, batch processing, embeddable widgets, generic blog, or unrelated converter categories.
- No speculative optimization that lacks a measured defect in the current phase.

### Acceptance criteria

- All automated checks pass; every public route and setting is manually or automatically covered.
- No silent data corruption in fixture/round-trip tests.
- No transformed content reaches network/telemetry.
- Ad layout passes CLS/placement/consent/accessibility checks and never interrupts the utility.
- Measured performance is documented; no unqualified field-CWV claim is made.
- Remaining issues are either fixed or moved to `future-only-backlog.md` with evidence that they are unnecessary now; no deferred work remains mixed into this plan.
