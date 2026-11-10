# Western-market SEO and advertising revenue — buildout acceptance criteria

**Owner direction:** 2026-11-09. **State:** buildout requirement / staged audit; NOT approval to publish live advertising, change ad consent or production, or merge into `main`.

## Business goal and evidence

Build the existing converter utility to maximize **sustainable, policy-compliant revenue per qualified visitor** while continuing to serve users globally. Prioritize English-language intent relevant to the United States, Canada, United Kingdom and Australia/New Zealand when demand and usability support it. Do not assume every Western visit monetizes equally; actual country/page/device ad RPM and viewability are not provided.

GSC August 8–November 7 country export (search visibility only, **not** ad revenue): US 102 clicks / 15,932 impressions; Canada 24 / 1,302; UK 23 / 2,798; India 39 / 3,775. These counts support US-led investigation but do not establish country RPM. The uploaded Bing CSV is AI citations, not organic or ad-revenue data. Avoid inventing RPM, fill, viewability, conversion rates or dollar forecasts.

`main` automatically deploys on Netlify. The 12 staged November 9 draft PRs are function/correctness/search infrastructure work; they are **not proof that live monetization readiness has been verified**. Finish a separate, evidence-based SEO/monetization readiness pass before fixing final release dates. Never make ad activation a prerequisite to shipping a proven security defect.

## What Codex should build and validate now (in additional independent draft PRs where justified)

### A. Western search opportunity and technical SEO audit

1. Analyze owner-verified query, page, country and device exports with dates and denominators; distinguish impression opportunities from ad earnings. Prioritize clear user tasks and strong utility fit. Suggested existing routes for investigation: `/byte-counter`, `/text-to-comma-separated-list`, `/table-to-list`, `/line-break-remover`, `/list-to-table`, `/json-array-to-list`, and homepage. Verify regional English terminology when relevant (line breaks, newline, CSV, UTF-8 byte size, etc.), but do not create US/UK synonym routes or geographic keyword stuffing.
2. For the exact candidates, research current Google/Bing SERP patterns and leading functional competitors. Record reproducible findings, not copied content. Assess title/H1/description intent, technical indexing and canonical URL behavior, crawlable contextual links, differentiation, immediately accessible tool output and accurate examples. Implement only supported changes on current tool pages.
3. Compare desktop and mobile experience, since the site receives most GSC impressions from desktop but mobile search also matters. Avoid geo-redirects, cloaking or hiding useful tools from non-Western visitors.
4. Keep GSC page-query/country conclusions caveated: the supplied page/query aggregates do not contain page-query pair detail, and the Bing export is AI-citation data. No cannibalization-based merges or protected-winner rewrites without additional evidence.
5. Any new page needs independent demonstrated demand, a genuinely distinct working converter, original value, unique functional acceptance, and explicit owner approval. Default: zero new indexable URLs.

### B. Ad-funded product experience audit (do NOT activate ads)

Inspect actual `app/client/components/advertising/AdSlot.tsx`, `app/root.tsx`, page placements, `app/site-config.ts`, responsive CSS, Netlify prerendered output and owner-protected `ai-issues/AD-PLACEHOLDER-SAFETY.md`. Current audited source is placeholder-only; do not claim a filled-ad lifecycle exists. Document the gap between current placeholders and actual Google-served ad readiness.

- The useful converter (input, options, output, copy/download) must be easy to reach and operate on mobile and desktop. Ads must never overlay, obscure, shift over, imitate or sit immediately against actions. Avoid accidental clicks, misleading download buttons, sticky overlays and aggressive interstitials. No ad between input and output or conversion controls.
- Build a *read-only* placement matrix for homepage, tool pages, policy/about/contact, mobile, tablet and wide desktop: top-banner, below-utility, information square, bottom-banner and side rails. Record the visible tool position, reserved space, spacing from controls, scrolling, responsive breakpoints, CLS risks, and ad density. More placements are not automatically better.
- Verify site layout using blocked scripts, no-fill, delayed fill, viewport resize, zoom, keyboard/tabbing, mobile touch and light/dark where relevant. Keep lab tests honest: placeholders cannot prove real-network safety. Record screenshots/DOM stacking evidence on realistic previews wherever possible. Reassess after genuine ad integration, *only with owner approval*.
- Do not change ad code, fill detection, consent, or placeholder suppression in unrelated SEO/UI work. Owner protection: if a first real ad has rendered, any global suppression behavior that is actually implemented must not be undone; existing documentation alone is not proof code has it. Placeholder overlay over a filled ad is prohibited.
- Before any personalized ads to EEA/UK/Switzerland users, confirm Google-certified CMP with TCF and applicable consent/privacy requirements; do not claim the site's current simple preference state suffices. No ad network calls, publisher IDs, new CMP, paid account changes, or ad serving activation without separate authorization.
- Produce a proposed ad rollout plan with policy gates, monitoring, and an explicit rollback, but do not enable anything now.

### C. Commercial measurement plan

Prepare definitions and read-only instrumentation design, without silently introducing new tracking:
- By **country, page, device**: organic landing sessions (where an authorized measurement source exists), ad-eligible pageviews, page RPM, session RPM, ad impressions, viewability, fill, and revenue. Separate Google Search clicks/impressions and Bing AI citations from monetization metrics.
- Guardrails: primary tool completion, output copy/download, bounce/engagement proxy where supported, conversion error rate, Core Web Vitals (especially LCP/INP/CLS), ad-policy/consent incidents, and URL/indexing errors.
- Report sample size, missing data and attribution limits. Do not assert higher US RPM as a site-specific fact without real ad data.
- A/B test one layout or placement at a time only once live ads are approved and valid measurement is available; revenue uplift cannot justify a compliance or accessibility regression.

## Release gating and priorities

1. **Immediately review security PR #4** separately; do not delay vulnerability patches for ad strategy.
2. Verify canonical PR #7 and other staged packages on the specific future merge SHA; preserve existing ranking winners.
3. Build Western SEO/intent corrections that have direct page-query or real usability evidence as isolated draft PRs. Keep search-visible changes in the controlled weekly lane.
4. Ad-readiness documentation, measurement design, and pre-activation safety checks can be completed NOW. Actual ad lifecycle, CMP and code activation require explicit owner authorization, real policy verification and production-representative testing; leave blocked if absent.
5. The final schedule must be set **after Codex completes all justified buildout**, not based on the provisional dates in the original release table. UI-only fixes may use a separately verified fast-track; never fast-track ad implementation via a CSS label.
6. Never modify `main` or trigger Netlify production as part of this audit/review.

## Source policies

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google Search spam policies, including scaled content abuse: https://developers.google.com/search/docs/essentials/spam-policies
- Google AdSense ad placement policies: https://support.google.com/adsense/answer/1346295
- Google Publisher Policies — ads interfering with interactions: https://support.google.com/publisherpolicies/answer/11035030
- Google AdSense certified CMP rules for EEA, UK, Switzerland: https://support.google.com/adsense/answer/13554116
