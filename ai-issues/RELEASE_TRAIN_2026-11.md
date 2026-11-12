# AllTextConverters — controlled build-and-release train (planning only)

**Created:** 2026-11-09  
**Status:** IMPLEMENTATION STAGED IN INDEPENDENT DRAFT PRS / PRODUCTION NOT AUTHORIZED  
**Production guard:** per owner, updates to `main` deploy on Netlify. Never merge, fast-forward, or push non-UI/UX work to `main` merely because a package is finished or a date arrives. Each weekly package must be independently ready and explicitly owner-approved. No auto-merge.

**Authoritative post-build sequence:** [Owner-gated release calendar](RELEASE_SCHEDULE_POST_BUILD_2026-11.md), prepared after Codex completed authorized implementation and the Western readiness audit. This calendar supersedes the provisional dates/order in the old release-package table below. **No automatic merge or deploy schedule exists.**

## Updated owner strategy — SEO for high-value English-speaking markets, ad-funded product

The owner has specified that commercial quality is **qualified search traffic and sustainable advertising revenue**, especially from relevant US/Canada/UK/Australia/NZ searches. Build Western-market SEO and monetization-readiness work before finalizing release dates, but do not turn utility pages into ad-heavy or keyword-stuffed pages. Actual ad integration remains separate and owner-gated; preserve `ai-issues/AD-PLACEHOLDER-SAFETY.md`. See [Western SEO and ad monetization acceptance](WESTERN_SEO_AD_MONETIZATION_2026-11.md). The ten calendar targets below are placeholders until all approved buildout is complete.

## Operating model

Build validated improvements in advance on isolated branches, small linear commits, and draft PRs. Release at most one search-visible functional/technical package per weekly slot (target Sunday, Toronto local time); an empty slot is acceptable. Queue unused packages rather than rebundling. UI/UX-only improvements may be released outside the weekly schedule after passing all tests, so long as they do not change search intent, URLs, indexed content, advertising lifecycle, or protected winners. Treat ambiguous changes as scheduled, not fast-track. Never use release frequency as a substitute for page usefulness or Google Search spam-policy compliance.

Read `ai-issues/AD-PLACEHOLDER-SAFETY.md` before any change. The first-filled-ad global placeholder suppression is a protected owner policy where implemented, not an item to 'fix'; do not change ad behavior or introduce advertising while doing SEO. Also review `docs/static-netlify-deployment.md`, `docs/audits/current-implementation-plan.md`, `docs/audits/future-only-backlog.md`, and current code; the older documents contain stale assumptions and are not an implementation checklist. This site is fully prerendered and browser-local.

## Evidence and constraints

See `ai-issues/SEARCH_BASELINE_2026-11-09.md`. The November 9 GSC upload includes daily site metrics Aug 8–Nov 7, 2026 and **three-month aggregate** pages/queries, but **not** 28-day page/query-pair cohorts; query list caps at 1,000 and is privacy-filtered. Do not claim route-level gains/losses for the last 28 days without actual segmented exports. Bing upload measures **AI citations**, not Bing Webmaster organic clicks. Page-level combined URL metrics are decision signals, not precise index coverage.

Last 28 days Oct 11–Nov 7: 194 clicks, 13,880 impressions, 1.398% CTR, 14.18 impression-weighted position. Previous Sep 13–Oct 10: 142 clicks, 11,586 impressions, 1.226% CTR, 13.99 position. Growth +36.6% clicks, +19.8% impressions. No evidence for sitewide failure.

Protected winners: `/table-to-list`, `/json-array-to-list`, `/list-to-table`, `/json-to-text`, `/text-to-xml` and other pages with evidenced query-to-tool fit. Preserve actual tools and URL paths. Current three-month GSC reports both slash forms; the live hosting redirects non-slash to slash; code canonicals and sitemap presently prefer non-slash. This **signal conflict** warrants a discrete technical fix, but combined GSC rows alone are not proof that Google indexes both current URLs.

## Release packages (proposed, dates are targets not mandates)

| Slot (Toronto) | ID | Package | Scope and acceptance | Protection/dependency |
|---|---|---|---|---|
| Nov 15, 2026 | ATC-01 | Canonical/host consistency | Investigate Netlify Pretty URLs; reconcile one URL convention across HTTP redirect, HTML canonical, OG, sitemap, internal links, structured-data URLs, tests. Preview verifies redirects on actual host and no loops. | Protect the established `/table-to-list` rankings; choose trailing slash only if actual host and GSC support, otherwise hold |
| Nov 22 | ATC-02 | Byte Counter quick win | Verify count correctness across Unicode/emoji and bytes; improve first-screen feedback, useful example, labels, copy. Consider small title/description adjustment only if verified intent fit; no unrelated content. | Keep `/byte-counter` URL and local processing |
| Nov 29 | ATC-03 | Comma-list intent clarity | Compare `/text-to-comma-separated-list`, `/list-to-comma-separated`, and `/list-to-csv`; correct misleading 'Lines to CSV' terminology; demonstrate unique user workflow and output semantics. | No merge, redirect, noindex, or canonical cross-target unless page-query evidence confirms cannibalization |
| Dec 6 | ATC-04 | Line Break Remover precision | Test CRLF/CR/LF, paragraph preservation, custom separators, blank lines and long inputs; align UI help and examples with actual behavior. | One route; no general rewrite |
| Dec 13 | ATC-05 | Homepage discovery & taxonomy | Make clear, usable in-context discovery of line/list/CSV/JSON tools; avoid exhaustive keyword-stuffed link blocks and near-duplicate landing pages. | Do not displace main homepage utility or break existing nav |
| Dec 20 | ATC-06 | Text/CSV hardening | CSV quoting, empty rows, unicode, copy/download semantics for existing list/CSV tools, only where existing tests/audit establish defects. | Protect existing table/list winner behavior |
| Dec 27 | ATC-07 | Accessible utility controls | Keyboard/focus/error status, label/fieldset, mobile tap targets, actual feedback for copy/download. | Shared changes must avoid ad overlays and unintended behavior |
| Jan 3, 2027 | ATC-08 | Input/file performance & safety | Reasonable size limits, cancel/error states, worker or progressive handling if justified; measure rather than invent performance claims. | Preserve browser-local operation; no server uploads |
| Jan 10 | ATC-09 | Secondary converter correctness | Test and improve evidence-backed XML, encoding, whitespace or ASCII edge cases, scoped to a small group. | No broad changes to proven search-intent copy |
| Jan 17 | ATC-10 | Final acceptance & residual cleanup | Audit production-ready candidates and close verified defects; hold risky or unsupported additions. | No forced release, no final batch publish |

The exact order and dates should be re-ranked against new data, regression risk, and ready PRs. One package can be smaller than listed. No expectation that all ten will be needed; close when justified quality work is complete.

## Fast-track UI/UX lane

Allow minor copy repetition fixes, layout/usability consistency, accessible focus or labels, and helpful input/output affordances to go to `main` once independently verified and isolated. First check actual production ad placeholder behavior; do NOT touch `AdSlot`, ad placeholders, ad loading/consent, or global first-filled-ad suppression under this lane. Do not smuggle SEO titles, canonicals, route additions, content-scale changes, or protected tool rewrites into a fast-track PR.

## Stage/build gates

1. Inspect `git status`, branch, origin/main, existing local changes, PRs and actual implementation before touching anything; preserve unrelated work. Use Node version in `.nvmrc`.
2. Write issue or package-specific plan, hypothesis, evidence, files, dependencies and rollback. Keep each unit independently releasable with one small draft PR against `main`. Avoid one giant PR.
3. `npm ci`; `npm run validate`; run bounded functional fixtures and actual browser acceptance across 320/375/768/1280/1920 px, keyboard and mobile; inspect network console; inspect relevant prerender HTML for title/meta/robots/canonical/H1/JSON-LD.
4. For ATC-01 specifically verify production-representative Netlify preview with HTTP status and Location for slash/no-slash, alias paths, 404, robots, sitemap and internal links; redirect tests at local code level are insufficient.
5. Confirm no alteration to protected winners, ad safety, conversion privacy, or indexing scope. Compare expected URL count before/after. Any SEO release needs a source-backed change log and baseline.
6. Stop and report any blocker, but continue safe unrelated packages. Keep PRs draft; no auto-merge, main push, deployment or paid services without owner authorization. UI-only fast lane may be released following owner rules and checks, but no unattended release.
7. Weekly review should inspect candidate SHA, diff, CI, preview, latest baseline and regression risks and report GO / HOLD / ROLLBACK, not force a scheduled release.

## Explicitly not approved

Bulk new converter URLs, synonym/translation clones, generic blog posts, scaled FAQ prose, buying links, unvalidated CMP or ad lifecycle changes, cloud content storage, accounts, APIs, browser extensions, major taxonomy redirects, merging comma-list routes without proof, noindex/URL changes to protected winners. Use `docs/audits/future-only-backlog.md` as deferred reference, not as a build list.
