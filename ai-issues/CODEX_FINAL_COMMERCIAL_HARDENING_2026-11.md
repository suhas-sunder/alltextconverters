# AllTextConverters — Final commercial hardening and release-readiness acceptance

**Owner direction:** Build to competitive maturity first; staged production releases may continue throughout 2027. **Status:** execute remaining critical hardening, not a new speculative feature backlog. No production merge, push, deploy, ad activation, account configuration, tracking activation or payment. Keep A/B/C draft PRs and staging worktrees intact.

**Verified current references on November 11, 2026:** Remote main `7189874058e86e26e8ea52d031d990f7687e517a`; Tranche C integration PR #37, exact head `7c76a46e515eab69d57a60b3dd1ce180ae8ae142`, Netlify immutable preview `6af526775883ae9326ed4d0b`, context `deploy-preview` and status ready. GH comparison: 43 commits and 178 changed files above main. Reported combined validation: 95 source/behavior tests and seven static; strict hosted Edge gate 53 prerendered pages and all 46 indexable functional routes; 48 sitemap URLs; two new noindex workspaces for batch and Markdown. Actual provider network/creative behavior remains unverified.

## What changed in the project decision

Tranches A, B and C represent **meaningful full product development**: 46 converter/analysis workflows have functional browser acceptance, plus advanced browser-local table, spreadsheet, batch, text workflow, Markdown, JSON Lines, better Unicode print, finder, offline measurement and disabled advertising infrastructure. Do not reflexively ask Codex to implement another six arbitrary features; code quantity is no longer the bottleneck. **Prioritize remaining verifiable launch blockers, full activation rehearsals and performance.**

The current GSC baseline remains small (194 clicks/13,880 impressions for the most recent 28-day period in supplied November 9 report). Search impressions are not pageviews and there are no actual publisher earnings or RPM figures. Monetization readiness needs both usable traffic and an account-backed, consent-safe ad pilot, not more speculative landing pages or increased density.

## Action F-01: Reconcile CMP / GPP actual compatibility before advertising approval

The Tranche C code in `app/client/components/advertising/regional-consent.ts` requires `gppVersion === "1.1"` (this is the **GPP CMP API version**, not the US National section version) and **`parsedSections.usnat[0].Version === 1`**, `applicableSections === [7]`, and opt-out fields strictly equal to 2. Research the current authoritative IAB GPP CMP API and US National section specs and current AdSense-supported GPP variants. As of 2026, Google AdSense supports **US National v2 as well as v1** (per official AdSense documentation). Determine whether the exact gate would reject currently compliant US National v2 or state-specific CMP responses. Do NOT simply relax checks or treat a missing/unknown signal as permission.

1. Create realistic reproducible contract fixtures for both supported US National versions and relevant applicable state-section scenarios, including valid user opt-outs, GPC, missing or contradictory signals, old strings, non-eligible sections and delayed readiness.
2. Trace how OneTrust's `__gpp('addEventListener', …)` payload, `pingData.parsedSections`, provider IDs and geolocation are actually emitted; use official OneTrust documentation and approved sandbox data where available, **not invented event shapes**. Label simulated vs provider-backed evidence explicitly.
3. Reconcile the TCF-based outside-GDPR applicability, allowed approved subdivisions and configured ad groups. A true `gdprApplies=false` from the approved CMP is distinct from unknown; unknown remains denied. Check that jurisdiction changes, banner re-open, withdrawal, policy expiry and tab navigation immediately prevent further ad requests.
4. Compare two operational routes **before declaring OneTrust mandatory**: a provider-supported Google Privacy & Messaging / Google CMP path where feasible, and a certified OneTrust/CookiePro path. The owner prefers free or inexpensive supported services. Verify current functional capability, regional coverage and cost/plan limits from vendor sources. Do not claim Google CMP automatically satisfies every regional law or that OneTrust is free.
5. Implement safe needed changes and tests in a **separate isolated PR**, ideally with supplier-provided fixtures or provider-backed sandbox. Keep the production configuration null and `advertisingEnabled=false`. Do not choose a vendor, send real requests, fill account values or change consent policy without explicit owner approval. If full provider test cannot run, record exact unresolved owner/provider blocker and leave default denied.

**Acceptance:** no false positive ad permission, supported version compatibility established or clearly blocked with evidence, and no unauthorized live provider requests. This is not a legal compliance certification.

## Action F-02: Real-ad readiness and owner activation evidence

- Audit the ad adapter, latch and DOM layering in the current C integrated code. Confirm **no element can overlay/obscure a real ad**. Protect `ai-issues/AD-PLACEHOLDER-SAFETY.md` verbatim, including page-session global placeholder suppression after first reliably verified fill. No lifecycle changes during ordinary SEO/UI refactors.
- Verify per-page below-utility placement for home, Table to List, JSON Array to List, Byte Counter, consent states, breakpoints and minimum container width. Do not activate narrow 300/320px slots when they cannot fit; avoid ad/control adjacency and layout instability.
- Prepare an **exact owner-action checklist** for approved account/site, verified publisher and each unit ID, ads.txt, chosen certified CMP, policies/disclosures, brand/editorial, ad serving mode, measured consent, real creative and real-network validation. Do not create or invent IDs. Review AdSense's current publisher policies and regional requirements, not outdated blog posts.
- Test simulated script blocked, consent denied/withdrawn, late fill, no-fill, later fill, route navigation, repeated mounts, zoom, keyboard, touch, first-filled-ad placeholder suppression, recovery, and emergency kill switch in the integrated staging application. Browser mocks may not prove genuine creative safety; label the real-creative gate BLOCKED until separately authorized and actually executed.
- Make sure unauthorized preview hosts never make provider requests. Preserve `X-Robots-Tag: noindex` on previews but **not accidentally on approved indexable production pages**.
- Build code only if actual integration defects found. No new empty ad placeholder PRs or policy boilerplate.

## Action F-03: Native editor latency and real user-interaction performance

The C handoff reports one 5 MiB desktop comparison: worker eliminated ~893 ms of secondary metrics main-thread work, but the native editor layout still took ~1.5 s. This is **one lab sample**, not a reproducible field percentile or production user complaint.

1. Reproduce on several runs and test 100 KiB, 1 MiB and 5 MiB at 320/375/768/1280/1920px with realistic mid-tier CPU emulation. Measure input-to-visible-update, long tasks, layout style/reflow, memory, worker transfer, and copy/export; distinguish browser-native `textarea` layout from application JS.
2. Test ordinary small inputs so a large-text solution does not slow common 1–20 KiB tasks. Identify the precise bottleneck before modifying the editor.
3. Only implement material, measured improvements: possible DOM limits, controlled input handling, secondary preview virtualization/worker scheduling, avoiding repeated re-renders, preserving selections, carriage returns, IME and keyboard accessibility. Do NOT silently drop text, cap copy/export incorrectly, switch to an inaccessible custom editor or leak text into storage.
4. Add repeatable lab command and before/after table with test machine, conditions, median/p95 when enough repeats, and honest limitations. Avoid claiming field LCP/INP/CLS without actual field data.

**Acceptance:** real measured performance improvement or an explicit finding that native browser cost is not economically safe to fix without compromising correctness. Do not create a perf PR solely because one large fixture was slow.

## Action F-04: Dependency/security and supply-chain closure

- Review the four reported inherited development-only advisories: `nanoid`, `source-map-js`, `undici`, `vite`, as of the exact integrated lockfile; verify current advisories, reachable affected functionality, patched versions and the Node 22 / React Router static build's compatibility.
- Prioritize patching vulnerabilities where a safe supported upgrade exists; use clean install and full suite, including Netlify Linux native/optional packages. Do not override an unsupported major version or fake zero-advisory status.
- Separate `npm audit --omit=dev` (production dependency risk) from full dev audit; document residual dev risk precisely. Retest PDF.js, DOMPurify, Mammoth, DOCX/XML safety and current protected converter inputs after changes.
- Keep CI/PR review read-only with no production deployment authority, secrets or paid services.

## Action F-05: SEO / distinct new-route indexing decision

- The integrated sitemap still has 48 canonical indexable URLs. The batch and Markdown routes are real functions but `noindex`. Do not assume their SEO contribution is nonzero while noindexed.
- Evaluate whether the Markdown table workflow is a distinct, adequately useful candidate for independent indexing. Use current first-party query data **if available**, relevant current competitive search evidence, original content, complete browser behavior and stable canonical route. If evidence is insufficient, keep noindex and document specific missing data. Same for batch; avoid exposing thin pages or making a mass-indexing decision.
- Audit that canonical migration, 404/redirects, robots and previous ranking winners remain correct on the exact eventual production candidate. Check preview noindex header does not leak to production context. Do not create new synonym pages, low-value blogs or geo-doorways.
- Traffic growth should come from differentiated useful conversions, accurate help and navigation and measured search intent. Do not claim clicks/revenue gains based on preview code alone.

## Action F-06: Build the definitive dependency-aware staged release inventory

After F-01 through F-05 and any justified code changes are validated, prepare a **final review-only release inventory**, potentially covering weekly owner-reviewed windows throughout 2027. This is not authorization to schedule merges or deployment; only organize package dependencies and acceptance.

- Treat #37 as an **integration evidence PR**, **not** a single production release to merge whole. Preserve independent staged PRs from Tranches A/B/C, including stacked dependencies #17 on #11; #21 on #20; all C on B integrated. Any new F PRs are separate.
- Build a dependency DAG for each expected production increment, including its current original head SHA, prerequisites, net diff against latest published main, SEO impact and rollback. For a stacked or wide PR base, calculate the **actual isolated patch** so merging it cannot accidentally ship unreleased Tranche B work. No release order may accidentally pull all 43 combined commits into production.
- Recommend early owner-reviewed security patch (#4), canonical & real 404 (#7), hydration fix (#3), and prerequisite data integrity, accessibility and file safety. Later release opt-in advanced workflows individually. One meaningful ordinary release per weekly window is a starting cadence, not a rule to pad 2027 or invent artificial waits. Specific dates can be proposed **only after** owner accepts completed implementation inventory; do not activate automation.
- Revalidate exact rebuilt candidate with `npm ci`, `npm run validate`, strict hosted browser gate (53 pages, 46 functional indexable routes plus two noindex tools), current security/ad/consent tests, and noindex guard. An earlier combined gate alone is insufficient to certify future incremental release trees.
- Business-critical security defects can be considered for a separately owner-approved early release. At the final activation stage, live ads/CMP can be its own tightly monitored, owner-approved release lane. No live ad pilot based only on mocked provider events.
- Provide rollback procedure per release, backup of exact published Netlify deploy ID and site health monitoring. Avoid altering other project automations.

## Exit instructions and report

**Do substantial work; do not just write another report.** Execute F-01 through F-06 using live current code. If justified defects exist, implement them, test, push independent draft PRs and continue. Do **not** impose an arbitrary six-PR minimum; commercial maturity now matters more than PR count. Unjustified changes should be refused with evidence.

Provide one final truthful matrix: fixed code; provider-contract tests; actual/live CMP gates; AdSense account prerequisites; latency results; vulnerable dependencies; sitemap/index changes; exact staged branches/SHAs; release DAG; preview and noindex verification; current main/prod status; unblocked next owner actions. If an external consent/provider input blocks one item, proceed on other independent items and report exactly what cannot be honestly marked complete.

No merge, main push, production deployment, live ads, analytics activation, paid services, or automatic schedule. Preserve all user work and exact references.

## Official reference links

- https://support.google.com/adsense/answer/14126816 (US National v2/v1 support, GPP)
- https://support.google.com/adsense/answer/13554116 (Google-certified CMP and EEA/UK/CH)
- https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Core/CMP%20API%20Specification.md (GPP API 1.1 vs sections)
- https://support.google.com/adsense/answer/1346295 (ad placements)
- https://developers.google.com/search/docs/essentials/spam-policies
