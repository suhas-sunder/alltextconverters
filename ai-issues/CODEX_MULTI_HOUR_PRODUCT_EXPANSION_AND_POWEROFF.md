# ALLTEXTCONVERTERS — multi-hour, multi-wave implementation marathon and safe PC power-off

## NON-MINIMAL EXECUTION DIRECTIVE — OWNER CLARIFICATION (2026-11-11)

**Do not take the shortest path to a technically passable report or to a superficially checked feature.** Your optimization target is the best justified, production-quality result from a sustained engineering session, not rapid task closure. Treat every package's listed acceptance as a **floor, not a ceiling**:

1. First implement the full useful workflow (not the smallest demonstrable slice); inspect realistic competitor behavior and the needs of frequent users. The utility must be genuinely competitive, ergonomic, accurate and worth revisiting. Do not rewrite existing working functionality without need.
2. For each new tool, go beyond a happy path: adversarial/invalid inputs, Unicode, data preservation, import/export round trips, large inputs, stale async states, copy/download accuracy, permission denial, responsive design, keyboard/screen reader, all supported modes and genuine browser testing.
3. Independently review each substantial implementation from both **engineering correctness/security** and **end-user UX/SEO** perspectives; fix findings in code, rerun validation, and only then mark the package complete. Run a second integration review after multiple packages to catch shared-component regressions.
4. Do not stop when a numeric PR target is reached if high-value work remains. Likewise do not manufacture PRs, filler pages or tests, run artificial sleeps or burn tokens for an arbitrary number of hours. Prefer difficult valuable tasks over the easiest available route to a green checklist.
5. Avoid the “one PR, one report, finish” anti-pattern: maintain a durable checklist, move automatically to the next meaningful work item, include any remaining justified gaps and tests, and continue while execution resources and safety allow. On a hard runtime/quota boundary, persist an exact resumable checkpoint and truthfully report partial work.
6. Before final shutdown, verify the full scope has been seriously explored, high-value remaining packages are either completed or blocked with concrete evidence, QA passes and all agent work is saved/pushed. Never power off early merely because the minimum package count or baseline tests passed.

**This direction is about depth, completeness and sustained implementation, not unnecessary complexity.** Preserve the product's quick utility experience; use free OSS, avoid redundant features, and keep staging/production/ad/shutdown safeguards unchanged.

**Owner authorization:** Develop substantial software on non-production branches, run long unattended implementation and validation, create PRs and maintain checkpoints. The owner explicitly requests that the **local Windows PC shut down completely at the END**. Do not force shutdown unsaved applications or shut down a remote VM by mistake.
**Agent:** Codex Sol MEDIUM default; HIGH only when justified for a difficult isolated problem. Discover available models and effort/quotas dynamically.
**Repo:** https://github.com/suhas-sunder/alltextconverters
**Verified on 2026-11-11:** published remote main SHA 7189874058e86e26e8ea52d031d990f7687e517a, full integrated A+B+C+F staging candidate PR #41 head 14f560d4a8a6628f39f13651c3f4927378238f52 (branch codex/atc-f-final-acceptance), early-security PR #42 head 71d556f3ef2076e52a3348cd33cf63126bfb9b6e; production still Oct 15 Netlify deploy 6ad02cf1071723e19c0b2ecd. Recheck every ref when starting.
**Business:** Mature browser-local converter platform with excellent repeat utility, search demand in US/CA/UK/AU/NZ, compliant sustainable advertising monetization, and gradual staged releases over 2027. This is NOT an MVP and not a readiness-only task.

## 0 — CRITICAL DISTINCTION FROM PREVIOUS SHORT RUNS

Earlier runs stopped after two small PRs plus a report or after completing a small fixed package count. DO NOT REPEAT THAT PATTERN. The task here is a **large ordered implementation queue with deeper executable acceptance**. Complete as many fully validated real features as the actual runtime and resources support, wave after wave. **A short report is not completion.**

- Target **10 to 15 independently meaningful implementation packages**, generally 7+ substantial converter/user-value features and 3+ quality/discovery/operations capabilities, plus a final integration and release preparation. The target is a work quota, NOT permission to ship junk. Skip unjustified tools and substitute the next high-value candidate.
- Avoid arbitrary wall-clock sleeps and token-burning debates. The task should naturally require hours of implementation, tests, and browser verification. Runtime/credit limits cannot be overridden merely by a long prompt. If limited, save an exact checkpoint and use a **genuinely available, permitted** continuation mechanism; do not claim asynchronous work that does not exist.
- Make each PR a real reviewable unit, not a minor color, label, FAQ, or 1-line fix. Substantial packages must include independent behavioral tests, real-browser acceptance at required widths, accurate copy/download behavior and protection of existing tools.
- One managing agent owns integration, delegates bounded nonoverlapping files where it actually reduces quota/credits, and checks the source of every worker result. No conflicting writes, branch reset or unpublished data loss.
- Do not stop after a kickoff research report. For each wave: choose, implement, test, stage, preserve proof, continue. Treat report generation as the last, small part of each wave.
- In particular DO NOT spend the work run on rebuilding already delivered PDF Unicode printing, CSV/table workspace, clipboard, batch TXT ZIP, workflow pipeline, JSON Lines, Markdown table converter, search tool finder/favorites, ad adapters, TCF/GPP, 46-route QA, counter worker or dependency patch. Improve these only where a reproduced new defect or substantial missing feature exists.

## 1 — ZERO PRODUCTION MUTATION AND SAFETY

Main is production and can trigger Netlify. No push/merge/rebase/force-update to main, no auto-merge, no production deploy, no changing DNS, no Ads publisher/account settings, no paid APIs, no new tracking, no live advertising requests, no publishing new pages for indexing, no installing privileged services or remote shutdown. All tasks go to separate isolated feature branches or worktrees and DRAFT PRs. Preserve all PRs #1–#43 and existing user/agent worktrees.

Base fresh changes on the **verified integrated candidate SHA 14f560...** in a separate read-only-derived feature branch, but do not accidentally merge a stacked full integrated PR to main. For incremental PR review, target their true feature parent (often PR #41 staging branch) and write the exact incremental diff; make clear any stacked ancestry. Prefer an integration manager and separate sibling worktrees. Do NOT create 10 PRs all targeting main with inherited 43 commits each and then misrepresent them as independent. Preserve the exact original patch SHA and dependencies, and allow later isolation onto production main in planned order. Do not modify previously approved PR heads without recording why. Stage new URLs with noindex,follow and exclude from sitemap pending owner authorization. Apply existing Netlify preview X-Robots-Tag noindex safeguards.

Read owner-protected ad policy ai-issues/AD-PLACEHOLDER-SAFETY.md: global placeholder suppression after reliable first real ad fill is a deliberate requirement. Do not change it except under separate explicitly reviewed ad integration scope; no creative/placeholder overlays. Do not enable any provider on preview.

## 2 — READ FIRST; THOROUGH BUT BOUNDED PREFLIGHT

Read the project source, original auditable settings, B and C handoffs, hardening report and final release inventory. Especially:
- ai-issues/FINAL_RELEASE_INVENTORY_2026-11.md on commit 537ef2bb9b9119f8d26887e5f259690354259ce0;
- ai-issues/FINAL_COMMERCIAL_HARDENING_REPORT_2026-11.md on that same commit;
- ai-issues/COMPLETE_COMMERCIAL_BUILDOUT_2027.md, ai-issues/WESTERN_SEO_AD_MONETIZATION_2026-11.md, ai-issues/SEARCH_BASELINE_2026-11-09.md, ai-issues/AD-PLACEHOLDER-SAFETY.md;
- docs/audits/competitor-feature-matrix.csv, docs/audits/query-intent-map.csv, docs/audits/tool-url-inventory.csv, docs/audits/future-only-backlog.md, docs/audits/settings-decision-matrix.csv, docs/performance-budgets.md;
- new integrated code on PR #41 and all recent PRs #29–#43; relevant route/transform modules.
- GitHub issue/tracker created for this run, if present, as a progress journal.

Verify main and preview SHA, existing uncommitted work, software environment (Windows host vs WSL vs NixOS VM), available quota, and tools. Record a compact working checklist. Do not write another 20-page audit before implementation. Baseline tests: Node 22.23.1 clean npm ci, npm run validate, appropriate hosted browser suite when practical.

Important historical user data: latest 28-day Google Search baseline supplied Nov 9 (Oct 11–Nov 7): 194 clicks / 13,880 impressions; previous 142 / 11,586. This is search traffic, NOT ad pageviews or revenue. US 15,932 of 43,230 three-month impressions; CA and UK contribute, AU/NZ detailed cohort unavailable. Do not claim high RPM, make up rankings, or build geographic doorway pages. No GSC Wizard.

## 3 — EVIDENCE-LED FEATURE SELECTION

Before each candidate, research **real task distinctness**, what already exists on this site, actual competitors and published format standards, practical English-language search need, and implementation cost. An approved candidate may be supported by clear useful workflow independently of GSC if not enough granular search data; don't falsify keyword volume. Reject and replace synonym-only routes. Scope a functional first-class tool (inputs, validation, outputs, copies/downloads, useful examples, error states) rather than padding content. If a feature would be genuinely valuable but new page indexing is not yet supported, build it as a noindex working route in staging. Keep all useful tools discoverable via legitimate contextual navigation.

Preserve browser-local privacy, free OSS libraries where safe, no new accounts, no backend, no remote URL fetching, no sensitive text telemetry. Avoid giant bundle imports; defer heavy modules until interaction.

## 4 — IMPLEMENTATION WAVE ONE: HIGH-VALUE, DISTINCT DATA UTILITIES

### M01: CSV ↔ JSON full multi-column converter

The existing CSV/list and JSON Lines/array utilities are NOT a general bidirectional CSV↔JSON object conversion. Implement a professional browser-local converter, probably a single new noindex route with both directions, using the verified shared CSV parser and serializer, not a third parser. Accept real CSV/TSV columns, header yes/no and explicit header handling, quoted newlines and separators, BOM/CRLF/CR, empty/null distinctions, uneven rows and duplicate/empty headers with explicit policy, configurable delimiter, JSON objects or array-of-arrays input, nested object cells with explicit strategy, strict UTF-8, exact large numeric input without silently rounding, clear errors with row/column, sorting/preview bounds, full result export. Include option for spreadsheet formula-risk mitigation with accurate disclaimer; preserve literal data by default and never claim apostrophe strategy is universal.

Acceptance: independent valid and invalid round-trip/property fixtures (50+ targeted cases reasonable), 1 MiB and 20k-row bounds aligned with existing policy, full output remains intact beyond preview cap, file picker, paste, clipboard, CSV and JSON downloads with correct extension/mime, keyboard, five widths, no private network. If it overlaps existing workspace, build a genuinely differentiated advanced mode instead of a new page.

### M02: Compare two lists / sets

Create a practical tool for reconciliation of customer/vendor IDs, domain lists, email lists, product codes and spreadsheet columns. Two separate input panes, visible A-only / B-only / common / union results with occurrence counts, stable source-order versus sorted option, exact or case-insensitive option, whitespace handling, Unicode and mixed line ending support, blank line policy, duplicate treatment including multiset vs set with explicit choice, side-specific copy and download, input/record bounds, no invisible destructive normalization by default. Keep results deterministic and understandable. Large input processing should not lock the browser; worker if measured and justified. No data upload or storage. Distinct intent from one-list deduplication and case-insensitive sort.

Acceptance: deterministic fixtures including repeated IDs, mixed CR/LF/CRLF, Unicode, case variants, zero and thousands of records, keyboard and 320px reflow, no stale A/B output after edits.

### M03: Text comparison / difference viewer

A separate two-pane compare for paragraphs, contract clauses, code snippets and documents; show line-level difference with optional word-level highlighting where safe. Use a proven OSS diff algorithm, license review, bounded memory/time, no browser unsafe HTML, preserved Unicode and original line endings. Design mobile responsive side-by-side or stacked view, meaningful accessible added/removed labels, navigation between changes, copy/download summary and optional unified diff where appropriate. Don't promise diff for gigabytes; guard inputs and pathological repeated lines, time-box/worker for long diff to prevent main-thread lock. Handle equality, blank input, merged line edits, combining sequences and tricky whitespace.

Acceptance: meaningful test suite for insert/delete/modify/repeated lines, HTML injection escaped, max input/cancel/timeout, responsive flow, keyboard navigation, output copy and downloads. Distinct from list comparison.

### M04: HTML ↔ Markdown for practical content transfer

Existing HTML↔plain-text and Markdown-table converter are not a full safe HTML↔Markdown workflow. Build opt-in rich text conversion for headings, paragraphs, links, nested ordered/unordered lists, code blocks, blockquotes and simple tables, preserving human-readable structure. Reuse mature audited OSS if suitable and dynamically import. Provide HTML preview in sandbox/inert DOM or rigorously safe generation only, never execute scripts, event handlers, external image fetches, forms, iframe, embedded objects or unsafe URLs. Markdown rendering must not execute raw HTML or XSS. Document deliberate loss of complex CSS/layout and non-representable elements. Save TXT/MD/HTML and copy with exact expected encoding. If HTML↔Markdown is too risky or far too large, perform HTML→Markdown first with complete test coverage and save the reverse direction as clearly incomplete next step, but DO NOT call the full package finished.

Acceptance: nested structure/escaping fixtures, XSS resource-blocking and external-request tests, different whitespace/line endings, clipboard/paste, 320–1920px, source preservation, no legacy HTML↔text regression.

### M05: Unicode text inspector and invisible-character detector

Build a tool that makes Unicode code points, variation selectors, NBSP, zero-width spaces, ZWJ, directional control marks, combining sequences and byte size understandable to developers, writers and editors. Show a bounded per-grapheme/code-point listing: escaped code point, category/description from a vetted minimal table when known, UTF-8 bytes, UTF-16 units and precise original indices, with visible warnings for ambiguous/invisible or bidi controls. Avoid automatically deleting intentional script shaping or emoji joiners. Offer an optional explicit removal/normalization preview with exact before-after and UTF-8 copy/export; default never mutates. Use Intl.Segmenter where supported and clear fallback. Escape dangerous output; prevent directional spoofing in display.

Acceptance: Unicode emoji ZWJ, combining marks, astral planes, CJK, variation selectors, RTL/bidi controls, Unicode normalization, 5k-record preview cap (adjust as measured) and full export bounds. Distinct from Byte Counter.

### M06: URL query-string / parameter parser and builder

Distinct from simple URL encode/decode: support query-only and full URLs, repeated keys and blank values, stable order and all reserved characters, "+" versus percent-space semantics, fragments, preserving base host without server requests, editable add/remove/reorder rows, valid percent encoding and informative errors. Display safe decoded versus encoded views, CSV/JSON export where useful, copy full URL or query, optionally append parameters without double-encoding. Do NOT fetch URL targets, SSRF, navigation to user-supplied hostile schemes or unsafe hyperlink previews. Use standards URL/URLSearchParams where fit.

Acceptance: duplicate keys, empty key/value, U+ characters, malformed %, existing fragments, exact fidelity of multiple equal keys and space conversion, long URL limits, mobile/keyboard.

## 5 — IMPLEMENTATION WAVE TWO: DEVELOPER / OFFICE DEPTH

### M07: JSON formatter, validator and structure explorer

Existing JSON↔text/list/JSON Lines do not necessarily expose full pretty-print/minify and useful validation. Provide meaningful operation on JSON input with clear syntax errors, safe parsing, selection/preview of large nested structures (optional), stable output indent controls and exact string escaping. Alert that JS number parser may lose huge numeric precision; preserve numeric lexemes or explicitly fail/keep source rather than silently rounding. Limit depth, total bytes, and expansion to avoid browser hangs. Error messages should identify line/column and failure without leaking input to logs/network. Copy pretty/minified JSON, download exact UTF-8; no JS execution (no eval, no interpreted JSON expressions). Reuse existing JSON lexer for exact numeric preservation if available.

Acceptance: nested objects, arrays, large integers, -0, exponent notation, duplicate keys with explicit policy, malicious '__proto__', malformed text and 1 MiB inputs; keyboard and mobile.

### M08: XML pretty-print / validation

Distinct from XML↔plain-text: format/indent structured XML and flag invalid syntax while preserving semantics. Disable DOCTYPE/entities, XInclude and external fetching; parse safely, handle namespaces and self-closing tags, mixed text content, CDATA, comments and processing instructions. Avoid modifying significance of whitespace in mixed-content elements: either preserve verbatim or refuse prettification with explanation. Allow compact and pretty output, download XML, clipboard, useful line/column errors. Never resolve external schemas or remote URLs. Use established vetted parser within existing dependency budget.

Acceptance: XML round trips, namespaces, control chars, DTD/XXE rejection, mixed content, CDATA, huge nesting/max bytes and five-width browser tests. Reuse existing XML foundation.

### M09: Local binary-file ↔ Base64 encoder/decoder

Current text Base64 is not an arbitrary binary file converter. If supported usefully, build a browser-local FILE to Base64 data/string exporter and Base64 back to file with explicit MIME/type/extension decisions, strict syntax validation, standard vs URL-safe option, optional data URI handling, no cloud upload, file size cap, chunking or worker where appropriate, cancellation and correct byte-for-byte round trip. Never render potentially malicious decoded HTML/JS inline or auto-execute downloads; Blob downloads only with safe names and explicit action. Do not spread an enormous byte array into function arguments.

Acceptance: empty file, arbitrary 0x00–FF bytes, images/PDF/ZIP as inert bytes, malformed Base64, padding, 10+MB bounded behavior only if performance proven, cancellation, filename sanitization, hash or exact bytes comparison in test.

### M10: CSV data cleanup / data-quality operations

Extend existing opt-in table workspace rather than re-implementing basic parsing. Practical transformations: select columns, trim per-cell whitespace with opt-in, remove duplicate records with key selection and stable order, filter blanks, simple header rename and predictable sort. Source stays immutable until explicitly applied; show before/after counts and preview vs full export distinctions, reversible step or undo, preserve CSV quoting and formula guard. Include CSV and TSV output and copy to Excel/Sheets when supported. Add safe bounds and progress where necessary.

Acceptance: sparse/duplicate headers, Unicode, quoted cells, literal formulas, empty vs null, 10k rows, stale source, row selection, output parity, integration with the existing #17/#29 feature stack.

### M11: Text file extraction and conversion shortcuts

Audit which file-import/export tasks are already offered through generic homepage and which would benefit users as distinctive focused paths. Prefer improving shared file picker, drag/drop, progress, accessibility, PDF/DOCX plain-text extraction and copy/download rather than mass-creating file-name keyword pages. If genuine PDF→TXT or DOCX→TXT distinct user task merits a route, stage noindex with clear limitations, no OCR promise, page order, paragraph quality, local-only processing, size limits and zero external resource requests. Avoid reusing a broken old PDF sample; use the patched dependency and existing extraction routines. If already sufficiently covered, skip and select M12.

Acceptance: real files and reimport text, multi-page PDF, DOCX tables, malformed and password-protected PDFs, Unicode, cancellation, no exfiltration, deferred libraries, five widths.

### M12: Advanced deterministic text cleanup presets

Existing Text Cleaner and reversible workflow are done. Add only **new, practical, distinctive** cleanup capability rather than a clone: e.g., remove bullet prefixes with context, strip quoted email reply markers, normalize indentation with tabs/spaces controls, add line numbers / strip numbers with safety, preserve paragraph boundaries, clean invisible characters without breaking emoji/script shaping. Provide opt-in presets in current workflow, reversible preview and documented limitations. Never use network AI, rewriting or destructive defaults. Validate with actual broken copied text fixtures and user-friendly explanation.

Acceptance: 20+ realistic mixed clipboard/document samples, Unicode, CRLF/CR/LF and large inputs, explicit undo. Do not count merely adding one checkbox as a whole substantive package.

## 6 — IMPLEMENTATION WAVE THREE: DISCOVERY, SEO, AD FUNDAMENTALS AND OPERATIONS

### M13: Task-based site navigation and useful journey composition

The existing finder, favorites, related links and homepage quick tools exist. Research and implement genuine workflows that make the new and old capabilities discoverable without clutter: e.g., desktop developer/office cards, contextual "Next: CSV→JSON / compare lists" progression, keyboard path, category grouping and noindex task workspaces. Use a shared registry; ensure metadata and link validation, no duplicated broken hard-coded URL lists, sensible focus/return. Keep tool above supporting content; ad slots cannot interrupt. No artificial category landing pages simply for SEO.

Acceptance: screen-reader and keyboard navigation across 46 current functional routes plus staged new routes, no broken links/redirect hops, mobile 320px no scroll, no forced search path. Measure task completion steps for at least six representative journeys.

### M14: Original intent-matched page content for genuinely new tools

For each new route, author exact, original explanations of accepted input/output/defaults, one real worked example, limitations, safe use, copy/download, applicable privacy boundary, and direct related-tool links. Maintain readable tool-first page layout, metadata, H1, canonical, OG where supported, and schema appropriate to rendered content. Do not fabricate testimonials, search volumes, reviews, freshness or structured data promises. No programmatic duplicate copy, no geographic doorway pages, no bloated generic blog. Preserve noindex until owner grants indexing. Develop a page-query hypothesis table and present real source evidence only. Prefer actual US/CA/UK/AU/NZ workflow usefulness to invented RPM forecasts.

Acceptance: SSR/prerendered content visible with JS disabled, accurate route metadata and sample outputs matching tests, strict link/title uniqueness, correct noindex and sitemap exclusions, no hidden extra routes generated by mistake.

### M15: Cross-tool acceptance at industrial depth

Expand the strict Edge/Playwright gate from baseline 53 prerendered / 46 indexable functional routes to cover all staged new workspaces. Test both JS-enabled behavior and JS-disabled crawlable content, keyboard/clipboard/file downloads, large inputs, browser storage privacy, inactive ad and CMP requests, startup and console errors, 404/canonical links, zip/txt/pdf, generated HTML safety, worker cancellation, and detailed form states. For the busiest old routes, add round-trip/property fuzz tests with deterministic seeds, recorded regression fixtures and failure shrinking when feasible. Keep tests efficient and robust enough for repeated integration use.

Acceptance: separate behavior fixtures for every new tool; all 46 original functional routes still pass; all noindex routes and new routes at five viewports, 320/375/768/1280/1920; zero known route coverage gaps; original six protected converters unchanged. Test no new sensitive text network or persisted storage. Netlify exact immutable preview check after integration.

### M16: Robust performance, a11y and real-world file/task QA

Measure 10KiB, 100KiB, 1MiB and 5MiB paths for representative tools; do not expect desktop-like latency at 5 MiB native textarea on mobile—the earlier lab showed browser layout dominates and the unprofitable prototype was intentionally reverted. Optimize real new regressions (e.g., diff, Unicode inspector, CSV table preview, Base64 file worker) with measurement and reuse, not speculative giant textarea rearchitecture. Compare lazy chunk footprints and input-to-output interactions; preserve 10KiB common path responsiveness and no huge initial JS. Automated axe/check plus keyboard/zoom/contrast/reduced-motion inspections, visible alerts and live regions for important UI. Test no unintended ad layout shift. Do not claim field Core Web Vitals without real field data.

Acceptance: reproducible results and before/after measures for actual changes; genuine accessibility fixes; no false field claims. Source/tests in dedicated reviewable package.

### M17: Commercial ad integration audit — keep OFF

The full staged ad runtime, regional TCF/GPP, consent guards, placement allowlists, first-fill placeholder latch and account gates are already implemented. DO NOT rebuild them or enable them. Inspect any new page integration and verify no new ad slot sneaks into noindex routes, no ads between tools and results, no Google/CMP/analytics requests on preview, no placeholder above a real creative. Render explicit owner activation checklist for final authenticated AdSense account/site/units, reviewed certified CMP tenant and regions, ads.txt, disclosure, actual first-fill screenshot/DOM proof, live withdrawal and rollback. Do not claim real commercial ad revenue or legal compliance from simulation. A user-approved live pilot is a **separate future task**.

Acceptance: full no-network disabled behavior and no ad/control overlap in tests, same owner protected global suppression rules, no production change.

### M18: Final staging integration, owner release ledger and rollback

Maintain exact incremental patch inventory, reviewable commits, dependency DAG and release-preparation checklist, including #42 security candidate first, canonical #7 and hydration #3 next. Add new packages AFTER their reviewed prerequisites. Avoid accidentally merging all 43 historical commits from the combined PR when shipping a single package. Validate the full A+B+C+F+new wave on an exact immutable Netlify preview and all tool routes, then produce a second independent review of the integration diff and intentional exclusions.

Produce a 2027 owner-review **release runway** that can span months, grouped by risk and dependencies, without actually scheduling automated production merges. One substantial release per reviewed week is a starting guideline; hold on failed gates; UI-only microchange may be bundled. Recommend separate indexing decisions for Markdown, batch and any new routes. Record real SEO baseline, no invented earnings and no auto deployment.

Acceptance: GitHub PRs for independently releasable features, committed full integration head, Netlify deploy context success, 0 unknown merge conflicts, full tests/host gate, exact main+production SHA unchanged. Report precise gaps rather than hiding them.

## 7 — DURABLE UNATTENDED EXECUTION LOOP

Do all implementation in a real sequence, **not** a 10-minute reconnaissance sprint:

1. Verify authority and exact baseline / dependencies.
2. Select next validated substantial package M01 onward; if already done or disproven, move to next, record why.
3. Make actual code and fixtures, test locally including npm run validate, browser routes at all widths and real clipboard/file workflows where relevant.
4. Commit in small local commits, push dedicated branch, create draft PR, record head SHA and isolated diff. Do not force push existing unrelated branches.
5. Maintain a single compact checkpoint ledger in ai-issues/CODEX_MULTI_HOUR_PROGRESS_2026-11.md or a dedicated GitHub issue: task status, exact PR/SHA, tests, blockers and next executable command. Update after each substantial wave, not every trivial step.
6. Continue automatically to next independent package and re-evaluate if delegated workers make sense. Do not ask routine questions.
7. After 4–6 packages, create an isolated combined candidate and verify cross-package behavior before building on it; do not merge to main.
8. Finish Wave Two and Wave Three when feasible; do independent quality passes: first correctness/security, second UX/a11y/SEO. Real code fixes when justified; do not write reports in place of fixes.
9. If an actual quota/context/runtime limit prevents completion, preserve committed/pushed checkpoints and resume via a supported existing runner/session continuation if available and authorized. If no runner exists, give an accurate PARTIAL handoff, do not fake background continuity. No unbounded retry loop, no hidden paid resource use or additional subscriptions.
10. **STOP only when the selected substantial queue has been implemented and verified, or when a genuine hard execution/resource boundary prevents further work.** No arbitrary timed sleeps. Do not claim success after two tiny PRs and a report.

Every feature PR should include before/after, user scenario, implementation decisions, tests counts and fixtures, five-width browser evidence, dependencies, actual exact immutable preview or documented host blocker, rollback and search/indexing changes. Verify that imported source and filenames never get transmitted to network or unexpected storage.

## 8 — FINAL POWER-OFF PROTOCOL — EXPLICIT OWNER REQUEST

Owner explicitly wants the **actual local development PC** to SHUT DOWN COMPLETELY once this unattended implementation session ends. This is NOT a request to restart, sleep, hibernate, shut down a remote VM, or terminate only the terminal.

The last permitted actions, in order:

A. Finish every achievable implementation/checkpoint; do not abandon a runnable package just to shut down early.
B. Save and close all agent-controlled editors, ensure no unsaved uncommitted project work; commit and push all authorized staging changes; preserve other projects and user windows.
C. Finish queued browser/validation/tests and stop all worker processes and child agents safely. Do not shut down while another agent is writing.
D. Verify remote staging PR and report/ledger are committed and accessible. Record exact main SHA and production deployment, incomplete work, external blockers and all PR links. Publish the final summary **before** shutting down because the session will terminate.
E. Detect whether the current execution environment can control **the user's physical Windows PC** (the paths in recent reports are E:/PROJECTS-and-WORK/... on Windows). Do not power off the wrong machine, VM or container. Do not call shutdown through a remote Cloud VM or NixOS shell assuming it is the user's desktop.
F. If on the verified local Windows PC and the user has explicitly authorized power-off here, invoke as the **FINAL terminal action**:

    shutdown.exe /s /t 0

This is a real Windows shutdown, NOT sleep or restart. Do **not** append /f and do **not** change /t to any positive number: Microsoft's shutdown documentation states positive /t implies force-closure /f, which risks unsaved user data. The command may be blocked by an unrelated unsaved GUI app; DO NOT kill/force-close that app. Report a blocked shutdown if still able to report, or preserve that state in the committed checkpoint beforehand.

G. If the work was run in WSL, first prove that shutdown.exe controls the exact user's Windows host before invoking; do not run systemctl poweroff inside WSL or on a remote VM. If the host cannot be verified or accessible, do NOT falsely claim the PC shut down: leave the command in the last report for the owner. Do not elevate privileges or install a power-control service.
H. If the run ends partially because of quotas/runtime hard limit, still save full checkpoint and final report; on the local PC, carry out the same authorized safe shutdown after no workers remain. The user requested an unattended run followed by full PC shutdown, not indefinite running when blocked.
I. Do not claim "PC powered off" merely because shutdown command was issued; success cannot be confirmed from a terminated local session. Report "shutdown command issued" when observable.

## 9 — FINAL REPORT CONTRACT

- Work completed: real substantial PRs, branch, exact SHA and link, functional evidence, not count inflation.
- Work rejected with evidence and replacements.
- Existing 46 functional route baseline and new noindex tools coverage.
- All tests, browser viewport, artifact checks, date and exact hosted immutable preview.
- Security, privacy, consent and advertising disabled proof.
- New route inventory, whether noindex/sitemap/canonical preserved, index candidate evidence.
- Release DAG vs #42/#7/#3 and dependency-sensitive packages, proposed reviewed 2027 runway (NOT auto schedule).
- Aggregate search baseline vs measured data, no made-up impressions, clicks or RPM.
- Exact user/agent projects left untouched, current remote main/production deployment.
- Exact remaining blockers and next execution steps if partial.
- Final shutdown issue status and command only after persistent report and child processes have ended.

**The agent must spend the session building actual functional software, NOT spending it composing another speculative plan.**