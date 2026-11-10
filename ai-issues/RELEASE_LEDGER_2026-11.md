# November 2026 release ledger

Baseline checked November 9, 2026 (America/New_York).

- Remote main and the published Netlify deploy reported 7189874058e86e26e8ea52d031d990f7687e517a. Local main began and stayed at 03ae0a5997bf2d383c600e1067152013da1f5444. Every implementation branch starts from the remote baseline.
- The original [planning draft](https://github.com/suhas-sunder/alltextconverters/pull/1) stays separate. Its [release plan and search baseline](https://github.com/suhas-sunder/alltextconverters/tree/planning/2026-11-growth-release-train/ai-issues) contain the owner-provided evidence.
- The repository has no GitHub Actions workflows. Netlify builds from Git and publishes build/client. A preview build status, hosted HTTP or browser check, and local validation are separate evidence.
- Node 22.23.1 is pinned in .nvmrc. React Router 8 and React 19 prerender 51 HTML pages, including 48 sitemap entries and three noindex policy pages. The standalone 404 and two Netlify aliases sit outside those counts. Conversion stays in the browser.

## Verified inventory

| Classification | Finding and disposition |
| --- | --- |
| Already implemented | Browser-local conversion, static prerendering, generated sitemap, standalone 404 artifact, social-image omission, schema cleanup, tool directories, input-size policies in newer converters, UTF-8 byte metrics, and lazy file libraries. |
| Verified defect | Production uses slash landing URLs but HTML and sitemap nominate non-slash URLs. Both unknown-path forms self-redirect and the legacy aliases take two hops. A current audit found document dependency advisories. A delayed homepage file read overwrites later edits. Table to List skips its file picker in keyboard navigation. |
| Justified improvement | Surface UTF-8 bytes, distinguish comma/list/CSV workflows, make line-break settings predictable, link existing table and JSON list tools, and fix parser and feedback edge cases. |
| Needs more evidence | Collect query-to-page data and comparable route cohorts before attributing query movements or proposing consolidation. Measure field Web Vitals and file workload before changing size limits or adding workers. |
| Deferred | Category routes, synonym pages, generic posts, accounts, cloud processing, CSP enforcement, and broad design changes. |
| Protected | Preserve Table to List, List to Table, JSON Array to List, JSON to Text, and Text to XML identities and workflows. Live advertising, consent, and placeholder suppression are separate owner decisions. |

The October 11–November 7 Search Console window had 194 clicks and 13,880 impressions, up from 142 and 11,586 in the preceding 28 days. The three-month slash split informed ATC-01. The exact byte-counter query informed ATC-02. These aggregates establish neither duplicate indexing nor cannibalization. The Bing counts of 689 and 494 measure AI citations. [Owner baseline](https://github.com/suhas-sunder/alltextconverters/blob/planning/2026-11-growth-release-train/ai-issues/SEARCH_BASELINE_2026-11-09.md)

The earlier implementation plan and final launch audit contain historical assumptions. Their missing-exports prerequisite, zero-advisory audit, manual-deployment instructions, and no-slash recommendation have been superseded by current evidence.

## Package inventory

| Package | Target | Scope | Branch and exact head | Draft and file inventory | Source + static tests and hosted evidence |
| --- | --- | --- | --- | --- | --- |
| Security | Early review | Patched PDF.js, DOMPurify and Mammoth's bundled parser path | `codex/atc-file-dependency-security` · `e56dc68ede4d78649f36e682c7e8d7720af74c28` | [Draft #4](https://github.com/suhas-sunder/alltextconverters/pull/4) · [4 files](https://github.com/suhas-sunder/alltextconverters/pull/4/files) | 41 + 5 · [Preview](https://deploy-preview-4--alltextconverters.netlify.app/) |
| ATC-01 | Nov 15 | Canonical URLs, one-hop aliases and real 404s | `codex/atc-01-canonical` · `39d3fc1782c9f5973f6ce4143a7e1f3c57a2ffc3` | [Draft #7](https://github.com/suhas-sunder/alltextconverters/pull/7) · [76 files](https://github.com/suhas-sunder/alltextconverters/pull/7/files) | 41 + 5 · [Preview](https://deploy-preview-7--alltextconverters.netlify.app/) |
| ATC-02 | Nov 22 | Prominent exact UTF-8 count and line-ending guidance | `codex/atc-02-byte-counter` · `ea51484c3fa023b11e8bd7c37c7dd31f584cb2fa` | [Draft #9](https://github.com/suhas-sunder/alltextconverters/pull/9) · [3 files](https://github.com/suhas-sunder/alltextconverters/pull/9/files) | 42 + 5 · [Preview](https://deploy-preview-9--alltextconverters.netlify.app/) |
| ATC-03 | Nov 29 | Distinct comma-list workflows, quoting and format labels | `codex/atc-03-comma-list-intent` · `535ed29a7ad8beadc26fc06ff2a0799f1db677b5` | [Draft #8](https://github.com/suhas-sunder/alltextconverters/pull/8) · [14 files](https://github.com/suhas-sunder/alltextconverters/pull/8/files) | 42 + 5 · [Preview](https://deploy-preview-8--alltextconverters.netlify.app/) |
| ATC-04 | Dec 6 | Line-break options, paragraph handling and fresh output | `codex/atc-04-line-break-remover` · `c0af213c63d95b2d3dd0587b809e5fd6be8f92ef` | [Draft #12](https://github.com/suhas-sunder/alltextconverters/pull/12) · [6 files](https://github.com/suhas-sunder/alltextconverters/pull/12/files) | 43 + 5 · [Preview](https://deploy-preview-12--alltextconverters.netlify.app/) |
| ATC-05 | Dec 13 | Homepage discovery for two existing list tools | `codex/atc-05-discovery` · `8c5b40566b472acbd732b9e5a2079a4ead9c4011` | [Draft #2](https://github.com/suhas-sunder/alltextconverters/pull/2) · [1 files](https://github.com/suhas-sunder/alltextconverters/pull/2/files) | 41 + 5 · [Preview](https://deploy-preview-2--alltextconverters.netlify.app/) |
| ATC-06 | Dec 20 | CSV parser and output fidelity, including malformed Table to List protection | `codex/atc-06-list-csv-correctness` · `e67ee0808d053415d93d546333fa616a26d80e37` | [Draft #11](https://github.com/suhas-sunder/alltextconverters/pull/11) · [6 files](https://github.com/suhas-sunder/alltextconverters/pull/11/files) | 42 + 5 · [Preview](https://deploy-preview-11--alltextconverters.netlify.app/) |
| ATC-07 | Dec 27 | Keyboard file picker and independent result/clipboard announcements | `codex/atc-07-accessibility` · `a9285ef01faa46c016d06f4d6f8ab609cf9a82c8` | [Draft #10](https://github.com/suhas-sunder/alltextconverters/pull/10) · [3 files](https://github.com/suhas-sunder/alltextconverters/pull/10/files) | 41 + 5 · [Preview](https://deploy-preview-10--alltextconverters.netlify.app/) |
| ATC-08 | Jan 3, 2027 | File race recovery, counter PDF pagination, smaller shared logo | `codex/atc-08-file-safety` · `59b1819e892fbf7e29ba7b520fcfd99bd09879d1` | [Draft #6](https://github.com/suhas-sunder/alltextconverters/pull/6) · [3 files](https://github.com/suhas-sunder/alltextconverters/pull/6/files) | 41 + 5 · [Preview](https://deploy-preview-6--alltextconverters.netlify.app/) |
| ATC-09 | Jan 10, 2027 | ASCII, UTF-8 and XML edge cases plus two hydration fixes | `codex/atc-09-secondary` · `4ef1561184beaa805f453a817e44b11453dae937` | [Draft #3](https://github.com/suhas-sunder/alltextconverters/pull/3) · [8 files](https://github.com/suhas-sunder/alltextconverters/pull/3/files) | 44 + 5 · [Preview](https://deploy-preview-3--alltextconverters.netlify.app/) |
| UI | Fast-track review | Homepage editor focus ring | `codex/atc-ux-polish` · `ada4f6ad7afb71ae36df40b1e6fc2377b4df9421` | [Draft #5](https://github.com/suhas-sunder/alltextconverters/pull/5) · [1 files](https://github.com/suhas-sunder/alltextconverters/pull/5/files) | 41 + 5 · [Preview](https://deploy-preview-5--alltextconverters.netlify.app/) |
| ATC-10 | Jan 17, 2027 | Final acceptance and this ledger | `codex/atc-release-ledger` | Documentation and detached integration review | No production release slot required |

All application packages above are HOSTED-VERIFIED and READY FOR OWNER REVIEW. Each passed a clean dependency installation, the local validation entry point and package-focused browser checks in Chrome or Edge at 320, 375, 768, 1280 and 1920 px. Counts separate source or behavior tests from static build checks. Netlify adds a preview-only X-Robots-Tag: noindex header. The candidate canonicals point at the production origin.

### Evidence by package

- ATC-01 hosted checks compared homepage, four priority converter URL pairs, both forms of each alias, unknown paths, robots and all 48 sitemap entries. Production unknowns currently loop. Preview unknowns return a genuine 404, aliases resolve in one hop, and slash landing pages nominate themselves. Checked query retention, internal links, mobile menu navigation, About and Contact placeholder eligibility, and Unicode CSV extraction from Table to List. [Netlify normalization rules](https://docs.netlify.com/manage/routing/redirects/redirect-options/#trailing-slash)
- ATC-02 keeps the current title and description. The exact count serves paste-and-check tasks such as byte limits. A prominent byte result and an LF/CRLF explanation are practical patterns seen on dedicated tools. Verified typing, clipboard, Unicode and CRLF TXT, PDF and DOCX, and invalid-file recovery. [Dedicated byte counter](https://mothereff.in/byte-counter) · [Line-ending comparison](https://utill.net/util/string-counter/)
- ATC-03 checked four workflow routes, keyboard import and copy, quoted data, TXT/CSV bytes, PDF/DOCX import and PDF export. The three comma-route metadata edits describe the actual job and use the existing URLs. The diff records old and new copy. [ATC-03 metadata and workflow diff](https://github.com/suhas-sunder/alltextconverters/pull/8/files)
- ATC-04 tested paragraphs, literal separators, stale result invalidation, mixed line endings, and a real paste of 25,000 CRLF lines.
- ATC-05 tested keyboard and pointer access to both added homepage links and the existing contextual links.
- ATC-06 tested 30,000 rows by clipboard and 150,000 rows with a programmatic input event, quoting, multiline fields, Unicode, BOM/CRLF, stale output, and valid Table to List HTML and CSV. Malformed Table to List CSV keeps the pasted source available. The inert HTML test made no network request.
- ATC-07 used Tab and Enter to open Table to List's real file chooser, then selected and extracted the second column by keyboard. Tested copy success, denial and result invalidation. A local Windows prerender request failed on the first run. The complete rerun and hosted checks passed.
- ATC-08 verified stale imports, parse failure and recovery, multi-page PDF and Unicode TXT/DOCX. A downloaded 80-line counter PDF had three pages and reimported through the final line. The shared logo dropped from 461,617 to 25,862 bytes and still renders at 32–36 px. Live cold measurements on home, Table to List and Byte Counter showed 124–130 KB compressed initial JavaScript, 8.9 KB CSS and no initial document-library requests. Those are browser lab observations.
- ATC-09 tested 450 KB ASCII, invalid-input recovery, BOM preservation, mixed XML text with CDATA, valid parsererror elements and TXT bytes. The first full-route browser sweep reproduced existing hydration errors on Case-Insensitive Sort and Comma to JSON Array. ATC-09 fixes their nested paragraphs and adds a static regression assertion.
- Security removes the production advisories reported by npm audit --omit=dev. It verified real browser TXT, PDF, DOCX and PDF export, with lazy optional modules. Four dev-only audit entries remain for Vite, Undici, nanoid and source-map-js. [PDF.js advisory](https://github.com/advisories/GHSA-hq66-cqwq-w95j)
- UI verified keyboard focus and uppercase conversion with the one-line style change. It is staged for fast-track review.

### Integration

The detached integration checkout applies the security branch, ATC-01 through ATC-09, and UI polish in that order. Three overlaps were resolved there only. Keep the ATC-01 canonical URL with ATC-03's new List to Comma Separated metadata, keep both added test cases when ATC-04 and ATC-06 touch adjacent fixtures, and keep the canonicalPath import alongside ATC-07's React hooks. These are merge overlaps between independent diffs. A subsequent release branch update needs the same intent and fresh validation. No combined branch was pushed.

The final combined build passed 49 source and behavior tests and five static checks using Node 22.23.1 and the dependency-security lock. Edge hydrated all 51 prerendered pages at 375 px without page, console, or request errors. The protected Table to List, List to Table, JSON Array to List, JSON to Text, and Text to XML conversions also passed representative browser fixtures. An overloaded local fixture server refused requests during one parallel run. Individual browser scenarios were rerun serially.

Netlify's published production deploy remained 6ad02cf1071723e19c0b2ecd at 7189874058e86e26e8ea52d031d990f7687e517a. All application changes remain staged for owner review.

Dates are target Sundays in America/New_York. Leave a slot empty when a gate fails. Each implementation package has an independent baseline and review. Recheck the exact merge result after any earlier package changes main. The ledger itself is documentation only.

## Release and rollback

1. Record the candidate SHA, compare it with current origin/main, review Files changed, and check for unrelated commits. Update only the candidate branch if main moved. Re-run validation for the resulting SHA.
2. Run npm ci and npm run validate with pinned Node. Run the focused converter and browser checks. Verify the automatic Netlify Preview belongs to the candidate commit. For ATC-01, run node scripts/verify-hosted-urls.mjs against the preview URL and check its status, Location, sitemap, metadata, aliases, and real 404s.
3. Verify protected-page conversions and the appropriate title, description, H1, canonical, robots, schema, sitemap, navigation, clipboard, download, and ad checks. Preview evidence does not establish search indexing.
4. Record owner approval before a production merge. Release at most one substantive package in a scheduled slot. An urgent security fix can take a separate owner-reviewed slot. Main is the production boundary.
5. Record the resulting merge or squash SHA and previous Netlify deploy ID. After the Git-triggered deploy, re-run the checks against production. Mark RELEASED and start MONITORING only once that package is live.
6. Hold failed previews. For a material production regression, revert the exact release in an owner-reviewed rollback PR using git revert -m 1 <merge-sha> for a merge or git revert <squash-sha> for a squash. Verify the Git-triggered rollback deploy. ATC-01 rollback restores the baseline redirect conflict. A dependency rollback can restore vulnerable versions. Compare sustained post-release query and page cohorts before attributing ranking changes.

## Indexing and advertising

The baseline has 48 sitemap entries and three policy pages with noindex,follow. The standalone 404 is noindex,nofollow. ATC-01 aligns 47 non-root sitemap entries to existing slash landing URLs, spells the homepage URL with an explicit slash, and aligns policy canonicals. Both aliases keep their destination identities. No package adds or removes a route or changes an indexing directive. ATC-03 changes search presentation only to distinguish existing workflows.

Source has reserved placeholders, advertising disabled, and no filled-ad lifecycle. ATC-01 normalizes the blocked-path lookup so slash navigation preserves About and Contact placeholder eligibility. Fill, suppression, consent, and placement policies are protected. [Owner directive](AD-PLACEHOLDER-SAFETY.md)

## Residual decisions

- Review the document-security PR early because the original dependency audit is stale.
- Keep comma-list routes separate while their distinct workflows exist. Consolidation needs query-to-page data and owner review.
- Revisit file limits and broader worker changes with production-equivalent performance data. Keep TXT, PDF, and DOCX support.
- Follow up on Unicode PDF fidelity in legacy exporters. Standard jsPDF font coverage is limited. Verify a suitable export path before changing supported formats.
- Keep live ads, CMP work, CSP, new routes, and content expansion outside this buildout.
