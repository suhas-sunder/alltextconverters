# AllTextConverters research audit

Audit date: 2026-07-16  
Repository: `C:\Users\user\Documents\vscode_project\alltextconverters`  
Production: <https://www.alltextconverters.com/>  
Scope: research and implementation planning only. No production routes, application behavior, UI, or feature code were changed.

## Evidence status and limits

The repository, all 50 declared exact public routes, the wildcard not-found response, production host/redirect behavior, sitemap, robots file, footer, policy/about/contact pages, and priority competitor pages were inspected. The site has 42 standalone tool pages, one homepage multi-tool, five informational/policy pages, and two legacy redirect routes. The static sitemap contains 48 content URLs.

Two required search-data inputs were not present in the repository or in the accessible Desktop, Documents, Downloads, or Codex attachment locations:

- `alltextconverters.com_SearchPerformanceOverview_All_7_12_2026.csv`
- the pasted GSC/Bing query exports described as approximately 884 queries

Consequently, zero supplied queries could be parsed. No impressions, clicks, CTR, average position, query-to-page assignment, Bing metric, or actual cannibalization-by-query figure is invented in this report. The query map contains 41 provisional intent definitions based only on the user's seed observations, repository behavior, technical distinctions, and competitor conventions. It is not a substitute for the missing exports. Re-run the clustering and landing-page diagnosis as soon as the exports are available.

The supplied maintainer image path, `app/client/assets/images/suhas.jpg`, is also absent. The portfolio resolves only to a JavaScript shell in a text crawl, and LinkedIn blocked automated access. The links themselves are user-provided and may be used; profile claims beyond the facts supplied by the owner are not treated as verified.

Competitor behavior establishes conventions, not demand or usage. No public usage numbers were found and none are claimed. TextFixer's priority page returned a Cloudflare interstitial, so that row records the block rather than inferred controls. Mobile, ad density, structured data, and performance details are marked unverified where a text/markup crawl could not establish them.

## Executive findings

1. Preserve the visual system and the tool-first SSR architecture. The plain Tailwind layout, direct route model, local transformations, visible server-rendered copy, no-account workflow, and route-level lazy loading of heavy document libraries are sound foundations.
2. Fix crawl and correctness defects before adding tools or content: most canonical declarations do not render; `/sort-list` redirects to itself; unknown URLs return a 200 soft-404; `/cookies-policy` points canonically and internally to nonexistent `/cookies`; noindex policy URLs are in the sitemap; and every Open Graph image tested resolves to the HTML fallback instead of an image.
3. The highest-value tool work is not page creation. It is making existing line/list/CSV, rich-text cleanup, encoding, XML, and counter pages technically exact and clearly differentiated.
4. `/list-to-comma-separated` and `/text-to-comma-separated-list` have substantially the same input, output, controls, and workflow. They should become one canonical implementation after the missing landing-page data is checked. Synonyms for line-break removal should remain one page.
5. Current CSV claims exceed the parser. Comma-to-list and comma-to-JSON use naive splitting, and table-to-list cannot parse quoted multiline fields. Either remove “CSV” claims or, preferably, use one shared standards-correct local parser.
6. The character counter labels a UTF-16 code-unit count as “characters” and labels a count excluding all `\s` whitespace as “no spaces.” Add and label literal-space, all-whitespace, code-point, grapheme, and UTF-8-byte metrics separately.
7. “Remove all styling” does not inspect rich HTML clipboard data, so it misses the dominant plain-text-paste workflow. It also mixes formatting removal with destructive emoji, punctuation, and non-alphanumeric deletion. Preserve paragraphs/lists by default and move destructive cleanup out of the primary flow.
8. The About page is the largest trust liability. It contains unprovided school, date, job-title, professional-experience, role, and technology claims. Replace them with only: Suhas Sunder; builds and maintains the tools; bachelor's degree in Engineering and Management; master's degree in Electrical and Computer Engineering; portfolio; LinkedIn; test methodology; contact path; and a truthful local-processing explanation.
9. AdSense groundwork is incomplete despite a valid-looking `ads.txt` publisher entry: no ad components, no consent implementation, no reserved slots, and policy/home copy that says “no ads.” Build consent and layout primitives before loading ads.
10. There are no automated tests, no input-size guards, no application Web Workers, and TypeScript currently fails. A production build succeeds but exposes duplicated PDF worker assets and multiple large lazy chunks. Correctness tests and dependency/security maintenance are prerequisites for the five implementation prompts.

## Priority model

`priority score = (impact × confidence × evidence strength) / (effort × risk)`

The score orders independent opportunities; it does not overrule dependencies. Consent, a real 404 response, parser correctness, and security maintenance remain critical even where risk/effort lowers the numeric score.

| Task | Impact | Confidence | Effort | Risk | Evidence | Score | Class | Primary evidence |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Fix `/sort-list` self-redirect | 4 | 5 | 1 | 1 | 5 | 100.00 | Critical | Live site; repository defect |
| Return HTTP 404 for unmatched routes and repair its links | 5 | 5 | 2 | 1 | 5 | 62.50 | Critical | Live site; repository defect |
| Render consistent self-canonicals and fix cookies URL | 5 | 5 | 2 | 1 | 5 | 62.50 | Critical | Live site; repository defect; Google documentation |
| Repair Open Graph image URLs/assets | 4 | 5 | 2 | 1 | 5 | 50.00 | High | Live site; repository defect |
| Make character/byte metrics exact | 5 | 5 | 3 | 2 | 5 | 20.83 | Critical | Repository; technical requirement; competitor |
| Add programmatic labels and live error/success announcements | 5 | 5 | 3 | 2 | 5 | 20.83 | Critical | Repository defect; WCAG implementation requirement |
| Resolve TypeScript defects and vulnerable dependencies | 5 | 5 | 3 | 2 | 5 | 20.83 | Critical | Typecheck/audit diagnostics |
| Remove unsupported About/structured-data claims | 5 | 5 | 2 | 2 | 5 | 31.25 | Critical | Repository; user-provided facts |
| Add consent/CMP and truthful policy/home copy before ads | 5 | 4 | 3 | 3 | 5 | 11.11 | Critical dependency | Google AdSense documentation; repository |
| Replace naive CSV parsing with a shared local parser | 5 | 5 | 4 | 2 | 5 | 15.63 | Critical | Repository; technical requirement |
| Make Base64 file and binary behavior byte-correct | 5 | 5 | 4 | 2 | 5 | 15.63 | High | Repository; competitor; technical requirement |
| Fix case-converter type/runtime mismatch | 4 | 5 | 2 | 2 | 5 | 25.00 | Critical | Typecheck; repository |
| Merge duplicate list-to-comma intent | 4 | 4 | 3 | 3 | 4 | 7.11 | High, data-gated | Repository; seed query; missing GSC landing data |
| Improve line-break settings without synonym pages | 4 | 4 | 3 | 2 | 4 | 10.67 | High | Competitor; technical requirement; query seed |
| Add rich-clipboard plain-text behavior | 5 | 5 | 3 | 2 | 5 | 20.83 | High | Repository; competitor; query seed |
| Correct XML whitespace/control/DTD handling | 4 | 5 | 3 | 2 | 5 | 16.67 | High | Repository; technical requirement |
| Add per-tool size guards and worker thresholds | 4 | 4 | 4 | 2 | 4 | 8.00 | High | Repository; performance requirement |
| Replace unsupported FAQ JSON-LD | 3 | 5 | 2 | 1 | 5 | 37.50 | High | Repository; Google documentation |
| Add compact contextual internal links | 4 | 4 | 2 | 2 | 4 | 16.00 | Medium | Repository; competitor convention |
| Build category landing pages | 2 | 2 | 4 | 3 | 1 | 0.33 | Low / data-gated | Missing search data; not currently justified |

## Repository assessment

| System | Current implementation | Decision | Evidence-based direction |
|---|---|---|---|
| Framework/build | React 19, React Router 7.7 framework mode, Vite 6, Tailwind 4, Express/Netlify, SSR enabled | Keep / Extend | No measurable need for a framework replacement. Update vulnerable versions within the current architecture. |
| Routing | Explicit file routes in `app/routes.ts`; 50 exact URLs plus wildcard | Keep / Refactor | Preserve route names. Fix route ordering assumptions, the self-redirect, status responses, and later merge only the proven duplicate list route. |
| Rendering | Server-rendered primary text plus client hydration | Keep | Crawlable tool and explanatory content is visible without waiting for client conversion code. |
| Tool-page architecture | Route composes a route-local ToolCard, HowItWorks, FAQ, and shared breadcrumb | Extend / Consolidate | Keep route composition; extract a shared accessible tool shell, status region, file loader, downloader, and bounded parser adapters without a visual redesign. |
| Shared components | Navbar, Footer, breadcrumbs, HelpfulTools, error boundary | Extend / Refactor | Add skip link, dialog focus management, ad slots, consent boundary, contextual related tools, and real 404 status. Remove duplicate breadcrumb output. |
| Transformation logic | Local synchronous functions colocated with each ToolCard | Keep / Consolidate | Preserve local processing. Consolidate CSV, Unicode counting, file loading, byte encoding, and download logic where inconsistent duplication creates defects. |
| Metadata generation | Per-route arrays with repeated title/description/OG/schema code | Refactor | Introduce one typed metadata helper that emits a real `<link rel="canonical">`, consistent robots/OG values, and no nonexistent image URLs. Do not replace route-specific titles. |
| Structured data | SoftwareApplication on tools; BreadcrumbList; widespread FAQPage; About graph | Refactor | Keep one accurate BreadcrumbList. Use WebSite/Organization/Person only where factual. Remove unsupported FAQ markup; visible FAQs may remain. Validate SoftwareApplication or omit it. |
| Sitemap | Static `public/sitemap.xml`, 48 URLs, all lastmod `2026-02-02` | Replace generator only | Generate from the canonical indexable route registry. Exclude noindex policies and redirects. Emit truthful lastmod only. |
| Robots | `Allow: /` and sitemap declaration | Keep / Extend | File is simple and correct; align sitemap/index directives. Do not use robots.txt to hide noindex policy pages. |
| Canonicals | Most routes use a metadata object that does not render as a link | Replace implementation | Self-canonicalize every indexable content page and make redirect/sitemap/internal links use the same no-trailing-slash URL. |
| Navigation | Four primary tool links, More dropdown, mobile search/drawer | Keep / Extend | Preserve information architecture. Add keyboard/focus behavior and optionally contextual links. Do not create category pages without query evidence. |
| Categories | Seven footer groups; no category routes | Keep for current phase | Footer directory already exposes all tools. Dedicated categories are not justified by the missing query data. |
| Related tools | Global footer plus unrelated external-project cards; little route-context linking | Extend / Consolidate | Add 3–5 deterministic same-intent links per tool before external projects. Consider suppressing external-project cards on policy/404 pages. |
| Analytics | No analytics code found | Missing | Choose privacy-conscious measurement only if needed; update claims/policies and gate nonessential storage by consent. Never capture textarea/file contents. |
| Cookies/consent | Policy text only; no CMP/banner/state | Missing | Implement a Google-certified CMP/TCF integration before personalized AdSense in EEA/UK/Switzerland. Do not load disallowed tags before signal. |
| Advertising | `ads.txt` exists; no ad components/scripts | Missing | Add reserved, labeled, responsive slots only in prompt 1. Keep tool actions contiguous. |
| Accessibility | Visual labels, buttons, focus styles in places; widespread unlabeled textareas and no live regions | Refactor | Retain visual styling; add semantic names, fieldsets/legends, focus management, announcements, touch sizes, and reduced-motion support. |
| Tests | No test framework, test files, or test script | Missing | Add unit/property fixtures for transformations, route/metadata tests, component accessibility tests, and a production crawl smoke test. |
| Error handling | Tool-local strings; generic root error boundary; not announced; wildcard returns 200 | Refactor | Standardize inline errors/status, preserve user input, include positions where possible, announce changes, and return correct HTTP statuses. |
| Large input | No maximum length, `file.size` guard, cancellation, or progress | Missing | Add per-tool soft/hard thresholds, nonblocking progress/cancel, and explicit limits before parsing. |
| File upload/download | Duplicated loaders; broad TXT/MD/CSV/JSON/HTML/XML/PDF/DOCX acceptance; jsPDF downloads | Consolidate | Only show semantically relevant file types. Centralize local FileReader/pdf.js/mammoth adapters, raw-byte mode, filenames, MIME, size checks, and Blob downloads. |
| Dynamic imports | pdf.js, mammoth, jsPDF loaded on demand | Keep / Extend | This is good. Deduplicate PDF worker output and prevent heavy libraries from entering routes that do not need them. |
| Web Workers | pdf.js worker only; no application workers | Missing selectively | Use workers only above measured thresholds for CSV/HTML/XML/encoding/counting; keep small text synchronous. |
| Maintainer information | About page and schema contain unsupported claims; no LinkedIn; requested photo missing | Replace content | Use only supplied facts and links, responsibility, test method, review date, and contact path. |
| Analytics/error privacy | No network instrumentation found in transformation code | Keep invariant | Explicitly ban content values, filenames, decoded output, and clipboard data from analytics/errors/logs. |
| Repository hygiene | Duplicate component directories and failed ZIP artifacts | Consolidate / Remove after verification | Delete exact duplicate source/artifacts only in an implementation prompt after confirming imports; this is maintenance, not a redesign. |

### Build and diagnostic evidence

- `npm run build` succeeds. The generated client includes route chunks around 20–38 KB plus lazy assets: two PDF worker outputs around 1.07–1.13 MB, pdf.js around 504 KB, mammoth around 500 KB, the PNG logo around 462 KB, jsPDF around 388 KB, html2canvas around 202 KB, client entry around 183 KB, and a shared index chunk around 159 KB. These are uncompressed build sizes, not network transfer or field performance.
- `npm run typecheck` fails. Every ToolCard import of `mammoth/mammoth.browser` lacks a declaration, and `CaseConverterToolCard.tsx` supplies uppercase keys such as `LOWERCASE` to a `Record<CaseMode, string>` whose union uses lowercase values. Build success must not hide this release defect.
- The dependency audit reported 29 advisories (2 low, 6 moderate, 14 high, 7 critical), including direct React Router/Vite/jsPDF advisories and an old `@remix-run/netlify` path. Verify current fixed versions, update within the existing stack, test, and remove an unused legacy adapter if confirmed unused. Do not replace React Router merely because packages are old.
- No tests, app Web Workers, `maxLength`, input byte thresholds, `file.size` checks, or cancellation path were found.

## Definitive public page report

The machine-readable, one-row-per-route record is in `tool-url-inventory.csv`. Search fields are explicitly unavailable because the exports are missing.

| Page group | Exact routes | Recommended action |
|---|---|---|
| Homepage | `/` | Improve claims, metadata, trust summary, contextual directory, and ad-ready layout; preserve tool-first card. |
| Counters | `/word-counter`, `/character-counter` | Improve exact count semantics, labels, large-input handling, and accessibility. |
| General/focused case | `/case-converter`, `/sentence-case-converter`, `/title-case-converter` | Improve/differentiate and fix type defect. |
| Stable focused case | `/uppercase-converter`, `/lowercase-converter`, `/alternating-case-converter`, `/text-case-checker`, `/match-case-converter` | Keep transformation/UI; apply only sitewide correctness/accessibility/metadata changes. |
| Cleanup | `/text-cleaner`, `/remove-extra-spaces`, `/whitespace-cleaner`, `/line-break-remover`, `/remove-duplicate-lines`, `/remove-all-styling-from-text` | Differentiate presets and improve correctness; no synonym routes. |
| Lists/CSV/tables | `/case-insensitive-sort`, `/comma-separated-to-list`, `/list-to-comma-separated`, `/list-to-table`, `/table-to-list`, `/comma-to-json-array`, `/json-array-to-list`, `/text-to-bulleted-text-list`, `/text-to-ordered-list` | Improve shared parsing/defaults; keep route workflows. |
| Duplicate list intent | `/text-to-comma-separated-list` | Merge into `/list-to-comma-separated` and redirect only after missing GSC/Bing landing data is reviewed. |
| Encoding | `/base64-encode`, `/base64-decode`, `/url-encode`, `/url-decode`, `/ascii-to-text`, `/text-to-ascii`, `/binary-to-text`, `/text-to-binary`, `/hex-to-text`, `/text-to-hex` | Improve byte/encoding correctness and validation; keep directional routes. |
| Structured text | `/json-to-text`, `/text-to-json`, `/xml-to-text`, `/text-to-xml`, `/html-to-text`, `/text-to-html` | Improve/differentiate settings and parsing; keep directional routes. |
| Legacy aliases | `/sort-list`, `/deduplicate-list` | Repair redirect target for the former; preserve the latter's one-hop 301. |
| Trust/info | `/about`, `/contact` | Rewrite only unsupported claims, add verified maintainer/test/contact signals, and fix schema. |
| Policies | `/privacy-policy`, `/terms-of-service`, `/cookies-policy` | Align claims with actual ads/analytics/CMP, fix canonical/sitemap/internal links, retain noindex unless owner wants them indexed. |

No dedicated category page is public. “All Tools” is the categorized footer directory rendered across pages; it is not a route. The wildcard not-found page is not a canonical public URL but was audited because it responds 200 and links to five nonexistent paths.

### Readable URL ledger

This compact ledger provides a human-readable row for every declared exact public URL. The companion CSV adds meta description, transformation, input/output, controls, formats, related tools, schema, all search fields, closest internal competitor, and evidence.

| Route | Status | Type/category | Current title | Current H1 | Rendered canonical / indexability | Action |
|---|---:|---|---|---|---|---|
| `/` | 200 | Homepage/directory | AllTextConverters – Free Online Text Converter, Formatter & Counters | All Text Converters - Free Online Text Converter | Missing; index | Improve |
| `/word-counter` | 200 | Tool/counters | Word Counter (Words, Characters & Lines) \| AllTextConverters | Word Counter | Missing; index | Improve |
| `/character-counter` | 200 | Tool/counters | Character Counter (With Spaces, Without Spaces, UTF-8 Bytes) \| AllTextConverters | Character Counter | Missing; index | Improve |
| `/case-converter` | 200 | Tool/case | Case Converter (Uppercase, Lowercase, Title Case) \| AllTextConverters | Case Converter | Missing; index | Improve |
| `/uppercase-converter` | 200 | Tool/case | Uppercase Converter (Convert Text to ALL CAPS) \| AllTextConverters | Uppercase Converter | Missing; index | Keep unchanged |
| `/lowercase-converter` | 200 | Tool/case | Lowercase Converter (Convert Text to Lowercase) \| AllTextConverters | Lowercase Converter | Missing; index | Keep unchanged |
| `/title-case-converter` | 200 | Tool/case | Title Case Converter (Capitalize Headlines) \| AllTextConverters | Title Case Converter | Missing; index | Differentiate |
| `/sentence-case-converter` | 200 | Tool/case | Sentence Case Converter (Capitalize Sentences) \| AllTextConverters | Sentence Case Converter | Missing; index | Improve |
| `/alternating-case-converter` | 200 | Tool/case | Alternating Case Converter (aLtErNaTiNg cAsE) \| AllTextConverters | Alternating Case Converter | Missing; index | Keep unchanged |
| `/text-cleaner` | 200 | Tool/cleanup | Text Cleaner (Clean & Normalize Text) \| AllTextConverters | Text Cleaner | Missing; index | Differentiate |
| `/remove-extra-spaces` | 200 | Tool/cleanup | Remove Extra Spaces (Clean Text Spacing) \| AllTextConverters | Remove Extra Spaces | Missing; index | Differentiate |
| `/whitespace-cleaner` | 200 | Tool/cleanup | Whitespace Cleaner (Remove Hidden Characters) \| AllTextConverters | Whitespace Cleaner | Missing; index | Differentiate |
| `/line-break-remover` | 200 | Tool/cleanup | Line Break Remover (Remove New Lines) \| AllTextConverters | Line Break Remover | Missing; index | Improve |
| `/remove-duplicate-lines` | 200 | Tool/cleanup | Remove Duplicate Lines (Deduplicate Text) \| AllTextConverters | Remove Duplicate Lines | Missing; index | Improve |
| `/case-insensitive-sort` | 200 | Tool/lists | Case-Insensitive Sort (Alphabetical Line Sort) \| AllTextConverters | Case-Insensitive Sort | Missing; index | Improve |
| `/base64-encode` | 200 | Tool/encoding | Base64 Encoder (Encode Text to Base64) \| AllTextConverters | Base64 Encoder | Missing; index | Improve |
| `/base64-decode` | 200 | Tool/decoding | Base64 Decoder (Decode Base64 to Text) \| AllTextConverters | Base64 Decoder | Missing; index | Improve |
| `/url-encode` | 200 | Tool/encoding | URL Encoder (Percent-Encoding) \| AllTextConverters | URL Encoder | Missing; index | Improve |
| `/url-decode` | 200 | Tool/decoding | URL Decode (Percent-Decoding) \| AllTextConverters | URL Decoder | Missing; index | Improve |
| `/text-case-checker` | 200 | Tool/case | Text Case Checker (Detect Uppercase / Lowercase) \| AllTextConverters | Text Case Checker | Missing; index | Keep unchanged |
| `/match-case-converter` | 200 | Tool/case | Match Case Converter (Copy Casing Pattern) \| AllTextConverters | Match Case Converter | Missing; index | Keep unchanged |
| `/ascii-to-text` | 200 | Tool/number systems | ASCII to Text Converter (Decode ASCII Codes) \| AllTextConverters | ASCII to Text Converter | Missing; index | Improve |
| `/text-to-ascii` | 200 | Tool/number systems | Text to ASCII Converter (Decimal ASCII Codes) \| AllTextConverters | Text to ASCII Converter | Missing; index | Improve |
| `/json-to-text` | 200 | Tool/data | JSON to Text Converter (Extract Values) \| AllTextConverters | JSON to Text Converter | Missing; index | Differentiate |
| `/text-to-json` | 200 | Tool/data | Text to JSON Converter (Lines or Key:Value) \| AllTextConverters | Text to JSON Converter | Missing; index | Improve |
| `/xml-to-text` | 200 | Tool/data | XML to Text Converter (Extract Text Nodes) \| AllTextConverters | XML to Text Converter | Missing; index | Improve |
| `/text-to-xml` | 200 | Tool/data | Text to XML Converter (Generate Simple XML) \| AllTextConverters | Text to XML Converter | Missing; index | Improve |
| `/sort-list` | 301 loop | Legacy alias | None | None | None; not indexable | Redirect |
| `/deduplicate-list` | 301 | Legacy alias | None | None | Target canonical; not indexable | Redirect |
| `/html-to-text` | 200 | Tool/data | HTML to Text Converter (Strip HTML Tags) \| AllTextConverters | HTML to Text Converter | Missing; index | Improve |
| `/text-to-html` | 200 | Tool/data | Text to HTML Converter (Generate Clean HTML) \| AllTextConverters | Text to HTML Converter | Missing; index | Improve |
| `/comma-separated-to-list` | 200 | Tool/lists | Comma Separated to List (CSV to Newlines) \| AllTextConverters | Comma Separated to List | Missing; index | Improve |
| `/list-to-comma-separated` | 200 | Tool/lists | List to Comma Separated (Lines to CSV) \| AllTextConverters | List to Comma Separated | Missing; index | Improve |
| `/list-to-table` | 200 | Tool/lists | List to Table Converter (List to HTML / CSV / TSV) \| AllTextConverters | List to Table Converter | Missing; index | Improve |
| `/table-to-list` | 200 | Tool/lists | Table to List Converter (Extract Column) \| AllTextConverters | Table to List Converter | Missing; index | Improve |
| `/comma-to-json-array` | 200 | Tool/data | Comma to JSON Array Converter (CSV to JSON) \| AllTextConverters | Comma to JSON Array Converter | Missing; index | Improve |
| `/json-array-to-list` | 200 | Tool/data | JSON Array to List (Extract Values) \| AllTextConverters | JSON Array to List | Missing; index | Improve |
| `/text-to-comma-separated-list` | 200 | Tool/lists | Text to Comma Separated List (Lines to CSV) \| AllTextConverters | Text to Comma Separated List | Missing; index | Merge |
| `/text-to-bulleted-text-list` | 200 | Tool/lists | Text to Bulleted List (Create Bullet Points) \| AllTextConverters | Text to Bulleted List | Missing; index | Keep unchanged |
| `/text-to-ordered-list` | 200 | Tool/lists | Text to Ordered List (Numbered / Lettered) \| AllTextConverters | Text to Ordered List | Missing; index | Keep unchanged |
| `/binary-to-text` | 200 | Tool/number systems | Binary to Text Converter (Decode Binary) \| AllTextConverters | Binary to Text Converter | Missing; index | Improve |
| `/text-to-binary` | 200 | Tool/number systems | Text to Binary Converter (ASCII to Binary) \| AllTextConverters | Text to Binary Converter | Missing; index | Improve |
| `/hex-to-text` | 200 | Tool/number systems | Hex to Text Decoder (Hexadecimal to ASCII) \| AllTextConverters | Hex to Text Decoder | Missing; index | Improve |
| `/text-to-hex` | 200 | Tool/number systems | Text to Hex Converter (Encode Text as Hex) \| AllTextConverters | Text to Hex Converter | Missing; index | Improve |
| `/remove-all-styling-from-text` | 200 | Tool/cleanup | Remove All Styling From Text (Strip Formatting) \| AllTextConverters | Remove All Styling From Text | Missing; index | Improve |
| `/privacy-policy` | 200 | Policy | Privacy Policy \| AllTextConverters | Privacy Policy | Correct; noindex | Improve |
| `/terms-of-service` | 200 | Policy | Terms of Service \| AllTextConverters | Terms of Service | Correct; noindex | Improve |
| `/cookies-policy` | 200 | Policy | Cookies Policy \| AllTextConverters | Cookies Policy | Wrong (`/cookies`); noindex | Improve |
| `/contact` | 200 | Contact/trust | Contact \| AllTextConverters | Contact AllTextConverters | Correct; index | Improve |
| `/about` | 200 | About/trust | About AllTextConverters \| Privacy-First Text Tools for Case, Cleanup & Encoding | AllTextConverters is a privacy-first toolbox for working with text | Missing; index | Improve |

## Live-site assessment

### What works

- Primary tool and explanatory content is SSR-rendered and visible to crawlers.
- HTTPS `www` is the final host and trailing-slash content requests 301 to no-trailing-slash paths.
- All 48 content routes returned 200; `/deduplicate-list` returns a one-hop 301 to `/remove-duplicate-lines`.
- The interface remains plain, readable, responsive in its CSS structure, and places the utility before explanatory copy.
- Tools run locally in inspected transformation code. No textarea/file value is sent to a server.
- `robots.txt` is crawlable and `ads.txt` contains the configured publisher line.

### Critical live defects

- `/sort-list` returns `301 Location: /sort-list`, creating a loop.
- An arbitrary unknown URL returns 200 with a not-found page (soft 404). Five suggested links on that page are themselves nonexistent.
- Most pages have no rendered canonical. React Router requires the correct link descriptor form; the repeated `{ rel, href }` entries do not appear in production HTML.
- `/cookies-policy` renders a canonical and OG URL for `/cookies`; `/cookies` is a 200 soft-404. Privacy copy also links to `/cookies`.
- All tool/home/about OG references use `/social-preview.png`, which is absent. Policy-specific `/og/*.jpg` and the requested maintainer image are also absent. The catch-all serves HTML with `text/html` at those image URLs.
- The sitemap includes three `noindex` policy pages and gives every URL the same static lastmod. Redirect routes are excluded correctly.
- HTTP apex reaches HTTPS `www` through two redirects. This is a minor efficiency issue; avoid changing it unless Netlify/Cloudflare configuration can safely produce one hop.

## Search-data and intent findings

Because the actual GSC/Bing exports are missing, the known opportunity statements cannot be verified or quantified. Specifically, this audit cannot determine whether any high-impression/low-CTR seed is caused by ranking, snippet presentation, wrong landing page, cannibalization, or a query not worth targeting. Those diagnoses require query, page, device/country/date, impressions, clicks, CTR, and position rows.

The provisional `query-intent-map.csv` keeps technically distinct intents separate:

- line-break removal versus blank-line cleanup versus whitespace normalization;
- inline list-to-comma output versus a valid CSV file;
- HTML-to-text extraction versus HTML entity decoding versus rich-clipboard plain text;
- literal-space exclusion versus all-whitespace exclusion versus code units/code points/graphemes/UTF-8 bytes;
- text-to-hex bytes versus ASCII decimal values versus Unicode code points;
- Base64 text conversion versus raw file-byte conversion;
- direct conversion, cleanup, formatting, encoding, decoding, counting, file conversion, definitions, how-to, API/developer, navigation, and irrelevant queries.

### Landing-page strategy from non-query evidence

- One `/line-break-remover` route should cover “remove newlines,” “newline remover,” and “remove line breaks” using modes. Do not create synonym pages.
- Keep HTML-to-text and rich-formatting removal separate because input acquisition and preservation rules differ.
- Keep byte encoders/decoders separate by direction; add modes only when the same input/output workflow remains.
- Merge the two list-to-comma pages because their current input, output, transform, and controls do not justify separate indexing. The exact redirect direction is strong on repository semantics but still data-gated to avoid discarding an unknown ranking URL.
- Do not build a generic blog, API pages, category landing pages, or separate pages for metric subtypes in this phase. Add exact counter metrics to the existing counter.

## Competitor findings

Twenty-two page/intent observations are recorded in `competitor-feature-matrix.csv`. They include ConvertCase, Browserling, Online Text Tools, TextFixer (blocked), MiniWebtool, Code Beautify, FreeFormatter, TextCompare, uWarp, FreeCodeFormat, TextCleaner.io, Glyph Widgets, DevTools24, Encode64, WordCountFast, Text Tool Suite, and BeautifyCode.

### Supported conventions

| Control/pattern | Classification | Evidence | Recommendation |
|---|---|---|---|
| Space/no-space line-break modes | Universally expected | Browserling, FreeCodeFormat, uWarp, focused SERPs | Keep primary. |
| Custom newline replacement | Commonly offered | Online Text Tools, TextCleaner.io, uWarp, FreeCodeFormat | Add to existing line page. |
| Preserve paragraphs/repeated-newline behavior | Commonly offered / correctness | uWarp, FreeCodeFormat, Online Text Tools | Add with exact whitespace-only-line rules. |
| Capitalize/add punctuation/indent during break removal | Specialist / potentially confusing | uWarp | Avoid; these rewrite content. |
| Rich-clipboard HTML handling | Technically required for plain-text intent | ConvertCase plain-text page; current repository gap | Add. |
| Preserve HTML links and list/line structure | Commonly offered / correctness | DevTools24, Encode64 | Preserve structure automatically; links advanced off by default. |
| Remote URL fetch/save/share/pastebin/chaining | Specialist / unnecessary | Code Beautify, Online Text Tools, TextCompare | Avoid in this phase; it changes privacy and architecture. |
| RFC-compatible CSV quoting and preview | Technically required / common | CSV suites and format semantics | Add one shared parser/preview; do not add batch tools. |
| Base64 standard/URL-safe | Commonly offered / correctness | MiniWebtool, Text Tool Suite | Standard default; URL-safe advanced. |
| MIME wrapping/data URL/byte visualization | Specialist | MiniWebtool, Text Tool Suite | Hide advanced or defer; no visualization needed. |
| Raw file byte Base64 and binary download | Technically required for file claims | MiniWebtool, FreeFormatter | Add correct file mode or remove irrelevant file promises. |
| Literal-space/all-whitespace/code-unit/byte distinctions | Technically required | WordCountFast; Unicode semantics | Add exact counter labels; no ambiguous “character” umbrella. |
| Proper-noun dictionaries/platform character presets | Specialist | ConvertCase, WordCountFast | Do not add without query/workflow evidence. |

What competitors do well is generally control clarity, before/after state, correct edge-case modes, examples, local-processing explanations, and related links. Their frequent friction is large site chrome, excessively long copy, feature overload, remote/cloud/share features, ad-removal prompts, and controls that mix different transformations. AllTextConverters should adopt correctness and clarity, not suite breadth.

## Settings audit

The complete setting-level decision record is in `settings-decision-matrix.csv`. The dominant defaults should be:

- line breaks: replace with one space; preserve paragraphs on; custom delimiter available; CRLF/LF/CR normalized; whitespace-only rows treated as blank;
- list-to-comma: one item per line; readable comma-space for inline output; valid RFC-style CSV preset for file output; no header unless requested;
- list-to-table: one item per line, not split on every whitespace run;
- formatting removal: rich clipboard auto-detection; paragraphs and lists preserved; links off unless selected; tabs, punctuation, emoji, and non-alphanumeric content preserved;
- HTML-to-text: line breaks, lists, and entities preserved/decoded; scripts/styles removed; link URLs advanced off;
- XML-to-text: whitespace collapse on by default, but enabling keep-line-breaks must not be neutralized by the collapse pass; reject DTD/entity declarations;
- text-to-XML: simple fragment/document generation with validated element names and invalid XML control-character errors;
- Base64: standard UTF-8 text default, URL-safe/padding advanced, raw bytes for files, strict decoding and binary download;
- hex/binary: UTF-8 bytes as the generic text default; ASCII remains an explicit mode, never an implied Unicode conversion;
- counters: literal space, all whitespace, UTF-16 code units, code points, graphemes, and UTF-8 bytes exposed as separate values.

### Unnecessary controls/work

- capitalization, punctuation insertion, or indentation in the line-break remover;
- XML namespace builders for a simple text-to-XML tool;
- URL fetching, cloud storage, accounts, public sharing, and pastebin exports;
- platform-specific character-limit presets until actual query/workflow data supports them;
- a visual Base64 bit breakdown, multiple MIME wrap widths as primary controls, or batch files;
- sort and deduplicate toggles repeated everywhere when the dedicated tools can be linked;
- more routes for synonyms or counter metric names.

## Cannibalization findings

### High confidence from repository semantics

- `/list-to-comma-separated` and `/text-to-comma-separated-list`: same line-list input, same comma-row output, same space-after-comma behavior, overlapping quote/trim/empty controls, and near-identical titles. Merge. Preserve `/list-to-comma-separated` as the likely clearer canonical route, but verify the missing GSC/Bing landing-page rows before selecting the redirect target.
- `/text-cleaner`, `/remove-extra-spaces`, `/whitespace-cleaner`, and `/remove-all-styling-from-text` overlap in copy and some operations. They can coexist only with sharper jobs: safe general preset; horizontal-space collapse; invisible/special-character normalization; rich-formatting-to-plain-text.
- `/json-to-text` and `/json-array-to-list` overlap but have genuinely different validation/input scope: arbitrary JSON flattening versus top-level array rows. Differentiate rather than merge.
- `/comma-separated-to-list`, `/table-to-list`, and `/comma-to-json-array` share delimiter parsing but produce different outputs/workflows. Share a parser, not a route.

### Not diagnosable without search exports

Focused case pages may compete with `/case-converter`, and directional encoding pages may rank for generic queries, but page-query overlap, impressions, and chosen Google landing pages are unavailable. Do not merge them based only on shared words.

## Content-quality findings

| Page/area | Classification | Evidence-based edit |
|---|---|---|
| Homepage | Needs targeted rewrite | Remove “no ads” and absolute “no tracking” claims before planned ads/measurement; reduce repeated generic paragraphs; keep tool first. |
| About | Needs substantial rewrite | Remove unsupported credentials/roles/school/date/experience/stack and promotional “trust moat/content farm/boring” copy; add supplied facts, responsibility, methodology, links, photo only after asset exists. |
| Privacy/cookies | Needs substantial rewrite | Align with actual future AdSense/CMP/analytics; explain local transformations and exactly what telemetry excludes; correct cookies route. |
| Contact | Needs minor editing | Remove unsupported 1–3 business-day response promise; provide issue-report template without requesting converted sensitive text. |
| Character counter | Needs targeted rewrite | Copy acknowledges code units but UI labels do not. Make the actual metrics primary and remove contradictions. |
| List/CSV pages | Needs substantial rewrite | Stop equating any comma split with CSV; explain quotes, escaped quotes, multiline fields, empty records, BOM, and preview only when implemented. |
| Remove styling | Needs substantial rewrite | Copy promises rich formatting removal that UI does not perform; distinguish clipboard, raw HTML, whitespace, and destructive cleanup. |
| HTML/XML/Base64/binary/hex | Needs targeted rewrite | Explain implemented encodings/parsers and failure modes; remove claims that exceed behavior. |
| Upper/lower/alternating/focused case | Strong / minor sitewide edits | Keep concise task copy; apply canonical/a11y/privacy consistency. |
| Shared HowItWorks/FAQ | Needs targeted rewrite | Remove internal package names and build instructions; eliminate repeated boilerplate and unsupported FAQ schema while keeping useful visible answers. |
| HelpfulTools/footer | Needs minor editing | Internal related tools should precede unrelated external properties; avoid external-project cards on policies/404. Keep the categorized footer directory. |

Many tool pages mention package names or installation/build conditions (`pdfjs-dist`, mammoth, jsPDF) that are internal implementation details and are already dependencies. Replace with user-visible capability/limit language. File upload controls frequently appear on tools where PDF/DOCX extraction is semantically surprising. Copy must describe local file reading accurately and never imply that a local File object is transmitted.

## Technical SEO findings

### Status, hosts, and URLs

- Keep `https://www.alltextconverters.com` and no trailing slash as the canonical convention.
- Fix the `/sort-list` loop and preserve one-hop permanent redirects.
- Return 404 from the wildcard loader/document response. Remove nonexistent suggested links or point them to real routes.
- If infrastructure permits, make HTTP apex redirect directly to HTTPS `www`; do not risk host migration for a one-hop optimization.
- No search/pagination/parameter routes were found. Do not invent them.

### Canonicals, sitemap, and robots

Google treats redirects and `rel=canonical` as strong signals and sitemap inclusion as weaker; signals should agree. Use self-canonicals, redirect merged/legacy URLs, link internally to canonicals, and list only canonical indexable URLs in the sitemap. See [Google's canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) and [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

Do not fabricate lastmod. Generate it from a maintained reviewed/content date or omit it. Keep policy noindex pages accessible to users and crawlers but remove them from the sitemap. Do not noindex useful tool pages merely because content overlaps; differentiate or merge based on behavior.

### Titles and snippets

Titles are unique in the inspected content routes, but many contain parenthetical keyword lists and claims not matched by behavior. Make each title concise, descriptive, and aligned with its primary H1 and actual transformation. Google recommends distinct, descriptive titles and may form title links from visible headings and other signals; see [title-link guidance](https://developers.google.com/search/docs/appearance/title-link).

Meta descriptions are not a direct guarantee of the snippet; Google primarily uses page content and may use the description when it better represents the page. Update descriptions only after behavior is correct, make each specific, and do not chase a fixed character count. See [snippet guidance](https://developers.google.com/search/docs/appearance/snippet).

Without query metrics, this audit cannot label any seed as a snippet problem. Prompt 4 must use the restored GSC/Bing data to compare query intent, landing page, title/H1, CTR, and position.

### Structured data and social metadata

- Keep one BreadcrumbList per content page and ensure every item URL resolves.
- Remove FAQPage JSON-LD. Google's current supported search appearance gallery does not include FAQ as a general utility-site feature; visible FAQs may remain. Do not recommend FAQ markup for rich-result expectations. See the [supported structured-data gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery).
- Use a small accurate WebSite/Organization graph on the homepage and factual Person/WebPage data on About. Do not place invented job titles, school, dates, or `knowsAbout` claims in schema.
- Keep SoftwareApplication only if its required/recommended properties accurately describe a browser utility and validate without warnings that matter; fewer accurate types are preferable to repeated decorative markup.
- Add a real, correctly sized social preview and per-page alt/context where relevant, or omit image tags. Never let the SPA fallback masquerade as an image.

## Trust and maintainer findings

### About page

Use a quiet two-part section: what the site does and who is responsible. Factual copy may state:

- AllTextConverters is built and maintained by Suhas Sunder.
- He holds a bachelor's degree in Engineering and Management and a master's degree in Electrical and Computer Engineering.
- Portfolio: <https://www.suhassunder.com/>
- LinkedIn: <https://www.linkedin.com/in/s-sunder/>
- Conversions are designed to run locally in the browser when the inspected implementation does so.

Do not state a school, employer, job title, graduation date, years of experience, awards, certifications, full-time/freelance/consulting history, or technology expertise unless separately verified and approved. The current About page and Person schema contain several of these unsupported claims.

Add a short testing methodology: deterministic fixture examples; Unicode/line-ending/delimiter malformed-input cases; browser/device smoke tests; large-input thresholds; accessibility checks; and last-reviewed date tied to an actual review/commit. This is a process promise that must be implemented, not generic E-E-A-T prose.

The image should be placed only on About, not repeated above every utility. Add a compact “Built and maintained by Suhas Sunder” link near the footer copyright and an unobtrusive “Reviewed [date] / report an issue” line below priority page explanations. The requested `suhas.jpg` file must be supplied before any image/schema reference is added, with intrinsic dimensions and meaningful alt text.

### Policies and contact

Explain that typed/pasted content and locally read files are not intentionally sent to the site's server by converter logic. Distinguish this from normal hosting logs, consent/CMP, advertising, and analytics. Explicitly prohibit converted text, decoded data, filenames, clipboard contents, and output from analytics and error telemetry. Give users a report path that asks for tool route, browser, input shape/redacted minimal reproduction, expected behavior, and actual error—not sensitive source text.

## Ad layout and AdSense readiness

No ads are implemented. `ads.txt` alone is not readiness. Before tags load, correct the home “no ads/no tracking” language, policy claims, consent behavior, and slot reservation.

Google warns against ads that resemble navigation/download controls and recommends padding/fixed sizing to prevent reflow. Use only “Advertisement” or “Sponsored links” labeling and keep ads away from download/action buttons. Sources: [AdSense ad placement policies](https://support.google.com/adsense/answer/1346295), [Confirmed Click guidance](https://support.google.com/adsense/answer/10025624), and [Google's CMP requirement](https://support.google.com/adsense/answer/13554020?hl=en). For TCF integrations, Google states that without Purpose 1 consent the ad tag should not be called; see [publisher TCF integration](https://support.google.com/adsense/answer/9804260?hl=en).

| Placement | Eligible pages | Desktop | Tablet | Mobile | Reservation / spacing | Suppress when |
|---|---|---|---|---|---|---|
| Below top navigation | Home and tool pages; optionally About after policy review | Static 970×90 or responsive equivalent, centered | Static 728×90 | 320×50/100 responsive unit | 16 px from nav; 24 px before tool; fixed min block only after slot is eligible | Consent/ad request not eligible; policy/contact/404; viewport cannot fit; no fill known before layout |
| Left sidebar | Tool pages only at very wide desktop | Static 160×600 outside content column; never overlay | Hidden | Hidden | Show only around ≥1600 px viewport with ≥24 px gutter and unchanged 1100–1180 px content width | Tool/result would narrow; zoom; reduced viewport; policy/about/contact/404 |
| Right sidebar | Same as left; do not force both | Static 160×600; choose one rail if width is insufficient | Hidden | Hidden | Same | Same; avoid double-rail density on short pages |
| Below main utility | Home/tool pages | Static 970×90 responsive | 728×90 | 320×100 or responsive | At least 24 px after the entire tool card; never between input/output/settings/action/result | Result/action still open; short viewport; consent/no fill |
| Square in information section | Tool pages with sufficiently long, useful information | Static 300×250 in a dedicated break between sections, not floated over text | Centered 300×250 | Centered 300×250 after a complete subsection | 24–32 px vertical space; retain readable text width | Copy is short; policy/contact/About/404; it would split a list/example/FAQ answer |
| Before bottom All Tools | Home/tool pages | Static 970×90 responsive immediately before footer directory | 728×90 | 320×100 | 24 px after preceding content and 24 px before “Tools” heading | All Tools is already near another ad; no fill/consent; policy/contact/404 |

Side rails should be static, not sticky. A sticky rail creates overlap/zoom risks and unnecessary density. No slot belongs between an input and output, between settings and Convert, inside the action row, over a result, below the footer, or styled like a button. Every slot needs visible “Advertisement” text, an accessible name, no misleading surrounding heading, no horizontal overflow at 200% zoom, and no focus hijacking.

Avoid an empty visual wall by deciding eligibility before initial layout: render a reserved box only when an ad request can occur, keep dimensions stable once shown, and collapse before first paint when the page/breakpoint/consent state is ineligible. Do not collapse a filled/requested slot after content has moved.

## Performance findings

- SSR and route-level lazy loading are strengths. Keep them.
- The 462 KB PNG logo is disproportionate for a small navigation mark. Compress/resize with intrinsic dimensions; do not redesign the logo.
- pdf.js produces two large worker assets and mammoth/jsPDF/html2canvas are heavy. Centralize the import path so each capability is emitted once, and load it only after a relevant file/action.
- External Google Font CSS adds a render/network dependency. Either self-host a subset with `font-display: swap` or use a system fallback if measurements justify it; visual appearance should remain Inter-like/plain.
- Every route hydrates shared navigation/footer and its ToolCard. Do not attempt a framework rewrite. Measure route-specific JS and interaction delay after fixes.
- No field Core Web Vitals data was provided. Repository observations are risks, not measured failures. Google's “good” thresholds are LCP ≤2.5 s, INP ≤200 ms, and CLS ≤0.1 at the 75th percentile; see [Web Vitals](https://web.dev/articles/vitals).
- Add byte/character/file size estimates before parsing. Use soft warning, hard safe limit, progress, cancel, and input preservation. Avoid blocking the main thread with multi-megabyte CSV, DOM, XML, encoding, or grapheme work.
- Use a Worker above measured thresholds (for example, start testing around 1–2 MB, then set limits from profiling); small inputs should remain instant without worker overhead.
- Clipboard writes must handle denied permissions and keep a manual selection fallback. Downloads should use Blob URLs, revoke them, choose correct MIME/extensions, and never round-trip content through a server.

## Accessibility findings

Static source inspection found 50 textarea instances across unique tool cards; 47 lack an `id`/associated `<label>`, `aria-label`, or `aria-labelledby`. Visual `<div>` headings do not provide programmatic names. No `aria-live`, `role="alert"`, skip link, `aria-describedby`, or reduced-motion rule was found.

Required remediation without redesign:

- associate every input/output/file/select with a visible label; read-only output remains focusable/selectable and is labeled as output;
- group related radio/checkbox controls in `<fieldset><legend>` and keep logical tab order;
- add “Skip to tool” and “Skip to result” behavior where useful;
- announce conversion completion, count changes only when appropriate, copy success/failure, file parsing progress, validation errors, and download readiness without stealing focus;
- move focus to the first error only on submitted actions, not live typing; return focus after mobile drawer/dialog closes; trap focus and support Escape;
- provide visible focus indicators, at least 44×44 CSS-pixel primary touch targets, and text labels/tooltips for icon-only controls;
- maintain heading order with exactly one H1 and avoid heading levels solely for visual size;
- test contrast in all states, 200%/400% zoom, reflow at 320 CSS px, keyboard-only operation, VoiceOver/NVDA, and reduced motion;
- allow textarea resizing or provide a usable grow control; `resize-none` across tools reduces large-input usability;
- label ad containers visibly and programmatically, but do not add ads to the accessibility tree as fake navigation or actions.

## Major risks

1. Missing query exports prevent the CTR/ranking/cannibalization portion of the acceptance criteria from being completed. Implementing title or redirect decisions without them risks optimizing the wrong landing page.
2. The current About/schema content can create trust problems because it contains unsupported personal claims.
3. Adding ads before consent, policy, slot, and CLS foundations risks privacy-policy and AdSense failures.
4. Naive CSV and silent encoding replacement can produce wrong output while appearing successful.
5. Broad PDF/DOCX upload controls imply semantics that many tools do not actually provide and can freeze the main thread on large files.
6. Typecheck/security debt makes a broad five-prompt change risky until tests and dependency fixes are in place.
7. Planned six-slot inventory can overwhelm short pages. Eligibility and density caps are mandatory; the list is placement capability, not a requirement to show all six simultaneously.

## What should remain unchanged

- The plain, polished, minimal visual language and current tool-first ordering.
- React Router/React/Vite/Tailwind/SSR as the core architecture.
- Existing canonical route names until the single evidence-backed duplicate merge is implemented.
- Local browser processing for text and files where browser APIs are sufficient.
- Separate directional pages when input/output/validation genuinely differ.
- The core focused uppercase, lowercase, alternating, case-checking, match-case, bulleted-list, and ordered-list workflows.
- The categorized footer directory and simple primary navigation.
- The no-account/no-server-storage model.
- Dynamic loading of PDF/DOCX/PDF-download libraries, after deduplication and size guards.
- Visible FAQs and explanatory content that answer real tool questions; remove only unsupported schema, duplicate/filler text, and implementation-package copy.

## Traceability

- Route, component, transform, policy, schema, sitemap, and build findings: repository inspection and local diagnostics.
- Status, redirects, rendered canonicals, missing assets, headings, and SSR findings: production crawl on 2026-07-16.
- Opportunity phrases and maintainer/ad facts: user-provided requirements; not presented as measured demand.
- Control conventions: URLs in `competitor-feature-matrix.csv`; no usage inference.
- Search presentation, canonical, sitemap, structured-data, and performance guidance: official Google sources linked in the relevant sections.
- Query metrics: unavailable; source files missing.
