# Codex Tranche C — complete Western-market monetization and full-site functional quality

**Created:** 2026-11-11. **Action:** substantial code implementation, tests, staging branches and draft PRs. **Do NOT schedule, merge, enable production ads or alter main.**  
**Baseline:** Main `7189874058e86e26e8ea52d031d990f7687e517a`, verify current refs. Tranche B integrated [#28](https://github.com/suhas-sunder/alltextconverters/pull/28) at `9a0efa2698842476e2ff968a4e85d490b6daf4dc`. Existing PRs #1–#28 must be preserved. Use Tranche B combined candidate as a **reference/integration test**, not as an excuse to lump all future changes into one unreviewable PR. The ten B packages are already implemented.

## Objective and result standard

The owner insists on a mature, well-utilized, ad-funded, SEO-competitive Western-market utility; an MVP or a short audit run is not acceptable. The site can have a controlled release runway throughout 2027, but **do not finalize release dates until the complete justified buildout is staged and accepted**. Never manufacture content, PRs or calendar slots.

**Actual evidence already verified**: 33 Git commits, 152 changed files in #28; Netlify preview 6af3eae834aee8e90189a7ff ready for exact head; 74 source/behavior tests and six static tests passed in the reported integrated run; 52 prerendered pages hydrated and crawled with JS disabled; six protected converters functionally exercised; 48 canonical sitemap URLs and four HTML noindex pages including /batch-text-files/; no ad/CMP/analytics requests on the preview; main unchanged. These are real acceptance gates, **not proof all 48 indexable converter tasks have full behavior coverage or ads generate revenue**.

**Critical identified code boundary:** In Tranche B `app/client/components/advertising/google-consent.ts`, `evaluateGoogleConsent` denies `gdprApplies !== true`. In `ad-config.ts` the initial pilot is home-only, `approvedDisplay=null`; `siteConfig.advertisingEnabled=false`. As a result, **the current ad pilot would not serve US/Canada/Australia/NZ traffic after configuration**, nor any converter page, until new regional policy/eligibility work is approved. This is acceptable as a deliberately narrow pilot, but cannot count as a commercially finished ad setup. Do not simply change `gdprApplies=false` to allowed. Implement a safe, explicit, policy-backed and testable regional treatment based on an approved consent/region signal, respecting other applicable laws, and leave all live serving disabled and owner-gated.

Current search baseline (28 days Oct 11–Nov 7): 194 GSC clicks, 13,880 impressions, 1.398% CTR, position 14.18. US three-month search impressions 15,932 / 43,230, not revenue. No live ad earnings, ad pageviews, site conversion completion rates or page-query-country joins. Never invent them. GSC Wizard unavailable; do not use.

## Work contract: long sustained implementation

- Aim for **at least six substantial distinct implementation packages**, and continue beyond six while genuinely useful development and runtime capacity permit. Two small PRs plus an audit is **partial**, not completed. At least three packages must add or materially improve tested user-facing workflows, not solely reporting/infrastructure.
- Spend execution on code, tests, previews and integration, not repetitive planning. A package counts only with meaningful functional diff, tests, validate, browser scenarios, exact commit, pushed draft PR, dependencies/rollback.
- If a package requires unapproved ad account credentials, certified CMP vendor, actual region/consent information or real-ad network: mark that exact activation gate blocked, implement testable independent code where safe, **and continue with other work**. Do not fabricate compliance with mocked tests.
- Work in waves; after one completed PR automatically pick the next. Use delegated workers only when genuinely cheaper and free of file collisions. Maintain one merge/integration owner; no force resets or overlap loss.
- At a hard tool/runtime boundary checkpoint exact branch heads, tests, failures, next executable action. Do not falsely claim to be running asynchronously after exit.
- Tranche A/B PRs are independently staged; some B PRs are stacked (#17 on #11; #21 on #20). Preserve dependencies, do not merge the entire #28 PR. Keep next C packages isolated atop appropriate reviewed bases and make intended ancestry clear.
- Full reproduction commands: Node 22.23.1, `npm ci`, `npm run validate`, and `node scripts/verify-browser.mjs --normalized-host` on suitable integrated hosted previews. Do not weaken checks. Browser viewports 320,375,768,1280,1920 and zoom/keyboard where relevant.
- Search: Google Search Essentials and spam policy. Real distinct functionality qualifies for indexable consideration; no keyword synonym routes, geographic doorway pages, mass article generation, or manufactured 2027 release filler. New pages staged noindex until separately authorized.
- Ad safety: read `ai-issues/AD-PLACEHOLDER-SAFETY.md`. Once a genuine top-window filled ad is reliably confirmed, suppress all placeholder **contents across the page session**; never allow placeholder DOM/CSS or labels to overlay filled creative. Maintain safe reserved space and effective click boundaries. Simulated events are not real creative tests.

## Implementation queue — use fresh current code and skip completed work

### C-01. Safe multi-region ad eligibility policy — substantial engineering

This is more than adding a boolean. Design a production-capable, default-denied, **region/purpose/consent decision boundary**. The B-02 TCF implementation covers approved GDPR regions with affirmative TCF; the rest of Western traffic currently fails closed by construction. Distinguish an authentic `gdprApplies=false` signal from missing/unknown/corrupt data; do not infer geographic residence from browser language, time zone or guessed IP. Investigate official Google-certified CMP and AdSense account-supported paths for EEA/UK/CH and current applicable US state and Canadian privacy requirements. Use a provider-controlled/approved regional consent status or separate policy-specific adapter with documented guarantees. Unknown regions/metadata stay denied, not silently allowed. Tests: US/Canada/Australia/NZ consent scenarios, TCF GDPR true/false/undefined, delayed signal, refusal, withdrawal, opt-outs where required, navigation, correct no-request boundaries. Actual legal/vendor setup remains owner-gated.

Acceptance: a real code path could support approved non-GDPR regional ad serving through a documented, testable provider integration without weakening GDPR, not merely a report. Still no real ad request/IDs in preview or production.

### C-02. Monetizable converter-page placement architecture — real code, initially off

Current B-01 allowlist includes only `/` and `below-utility`, using 320×50. Extend *configurability* (not live activation) safely for selected top-intent converter pages, one placement per page initially, using layout/whitespace based on actual container and control locations. Keep protected actions, outputs, file input, sample, copy/download and mobile conversion above/clear of advertising. Do not introduce hidden overlay, sticky auto ad or a broad sitewide density increase. Explicitly handle 272–288px narrow containers where 300/320px creative does not fit. Responsive opt-in test matrix: blocked/no-fill/late fill/first fill/later navigation, mobile width, ad blockers, zoom/reflow, mouse/touch focus, no accidental click adjacency. Site remains flag-off, IDs null, account gate unresolved. Test dynamic route transitions, policy/about/contact exclusions and first-fill global suppression. Real creatives still must be accepted separately.

Acceptance: no forced ad calls, no layout/control intersection, realistic container constraints, auditable allowlist choices grounded in actual page use.

### C-03. Complete all-tool functional acceptance, not just hydration

The B-08 gate traverses all 52 HTML pages but functionally executes six protected conversions. Build a maintainable route-to-behavior contract for **every indexable converter**, including defaults, input/output, representative valid fixture, two serious edge cases, copy/download, settings where relevant, and critical keyboard flow. Aim for actual runtime tests on all existing converters, not a static `route exists` check. Prefer low-maintenance data-driven Playwright over hard-coded brittle selectors; augment stable accessible labels in the application only where justified. Cover nested JSON, XML/HTML parsing, bytes/encoding, case, counters, list and CSV, whitespace cleanup, downloading, file picker, malformed/empty inputs and obsolete state. A page only renders is not a functional pass.

Prioritize high-traffic existing winners first and systematically cover remaining routes; do not stop because a high-level browser crawl already passed. Add screenshots only for verified layout problems. Report exact route count fully exercised versus deferred, no false 48/48 claim.

### C-04. Fix competitive functional defects discovered by C-03

Implement the nontrivial issues found by those behavior tests in separately reviewable packages; do not create a monster mechanical refactor. Examples to investigate, not assume:
- Homepage converter algorithms versus route engines (large Base64 now fixed by B-05; check other parity).
- Unnecessary malformed input truncation, data loss, stale outputs and copy/export mismatch.
- Unicode grapheme/code point/byte semantics and line endings.
- Actual settings and validation on JSON, XML, HTML and encodings.
- Browser-native clipboard workflows and file input accessibility.
- One-way conversion errors and empty-input behavior.
- Handling of 1 MiB and 5 MiB representative inputs without freezing.
Preserve default outputs of ranking winners unless correcting an actual bug with fixtures.

Every fixed defect should have a before/after executable reproduction and appropriate browser acceptance.

### C-05. Real spreadsheet interoperable clipboard and table export

B-03 already adds opt-in CSV/TSV column selection/reordering. Do NOT rebuild it. Investigate data interchange still missing: paste from Google Sheets/Excel into browser, preserve quoted tab/newline/embedded quote semantics, copy selected multi-column cells as `text/plain` TSV and optionally `text/html` with a safe clipboard implementation, provide accessible preview. Ensure CSV and TSV download preserve all rows rather than only 20-row preview. Support unavailable clipboard API fail-closed/copy fallback where reasonable, browsers and mobile. Avoid overpromising when clipboard HTML isn't available. Implement genuine new behavior only where it improves existing use; B-03 remains opt-in and simple route defaults unchanged.

### C-06. Two or more distinct, production-quality format workflows where justified

Assess actual need (current competitors + task differences + current site route map). Strong candidates:
- Markdown table ↔ CSV/TSV or HTML table with correct escaped pipe cells, headers and alignment, robust round trips.
- JSON Lines (already implemented in B-10) into CSV/TSV with explicit flattening and schema handling, only if value distinct.
- Other truly new browser-local data/text conversion tasks supported by evidence.
Do not repeat B-10 JSON Lines or B-04 batch. Prefer using existing shared engines. For any new route: implement complete tool, defaults, validation, examples, copy/download, tests, accessible mobile UI, privacy statement, lazy code and accurate unique metadata; **stage with noindex and outside sitemap until owner authorizes its indexing**. Avoid filler routes or synonyms. If candidate lacks evidence, choose a more meaningful existing-route depth improvement.

### C-07. Improve user task completion and repeat use, not cosmetic SEO

B-07 already adds tool finder/favorites. Extend only with evidence-backed workflows: task-based related-tool navigation, browser-local settings restoration, optional safe recently-used references, power-user keyboard sequence, common office/developer task presets. Never store pasted text or filenames by default. Validate efficiency: user can reach relevant tool from homepage and complete conversion in few predictable interactions. Protect mobile and screenreader UX. Compare before/after user steps and verify no controls crowded out by reserved ads.

### C-08. Core Web Vitals/performance under actual workloads

Build repeatable production-preview performance measurements (initial main bundle, file library loads, render/hydration, input processing latency, output/copy response, memory and long tasks, CLS). Do not invent field CWV. Investigate worker-backed large text transformations, native file parsing, table preview chunking where significant and measured. Protect all existing size/cancellation guards, and avoid loading PDF/DOCX/batch libraries initially. Implement only demonstrable regressions or meaningful improvements and rerun real workloads at 320px/mobile and mid-tier desktop.

### C-09. Monetization measurement interoperability that can consume REAL exports

B-09 CLI already imports aggregates; do not build another parallel reporting engine. Extend only where genuinely useful: supported actual AdSense CSV export quirks, GA4/other authorized session report schemas, cohort matching, coverage diagnostics, page canonical normalization, country/device breakdown and safe missing-data handling. No invented revenue. Never put visitor text or filenames into reports or network. Make source provenance auditable. Do not integrate analytics scripts or OAuth without separate authorization. A sample dashboard is not proof of real monetization.

### C-10. SEO growth based on useful tools and measurable queries

Use Nov 9 baseline but label it historical and request/search newer first-party evidence when obtainable without unapproved GSC Wizard. Inspect live SERPs for target workflows and task intent. USA has 15,932 impressions over three months, but do not infer page-specific US demand, actual rankings, or RPM. Improve search-visible features based on actual functional differentiation, trustworthy content and contextual links. Preserve canonical policy and existing page winners. For new tools, establish distinct user intent and indexability decision; publish no mass pages, no fake reviewed dates, no geographic doorway pages, no generic blog to inflate inventory. Optimize users and long-run qualified traffic, not frequency of SEO changes.

### C-11. Ads/consent security, abuse, and production activation rehearsal

Test failure cases on the **real deployed staging candidate**, with all ad network requests intercepted by default: script blocked, races, CSP, callback errors, unsupported window status, route changes, consent withdrawal, region unknown, no-fill and global placeholder latch. Check a certified CMP provider integration can actually be configured, but don't claim configured unless publisher credentials/account actions exist. Inspect official live Google AdSense terms and placement policies before deciding whether any planned creative height/density violates policy. Prepare owner activation matrix with real ad account, site approved, publisher and unit IDs, ads.txt, consent settings, version, privacy text, rollback, independent genuine-creative proof, and progressive traffic exposure. All activation remains off. Do not set up paid tools or send own-ad clicks.

### C-12. Permanent release and growth operations

Automate code, build, browser crawl, security and data integrity checks in PR-only staging workflows where low cost and robust. Avoid auto-merge or auto-deploy. Detect unintended route/sitemap, canonical, metadata/noindex, 404, dependency, sensitive content or placeholder changes. Prepare an operational scorecard for organic landing/page cohorts, index coverage, conversion functionality, source-backed ad earnings, load failure and CWV. Schedule only AFTER all accepted development is complete and the owner approves the release inventory. Calendar length is flexible; do not fill 2027 with meaningless releases.

## Technical acceptance/integration

For each package:
1. inspect the exact B dependency and current candidate source;
2. write meaningful code and functional regression tests;
3. run `npm ci` and `npm run validate`;
4. conduct browser tests on actual running build at 320,375,768,1280,1920; verify keyboard and copies/files for relevant tasks;
5. push a bounded isolated draft PR, record commit, diff, dependency and rollback;
6. check Netlify preview exact SHA; stacked PRs without hosted preview must be verified on a new integrated preview;
7. continue to next package and preserve all work even if one test or account gate blocks progress.

At a suitable checkpoint build combined Tranches A+B+C in an isolated tree from the live main base, preserving the verified #28 behavior. Confirm at least 52 HTML prerenders before any approved route additions, 48 canonical indexable sitemap URLs unless a new page is explicitly authorized, no ad/CMP/analytics network in previews, no user text exfiltration, honest `noindex`, 404/aliases/redirects, and B's six protected converters. Run expanded all-tool behavior suite and realistic file/ad failure cases. Never merge/push main or enable paid services/ads.

## Exit report

Return: meaningful completed implementation PRs (separate from docs/cosmetic), before/after functionality, acceptance tests, exact commit/dependency/rollback and live preview; uncovered route functionality count; browser and build test counts; commercial limitation of US/Canada/Australia advertising and whether code now addresses it safely; any account/CMP/legal/actual creative gates; country/page SEO opportunity caveats; staged new URL/index count; production SHA; next implementation queue. **If less than six substantive PRs, report partial with exact resume instructions, not 'complete'.**
