# AllTextConverters — full commercial product buildout (2027 runway)

**Owner instruction:** November 9, 2026. **Status:** DEFINITIVE PRODUCT TARGET / BUILD FIRST / DEPLOYMENT NOT AUTHORIZED.  
**Supersedes** the assumption that the existing 15 staged packages or January 24, 2027 represent project completion. Those PRs are **Tranche A: stabilization**, not the complete business product.  
**Timeline:** Development continues until a professionally finished, competitive, sustainable ad-funded text utility is achieved. Production release windows may extend through all of 2027 or later if justified; **do not manufacture releases to fill calendar dates**.

## Mission / definition of done

AllTextConverters should be a mature utility site with (1) accurate, delightful, browser-local conversions; (2) competitive feature depth based on real user workflows; (3) defensible SEO and task-oriented discoverability; (4) production-ready, policy-compliant Google advertising **implementation**, not just placeholders; (5) privacy-compliant consent and monetization measurement; (6) fast, accessible, reliable tools on desktop and mobile; and (7) maintenance and monitoring operations.

Business optimization is **long-run qualified usage × sustainable revenue per session**, with US, Canada, UK, Australia and New Zealand important English-language markets **when real demand warrants it**. Do not alienate the global audience, use geo-doorways, invent RPM, or make keyword clones. Revenue and fill require actual account data, which is not currently supplied. Existing 28-day GSC: 194 Google Search clicks / 13,880 impressions; this is still a small traffic base for meaningful ad experimentation.

A completed build does **not** imply AdSense activation is authorized. Engineering must deliver approved integration paths and high-confidence tests in staging while actual publisher identity, site/account status, certified CMP setup, legal review and genuine filled-ad acceptance remain owner-gated.

## Existing completion boundary: Tranche A

Staged 15 package candidates include security PR #4; canonical/404 #7; Byte Counter #9; comma/list CSV #8; line breaks #12; navigation #2; CSV parser #11; accessibility #10; file safety #6; encoding and hydration #3; tool guidance #14; spreadsheet workflow #15; UI focus #5; and documentation #13 and #16 (planning #1 separate). These are **not** evidence that all commercial features below are implemented. Keep them independent. Baseline main 7189874058e86e26e8ea52d031d990f7687e517a; check again every time. Never modify main without exact owner authorization.

## Tranche B — finish the product before the release schedule is finalized

Build **all independently justified, testable work now** as small branches and draft PRs; plan much more than one batch and continue iterating rather than producing repeated audits.

### B1. End-to-end product and functional acceptance

- Inventory **every current converter**, variants, controls, defaults, input/output formats, error modes, test gaps and misleading copy. Grade critical workflows against actual competitors and real user scenarios. Build a testable functional coverage matrix; do not label a route done solely because it prerenders.
- Standardize high-quality affordances where relevant: input/output distinction, clear action and mode, accurate live/explicit results, copy feedback, filename and file extension, download fidelity, upload/retry/cancel, sample, clear, undo where safe, format preview, progress, limits and accessibility. Preserve each tool's distinct workflow; do not turn everything into a generic complex form.
- Fix remaining PDF/DOCX issues, **Unicode PDF fidelity**, input size/performance, errors and stale async results based on tests. Test malformed, huge and non-English text. Keep files local. Improve exports with correct UTF-8 where format supports it.
- Evaluate reusable internal browser-only capability primitives and migrate only when behavior is stable; avoid broad UI rewrites and oversized JS.

### B2. Competitive depth for high-value workflows

Research and, where useful, implement **existing-route** improvements for CSV/list/table extraction, JSON/XML/HTML text conversion, encoding, byte counts and cleanup. Consider proper multi-column TSV/CSV paste/preview where existing one-column semantics are insufficient, robust quoted data, clipboard HTML table handling, semantic extraction modes, large-input responsiveness and realistic office/developer workflows. Keep protected default behavior, URLs and indexing, and add tested opt-in advanced controls only when intuitive.
- Reassess **batch/multi-file processing** after hard single-file limits and cancellation prove reliable. Consider a browser-local multi-file batch export with bounded counts, deterministic naming, progress, cancellation and ZIP only if useful and performant; build without server storage. No new indexable batch SEO pages without demand.
- Reassess a **lightweight multi-step text workflow** on the homepage or within existing tools when a repeatable task can justify it. Keep a one-click primary default, explain transformation order and allow undo. Do not create an incomprehensible automation builder merely because it sounds advanced.
- Assess favorites, recently used tools, queryable tool finder and keyboard navigation as no-account return-usage improvements. LocalStorage can remember **tool preferences only by default**, never sensitive pasted content without explicit opt-in, expiry and deletion controls.
- Evaluate CSV↔TSV, table↔Markdown, plain-text formatting and other genuinely distinct formats as **candidates**, not mandatory routes. For each candidate, do user-task/competitor/query analysis, a working prototype and clear independent value; new URL requires separate owner approval.

### B3. User-first SEO and Western audience

- Prioritize actual user tasks: GSC shows `byte counter` 1,502 impressions at position ~10.2; `list to csv` 710 at ~11.45; `plain text converter` 813 at ~19.58; `ascii to text` 540 at ~21.12; ambiguous `line removal` 3,723 at ~39.58. **Query totals are 3-month sitewide, not page-query pairs**. Investigate but do not presume page ownership or CTR remedy.
- Measure indexation, canonical/redirect behavior, metadata, actual search appearance, SERP competitors, navigation flow, usefulness, country/device and Core Web Vitals. Current 3-month GSC desktop impressions 38,510 / 43,230 and US impressions 15,932 / 43,230; that is search exposure, **not site RPM**.
- Improve on-page content only for real task instructions with verified examples. Avoid unoriginal articles, bulk programmatic pages, redundant synonyms, fake dates, FAQ padding, keyword stuffing, city/country doorway routes or manipulative internal links.
- A new route is **not prohibited forever**: approve one when it offers a materially distinct converter, evidence of real demand (search and/or observed user needs), excellent functionality, unique intent and independent tests. Keep a business case and publish individually. Prohibit mass route generation without quality/evidence.
- Use canonical and title/indexing monitoring after changes, protect current winners and compare matched periods. Google Search Console data can be refreshed when material changes/dataset staleness warrant; do not use unavailable GSC Wizard.

### B4. Real monetization infrastructure — not merely a placement audit

**Current verified state:** `siteConfig.advertisingEnabled = false`, `adMode = "placeholder"`; `AdSlot` renders reserved boxes, not genuine network ads, has no fill lifecycle and no approved consent integration.

Build a disabled-by-default, staging-capable and documented production integration, in separate draft PRs:
1. Decide actual AdSense integration mode (manual display slots vs Auto ads or bounded combination) using latest AdSense policy, user flow and explicit owner agreement. Do not assume all possible slot types can run simultaneously safely. No speculative library reinventing.
2. Implement a **single central slot system** and clear per-page eligibility and density policy with placements that do not obscure tools. Safe progressive loading, stable layout, no ad/request before allowed consent, script failures, no-fill, late fill, client navigation, and responsive/zoom behavior must be accounted for. Use a fail-closed kill switch, release toggles and diagnostics not containing private conversion text.
3. **Owner's hard ad safety:** read `ai-issues/AD-PLACEHOLDER-SAFETY.md`. All placeholders must disappear after first real ad fill for the page session, if approved implementation is created. Never restore individual placeholders over creatives. Do not claim this is tested with genuine ads until a real creative test occurred. Mocked tests cannot guarantee account safety.
4. Integrate/prepare a **Google-certified CMP that supports the IAB TCF** for relevant EEA/UK/Switzerland ads in the approved mode, instead of treating homegrown consent flags as certification. The actual vendor/account, legal disclosures, IDs and production connection require owner authorization. Denial and withdrawal must not block core converters.
5. Prepare **ads.txt** from verified owner account publisher identity, not fabricated IDs. Only enable actual network calls after explicit authorization and site/account readiness; keep stage previews safe and noindex.
6. Initial post-approval test: one adequately sized **below-utility** slot where it remains separated from copy/download. Hold 300px squares where containers are 272–288px, and sticky rails/Auto ads until real-creative tests prove policy and ergonomics. Test actual network creatives under no-fill, blocked, delayed, first/later fill, navigation, resize/zoom, mobile, keyboard and consent changes. Never click own ads.
7. After launch, test placement variation using AdSense supported experiments and owner-controlled settings; do not automatically optimize ads based on untrusted click counts or place overlays on primary tool controls. Measure revenue *and* successful tool use.

### B5. Analytics and ongoing growth operating system

- Implement a **privacy-conscious, owner-approved** measurement connection to track country/page/device organic landings and, when available, ad reports: page RPM, session RPM, ad-eligible pageviews, fill, Active View, revenue, placement eligibility, sessions, engagement, success of conversion, copy/download and error rates. **Do not** confuse GSC impressions with pageviews; Bing AI citation counts are not Bing organic traffic.
- Avoid collecting text, filenames, conversion output, clipboard contents or document content. Consent gate as required; no unapproved analytics or new tracking by default.
- Site health: status, redirects, sitemap, accidental noindex, robots, broken links, HTML availability with JS off, build and hydration errors, Core Web Vitals field/lab distinction, dependency advisories, ad overlay violations, consent misfires. Alert only on material anomalies; attach inspectable evidence.
- Distinguish locally reproducible build tests from hosted preview and real-ad/production measurements. Add lightweight GitHub/Netlify CI and regression fixtures where economically sensible.
- Provide owner-readable dashboard or reports when sources are connected; avoid inventing monetization statistics.

## Tranche C — conditional expansions (not an indefinite excuse for MVP)

After B packages, deliberately re-evaluate previously deferred product ideas with explicit evidence and feasibility (NOT automatically all in the sitemap): browser extension, local batch processing, modest pipelines, useful category navigation, format support, an editor-like table preview, optional printables; avoid generic blog, forced accounts, remote data storage, public API, cloud imports, translations or unrelated utilities unless validated as a real product need. Each accepted candidate becomes a real functioning feature with tests and a clear release note. Each rejected candidate records why it would not help.

## Gate to freeze the release inventory

The buildout is ready to schedule only when:
- Every current indexable tool route meets documented functional, mobile, accessibility and privacy standards, including import/export and real data edge cases.
- Major commercial gaps have been closed by code, not only TODOs or placement notes; staged ad path, consent integration plan/provider gate and non-sensitive measurement are real and testable as far as owner inputs permit.
- All accepted B and C features are on isolated validated draft branches; combined integration runs pass on the actual candidate trees. Remaining blocked work is clearly owner/account-dependent, not simply ignored.
- Search/index baseline and protected winners are established; no unjustified URL inventory growth or bulk keyword pages.
- A release steward can construct each actual weekly candidate from the latest main, resolve overlaps, test Netlify preview and rollback. PRs may depend on other releases but must not leak unreleased changes.
- The owner signs off the **inventory** as commercially complete enough to release. Future iteration remains normal; 'complete' cannot guarantee future revenue or that Google will reward rankings.

## Release policy — 2027 runway without artificial deadlines

The existing [November post-build calendar](RELEASE_SCHEDULE_POST_BUILD_2026-11.md) now becomes **Tranche A proposed sequencing only**, not the final release schedule or project endpoint. Actual production dates and more release packages are **deferred until Codex completes Tranche B/C and owner acceptance**. An optional separate security-only exception may be prioritized after approval.

When ready, plan as many small, independent owner-gated releases as justified (potentially throughout 2027), grouped by dependencies and expected impact; usually one significant change in a weekly window, with **hold/skip** when not ready. Separate immediate UI-only refinements from user-facing functionality/SEO and monetization changes. Do not release content at a fixed rate to 'avoid Google updates'; Google cares about content quality and spam practices, not ritual weekly pacing. Never auto-merge.

Actual live ad pilot and revenue optimization is its **own owner-authorized release lane**, and is not considered tested merely because ad components or preview placeholders work.

## Research reference

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google Search spam and scaled-content abuse policy: https://developers.google.com/search/docs/essentials/spam-policies
- Google people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- AdSense placement: https://support.google.com/adsense/answer/1346295
- AdSense certified CMP: https://support.google.com/adsense/answer/13554116
- AdSense experiments: https://support.google.com/adsense/answer/6321879
