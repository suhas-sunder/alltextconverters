# AllTextConverters — post-build gated release calendar

**Prepared:** November 9, 2026 (Toronto time).  
**Status:** PROPOSED RELEASE WINDOWS / NO OWNER APPROVAL TO MERGE OR DEPLOY  
**Source:** Staged Codex implementation PRs #2–#15, final readiness report PR #16, earlier acceptance ledger #13, planning PR #1. The implementation buildout has completed to the extent authorized. Live-ad activation, certified CMP, ad tracking and unverified Unicode PDF fidelity remain separately gated, not unfinished license to add unrelated code.

**IMPORTANT — tranche A only, not the final schedule or complete site.** The owner has expanded the brief to a mature, fully monetizable utility site. This file preserves **provisional sequencing of the first 15 staged PRs**, while further product, SEO, ad integration and revenue-measurement buildout is still required. The final production calendar (potentially through 2027) will be set **only after** the approved buildout is finished and accepted. See [Full 2027 commercial buildout](COMPLETE_COMMERCIAL_BUILDOUT_2027.md). Dates below are superseded as commitments, and none of these releases is authorized for production yet.

## Hard rules

- **Main is production.** Every push or merge to `main` automatically triggers a Netlify deployment. **No automatic merge, main push, scheduled execution, or deployment is approved by this calendar.**
- The owner must approve **the exact rebased/merged candidate SHA** for each production slot. Draft status is not approval.
- At most one substantive non-emergency package per week, but never force a package simply because a date arrives. **Hold** when a required gate fails; publish an empty week or shift later slots without silently bunching releases.
- Security and similarly urgent regressions may be considered separately for an earlier owner-approved fix slot, with targeted hosted tests.
- Minor isolated UI-only changes can be fast-tracked after owner review and full testing; anything affecting search metadata, content intent, conversion behavior, advertising, or URL policy stays weekly.
- Preserve proven ranking winners, URL inventory (48 sitemap entries), noindex policy routes, browser-local privacy, responsive conversion utility, consent and advertisement safety.
- Existing PRs are branches from **the same historical baseline**. Their passing independent previews do **not** mean future sequential merged trees have been validated. Reconcile conflicts carefully and rerun the full suite on the *exact* candidate tree against the then-current main.
- `ai-issues/AD-PLACEHOLDER-SAFETY.md` is protected: no live ad activation, automatic overlays, per-slot placeholder restoration, ad-lifecycle change or CMP/analytics activation as part of these PRs.
- Conversion usability, actual search quality and Western visitor value govern release decisions, not filler content frequency or hypothetical RPM.

## Proposed release order (Sunday windows, America/Toronto)

| Slot (target, not obligation) | PR / exact focus | Why this order | Release gate |
| --- | --- | --- | --- |
| **Early security, separately owner-approved** | [#4](https://github.com/suhas-sunder/alltextconverters/pull/4) — document dependency patch | Security advisories deserve priority over weekly marketing cadence. | Validate PDF.js, Mammoth DOCX, PDF import/export, security audit, exact-SHA Netlify preview; no lockfile regressions. |
| **Fast-track UI, separately owner-approved** | [#5](https://github.com/suhas-sunder/alltextconverters/pull/5) — editor focus ring | Isolated, low-risk focus-only polish. | Single-line diff, keyboard ring, no SEO/ad/functional changes, exact preview. |
| **Nov 15, 2026 — W01** | [#7](https://github.com/suhas-sunder/alltextconverters/pull/7) — ATC-01 canonical/404 | Corrects active canonical conflict, unknown-path redirect loop, and alias hops. Foundational SEO/technical fix. | One-hop slash redirects and aliases; both 404 variants return 404; canonical/sitemap/OG/schema/breadcrumb/internal links agree; verify entire live-host preview, protected pages, noindex and ad eligibility. |
| **Nov 22 — W02** | [#3](https://github.com/suhas-sunder/alltextconverters/pull/3) — ATC-09 encoding/XML and two hydration fixes | Correct observed hydration failures and text edge cases early. | 51 prerender routes hydrate cleanly; ASCII, UTF-8 and XML fixtures; after ATC-01 verify route canonical consistency and fixed hydration. |
| **Nov 29 — W03** | [#6](https://github.com/suhas-sunder/alltextconverters/pull/6) — ATC-08 file race, PDF export, image weight | Prevents a delayed import from destroying a user's newer work. | Exact file-read race, DOCX/PDF/TXT import and download, PDF pagination, lazy modules and responsive editor tests on combined security dependencies. |
| **Dec 6 — W04** | [#15](https://github.com/suhas-sunder/alltextconverters/pull/15) — List to Table keyboard/mobile/import | A documented 3,553px overflow in a 320px view and inaccessible upload warrant release before editorial changes. | 320/375/768/1280/1920px, long cells, actual keyboard chooser, CR-only input, CSV/TSV/HTML export bytes, protected list/table tests. |
| **Dec 13 — W05** | [#11](https://github.com/suhas-sunder/alltextconverters/pull/11) — ATC-06 CSV correctness | Data fidelity and malformed input behavior outrank SEO polish. | RFC-style quoting, BOM, multiline/empty cells, invalid syntax, stale export and Table to List regression tests; reconcile shared fixtures. |
| **Dec 20 — W06** | [#10](https://github.com/suhas-sunder/alltextconverters/pull/10) — ATC-07 keyboard and announcements | Completes accessible Table to List file/feedback controls. | Reconcile canonicalPath imports with ATC-01; keyboard upload, focus, clipboard success/failure and result announcements. |
| **Dec 27 — W07** | [#9](https://github.com/suhas-sunder/alltextconverters/pull/9) — ATC-02 Byte Counter | Near-page-one query; now correct responsive UI; commercial effects unmeasured. | Head `99e62317011eda3ecd5202dc0cc453cf5c65c6b9` or its explicitly reviewed successor; count correctness and mobile editor reach, no metadata drift. |
| **Jan 3, 2027 — W08** | [#8](https://github.com/suhas-sunder/alltextconverters/pull/8) — ATC-03 comma/CSV intent | Existing high-impression route; differentiate *working* tools after shared CSV correctness is established. | Reconcile ATC-01 canonical with metadata; verify quote round trips, formats and copy; no route merges/redirects. |
| **Jan 10 — W09** | [#12](https://github.com/suhas-sunder/alltextconverters/pull/12) — ATC-04 Line Break Remover | Significant impressions but shallow rankings; improve useful conversion first. | CRLF/LF/CR, paragraph preservation, literal delimiters, stale outputs and source test conflict resolution. |
| **Jan 17 — W10** | [#14](https://github.com/suhas-sunder/alltextconverters/pull/14) — existing converter guides | Improve accuracy of copy on protected tools without bulk rewrites. | JS-disabled rendered copy matches *current* controls after prior packages; no metadata/URL changes; functional test on ranking winners. |
| **Jan 24 — W11** | [#2](https://github.com/suhas-sunder/alltextconverters/pull/2) — ATC-05 homepage discovery | Useful contextual links after technical/correctness stages; avoid manufactured category URLs. | Homepage tool remains prominent; links work; no new URL footprint or page copy duplication. |

### Documentation PRs (no separate production release date)

- [#1](https://github.com/suhas-sunder/alltextconverters/pull/1) planning and verified search snapshot
- [#13](https://github.com/suhas-sunder/alltextconverters/pull/13) implementation ledger / rollback
- [#16](https://github.com/suhas-sunder/alltextconverters/pull/16) Western SEO and ad monetization readiness

Review their content for staleness after this calendar and reconcile into one truthful source of record. Publishing documentation on `main` still triggers Netlify; do not merge merely to make documentation public. If merged, couple it with an explicitly approved production release and verify that no unrelated code is pulled in.

### Notes on sequencing

1. A readiness defect discovered on a staged branch must be fixed and revalidated before release; do not force an early calendar slot.
2. A documented urgent bug may justify moving an existing package earlier, but preserve **one focused functional change per ordinary weekly slot**.
3. On each window, compare remote `main` HEAD and original PR head, resolve *only* required conflicts on a newly reviewed candidate, run `npm ci`, `npm run validate`, appropriate UI/browser functional tests, Netlify exact-commit preview checks, and final owner authorization. Reconfirm no SEO/meta route movement beyond the package's documented scope.
4. Merge only after owner approval for that exact slot; then observe Netlify deployment and verify production URLs, telemetry where approved, protected tools and advertisement guardrails. Record shipped SHA/deploy ID. An automation, if later authorized, can review and recommend **GO/HOLD** but must **never auto-merge**.
5. Evaluate GSC by matched 28-day cohorts and route/query only when data supports comparison. Request fresh GSC/Bing data if a major URL change, rankings drop, warning or materially stale dataset requires it; avoid weekly export demands. Bing AI citations are not search click metrics.
6. Track target US/Canada/UK and other English-speaking markets using measured search and ad outcomes, not inferred country RPM. **Actual ad activation remains outside this release calendar**.

## Separate ad monetization phase — no scheduled activation

The source remains placeholder-only and advertising is disabled. Complete Google ad account/site authorization, vendor disclosures, certified CMP/TCF requirements where applicable, policy review, consent/withdrawal and genuine ad creative safety testing before any ad enablement. Initial proposed experiment is a *single below-utility* placement with fail-closed rollout and measurement; do not pilot the narrow 300px information square or side rails first. Honor global first-filled-ad suppression when actually implemented, protect click targets, and never overlap ads or placeholders.

## Scheduling automation

A recurring ChatGPT task was **not** created: the account previously returned a 5-task plan limit. Do not pause another project's automations without the owner's explicit instruction. This document is a release *calendar*, not an automatic execution schedule. The owner can review a particular week manually; if an automation slot becomes available, create a **review-only** weekly task.
