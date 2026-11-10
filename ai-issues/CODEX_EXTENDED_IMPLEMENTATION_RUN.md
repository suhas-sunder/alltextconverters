# Codex extended implementation run — AllTextConverters Tranche B

**Run objective:** Complete a sustained, multi-package commercial buildout. Do not exit after an audit, two tiny PRs, or a readiness report.  
**Model:** Codex Sol MEDIUM default. Escalate to HIGH only for a specific hard architectural/security challenge. Re-evaluate available runtime models and quotas instead of assuming a hard-coded catalog.  
**Current known baseline:** production `main` at `7189874058e86e26e8ea52d031d990f7687e517a` on Nov 9, 2026, but recheck live refs before starting. PRs #1–#16 exist as separate drafts.  
**Safety:** No commit, push, merge, auto-merge or production deployment on `main`. Only isolated staging branches/draft PRs; no live AdSense network requests, publisher IDs, consent or tracking activation. Read `ai-issues/AD-PLACEHOLDER-SAFETY.md`.

## Mandatory endurance contract

The previous Codex run returned after two small drafts, an adjustment to a third and a report. That is **not** a successful outcome for this assignment. This run is intended to maximize *fully implemented, independently validated software*, not number of paragraphs in the final report.

- Target **at least SIX meaningful implementation packages**, not counting planning, documentation, changing a line of copy, one focus style, or repairs inside an existing PR. At least THREE should be substantial user-facing capabilities or production-capable commercial infrastructure, rather than polishing a paragraph. Continue beyond six if the runtime and safe work permit.
- Do not stop after a preliminary inventory. Allocate the vast majority of the effort to writing, testing and integrating code.
- Work in waves. A package counts as complete only if it has working code, meaningful behavior tests, a successful `npm run validate`, appropriate browser acceptance, a staged branch, a **draft PR**, and a rollback/compatibility note. A report without implementation does not count.
- The number is not license to invent features. If a candidate fails the product value/safety test, skip it and select the next justified candidate. If genuine runtime/quota limits prevent six substantial packages, persist a precise checkpoint and report the actual blocker rather than claiming finished.
- On completion of a package, automatically inspect the remaining queue and implement the next independent one. Don't ask the owner to approve normal coding decisions. Missing AdSense credentials/CMP decisions must not block browser-local functionality.
- Where capable, delegate separate file areas to authorized agents/models only when it reduces effective cost and collision risk. Keep one integration owner. Avoid different agents writing shared files in parallel.
- Do not spend this run on creating another giant strategic analysis. Produce one concise inventory at the start and update it as implementation progresses. At the end give evidence-based status, not a long celebration.
- Before reaching an environment execution cap, preserve all committed branches, drafts, and a machine-readable continuation queue containing exact refs, open tests, failing cases, next executable action. If the environment supports continued iterations or automatic successor tasks, use them only under the user's already-authorized staging-only scope. Do not imply an asynchronous process is running if it is not.

## Preflight: reconcile existing work and architecture

Fetch remote `main` and inspect existing draft PRs #1–#16, their files and exact heads. Do not duplicate ATC-01 through ATC-10, security, workbook fixes, crawlable guidance or the revised Byte Counter.

Read:
- `ai-issues/COMPLETE_COMMERCIAL_BUILDOUT_2027.md`
- `ai-issues/WESTERN_SEO_AD_MONETIZATION_2026-11.md`
- `ai-issues/SEARCH_BASELINE_2026-11-09.md`
- `ai-issues/AD-PLACEHOLDER-SAFETY.md`
- `ai-issues/RELEASE_LEDGER_2026-11.md` on its actual branch
- `ai-issues/WESTERN_READINESS_2026-11.md` on its actual branch
- `docs/audits/future-only-backlog.md` (old-phase decisions are not permanent vetoes)
- `docs/audits/competitor-feature-matrix.csv`
- `docs/audits/settings-decision-matrix.csv`
- `docs/performance-budgets.md`

Specific source touchpoints verified on baseline:
- `app/client/components/home/TextToolCard.tsx` has inplace conversion, upload, TXT/PDF export, single-step undo and shared homepage input.
- `app/client/components/home/textConverters.ts` has several standalone transformations, including a UTF-8 Base64 path using argument spread on `Uint8Array`; do not let large inputs throw or turn thrown failures into apparently successful text.
- `app/client/components/list-to-table/ListToTableToolCard.tsx` and `app/client/components/table-to-list/TableToListToolCard.tsx` are separate existing utilities.
- `app/client/text/csv.ts` is changed by existing draft PR #11; base future CSV work on the correct planned dependency instead of rewriting the old parser.
- `app/client/components/navigation/NavBar.tsx` has a long hard-coded tool inventory and mobile search; check if desktop finder is actually competitive.
- `app/client/components/advertising/AdSlot.tsx`, `app/root.tsx`, `app/site-config.ts` are placeholder-only. `advertisingEnabled=false`, `adMode=placeholder`; currently no real fill behavior.
- React Router 8, React 19, static prerender, Netlify `build/client`; no runtime backend. `npm run validate` typechecks, tests, builds and audits prerender HTML.

Do not trust historical documentation over current implementation. Run baseline tests and note failures and existing uncommitted changes. Never reset unrelated changes.

## Execution waves — implement in order where safe, then continue

### Package B-01: Ad serving engine, owner-safe and DISABLED

Build an actual reusable client-side ad component/provider boundary, **not just a document or another placeholder**. Keep production default OFF. Avoid sending real AdSense requests in previews or without explicit approval. The architecture must support a future owner-configured Google publisher ID and policy-compliant manual slot usage only after a reviewed enablement step.

Implement an explicit kill switch, per-route allowlist, per-placement restrictions, responsive minimum-width guards, stable reserved geometry, clear advertisement labeling, load/error/no-fill states where official APIs actually support them, client navigation cleanup, consent gate injection, and defensive DOM layering with nothing over creatives. Preserve the existing owner rule: after the first **reliably confirmed genuine** filled advertisement in a page session, all placeholders are suppressed globally, not per-slot. If Google cannot reliably signal genuine fill through a supported documented mechanism, never invent a check from guessed iframe internals; report the fill-detection limitation and implement safe structural separation and a gated alternative. No fake compliance claims.

Create tests with mock adapters simulating no fill, late fill, repeated fill, route change, ad block, consent deny/revoke, resize/zoom, and malicious/unknown ad states. These tests do not count as genuine creative validation. The initial enablement candidate is ONE below-utility placement. Exclude narrow 300px square and side rails by default. Do not add accidental-click risk. Keep policy/about/contact/404 ineligible. Consult actual current Google AdSense documentation. Draft PR; no live ad calls.

### Package B-02: Certified CMP integration boundary and policy-safe activation

Implement robust adapter/configuration lifecycle for an officially supported Google-certified CMP using IAB TCF where required (EEA, UK, Switzerland), with the concrete provider decision/credentials clearly gated. Do not invent a homemade CMP and claim certification. No ad requests until appropriate approved state permits them. Support denial, withdrawal, delayed provider readiness, navigation and failure closed. Core converters remain usable with consent denied. Provide accessible UI integration seam to revisit privacy choices. Update truthful privacy implementation notes but don't claim legal review, live certification or production readiness without actual provider configuration.

This is a substantive implementation package only if real provider-supported code and tests exist. If provider/account decisions cannot be made safely, stage the reusable testable integration boundary as one package, identify owner inputs, and continue other work. Keep distinct from B-01 when independently releasable or document explicit dependency.

### Package B-03: Professional table/CSV workspace within existing routes

Upgrade a **real** high-value office task, not only explanatory copy. Starting from existing PR #11 CSV parser and PR #15 List to Table changes, design a capable browser-local, mobile-safe work surface with optional (not forced) pasted multi-column CSV/TSV table preview, headers, column selection/extraction, quoting, Unicode, multiline cells, output preview, explicit export CSV/TSV/HTML/clipboard when appropriate. Preserve existing defaults and existing protected Table to List and List to Table behavior. Do not turn the one-column List to Table route into a different tool by default.

Implement strong fixtures for quoted delimiters, quoted newlines, CR-only rows, embedded tabs, missing/duplicate headers, thousands of rows, 512-character cells, malformed inputs, blank values and output consistency. Keep huge previews bounded and accessible. Code should be maintainable and use the staged shared CSV engine rather than copy-paste another parser. No new indexable URL without owner approval; use an advanced mode of an existing compatible route first.

### Package B-04: Browser-local batch text file conversion

Create an actually working bounded batch processing capability for useful supported text transformations (not PDF/DOCX by default if unsafe). Pick an appropriate existing work surface or a deliberate **noindex** staging route until owner grants indexing. Support select/drop multiple TXT or other validated text-like files, per-file transform, progress, cancellation, naming, per-item errors, partial success, ZIP export with verified OSS dependency if warranted, and cleanup of object URLs and workers. Respect input size caps and total memory budgets; do not upload or persist file content.

Use deterministic fixtures, cancellation before/during processing, malformed encoding, duplicate filenames, 0-byte, oversized files, 20+ file batch and rapid repeated actions. Ensure ZIP contains only completed outputs, no stale prior run. Do not make claims of all-format support if only TXT is safe.

### Package B-05: Reversible multi-step text workflow

Build a useful opt-in workflow on the homepage or other appropriate existing UI that chains stable existing transformations: trim outer whitespace, normalize line breaks, collapse spaces, remove duplicate lines, change case, join/split where output semantics are clear. Show explicit step order, before/after preview, reversible rollback, error boundaries and export. Preserve the existing one-click homepage buttons and Undo; the new capability must not replace or complicate the default fast path. Reuse shared tested engines where possible. Handle large input without freezing or silently truncating output; undo must restore exact original text including CRLF/Unicode.

Compare at least three real office/developer workflows that benefit from multiple steps; implement only the steps that offer real value and can be validated. No account or server processing.

### Package B-06: Genuine Unicode-safe export and import hardening

Audit PDF exports in `TextToolCard`, List to Table, Table to List and shared counter components. Fix actual Unicode font limitations and clipping where a maintainable client-side method exists. Consider print/HTML export or appropriate open-source embedded fonts with verified license rather than blindly using jsPDF Latin-only defaults. Ensure Latin accents, CJK, combining sequences, RTL where feasible, emoji limitation disclosure, long paragraphs and multi-page content do not silently disappear. Preserve lazy loading and initial bundle budgets.

Exercise PDF generation, browser download and PDF reimport, with byte/text fidelity checks where technically meaningful (PDF extracted text may normalize glyphs). Provide honest coverage limitations. If a universal fix is not feasible, improve safe fallback/notification and keep as an explicit blocker without halting other packages.

### Package B-07: Desktop tool finder and repeat-use productivity

Replace the need to browse a huge hard-coded list with a genuinely useful accessible command finder on desktop and mobile. Derive tool inventory from one authoritative registry where feasible; maintain labels, keywords, categories and routes. Support keyboard typeahead, Escape, focus restore, predictable screen-reader semantics and responsive overlay; preserve the current mobile drawer and primary links.

Add optional favorites/recently-used-tool references only (not pasted text, filenames or generated outputs). Defaults must reveal no sensitive history; provide clear reset. Avoid complex profiles, cloud services and tracking. Verify no broken internal links and no duplicative categories/SEO pages.

### Package B-08: Full-route behavior, safety and commercial-readiness automated checks

A meaningful permanent quality package, not just a Markdown checklist. Expand source tests and production-output crawl for all 51 prerender HTML routes, 48 sitemap URLs, policy noindex, real 404, redirects, title/description/H1/canonical/internal links, JS-disabled crawlability, hydration, broken anchors and ordinary accessible controls. Where useful, add GitHub Actions PR-only, read-only CI using pinned Node 22 and built-in npm scripts, with no secrets or deploy permissions. Avoid a flaky or cost-heavy browser setup if a reliable local E2E runner is not yet available; add smoke tests and document bounded manual browser acceptance.

Include regression tests for new batch, workflow, ad adapters, consent gate, home converter large Base64, staging branch overlap with existing PRs and protected converter outcomes. Do not count pure extra tests as three primary commercial features, but do not skip them.

### Package B-09: Commercial measurement interfaces, disabled by default

Build minimal source interfaces or offline import/reporting where it advances the real product. Define canonical page + country + device cohorts, Google Search clicks vs organic sessions, ad requests/fill/viewability/revenue vs search metrics, tool task completion and error rates, and p75 field Core Web Vitals vs lab. No raw visitor text, filenames, clipboard contents or outputs. Do not emit network analytics without consent and owner approval. Use only authorized existing sources, not GSC Wizard. If external credentials are missing, implement isolated adapters and sample fixtures only, not fake numbers or an empty 'dashboard complete' claim.

### Package B-10+: Evidence-based additional converter and SEO expansion

Once first eight packages are materially complete, investigate differentiated candidate workflows such as Markdown table conversion, CSV↔TSV, validated text↔JSON Lines, structured data extractors, or safe URL/HTML/text cleaning modes. For each, prove that it is not a synonym page or feature already shipped. Require distinct input/output, strong deterministic tests, useful original examples, accessible UI, transparent limits and reason to exist. Stage any entirely new indexable route as noindex until explicit owner approval. Do not build bulk pages.

Also inspect user-facing search relevance: US/Canada/UK/Australia/NZ opportunities are hypothesized from aggregate GSC; latest verified 28 days were 194 clicks / 13,880 impressions. No evidence of page-query-country joins or site ad RPM. Improve actual tool capabilities and appropriate titles/help/related links rather than fabricating regional doorway pages. Revisit high-impression workflows, protect `/table-to-list`, and do not roll back validated canonical work.

## Definition of a substantive package

A package does NOT count if it consists solely of: an audit document, a one-line focus ring, rewording an FAQ, adding two footer links, a metadata-only experiment, fixing a typo, creating tests for unchanged code, or a configuration stub with no behavior.

A package DOES count when it delivers a coherent new working user-facing system or materially hardened commercial infrastructure and can be independently verified, e.g. a safe opt-in multi-step cleaner, reliable batch exports, complete table preview/extraction/export, a tested privacy-gated ad provider, a real supported CMP adapter integration, comprehensive Unicode export recovery, or a responsive searchable tool command center.

For each claimed package show: before state; actual behavior; changed files; tests; browser evidence; exact commit; draft PR; dependencies; rollback. If an implementation relies on unmerged PR #11, #15 etc., document explicit ancestry or cherry-pick isolation and test the resulting combination.

## Mandatory run loop

1. Quick inventory (bounded; only enough to avoid duplicates).
2. Select highest-value executable package.
3. Write real code and behavioral tests.
4. Run `npm ci` when dependency graph changes or first worktree is set up, and `npm run validate`; run appropriate browser tests at 320/375/768/1280/1920.
5. Push staging branch and open draft PR; check exact Netlify preview matches SHA. Do not merge.
6. Update the queue: remaining packages, blocked inputs, dependencies, uncovered tests.
7. Repeat steps 2–6. Do not exit to deliver a report after the first or second pass.
8. Near runtime/resource boundary, commit current work to its own branch, leave unrelated work untouched, record an exact resumable state and what should run next. Never claim an unpushed checkout or failed test as a completed package.
9. When significant progress has accumulated, build a detached integration candidate across completed packages plus existing safe staging PRs, explicitly reconcile overlaps, rerun all source/static tests and hydration on all 51 pages, sample protected converter functions and ad safety. Never publish this combined tree to main.
10. Produce final concise but inspectable implementation report after material work, not as a replacement for it.

## Nonnegotiable limits

- Production `main` untouched; no deployment, auto-merge, branch force pushes, paid service, real ad network activation or analytics tracking.
- Preserve the owner's global placeholder suppression invariant. If genuine fill detection cannot be guaranteed with documented Google APIs, do not fake it; build architecture that is safe by default and separately review owner-gated options.
- Protect Search Console winner URLs and existing conversion behavior. Staged new routes remain nonindex until approved.
- Google's search spam policies: no scaled low-value content, generic auto-generated SEO prose, doorway pages or synonym routes; Western markets are a commercial prioritization, not a reason for localization spam.
- No sensitive user text or files leave the browser by default.
- Keep dependency use OSS and minimal, especially large parsing and PDF modules; dynamically import expensive libraries.
- No false PASSED labels: local source tests are not hosted Netlify tests; simulated ads are not actual Google creative compliance; a CMP adapter is not a certified CMP account integration; source code is not a monetizing website until configured/authorized.
- No busywork to hit six. On a hard genuine blocker, keep moving to another justified work item.

## Final output format

Give a compact table of **substantive completed feature PRs** (do not mix documentation-only or trivial changes), plus: tests and browser proof, combined integration proof, exact SHA and diff for each, known PR dependencies, blocked items, progress against the original 10+ workstreams, any new URL/indexing footprint, exact current main/production safety, and the single next implementation step if another run is needed. State whether the six-package target was met; if not, why and how to continue. Do not set weekly production dates yet.

**START BUILDING NOW. Treat an output resembling 'two small PRs and a readiness report' as an incomplete run, not as success.**
