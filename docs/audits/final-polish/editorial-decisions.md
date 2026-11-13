# Editorial decisions and indexing review

Reviewed against accepted commit 35d8846bdbc5707a3a233df4be26f131c29ad64b and its immutable Netlify preview on November 12, 2026. The CSV matrix covers all 48 indexable routes. Its metadata, headings, guide text and links are baseline observations, paired with route-specific judgments and implementation actions. Final runtime results belong to the acceptance report.

## Evidence and intent

The supplied first-party total is 194 clicks and 13,880 impressions for its recorded period. No current page-by-query export is available for this review. That total cannot establish demand for an individual tool or diagnose cannibalization. All intent and indexing recommendations below are qualitative product judgments, not measured search gains.

Google treats useful interactive functionality as main content and asks whether it satisfies the visitor's task. Its title guidance favors concise, distinctive descriptions. These principles support correcting inaccurate help and making the utility easier to use; they do not justify adding generic word count. [People-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [title links](https://developers.google.com/search/docs/appearance/title-link).

Competitor observations were limited to public page content, not their traffic or rankings. Convert Case emphasizes preserving useful structure when stripping rich formatting. TableConvert exposes table review and export settings. Diffchecker separates text comparison from document and spreadsheet comparison. These are evidence of workflow terminology; no copy or performance claims were borrowed. [Convert Case](https://convertcase.net/plain-text-converter/), [TableConvert](https://tableconvert.com/markdown-to-csv), [Diffchecker](https://www.diffchecker.com/).

## Close route decisions

| Pair or family | Observed distinction and decision |
|---|---|
| List to Comma-Separated / Text to Comma-Separated List | The first joins lines and can export the original items as a CSV column. The second strips list prefixes and offers several split modes. Keep both and explain the distinction. Its Commas mode is simple splitting; quoted CSV support belongs to the dedicated comma parsers. |
| Text Cleaner / Whitespace Cleaner / Remove Extra Spaces | Fixed trim-collapse normalization, invisible-whitespace normalization with tabs preserved, and horizontal-space collapse with line preservation are different operations. Help previously misstated these rules. Correct help and retain all three. |
| Character Counter / Word Counter / Byte Counter | Visible-character, writing-word and UTF-8 byte limits require different primary results. Shared computation is useful consistency, not proof of cannibalization. |
| Text to JSON / JSON Array to List / JSON to Text | Creation from text, extraction of top-level items and recursive primitive extraction have different inputs and information loss. Keep all and explain types, nesting and numeric precision. |
| CSV to List / Table to List / Comma-Separated to List | CSV column selection, HTML/TSV table extraction and flattening every CSV field are distinct. The extended CSV workspace does overlap parts of Table to List, but there is no query evidence supporting migration. |
| HTML to Text / Plain Text Converter / HTML and Markdown | Plain-text extraction, configurable formatting cleanup and conversion retaining markup structure overlap in source input. Outputs and controls differ. Keep them, add a contextual Markdown link, and do not consolidate without owner-reviewed page-query evidence. |
| Broad case converter / focused case routes | Focused modes offer a direct entry for a known task. No new synonym pages are proposed. Query-level overlap remains unmeasured. |

No redirects, canonical changes, removals, deindexing or sitemap additions are proposed for execution in this assignment. If later data supports consolidation, review both pages' queries and landing traffic, choose a destination with equivalent functionality, inventory internal links and backlinks, then separately approve the redirect, canonical and sitemap migration with rollback and monitoring.

## All 15 noindex documents

Every route stays noindex and outside the sitemap. INDEX WHEN APPROVED means the product has a defensible distinct task; it is not authorization or a prediction of search performance. Each future activation requires an owner decision and acceptance against its exact release tree.

| Route | Recommendation | Product/content judgment, overlap and maintenance |
|---|---|---|
| /markdown-table-converter/ | INDEX WHEN APPROVED | Markdown pipe tables to CSV/TSV and the reverse are distinct from HTML extraction. Original working examples, settings, preview and local export support the task. TableConvert demonstrates the workflow vocabulary. Maintain escaping, alignment and round-trip fixtures. |
| /csv-json-converter/ | INDEX WHEN APPROVED | Table records, type choices and exact header handling differ from a flat comma-to-string-array tool. Existing examples and documented limits are useful. Maintain CSV quoting, duplicate-header and type-fidelity coverage. |
| /compare-two-lists/ | INDEX WHEN APPROVED | Intersection, union and differences between sets differ from deduplicating one list. The results and examples are task-specific. Maintain matching-rule and export-order tests. Demand volume remains unknown. |
| /text-diff/ | INDEX WHEN APPROVED | Ordered draft revisions differ from unordered set comparison. Its line-ending and whitespace controls give a coherent text-focused scope. Diffchecker confirms common task terminology, not a ranking opportunity. Maintain large-input and report fidelity. |
| /html-markdown-converter/ | INDEX WHEN APPROVED | Two-way structural conversion differs from stripping HTML to plain text or extracting a pipe table. Existing examples and limitations explain sanitization and lossy conversion. Maintain parser and preview security. |
| /unicode-inspector/ | INDEX WHEN APPROVED | Shows code points, byte offsets and invisible characters before optional cleanup; this is distinct from counters and fixed cleaning. Original inspection examples are useful. Maintain Unicode handling and preserve join controls. |
| /url-query-builder/ | INDEX WHEN APPROVED | Ordered query pairs, duplicate keys and fragments differ from encoding one value. Existing examples explain plus signs and blank values. Maintain URL parsing and no-navigation safeguards. |
| /json-formatter/ | INDEX WHEN APPROVED | Formatting/validation with exact numeric-token preservation differs from extracting JSON values. The precision-focused example and syntax errors provide substance. Maintain tokenizer correctness and avoid claiming schema validation. |
| /xml-formatter/ | INDEX WHEN APPROVED | Well-formedness checks and formatting with mixed-content/xml:space preservation differ from XML extraction. Content states unsupported DTDs and schema validation. Maintain strict parsing and non-destructive whitespace tests. |
| /file-base64-converter/ | INSUFFICIENT EVIDENCE | Arbitrary binary bytes are functionally distinct from UTF-8 Base64 text, and the file workflow is complete. Prioritize obtaining page/query evidence for file-oriented demand before adding another broad Base64 landing page. Maintain size, MIME and download safeguards. |
| /batch-text-files/ | INSUFFICIENT EVIDENCE | Multi-file local processing and ZIP export are real additional capabilities with an original example. Demand for a dedicated batch landing page is unmeasured; keep discoverable through relevant tool links while collecting approved evidence. Maintain cancellation, limits, names and complete exports. |
| /tools/ | KEEP NOINDEX | Useful task directory and internal navigation. It need not compete with the homepage for broad text-tool searches. Keep accurate descriptions and working links; no extra conversion claims. |
| /privacy-policy/ | KEEP NOINDEX | Trust/support document, not a converter landing page. Clear local-content and future optional-service descriptions; retain the existing date unless the policy is actually revised. Future ad activation requires owner review. |
| /cookies-policy/ | KEEP NOINDEX | Explains storage and optional categories. Preserve existing indexing policy. Any future CMP deployment requires the owner to reconcile this document with real provider behavior. |
| /terms-of-service/ | KEEP NOINDEX | Useful service conditions and contact links, without a distinct tool-search task. Keep available in navigation. No legal rewrite or new claims in this assignment. |

## Changes and limits

Three cleanup guides and two comma-parser guides replace long, partly inaccurate explanations with short rules, exact input/output and focused native disclosure FAQs. Other edits clarify JSON type/depth loss, default comma spacing, document extraction and the distinction between encoding and security. Technical segmentation detail remains below the word-counting utility. The redundant converter guides on About and Contact are removed.

New contextual links point to existing JSON Formatter, Unicode Inspector, CSV and JSON Converter, HTML and Markdown Converter and the homepage workflow. Their destinations remain noindex where already configured. Inline samples render as escaped code with preserved spacing and real line breaks, so a spacing example no longer collapses visually into two identical strings.

No new dependency or tool is introduced. No page-level search demand, ranking gain, CTR improvement, traffic forecast or revenue effect is claimed. The existing exported aggregate is insufficient to prioritize these candidates commercially; owner-approved Search Console page/query evidence is the next research input.
