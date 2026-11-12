# AllTextConverters owner review and 2027 release runway

## Evidence and release scope

This is a review queue for incremental releases. Each increment needs a fresh candidate on the then-current published branch, an exact preview, and owner authorization. The [A/B/C/F release inventory](./FINAL_RELEASE_INVENTORY_2026-11.md) gives the historical patch bases, exact heads, dependency graph, and rollback procedure. The [commercial hardening evidence](./FINAL_COMMERCIAL_HARDENING_REPORT_2026-11.md) gives the earlier GPP, security, indexing, and native-editor findings. The tables below extend that inventory with the marathon packages.

Wave 1 [draft #51](https://github.com/suhas-sunder/alltextconverters/pull/51) used commit `f463defa3bb12530161e0f5c8a2398d38d42cb7f` and the [immutable Netlify preview](https://6af5415e230c05a2e4d83edc--alltextconverters.netlify.app). The ready deploy had that exact Git ref. Node 22 validation passed 150 behavior/source tests and 10 static checks. Edge passed 58 of 58 hydrated and 58 of 58 JS-off documents, 46 original functional routes, and seven dedicated workflow suites at five widths. The sitemap remained at 48 URLs. One initial parallel strict pass recorded a 403 for `/json-to-text/`. Direct requests returned 200 and a serialized full rerun passed on the same deploy. The later expanded gate also passed on that exact deploy.

Wave 2 [draft #60](https://github.com/suhas-sunder/alltextconverters/pull/60) used commit `711bcbc3017da48af5a4aa7e8884dc9b0bc77c5c` and the [immutable Netlify preview](https://6af547edfaa905c0af940f56--alltextconverters.netlify.app). Validation passed 215 behavior/source tests and 12 static checks. The expanded hosted gate passed 61 documents in both crawl modes, 46 original functional routes, 13 noindex layouts at five widths, and 12 dedicated workflow suites. This wave contains ten feature packages and the Markdown, Unicode and query-editor correctness follow-ups.

Final [integration draft #65](https://github.com/suhas-sunder/alltextconverters/pull/65) is `35d8846bdbc5707a3a233df4be26f131c29ad64b`. Netlify deploy `6af54f407c6c2690ae0794b0` is ready and reports that exact commit in `deploy-preview` context. [Immutable candidate](https://6af54f407c6c2690ae0794b0--alltextconverters.netlify.app)

The first final preview at `b696cfc666519c305322099e70a3b54eac8f2b48` passed all original functional routes. Its staged suite stopped when the Unicode test's table selector matched both the live results and a static worked example. Commit `8833ea1e63a41713d5744de6c4b8660c00295f51` scopes the fixture to the results region. The extra accessibility scan then found a visible-label mismatch in the directory cards. The final candidate separates link names and descriptions and keeps the entire card clickable, with an explicit focus ring and browser regressions.

A subsequent hydrated crawl received Netlify 403 responses for `/word-counter/`, `/xml-formatter/` and `/xml-to-text/`. Direct rechecks on the same immutable deploy returned 200 with preview noindex headers, and the functional checks passed. The gate now uses two HTTPS document readers and smaller directory request batches. Every route still requires its own successful response.

Independent review verified the A, B, C and F ancestry and found no unresolved merge entries or whitespace errors. The advertising and consent source, root ad layout, Netlify configuration, robots rules, ads.txt and sitemap match #41. The final tree has 63 prerendered documents, 48 sitemap URLs and 15 noindex documents.

Verified ancestor commits are A `822b028d0831c49ccadf73c1214e98d8243fe8da`, B `9a0efa2698842476e2ff968a4e85d490b6daf4dc`, C `7c76a46e515eab69d57a60b3dd1ce180ae8ae142`, and F `14f560d4a8a6628f39f13651c3f4927378238f52`. The final crawl pacing commit changes the release gate, its documentation and the directory fixture. The final application matches the reviewed directory accessibility commit.

All ten new routes are ad-free and marked `noindex,follow`. They are `/csv-json-converter/`, `/compare-two-lists/`, `/text-diff/`, `/html-markdown-converter/`, `/unicode-inspector/`, `/url-query-builder/`, `/json-formatter/`, `/xml-formatter/`, `/file-base64-converter/`, and `/tools/`.

Published Git main remains `7189874058e86e26e8ea52d031d990f7687e517a`. Netlify's current production deploy remains `6ad02cf1071723e19c0b2ecd` on that commit, published October 15, 2026. The original Windows worktree remains clean at its starting local head `03ae0a5997bf2d383c600e1067152013da1f5444`. Pre-existing PRs and worktrees were preserved. No production merges, publication, scheduled releases, index submissions, account settings or live provider activation were performed.

### Reproduce the final check

Use the exact integration commit and its validated build. Node 22.23.1 clean install and validation passed 226 behavior/source tests and 15 static checks. Both dependency audits returned zero findings. The directory browser check verified all 56 canonical destinations, 60 interactive keyboard journeys and 24 with JavaScript disabled. It also verified that clicking the visible card description opens the same destination and that keyboard focus has a visible ring.

On November 12, 2026, the immutable candidate passed the full normalized-host Edge gate. It reached 63 of 63 pages hydrated and 63 of 63 with JavaScript disabled, passed all 46 original functional routes and all 15 dedicated workflow suites, and checked every noindex page at 320, 375, 768, 1280 and 1920px. The normalized redirects, real 404 responses, canonical links, preview indexing headers and 48-entry sitemap passed. The browser checks observed no ad, CMP or analytics requests or provider globals. Browser-local fixtures verified exact downloads, file and worker cancellation, private source handling and inert conversion of hostile input.

```powershell
npm ci
npm run validate
npm audit --audit-level=low
npm audit --omit=dev --audit-level=low
node scripts/verify-browser.mjs --all-staged --normalized-host --base 'https://6af54f407c6c2690ae0794b0--alltextconverters.netlify.app'
node tests/staged-accessibility.browser.mjs 'https://6af54f407c6c2690ae0794b0--alltextconverters.netlify.app' "$env:PLAYWRIGHT_CORE_PATH" "$env:BROWSER_EXECUTABLE" "$env:ATC_AXE_BUNDLE"
```

Set `PLAYWRIGHT_CORE_PATH` and `BROWSER_EXECUTABLE` for the release gate. Set `ATC_AXE_BUNDLE` to the axe-core 4.14.0 `axe.min.js` file from a separate browser tool installation. The browser tooling remains outside the application lockfile.

## Independent feature patches

Each patch is the delta from the listed base to the reviewed feature head. A follow-up fixes only its package and should travel with the initial patch. If a full patch is rejected, retain its existing baseline behavior by omitting it or reverting the reviewed integration commit. These draft branches do not authorize a production deployment.

| Package | Draft and exact source | Patch base | Proposed prerequisites and effect |
| --- | --- | --- | --- |
| M01 CSV/TSV ↔ JSON | [#46](https://github.com/suhas-sunder/alltextconverters/pull/46), `4f63bd178b9ea0bdadd42227d8147b1cd8bb6782` | #41 | #7, #11, #26 and #34. Reuses the CSV parser and factors JSON Lines lexical handling. New noindex route. |
| M02 Compare Two Lists | [#45](https://github.com/suhas-sunder/alltextconverters/pull/45), `8e71faedb7bf65ea28a6a315e5b4c724e35ac6b5` | #41 | #7 and the reviewed list utilities. New noindex route. |
| M03 Text Diff | [#47](https://github.com/suhas-sunder/alltextconverters/pull/47), `85dd8bd5c326bbbad39b11c7cafdbba470fe5a6b` | #41 | #7 and Text Cleaner fidelity #36. Review the pinned jsdiff dependency. New noindex route. |
| M04 HTML ↔ Markdown | [#54](https://github.com/suhas-sunder/alltextconverters/pull/54), `d453bc20a5f556d07af68f5f3d1102354ce7f6bc` | #41 | #7 and #3. Review the pinned Markdown and HTML converter dependencies. Includes literal Markdown and table fidelity fixes. New noindex route. |
| M05 Unicode Inspector | [#49](https://github.com/suhas-sunder/alltextconverters/pull/49), `21f96cc3412450589d890caea8b330486b9e1bea` | #41 | #7 and Byte Counter #9. Includes independent revisions for file reads and cleanup changes. New noindex route. |
| M06 URL Query Builder | [#48](https://github.com/suhas-sunder/alltextconverters/pull/48), `41bac6642e0f2a9ef7a7cbac6da46593d95ff41e` | #41 | #7 and #3. Includes exact newline edits and malformed Unicode rejection. New noindex route. |
| M07 JSON Formatter | [#50](https://github.com/suhas-sunder/alltextconverters/pull/50), `c253418cee44211220a88d2cd5e27884e66cab38` | #41 | #7 and #26 for the contextual JSON Lines journey. New noindex route. |
| M08 XML Formatter | [#57](https://github.com/suhas-sunder/alltextconverters/pull/57), `037aa50efa1eeedae527a3498283f388c262592e` | #41 | #7 and #3. New noindex route. |
| M09 File ↔ Base64 | [#53](https://github.com/suhas-sunder/alltextconverters/pull/53), `ffecb8e04c1758e7cf01e6d0af935f9bb46a8f1b` | #41 | #7 and #3. New noindex route. |
| M10 CSV data cleanup | [#52](https://github.com/suhas-sunder/alltextconverters/pull/52), `233a7e68e0a0f757ae8ffb5b61f324d1b2d041f7` | #41 | #17 and #29. Uses the same formula helper as #46. Existing table workspace. |
| M11 Local document import | [#58](https://github.com/suhas-sunder/alltextconverters/pull/58), `a7b627bef19c933fcb5d671ac45080e8c5ee8098` | #41 | Security #42, file race fixes #6 and counter work #9/#38. Existing homepage and counter routes. |
| M12 Cleanup recipes | [#56](https://github.com/suhas-sunder/alltextconverters/pull/56), `ed436aaea3b47d675afa1f933a9d8c28a3f0a5f1` | #41 | #18. Existing text workflow. |
| M13 Browse by Task | [#55](https://github.com/suhas-sunder/alltextconverters/pull/55), `48471fffbc47e072b2c15c7456396ca46e6acfe2`, plus final `712c3d1d0f1322c384d0ad081089ee310757a31d` | Wave 1 #51 plus final assembly | #23, #19, #30, M01/M02/M03/M05/M06 and any later destinations present in the final catalog. Include the final label and focus correction. New noindex directory. |
| M14 Catalog closure and worked examples | `a54329daccc42805663efc262007698eac2567fb`, integrated as `e8199c7` | Final assembly | M13 and linked tool destinations. Keep with the routes it documents. |
| M15 Browser release gate | [#59](https://github.com/suhas-sunder/alltextconverters/pull/59), `f401a193922d516f90c07244dcd5ecfe99194f33` | Wave 1 #51 | #25 and #32. Checks every staged tool present in the reviewed build. No separate production window. |
| M16 Large CSV worker | [#61](https://github.com/suhas-sunder/alltextconverters/pull/61), `ccc98cb9147f827c269136420d5b6d8894f2f767` | M01 #46 | M01 converter. Keeps larger conversions cancellable and lazy-loads the worker. |
| M16 Accessible controls | [#62](https://github.com/suhas-sunder/alltextconverters/pull/62), `5dd81cbe4c80499d0dfb7af7813e9ea66d58b52e` | `290f5fd6a01a4a9accbf95110928ac9c2bbbe5fa` | M02, M03, M05, M06 and M12. Review the isolated contrast, label, focus and scrolling changes. |
| M16 XML worker and validation | [#63](https://github.com/suhas-sunder/alltextconverters/pull/63), `5e632e8b47ac0495584eab6c56360800e5eca5af` | M08 #57 | M08 XML. Keeps native strict validation, moves lexical work off-thread and accepts valid authored `parsererror` elements. |
| M16 Table parse budgets | [#64](https://github.com/suhas-sunder/alltextconverters/pull/64), `73b8348b3bfacc3975722ed4910e34cf8395e59f` | Wave 2 #60 | M01's bounded parser and M10's workspace. Preserves C05 clipboard and 20,000 logical records. |
| Selected newline edits in Text Diff | Final integration `478d3fd` | Final assembly | M03 and the shared editor helper from M06. When releasing M03 earlier, isolate the helper and diff correction together and run the adjacent CRLF/LF deletion fixture. |

`#41 = 14f560d4a8a6628f39f13651c3f4927378238f52`. `#51 = f463defa3bb12530161e0f5c8a2398d38d42cb7f`. Use the listed commit range or the historical three-way patch procedure. Combined PRs can contain dozens of older commits. Verify the staged stat against the intended package before committing an increment.

## Proposed review order

1. **Security first.** Review scoped [#42](https://github.com/suhas-sunder/alltextconverters/pull/42) using its exact file-import/export and advisory evidence. Then prepare [#7 canonical and 404](https://github.com/suhas-sunder/alltextconverters/pull/7), followed by [#3 encoding and hydration](https://github.com/suhas-sunder/alltextconverters/pull/3). Recheck real 404s, trailing slash and aliases, protected conversions, JS-off crawl, hydration, and actual document files.
2. **Core editing and office fidelity.** Review homepage focus #5, file-race #6, list/table reflow #15, CSV correctness #11, keyboard feedback #10, and then Byte Counter #9, Line Break Remover #12, and intent/guide work #8/#14/#2 after their listed prerequisites. Use one reviewed package per ordinary week when practical. A failed gate moves subsequent work rather than compressing it.
3. **Established workflows and quality gates.** Stage table workspace #17 then spreadsheet clipboard #29, text workflow #18, print #24, JSON Lines #26 then #34, Batch #19, and Markdown #30. Land #35/#36 fidelity fixes and #38 counter worker before dependent expansions. Install QA #25/#32/M15 where their prerequisites exist. Offline aggregate importer #22 can be reviewed independently.
4. **New task workflows.** Review M01 and M10 with representative spreadsheet files, then M02 and M03 with actual duplicate counts and line ending fixtures. Review M04 and M07/M08 individually with structured and hostile fixtures. Review M05, M06, and M09 individually with byte and input preservation. M11 and M12 extend existing workflows and can advance independently when prerequisites have shipped. Review M13 after all linked destinations, with native and keyboard journeys on the proposed tree. Apply measured usability follow-ups together with the owning tool where possible.
5. **Indexing and advertising decisions.** Indexing for each of Markdown, Batch and the new routes requires a separate owner decision. Keep the current sitemap footprint until that decision. Disabled ad infrastructure can be reviewed independently in #20 → #21 → #31/#33 → #40 dependency order. Actual serving requires the separate activation gate below.

For a 2027 runway, reserve review weeks 1–3 for security, URL normalization and hydration, then allow roughly ten weeks for core editing and office fixes. Follow with the established B/C workflows and then the thirteen marathon packages. Treat the combined evidence drafts as regression references while each increment advances. Breaks for observation or a failed gate can extend the runway.

## Search evidence and indexing review

The supplied Search Console aggregate for October 11 through November 7, 2026 records 194 clicks, 13,880 impressions, 1.40% CTR and position 14.18. It predates the new pages. There is no page-query, country, revenue, or field-vitals evidence for these staged routes. Use new authorized first-party exports for those decisions. [Recorded aggregate](../docs/measurement-import.md)

| Page or workflow | Plausible task query to test | Public comparison and staged evidence |
| --- | --- | --- |
| CSV and JSON | CSV to JSON keep leading zeros | Comparable CSV tools offer explicit number inference. Verify default strings, duplicate headers, missing values and unrounded numbers. [CSVJSON](https://csvjson.com/csv2json) |
| Compare Two Lists | compare two lists and count duplicates | Compare set results with occurrence-aware common/only/union and stable exports for inventory or roster work. [ListDiff](https://listdiff.org/compare-two-lists) |
| Text Diff | compare text files including line endings | Test exact CR/LF and terminal line break comparisons plus full export. [Edwin Lab](https://edwinlab.dev/text-diff/) |
| HTML and Markdown | paste formatted HTML to Markdown | Test rich clipboard, headings, lists and simple tables in both directions. [Paste to Markdown](https://euangoddard.github.io/clipboard2markdown/) |
| Unicode Inspector | find zero width spaces and Unicode offsets | Test invisible controls, grapheme groups, byte offsets and exact UTF-8 exports. [UniView](https://r12a.github.io/uniview/help.html) |
| URL Query Builder | edit repeated URL query parameters | Test repeated keys, blank values and plus/percent space encoding. [Query String Builder](https://a2z.tools/query-string-builder) |
| JSON Formatter | format JSON without rounding large integers | Test formatting and diagnosis with original number and string lexemes. [JSON Formatter tools](https://jsonformatter.org/tools) |
| XML Formatter | validate XML and preserve mixed content | Test well-formedness and byte-sensitive text inside mixed content and `xml:space`. [XML Formatter tools](https://jsonformatter.org/tools) |
| File Base64 | convert a local binary file to Base64 and back | Compare ordinary file encode and download workflows. Test inert output, URL-safe form, data URIs and byte hash equality. [File to Base64](https://base64.guru/converter/encode/file) · [RFC 4648](https://www.rfc-editor.org/rfc/rfc4648) |
| Markdown Table | Markdown table to CSV with quoted cells | Distinct spreadsheet transfer task, strongest existing staged page for first owner indexing review. [TableConvert](https://tableconvert.com/markdown-to-csv) |
| Batch Text Files | clean multiple local text files and download a ZIP | Useful multi-file task with cancellation/retry. Review separately from Markdown. [Batch Processor](https://tools.maxhogan.dev/batch-processor/) |

## Laboratory and accessibility results

The Edge 157 workload lab used native local files, 320px and 1280px viewports and 4× CPU throttling. Timings are medians of three samples for the listed configurations. The right-hand number in each pair is the longest observed main-thread task. A zero records no task at or above the 50 ms observation threshold. These are laboratory observations.

| Representative workload | 320px action / main-task ms | 1280px action / main-task ms |
| --- | --- | --- |
| 1 MiB CSV → JSON | 232 / 235 → 134 / 0 | 254 / 258 → 130 / 0 |
| 1 MiB JSON → CSV | 176 / 179 → 85 / 0 | 161 / 164 → 87 / 0 |
| 512 KiB XML compact | 206 / 125 → 173 / 86 | 207 / 126 → 174 / 80 |

CSV conversion at 10 KiB remained within 3 ms of the baseline, and 100 KiB had no measured regression. The CSV worker adds 3,508 gzip bytes on demand, with about 599 bytes of additional startup JavaScript. The XML worker leaves the native parse on the main thread and keeps its startup bundle near the original size. Exact output bytes passed both comparisons. XML rejects over 512 KiB. JSON and CSV reject over 1 MiB. The 5 MiB binary workflow completed in the worker, and its 12 MiB fixture passed a SHA-256 round trip and cancellation. [Reproducible performance lab](https://github.com/suhas-sunder/alltextconverters/blob/5e632e8b47ac0495584eab6c56360800e5eca5af/docs/workload-performance.md)

Applying the existing row and column budgets before workspace allocation reduced a 1 MiB blank-line rejection from 456 ms to 14 ms in the 4× Edge run, and reduced an oversized TSV probe from 141 ms to 16 ms. Node heap growth in the same inputs dropped from 200.6 MiB to 7 MiB and 102.2 MiB to 4.3 MiB respectively. The workspace still accepts 20,000 quoted-multiline logical records. [Bounded table parser evidence](https://github.com/suhas-sunder/alltextconverters/pull/64)

The accessibility pass corrected measured contrast failures in six homepage actions and transient tool controls, provided keyboard access to the scrollable comparison preview, matched move and directory link labels to visible text, and preserved focus after reorder. The exact hosted axe and Edge checks passed on 11 pages at 320px and 1280px with 200% zoom and reduced motion. The audit still reports pre-existing duplicate advertisement landmark labels on Home. Those landmarks and the ad placement behavior were kept intact.

The document workflow extends the existing homepage and counter controls. PDF extraction requires selectable text and preserves page order without attempting OCR. The native textarea architecture remains in place based on the prior layout measurements. Large CSV and XML paths gained targeted worker changes where paired measurements showed an improvement.

## Owner approvals before an advertising pilot

1. Review the exact publisher account, approved site and production hostname, publisher and unit IDs, and account-provided ads.txt entry. Decide on a single below-utility Home unit and the exact pilot audience.
2. Provision and review the selected certified CMP tenant, identifiers, notices, consent version, geography, refusal/withdrawal, GPC, and reporting. Verify the actual regional signal fields rather than relying on synthetic fixtures. Google documents certified TCF for personalized ads in EEA/UK/Switzerland, and its GPP support covers US National v1/v2 and selected US state sections. The site continues to require the approved signals for the chosen regions. [Google CMP requirements](https://support.google.com/adsense/answer/13554116) · [AdSense GPP support](https://support.google.com/adsense/answer/14126816) · [Google privacy choices API](https://developers.google.com/funding-choices/fc-api-docs)
3. Review real first fill, late and blocked scripts, no fill, withdrawal, navigation and resizing on desktop and mobile. Capture genuine network, DOM and screenshots. Verify global placeholder suppression after first fill, physical separation from every actionable control, and that the kill switch prevents new requests. Account and provider access plus authorization for a genuine creative are still required. [Ad placement policies](https://support.google.com/adsense/answer/1346295)
4. Approve the exact pilot SHA and rollback. Check the previous published deploy ID and leave tracking separately gated. Verify the flag and withdrawal in the account after any separately authorized pilot.

## Rollback and recovery

Build an isolated candidate on the current published head. Record the exact source and patch base, review its isolated diff, run Node 22.23.1 `npm ci` and `npm run validate`, run development and runtime audits, and get an immutable Netlify deploy whose `commit_ref` matches. Run the [browser release gate](../docs/browser-release-gates.md) with `--all-staged --normalized-host --base <immutable-preview>` when the corresponding QA package is present. Record the ready deploy ID, 404 and redirect evidence, sitemap and noindex footprint, JS-off and hydrated counts, provider attempts, and original functional route pass count.

Retain the preceding production SHA and deploy ID for each separately authorized release. If a defect appears, prepare a revert of the isolated release commit, or reverse dependent commits in reverse order. Re-run the affected and full gates on an exact revert preview and obtain owner approval for that recovery candidate.

## Local power-off checkpoint

This report records the state before power-off. The execution host was verified as the physical local Windows 11 development PC. After the browser runners finish and the remote candidate and report are verified, the requested final terminal action is `shutdown.exe /s /t 0`. Windows handles any application that needs attention. [Microsoft shutdown command](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/shutdown)
