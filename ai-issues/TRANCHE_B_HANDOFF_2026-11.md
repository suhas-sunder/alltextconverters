# Tranche B implementation handoff

## Staged packages

| Package | Draft and staging branch | Exact head | Acceptance |
|---|---|---|---|
| B-01 Manual display ad runtime | [#20](https://github.com/suhas-sunder/alltextconverters/pull/20), `codex/atc-b01-ads` | `d73bff5660ac5fcbc797bd9ecd2115f2b9486e89` | 44 behavior/source and 5 static tests. Mock provider in Edge covered below-utility eligibility, width, fill, no fill, failures, navigation and global placeholder suppression. [Exact preview](https://deploy-preview-20--alltextconverters.netlify.app/) |
| B-02 Google CMP and TCF boundary | [#21](https://github.com/suhas-sunder/alltextconverters/pull/21), `codex/atc-b02-consent` | `470f618d7e8b2df049b03ccbde9d60090258799d` | 46 behavior/source and 5 static tests. Mock TCF in Edge covered late initialization, refusal, withdrawal, re-opening, unknown regions and converter availability. Stacked on #20. |
| B-03 Spreadsheet workspace | [#17](https://github.com/suhas-sunder/alltextconverters/pull/17), `codex/atc-b03-table-workspace` | `430dba3211d41c79d122c88403ce81f60d185e25` | 45 behavior/source and 5 static tests. Edge covered UTF-8 CSV/TSV files, quoted and multiline fields, header and column handling, clipboard and byte-exact downloads. Stacked on #11. |
| B-04 Local batch file processing | [#19](https://github.com/suhas-sunder/alltextconverters/pull/19), `codex/atc-b04-batch-text` | `2d1ddf869ac6e5d3ff45b243f366d13a06650be9` | 44 behavior/source and 6 static tests. Edge covered the 32-file limit, malformed/oversized/empty files, cancellation, retry and ZIP integrity. [Exact preview](https://deploy-preview-19--alltextconverters.netlify.app/) |
| B-05 Multi-step text workflows | [#18](https://github.com/suhas-sunder/alltextconverters/pull/18), `codex/atc-b05-text-workflow` | `bd13c35c44061f5240b52558238392bd08a24609` | 44 behavior/source and 5 static tests. Edge covered order, undo, source preservation, errors, cancellation, UTF-8 Base64 and export. [Exact preview](https://deploy-preview-18--alltextconverters.netlify.app/) |
| B-06 Unicode print and PDF | [#24](https://github.com/suhas-sunder/alltextconverters/pull/24), `codex/atc-b06-unicode-print` | `1efdb48791acc07f47bd8ef057ef0ee5d1cbdc3e` | 42 behavior/source and 5 static tests. Six Edge routes passed isolated print preview, blocked-popup and ASCII PDF checks. A six-page fixture preserved 200 numbered lines and an 840-character wrapped token. PDF.js split a combining accent across text runs. Native save UI and full font coverage are platform-dependent. [Exact preview](https://deploy-preview-24--alltextconverters.netlify.app/) |
| B-07 Tool finder and favorites | [#23](https://github.com/suhas-sunder/alltextconverters/pull/23), `codex/atc-b07-tool-finder` | `f6fbb51f35485c7edabe9af70b292a7edb79cea8` | 43 behavior/source and 5 static tests. Edge exercised keyboard opening, search, selection, focus restoration, favorite removal and reflow. [Exact preview](https://deploy-preview-23--alltextconverters.netlify.app/) |
| B-08 Executable browser and host gate | [#25](https://github.com/suhas-sunder/alltextconverters/pull/25), `codex/atc-b08-browser-gates` | `d313227b8b2c42c472e56881be948e26a6f9219d` | Opt-in Edge/Chromium gate. Standalone preview caught inherited unknown-URL redirects, About/Contact ad placeholders and hydration errors on Case-Insensitive Sort and Comma to JSON Array. Exact #7 verified normalized hosted routing. The full combined local gate passed. [Exact QA-only preview](https://deploy-preview-25--alltextconverters.netlify.app/) |
| B-09 Aggregate measurement import | [#22](https://github.com/suhas-sunder/alltextconverters/pull/22), `codex/atc-b09-measurement` | `df95c37f01397b5040ce26e93f161fefdfc3fd24` | 46 behavior/source and 5 static tests. Authorized Search Console baseline reproduced 194 clicks, 13,880 impressions and 1.40% CTR. Other source schemas were exercised with synthetic aggregates. [Exact preview](https://deploy-preview-22--alltextconverters.netlify.app/) |
| B-10 JSON Lines workspace | [#26](https://github.com/suhas-sunder/alltextconverters/pull/26), `codex/atc-b10-json-lines` | `35d02751be956de9bd55858b15012fb147343818` | 43 behavior/source and 5 static tests. Edge verified file import, line-specific errors, Unicode, large integer fidelity, clipboard, exact downloads and both directions. Windows clipboard normalizes LF to CRLF. [Exact preview](https://deploy-preview-26--alltextconverters.netlify.app/) |

Functional browser scenarios used 320, 375, 768, 1280 and 1920 px. The external suite simulates AdSense and TCF. Actual Google creatives and a configured certified CMP require separate owner authorization. The standalone stacked previews for #17 and #21 were unavailable. Both were exercised locally and in the combined tree.

## Combined checkout

Detached integration head `9a0efa2698842476e2ff968a4e85d490b6daf4dc` in the sibling `alltextconverters-tranche-b-integration` worktree. It builds on previous combined head `822b028d0831c49ccadf73c1214e98d8243fe8da` (earlier PRs #4, #7, #9, #8, #12, #2, #11, #10, #6, #3, #5, #14 and #15). PRs #1, #13 and #16 are prior planning/readiness material. The local reference `codex/atc-tranche-b-verified` retains the detached commit.

- For AdSlot, retained normalized route blocking from #7 and the B-01 runtime import, reserved geometry and allowlist. Applied the final CMP origin guard independently of the merge that brought B-01 into B-02.
- Kept both the spreadsheet and batch suites in the text tool entry point.
- Retained canonical counter links alongside Unicode printing and preserved the existing paginated ASCII export.
- Replaced the desktop portal with the inline finder, retained #7 canonical navigation on desktop and mobile, and kept both the line break and finder regression suites.
- The remaining packages applied cleanly. B-04 reuses the existing fflate version and promotes it to a direct dependency. No other package changes the dependency graph.

Node 22.23.1. Ran `npm ci --offline --no-audit`, `npm run validate` and the opt-in browser release gate. The build passed 74 behavior/source tests and 6 static checks.

```powershell
npm ci
npm run validate
node scripts/verify-browser.mjs --playwright "$env:TEMP/atc-browser-tools/node_modules/playwright-core" --executable 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
```

The combined gate covered 52 hydrated and JavaScript-disabled prerenders, six protected converters, quoted Unicode CSV, batch ZIP, workflow restore/cancel, keyboard behavior, responsive layout, local 404s and input/ad request boundaries. Standalone host checks used exact automatic previews. Netlify's preview toolbar makes its own telemetry requests. The JSON Lines privacy smoke checked those requests for the synthetic fixture and observed no fixture data or application uploads. The combined checkout remained local, so Netlify's host-specific matrix is evidenced separately by the earlier #7 preview.

The sitemap retains 48 indexable URLs. The only new URL is `/batch-text-files/`, served with a canonical and `noindex,follow`, excluded from the sitemap. JSON Lines is an opt-in mode on the established JSON Array to List page. The November 9 baseline records 35 clicks from 822 impressions for that page without a page-query-country join. The format workflow is useful independent of geographic ranking claims. [JSON Lines specification](https://jsonlines.org/) [TableConvert workflow documentation](https://tableconvert.com/api/reference/json-to-jsonlines)

## Release gates and next step

- Omit a draft or revert its listed change to roll it back. Remove B-02 before B-01 and B-03 before its prerequisite #11. B-04's two commits must be reverted in reverse order. B-01's disabled config and emergency stop are the serving rollback gates.
- A real ad pilot needs an owner-approved AdSense property and manual below-utility unit, a reviewed Google Privacy & Messaging configuration, verified publisher/CMP identifiers and consent policy version, and separately authorized live validation. The pilot deliberately fails closed when TCF applicability or affirmative consent is absent. Other placements remain outside the pilot.
- Populate B-09 with owner-authorized GA4, AdSense, converter and field-performance aggregates. Session RPM requires linked ad earnings and eligible sessions for the same scope. No live earnings, coverage or viewability measurements were available here.
- Next development step is to run `scripts/verify-browser.mjs --normalized-host` on an authorized preview of the release candidate after its prerequisite drafts have been reviewed. Check canonicals, redirects, preview indexing headers and all six protected converters before approving any staged indexing change.

Remote `main` remained at `7189874058e86e26e8ea52d031d990f7687e517a` and the published Netlify deploy remained `6ad02cf1071723e19c0b2ecd`. Production activation and release scheduling require separate authorization.
