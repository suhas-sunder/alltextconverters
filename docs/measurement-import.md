# Offline measurement reports

Run the report with the repository's pinned Node 22. Give it one local UTF-8 JSON file per source and reporting window. Keep exports and generated reports in an owner-controlled location outside the repository and public assets.

```sh
node scripts/measurement-report.mjs search.json traffic.json adsense.json
node scripts/measurement-report.mjs --format markdown search.json traffic.json adsense.json
```

The CLI prints a report to standard output. An invalid input exits with status 1 and identifies the input or row by ordinal. File paths, unknown field names and rejected values stay out of error output. The report displays accepted aggregate values and indicates which sources are unavailable. Each file can contain 1 to 10,000 rows and up to 2 MiB. A report can combine up to 24 files and 20,000 rows.

## Prepare authorized aggregates

Export only the AllTextConverters property and use the reporting window, filters and cohort from the source. Normalize the provider's aggregate export to the version 1 structure below. This example shows the shape using the aggregate totals from the November 2026 Search Console baseline.

```json
{
  "version": 1,
  "site": "https://www.alltextconverters.com",
  "source": "search-console",
  "window": {
    "start": "2026-10-11",
    "end": "2026-11-07",
    "timeZone": "America/Los_Angeles"
  },
  "rows": [{
    "page": null,
    "country": null,
    "device": null,
    "metrics": {
      "clicks": 194,
      "impressions": 13880,
      "averagePosition": 14.18
    }
  }]
}
```

- Dates are inclusive calendar days in the source's reporting time zone. Use an IANA time zone identifier accepted by Node or `UTC`. Google Search Console uses `America/Los_Angeles`. [Search Console API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- Use `null` in each dimension for an explicitly unsplit total. Use sitemap paths for page values, such as `/table-to-list`. The same path with a trailing slash resolves to the canonical sitemap form. Use uppercase two-letter country or region codes, for example `US` for the Search Console code `usa`, and `desktop`, `mobile` or `tablet` for devices. Drop unknown and suppressed dimensions from the import. Import provider-supplied totals separately.
- Each row holds metrics for exactly its stated page, country and device together. Import country-only, device-only and page-only exports as separate rows with the other dimensions set to `null`. If an export has duplicate page variants, prepare one authorized aggregate per canonical path and segment before importing. The report does not sum rows or reconstruct combined country, page and device metrics.
- Use only these metric keys. Counts must be nonnegative safe integers. A missing metric can be omitted or set to `null`, and every row needs at least one measured value. An observed zero stays zero. Retain fractional precision for average position and CLS. Add a top-level `currency` to `adsense` and `session-revenue` files. Encode estimates in millionths of that currency as safe integers, for example 1.23 USD as 1230000, including a signed adjustment if reported.
- Exclude query text, pasted or uploaded content, filenames, URLs with query strings, account identifiers and user or session records when preparing the export. This tool reads local files and makes no network requests.

## Supported sources

| Source | Allowed fields | Calculations and meaning |
| --- | --- | --- |
| `search-console` | `clicks`, `impressions`, `averagePosition` | CTR is Google Search clicks divided by Google Search impressions. |
| `traffic` | `sessions`, `organicLandingSessions`, `engagedSessions`, `pageviews`, `adEligiblePageviews` | Organic landing and engagement rates use the same cohort's session count. The eligible pageview rate uses the same cohort's pageview count. Use a page landing dimension for session metrics and count pageviews within the same landing cohort when supplying both. |
| `adsense` | `estimatedRevenueMicros`, `pageViews`, `adImpressions`, `adRequests`, `matchedAdRequests`, `measurableImpressions`, `viewableImpressions` | Page and impression RPM use the same report's estimated earnings per thousand AdSense page views or ad impressions. Coverage is matched requests divided by requests. Viewability is viewable impressions divided by measurable impressions. [Page RPM](https://support.google.com/adsense/answer/112030), [ad RPM](https://support.google.com/adsense/answer/112032), [coverage](https://support.google.com/adsense/answer/92360), [Active View](https://support.google.com/adsense/answer/4510652) |
| `session-revenue` | `estimatedRevenueMicros`, `eligibleSessions` | Eligible session RPM is the same report's session-attributed earnings per thousand eligible sessions. Supply both measurements from an authorized linked reporting source with the same session population. AdSense retired its ad session metrics in September 2025. [AdSense announcement](https://support.google.com/adsense/announcements/9189068) |
| `converters` | `attempts`, `completedAttempts`, `erroredAttempts`, `successfulCopies`, `initiatedDownloads` | Completion and error rates use the attempt count. A completed attempt has an output and an errored attempt has a terminal error. These outcomes are disjoint. Copy and download are action counts and can exceed completed attempts. |
| `field-vitals` | `lcpP75Ms`, `inpP75Ms`, `clsP75` | Import supplied field p75 values in milliseconds for LCP and INP and a unitless value for CLS. Use the provider's actual collection period and scope. [CrUX metrics](https://developer.chrome.com/docs/crux/api) |

The report groups sources for display only when dates, time zone, canonical page, country and device all match. Every calculation uses the metrics supplied together in a single source row. Ratios are fractions in JSON and percentages in Markdown. RPMs are in units of the row's currency. A missing numerator, missing denominator or zero denominator yields an unavailable rate. Unavailable sources remain absent from the cohort. Provider counts, estimates and percentiles are reported at their supplied scope.

## Owner actions for live measurement

Supply a settled Search Console aggregate for the desired window. Supply aggregate traffic and converter exports only from an authorized analytics setup with the site's approved data handling and consent controls. Supply a property-scoped AdSense aggregate with reporting currency for ad performance. Supply eligible sessions and their attributed estimate together from an authorized linked report before measuring session RPM. Supply actual field p75 values when the provider has enough data for the requested scope.
