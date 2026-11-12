# Search-performance baseline — AllTextConverters — 2026-11-09

**Source:** Owner-uploaded GSC Search Performance ZIP dated 2026-11-09; Bing AI Performance Overview CSV. Raw exports intentionally not added to this public GitHub repository. **These numbers are snapshots, not real-time GSC.**

## Comparable organic Google search periods

| Metric | Sep 13–Oct 10 (28d) | Oct 11–Nov 7 (28d) | Movement |
|---|---:|---:|---:|
| Clicks | 142 | 194 | +36.6% |
| Impressions | 11,586 | 13,880 | +19.8% |
| CTR | 1.226% | 1.398% | +0.172 percentage points |
| Impression-weighted avg position | 13.99 | 14.18 | broadly flat/slightly worse |

Site daily chart runs Aug 8–Nov 7 (92 days): 454 clicks / 43,230 impressions. Do not mix this three-month denominator with 28-day route totals.

## 3-month page inventory, slash variants combined for **analysis only**

| Page path (not canonical recommendation) | Clicks | Impressions | CTR | Weighted avg position |
|---|---:|---:|---:|---:|
| /table-to-list | 79 | 1,721 | 4.59% | 8.90 |
| /text-to-comma-separated-list | 35 | 7,115 | 0.49% | 13.51 |
| /json-array-to-list | 35 | 822 | 4.26% | 8.11 |
| /text-to-xml | 29 | 1,098 | 2.64% | 22.02 |
| /list-to-table | 29 | 771 | 3.76% | 19.27 |
| /json-to-text | 15 | 1,165 | 1.29% | 9.15 |
| /byte-counter | 7 | 2,656 | 0.26% | 11.55 |
| /line-break-remover | 7 | 5,023 | 0.14% | 36.84 |
| /list-to-comma-separated | 8 | 3,931 | 0.20% | 26.26 |
| homepage / | 40 | 2,960 | 1.35% | 16.99 |

Example slash split: `/table-to-list/`: 55 clicks, 1,230 impressions, position 7.81; `/table-to-list`: 24 clicks, 491 impressions, position 11.64. `/text-to-comma-separated-list/`: 30 clicks, 5,053 impressions, position 10.97; without slash: 5 clicks, 2,062 impressions, position 19.73. **Live Netlify redirects currently land on the slash form; repo sitemap/canonicals are configured non-slash.** Align signals after testing without changing pathname identity.

Queries: `byte counter` 2 clicks / 1,502 impressions / avg pos 10.20; `line removal` 0 / 3,723 / 39.58; `table to list` 11 / 63 / 4.94; `convert table to list` 7 / 32 / 4.28. Query export has only the 1,000 available rows and hides substantial anonymized traffic (94 clicks across exported queries vs 454 overall). **No page-query-pair segmentation provided.** Do not falsely infer cannibalization or route-level period changes.

Device: desktop 342 clicks / 38,510 impressions (CTR 0.89%); mobile 109 / 4,602 (2.37%). Country: US 102 / 15,932; India 39 / 3,775; Canada 24 / 1,302; UK 23 / 2,798.

## Bing distinction

The supplied Bing CSV is **AI Performance Overview Stats**, 2026-08-10 to 2026-11-06: citations and cited pages per day. Most recent Oct 10–Nov 6 (28 days) citations 494 versus Sep 12–Oct 9 citations 689, a 28.3% decline. These are not Bing organic search clicks/impressions/positions; do not conflate. Inspect AI citation performance separately, without content churn to pursue citation counts.

## Decision controls

- Protect ranking pages; do not assume shallow average site position equals failure.
- Best volume target: /text-to-comma-separated-list; meaningful overlap with /list-to-comma-separated and /list-to-csv is **unverified cannibalization**.
- Quick-win hypothesis: /byte-counter already near page one for exact query; improve intent clarity and verified UX, not filler.
- /line-break-remover has high impressions but is comparatively far from page one.
- Refresh exports only when materially stale/changed or a high-risk search decision needs them. Avoid claiming page-level week-over-week changes from aggregate exports.
