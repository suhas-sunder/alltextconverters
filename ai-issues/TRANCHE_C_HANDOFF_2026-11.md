# Tranche C implementation and hosted acceptance

The combined A+B+C candidate passed at `7c76a46e515eab69d57a60b3dd1ce180ae8ae142`. It is ten commits above the verified Tranche B head `9a0efa2698842476e2ff968a4e85d490b6daf4dc`. The acceptance candidate is preserved on `codex/atc-tranche-c-integration`. This handoff is a separate commit.

[Immutable Netlify deploy](https://6af526775883ae9326ed4d0b--alltextconverters.netlify.app/) · [Integration draft #37](https://github.com/suhas-sunder/alltextconverters/pull/37)

## Staged changes

| Draft | Exact package head | Delivered behavior and dependency |
|---|---|---|
| [#33](https://github.com/suhas-sunder/alltextconverters/pull/33) | `d981425d75815fb2161ec696503ab708667cc8b9` | Default-denied OneTrust adapter for reviewed US, CA, AU and NZ subdivisions. Requires an affirmative advertising choice, and a ready US National GPP signal for US traffic. Retains the B-02 TCF path. |
| [#31](https://github.com/suhas-sunder/alltextconverters/pull/31) | `5ca6cc9f3a4066b5735156cefb1531b2b4d46b93` | Per-page disabled display units for Home, Table to List, JSON Array to List and Byte Counter. One below-utility placement at 320 px of measured available width. Extends B-01. |
| [#29](https://github.com/suhas-sunder/alltextconverters/pull/29) | `a3fe2078e11b9b9a94acb76eb36565d7230423a6` | The B-03 workspace accepts inert spreadsheet HTML and quoted TSV, writes safe HTML and TSV, and falls back to manual copy. |
| [#30](https://github.com/suhas-sunder/alltextconverters/pull/30) | `6dfdce088e80ee4050bc3cab7b9d8bf7dbf1a67a` | Reversible Markdown tables and CSV/TSV with UTF-8 files, previews and export. Reuses the CSV parser from #11 and links from List to Table. |
| [#34](https://github.com/suhas-sunder/alltextconverters/pull/34) | `57bb930205e04781f737c71c2895db2c62073e95` | B-10 JSON Lines workspace exports object records to CSV/TSV with first-seen columns, exact numeric text, nested JSON cells and optional formula prefixing. |
| [#35](https://github.com/suhas-sunder/alltextconverters/pull/35) | `da61aa0a9a9be79055cdb42627b050bc732b18f3` | JSON to Text exports the displayed result and can restore the original. Text to JSON invalidates stale results and preserves legal keys. Both reuse B-06 Unicode print. |
| [#36](https://github.com/suhas-sunder/alltextconverters/pull/36) | `a0b0d17453891a8b84014255841cc5dd4b5cc23e` | The shared cleanup engine honors line-break settings. Text Cleaner retains emoji and script join controls. |
| [#38](https://github.com/suhas-sunder/alltextconverters/pull/38) | `130ee8b7a412a8f45c2800892d1efc8d29a90bed` | Large counter input uses a cancellable local worker for secondary counts, with immediate UTF-8 byte counts and a visible worker failure state. Reuses the shared metrics engine. |
| [#32](https://github.com/suhas-sunder/alltextconverters/pull/32) | `282f06e694d0a04ffae3f26e3ee0d574a0bdc1cb` | The expanded B-08 browser gate adds 147 scenarios for 46 functional routes. This QA package is separate from the eight implementation packages. |

The packages are independently staged on Tranche B. The combined preview provides hosted acceptance for the stacked drafts. To roll back an individual package, omit or revert its listed commit. For #35, revert both commits in reverse order. Its correction `da61aa0` follows `e728eec949d5821c2a110139dc01603e932dd82c`. Integration retained both the JSON and counter regression tests where they appended to the same harness.

## Verified results

- Node 22.23.1 clean install and validation passed 95 behavior and source tests plus seven static checks.
- Strict normalized-host Edge gate passed 53 prerenders with and without JavaScript. All 46 indexable functional routes passed. About and Contact were covered by page checks. No functional routes were deferred. Targeted browser tests also exercised both staged noindex tools.
- All six protected converters, real 404s, aliases, canonical redirects, robots, sitemap and indexing headers passed. The new `/markdown-table-converter/` is ad-free, `noindex,follow` and outside the sitemap. Totals are 48 sitemap URLs and five noindex pages.
- Targeted Edge runs covered 320, 375, 768, 1280 and 1920 px, including clipboard, files, exact exports, Unicode, regional refusal and withdrawal, intercepted fill/no-fill and blocked script, and cancellation. No ad, CMP or analytics requests were detected across all 53 pages of the immutable preview.
- The first combined preview found a regression in JSON to Text when a settings change could restore the prior source after a new paste. The revised candidate passed the strict fixture and five-width JSON export checks.
- A single 5 MiB desktop sample showed an 893 ms post-paint secondary-metrics long task before the worker. That task was absent after the change. Native editor layout still took about 1.5 seconds. The comparison is lab evidence.
- The production dependency audit reported zero advisories. The full audit reported four inherited development dependency advisories in nanoid, source-map-js, undici and Vite.

## Reproduce or resume

```powershell
# Node 22.23.1 and an installed Playwright Core and Edge
npm ci
npm run validate
node scripts/verify-browser.mjs --all-tools --normalized-host --base 'https://6af526775883ae9326ed4d0b--alltextconverters.netlify.app' --playwright "$env:TEMP/atc-browser-tools/node_modules/playwright-core" --executable 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
```

Review and approve each exact production candidate independently. For advertising, the remaining gates are a provisioned certified CMP, provider-confirmed subdivision payloads and default-off categories, jurisdiction-specific policy review, approved AdSense account/site/units, disclosures and applicable ads.txt, and genuine creative and withdrawal validation. The US gate requires the reviewed US National GPP setup. No live serving is enabled.

The November 9 search baseline remains historical and contains no page-query-country join or live ad earnings. Obtain approved aggregate exports before extending measurement. Review the inherited development advisories and the remaining 5 MiB native editor layout cost in isolated work. Indexing the Markdown or batch route requires separate approval.

Remote main at `7189874058e86e26e8ea52d031d990f7687e517a` and published Netlify deployment `6ad02cf1071723e19c0b2ecd` were verified after hosted acceptance.
