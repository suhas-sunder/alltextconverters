# Owner review release inventory

Published Git base `7189874058e86e26e8ea52d031d990f7687e517a` and published Netlify deploy `6ad02cf1071723e19c0b2ecd`. This is a proposed dependency order for separately reviewed candidates. Each production increment requires owner authorization for its exact SHA.

## Isolated release patches

The delta columns show files / added lines / deleted lines. The isolated delta uses the listed patch base and exact source head. The main delta is a non-mutating three-way application of that isolated delta to the published Git base. A conflict means that exact delta needs its prerequisites or manual reconciliation before review. Prerequisites are the proposed release DAG, including behavioral and validation dependencies. Apply each row on top of then-published main with its reviewed prerequisites already present.

| Draft | Package | Exact source head | Patch base | Prerequisites | Isolated delta | Main delta | Search surface |
|---|---|---|---|---|---|---|---|
| [#4](https://github.com/suhas-sunder/alltextconverters/pull/4) | Document dependency security | `e56dc68ede4d78649f36e682c7e8d7720af74c28` | `7189874` | — | 4 / +139 / −63 | 4 / +139 / −63 | No URL changes |
| [#39](https://github.com/suhas-sunder/alltextconverters/pull/39) | Development dependency security | `49f86cfa28db3c6d07c172ee230f66143e70434b` | `7189874` | — | 1 / +12 / −12 | 1 / +12 / −12 | No runtime URL changes |
| [#7](https://github.com/suhas-sunder/alltextconverters/pull/7) | Canonical URLs, redirects and real 404 | `39d3fc1782c9f5973f6ce4143a7e1f3c57a2ffc3` | `7189874` | — | 76 / +340 / −239 | 76 / +340 / −239 | Slash canonicals, one-hop aliases, correct 404 |
| [#3](https://github.com/suhas-sunder/alltextconverters/pull/3) | Encoding/XML and hydration repairs | `4ef1561184beaa805f453a817e44b11453dae937` | `7189874` | 7 | 8 / +63 / −22 | 8 / +63 / −22 | Existing URLs, fixes two hydration failures |
| [#5](https://github.com/suhas-sunder/alltextconverters/pull/5) | Homepage editor focus | `ada4f6ad7afb71ae36df40b1e6fc2377b4df9421` | `7189874` | — | 1 / +1 / −1 | 1 / +1 / −1 | UI only |
| [#6](https://github.com/suhas-sunder/alltextconverters/pull/6) | Document import race and PDF pagination | `59b1819e892fbf7e29ba7b520fcfd99bd09879d1` | `7189874` | 4 | 3 / +69 / −74 | 3 / +69 / −74 | Existing URLs |
| [#15](https://github.com/suhas-sunder/alltextconverters/pull/15) | List to Table keyboard, import and reflow | `c85351023165ef2e81dce492c91122fb3a4b1f6f` | `7189874` | 7 | 3 / +29 / −11 | 3 / +29 / −11 | Existing protected converter |
| [#11](https://github.com/suhas-sunder/alltextconverters/pull/11) | CSV correctness | `e67ee0808d053415d93d546333fa616a26d80e37` | `7189874` | 7 | 6 / +393 / −50 | 6 / +393 / −50 | Existing list/table URLs |
| [#10](https://github.com/suhas-sunder/alltextconverters/pull/10) | Table to List accessibility | `a9285ef01faa46c016d06f4d6f8ab609cf9a82c8` | `7189874` | 7, 11 | 3 / +27 / −10 | 3 / +27 / −10 | Existing protected converter |
| [#9](https://github.com/suhas-sunder/alltextconverters/pull/9) | Byte Counter | `99e62317011eda3ecd5202dc0cc453cf5c65c6b9` | `7189874` | 7 | 3 / +87 / −10 | 3 / +87 / −10 | Existing converter usability |
| [#8](https://github.com/suhas-sunder/alltextconverters/pull/8) | Comma-list workflow intent | `535ed29a7ad8beadc26fc06ff2a0799f1db677b5` | `7189874` | 7, 11 | 14 / +144 / −129 | 14 / +144 / −129 | Existing page purpose and copy |
| [#12](https://github.com/suhas-sunder/alltextconverters/pull/12) | Line Break Remover | `c0af213c63d95b2d3dd0587b809e5fd6be8f92ef` | `7189874` | 7 | 6 / +210 / −421 | 6 / +210 / −421 | Existing converter behavior |
| [#14](https://github.com/suhas-sunder/alltextconverters/pull/14) | Converter guides | `bb8e368cb7a2990c174ffb768b4c21cb3e32f43f` | `7189874` | 3, 7, 11, 15 | 2 / +5 / −5 | 2 / +5 / −5 | Existing crawlable content |
| [#2](https://github.com/suhas-sunder/alltextconverters/pull/2) | Homepage discovery | `8c5b40566b472acbd732b9e5a2079a4ead9c4011` | `7189874` | 7, 14 | 1 / +12 / −1 | 1 / +12 / −1 | Existing contextual links |
| [#17](https://github.com/suhas-sunder/alltextconverters/pull/17) | Spreadsheet table workspace | `430dba3211d41c79d122c88403ce81f60d185e25` | `e67ee08` | 11 | 5 / +501 / −1 | Conflict | Opt-in on an existing route |
| [#18](https://github.com/suhas-sunder/alltextconverters/pull/18) | Reversible text workflow | `bd13c35c44061f5240b52558238392bd08a24609` | `7189874` | 5, 6 | 8 / +374 / −9 | 8 / +374 / −9 | Opt-in on Home |
| [#19](https://github.com/suhas-sunder/alltextconverters/pull/19) | Batch text files | `2d1ddf869ac6e5d3ff45b243f366d13a06650be9` | `7189874` | 7 | 15 / +775 / −1 | 15 / +775 / −1 | New noindex route outside sitemap |
| [#22](https://github.com/suhas-sunder/alltextconverters/pull/22) | Offline aggregate importer | `df95c37f01397b5040ce26e93f161fefdfc3fd24` | `7189874` | — | 4 / +498 / −0 | 4 / +498 / −0 | Operational CLI |
| [#23](https://github.com/suhas-sunder/alltextconverters/pull/23) | Tool finder and favorites | `f6fbb51f35485c7edabe9af70b292a7edb79cea8` | `7189874` | 7, 2 | 5 / +217 / −174 | 5 / +217 / −174 | Canonical internal links |
| [#24](https://github.com/suhas-sunder/alltextconverters/pull/24) | Unicode print and PDF | `1efdb48791acc07f47bd8ef057ef0ee5d1cbdc3e` | `7189874` | 4, 6 | 8 / +137 / −74 | 8 / +137 / −74 | Existing converter exports |
| [#25](https://github.com/suhas-sunder/alltextconverters/pull/25) | Browser and host release gate | `d313227b8b2c42c472e56881be948e26a6f9219d` | `7189874` | 7, 3 | 3 / +554 / −0 | 3 / +554 / −0 | QA only |
| [#26](https://github.com/suhas-sunder/alltextconverters/pull/26) | JSON Lines workspace | `35d02751be956de9bd55858b15012fb147343818` | `7189874` | 7, 3 | 4 / +252 / −1 | 4 / +252 / −1 | Opt-in on JSON Array to List |
| [#29](https://github.com/suhas-sunder/alltextconverters/pull/29) | Spreadsheet clipboard interoperability | `a3fe2078e11b9b9a94acb76eb36565d7230423a6` | `9a0efa2` | 17 | 3 / +292 / −2 | Conflict | Existing workspace |
| [#30](https://github.com/suhas-sunder/alltextconverters/pull/30) | Markdown table conversion | `6dfdce088e80ee4050bc3cab7b9d8bf7dbf1a67a` | `9a0efa2` | 7, 11, 15 | 10 / +746 / −0 | Conflict | New noindex route outside sitemap |
| [#34](https://github.com/suhas-sunder/alltextconverters/pull/34) | JSON Lines tabular exports | `57bb930205e04781f737c71c2895db2c62073e95` | `9a0efa2` | 26, 11 | 4 / +238 / −20 | Conflict | Existing workspace |
| [#35](https://github.com/suhas-sunder/alltextconverters/pull/35) | JSON result and key integrity | `da61aa0a9a9be79055cdb42627b050bc732b18f3` | `9a0efa2` | 3, 24 | 4 / +205 / −124 | Conflict | Existing converters |
| [#36](https://github.com/suhas-sunder/alltextconverters/pull/36) | Cleanup setting and Unicode integrity | `a0b0d17453891a8b84014255841cc5dd4b5cc23e` | `9a0efa2` | 12 | 5 / +21 / −15 | Conflict | Existing converters |
| [#38](https://github.com/suhas-sunder/alltextconverters/pull/38) | Counter worker | `130ee8b7a412a8f45c2800892d1efc8d29a90bed` | `9a0efa2` | 9, 24 | 4 / +76 / −11 | Conflict | Existing counters |
| [#32](https://github.com/suhas-sunder/alltextconverters/pull/32) | Strict all-converter acceptance | `282f06e694d0a04ffae3f26e3ee0d574a0bdc1cb` | `9a0efa2` | 25, 35, 36 | 10 / +727 / −1 | Conflict | QA only |
| [#20](https://github.com/suhas-sunder/alltextconverters/pull/20) | Disabled AdSense runtime | `d73bff5660ac5fcbc797bd9ecd2115f2b9486e89` | `7189874` | 7 | 8 / +419 / −17 | 8 / +419 / −17 | No indexed URL changes |
| [#21](https://github.com/suhas-sunder/alltextconverters/pull/21) | Disabled Google CMP and TCF adapter | `470f618d7e8b2df049b03ccbde9d60090258799d` | `d73bff5` | 20 | 5 / +241 / −3 | Conflict | No indexed URL changes |
| [#31](https://github.com/suhas-sunder/alltextconverters/pull/31) | Disabled converter ad placements | `5ca6cc9f3a4066b5735156cefb1531b2b4d46b93` | `9a0efa2` | 7, 9, 20 | 5 / +74 / −12 | Conflict | No URL changes |
| [#33](https://github.com/suhas-sunder/alltextconverters/pull/33) | Disabled regional CMP adapter | `d981425d75815fb2161ec696503ab708667cc8b9` | `9a0efa2` | 21 | 8 / +409 / −5 | Conflict | No indexed URL changes |
| [#40](https://github.com/suhas-sunder/alltextconverters/pull/40) | GPP compatibility and deferred-request guard | `8ca89f1a32095a15c6246a84bc70c71bf74e080b` | `7c76a46` | 31, 33 | 12 / +329 / −46 | Conflict | No indexed URL changes |

Patch bases resolve to published main `7189874058e86e26e8ea52d031d990f7687e517a`, #11 `e67ee0808d053415d93d546333fa616a26d80e37`, #20 `d73bff5660ac5fcbc797bd9ecd2115f2b9486e89`, Tranche B `9a0efa2698842476e2ff968a4e85d490b6daf4dc`, or Tranche C `7c76a46e515eab69d57a60b3dd1ce180ae8ae142`.

Apply only the isolated delta. For #17 use #11 as the base, for #21 use #20, and for #29–#38 use the listed Tranche B base. For #40 use the Tranche C base. A full-history merge of a stacked draft would include work outside that row. [Tranche B integration #28](https://github.com/suhas-sunder/alltextconverters/pull/28) · [Tranche C integration #37](https://github.com/suhas-sunder/alltextconverters/pull/37)

```powershell
# Run in an isolated candidate worktree rooted at current published main.
git fetch origin
git diff --binary --output="$env:TEMP/atc-reviewed-release.patch" $patchBase $sourceHead
git apply --3way --index "$env:TEMP/atc-reviewed-release.patch"
git diff --cached --check
git diff --cached --stat
# Inspect any conflicts and the staged patch before committing.
```

Use `git merge-tree --write-tree --merge-base=$patchBase origin/main $sourceHead` to reproduce the main simulation without updating refs. Review the resulting net diff and note any conflict resolution in the release draft. Store one reviewed release commit per increment so reverting that exact commit restores the preceding behavior. If multiple packages were approved together, revert in reverse dependency order.

## What can go to owner review

1. **Early security.** The two-patch candidate #42 applies only #4 and #39. It can go to owner review first. Its exact hosted build and file acceptance are in the hardening report.
2. **Foundational releases.** Prepare #7 next and #3 after it. Queue #5 as an isolated UI change if useful. File safety and table data fidelity precede workflows that use them.
3. **Independent workflows.** Approve the opt-in features one at a time after their prerequisites. The browser gate and aggregate reporting are engineering or owner tools. Give them no standalone search release date.
4. **Advertising code and activation.** Review the disabled runtime, consent adapter, placement, regional and GPP changes in dependency order. A separate owner-approved pilot needs the chosen provider and genuine creative evidence. Keep batch and Markdown indexing as separate decisions.

Planning and handoff drafts #1, #13, #16 and #27 are review records. #28, #37 and #41 are combined test evidence. #42 is a scoped early-security review candidate. Their presence in GitHub does not grant production approval.

## Exact-candidate gate and recovery

For each proposed increment, record current main, the published Netlify deploy ID, the reviewed isolated diff and the new exact preview SHA. Run Node 22.23.1 `npm ci`, `npm run validate`, both dependency audits and the relevant hosted browser checks. After the route and QA prerequisites, use `node scripts/verify-browser.mjs --all-tools --normalized-host --base <immutable-preview>`. The full inventory expects 53 prerenders, 46 functional indexable routes, targeted browser checks for both noindex tools, and 48 sitemap URLs. Earlier increments use the route count and gates appropriate to their narrower inventory.

Verify status and Location for canonicals, aliases and unknown paths, browser hydration, protected converter outputs, file privacy, preview indexing headers, and disabled provider behavior. The early security preview only tests the document patch scope. Existing main's routing remains a reason to review #7 early.

Before any separately approved production release, retain the preceding main SHA and Netlify deploy ID. After publication, verify the primary domain, key conversions and document imports, known redirects, real 404s, robots and sitemap, and the provider flag. If acceptance regresses, open a reviewed revert of that release commit. Re-verify the prior behavior on an exact preview and obtain approval before publishing the revert. No automation is required for the cadence.
