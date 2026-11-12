# Final commercial hardening owner review

The full integration candidate `14f560d4a8a6628f39f13651c3f4927378238f52` passed exact hosted acceptance. The early security candidate `71d556f3ef2076e52a3348cd33cf63126bfb9b6e` also passed its narrower release gate. Remote main was verified at `7189874058e86e26e8ea52d031d990f7687e517a` and the currently published Netlify deploy was verified at `6ad02cf1071723e19c0b2ecd`.

- [Full candidate draft #41](https://github.com/suhas-sunder/alltextconverters/pull/41) · [Immutable preview](https://6af52fa766b69abda0158602--alltextconverters.netlify.app/)
- [Early security review draft #42](https://github.com/suhas-sunder/alltextconverters/pull/42) · [Immutable preview](https://6af52fd831a4297b34c62aba--alltextconverters.netlify.app/)
- [Release inventory and dependency graph](FINAL_RELEASE_INVENTORY_2026-11.md)

| Action | Disposition | Evidence and remaining gate |
|---|---|---|
| F-01 CMP and GPP | Code fixed in #40 | National v1/v2 and matching CA, CO, CT, FL, VA sections pass using encoded IAB fixtures. The actual CMP tenant and regional configuration still require owner approval and provider-backed validation. |
| F-02 ad readiness | Request race fixed in #40. Live acceptance blocked. | Five-width browser rehearsal used the IAB reference CMP SDK and simulated OneTrust and ad events. Real creative and network evidence requires an approved account, region and pilot. |
| F-03 editor | Measured and retained the current editor | Native layout dominates. The tested textarea synchronization change yielded inconsistent latency and was discarded. The lab is repeatable from this branch. |
| F-04 dependencies | Four development packages patched in #39 | Both npm audits reported zero on the full and early security candidates. Exact Netlify Linux builds, file safety and browser conversion checks passed. |
| F-05 indexing | Markdown is a candidate for separate indexing review. Batch remains lower priority. | Both tools retain noindex and stay outside the 48-URL sitemap. The supplied first-party baseline predates both tools. |
| F-06 release inventory | Ready for owner review | #42 is the first exact candidate to review. Prepare fresh exact candidates for canonical/404 #7 and hydration #3 next, followed by the remaining dependencies in the inventory. |

## CMP contract and activation gate

The prior regional policy rejected National section v2, every applicable state section and the flat parsed response emitted by the IAB reference SDK. The revised gate matches the approved CMP ID, requires a ready GPP 1.1 API response, decodes the supplied string, and checks each applicable section against its parsed response. US National v1/v2 and the documented AdSense state sections are accepted only when applicable to the reviewed state and the relevant opt-out fields are explicitly clear. GPC, unsupported applicable sections, conflicting raw and parsed values, missing consent, unknown TCF, and unrelated states fail closed. The regional opt-in group and explicit outside-TCF decision still apply. The deferred AdSense unit checks permission again after the script resolves. Google privacy choices now use its supported callback queue. [AdSense GPP](https://support.google.com/adsense/answer/14126816) · [IAB CMP API](https://github.com/InteractiveAdvertisingBureau/Global-Privacy-Platform/blob/main/Core/CMP%20API%20Specification.md) · [IAB reference SDK](https://github.com/IABTechLab/iabgpp-es) · [Google Privacy & Messaging API](https://developers.google.com/funding-choices/fc-api-docs)

Google Privacy & Messaging is available inside the AdSense publisher account for European consent and supported US state messages. Its US API communicates opt-outs. The current Google adapter can follow affirmative European TCF. The Western opt-in pilot also requires separately approved regional location and affirmative purpose signals. OneTrust documents geolocation rules and GPP consent APIs, and its published CMP pricing is quote-based on visitor volume. A OneTrust implementation requires a tenant and a confirmed entitlement for the relevant features. The browser rehearsal used the actual IAB reference SDK's event producer with simulated OneTrust geolocation and group data. An approved provider tenant is still needed to confirm those fields, CMP IDs, regional selection, policy renewal and withdrawal on a real domain. [European messages](https://support.google.com/adsense/answer/10961068) · [US messages](https://support.google.com/adsense/answer/10960771) · [OneTrust GPP settings](https://docs.onetrust.com/en/consent--preferences/cookie-consent/configuring-templates-and-geolocation-rules/configuring-the-global-privacy-protocol-settings) · [OneTrust pricing](https://www.onetrust.com/pricing/)

### Owner checklist before a separately approved live pilot

1. Confirm the AdSense publisher account, approved site and exact production hostname. Verify the publisher ID and the approved below-utility unit ID for each enabled route. Review ads.txt using the account's exact entries.
2. Choose and provision the CMP. Confirm the exact approved configuration, identifiers, certified TCF coverage where required, applicable jurisdiction and GPP policies, geographic rule payloads, advertising-purpose labels, consent version and renewal behavior. Publish owner-approved disclosures and working privacy choices. Validate no grant before permission, refusal, withdrawal, GPC and location changes.
3. Review publisher and placement policies against the real site. Start with one approved below-utility placement on Home. Confirm the creative fits the measured container, no control or placeholder covers it, and copy/download targets have adequate separation. Verify the same for any later expansion to Table to List, JSON Array to List or Byte Counter. Keep wider and narrower breakpoint outcomes explicit.
4. Under separate written authorization, capture genuine network and DOM evidence for first fill, withdrawal, late or blocked scripts, no-fill, navigation, keyboard, touch and zoom. Verify page-session-wide placeholder suppression after the first confirmed fill and that the kill switch prevents new requests. Review a real creative without clicking it.
5. Record the approved release SHA, prior deploy ID, flag and rollback procedure. Keep reporting separate from tracker activation. The initial pilot remains blocked until real consent and real creative acceptance is complete. [Google-certified CMPs](https://support.google.com/adsense/answer/13554116) · [Ad placement policies](https://support.google.com/adsense/answer/1346295) · [Publisher policies](https://support.google.com/adsense/answer/10502938)

## Native editor lab

Windows, Ryzen 9 5950X, 32 GiB, headless Edge 157, 900 px viewport height and 4× Chromium CPU emulation. Measurements use exact generated multiline input, the native textarea setter, a real application input event, and two animation frames. The native comparison clones the same textarea with its layout and removes the React binding. CDP captures renderer layout, style, script and JS heap snapshots. The benchmark does not measure field INP, native allocation or a reliable p95. Each median below is three samples and the 5 MiB clipboard/download result is a single interaction per viewport. Copy time includes the browser and automation interaction and subsequent confirmation.

| Width | 10 KiB app/native ms | 100 KiB app/native ms | 1 MiB app/native ms | 5 MiB app/native ms | 5 MiB copy/download ms |
|---|---|---|---|---|---|
| 320 | 21 / 15 | 135 / 105 | 1429 / 1149 | 7216 / 5301 | 6763 / 235 |
| 375 | 24 / 15 | 119 / 105 | 1379 / 1059 | 6564 / 5502 | 6540 / 245 |
| 768 | 22 / 17 | 127 / 101 | 1356 / 1020 | 7326 / 5260 | 6261 / 208 |
| 1280 | 24 / 17 | 116 / 105 | 2324 / 1110 | 7634 / 5850 | 7251 / 265 |
| 1920 | 22 / 19 | 132 / 122 | 1454 / 1053 | 8277 / 5532 | 14857 / 364 |

At 320 px for 5 MiB, median main-thread layout/style was 3881/1594 ms and application script was 133 ms. The maximum long task per sample had a median of 6733 ms. The 5 MiB app heap delta ranged from negative after collection to about 5.3 MiB across samples. In the separate worker measurement, the synchronous postMessage call took 2.4–3.0 ms for 1 MiB and 8.5–42 ms for 5 MiB. Results returned in 256–309 ms and 958–2018 ms respectively.

A local comparison used the original editor and a prototype with a native-controlled field synchronized only for programmatic edits. At 320 px, 1 MiB changed from 1381 to 1489 ms and 5 MiB from 6835 to 6914 ms. At 1280 px, 1 MiB changed from 1493 to 1319 ms and 5 MiB from 6834 to 6765 ms. Small input stayed within 1 ms. The 5 MiB change was about 1% on desktop and slower on mobile. The prototype lowered scripting but left the native layout cost. The app code was restored to preserve existing edit, selection, CRLF and export behavior.

```powershell
node scripts/measure-native-editor.mjs --base 'https://6af526775883ae9326ed4d0b--alltextconverters.netlify.app' --playwright "$env:TEMP/atc-browser-tools/node_modules/playwright-core" --executable 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
# Add --worker-transfer to measure renderer-side postMessage and worker result timing.
# Use --width 320,1280 --kib 10,1024,5120 --app-only for the targeted comparison.
```

## Security and indexing evidence

Vite 7.3.8, nanoid 3.3.20, source-map-js 1.2.2 and undici 7.30.2 are isolated in #39. Vite's dev server/editor paths, CSS/source map tools, test DOM HTTP paths and build dependencies are distinct from the site's static publication. Published main still has the browser-document findings covered by #4. Both npm audits are clean on #42 and #41. #42 passed 41 behavior/source and five static checks. #41 passed 97 behavior/source and seven static checks plus all 46 functional indexable routes across 53 prerenders. Edge verified TXT, DOCX, multipage PDF import and PDF export at five widths. A separate external-entity DOCX test observed zero external fetches on both exact previews. XML/HTML hostile-input checks passed in source and browser fixtures. DOMPurify is a jsPDF dependency. Current app routes use the text PDF path, so this run exercised that path and the HTML inertness tests. [Vite advisory](https://github.com/advisories/GHSA-587h-7wmj-h5pm) · [Undici advisory](https://github.com/advisories/GHSA-2m5v-pch6-74hx)

Markdown handles a distinct two-way spreadsheet/docs task and has competitive evidence for paste/file, preview and export intent. The current tool's exact tested preview covers quoted multiline cells and reversible escaping. It is the stronger first indexing review candidate. Batch performs a different multi-file task with cancellation, retry and ZIP output. Competing batch tools cover broader operations. For both pages, use authorized query data or an owner-approved indexing experiment before drawing conclusions about demand. The November 9 baseline has no page-query evidence for these URLs or actual publisher earnings. The final exact preview retained both noindex pages, 48 sitemap URLs, canonical and alias handling, and real 404s. The immutable preview sent no ad, CMP or analytics requests across 53 pages, and live Home and the five other protected converters had no preview X-Robots-Tag header. [Markdown competitor](https://tableconvert.com/markdown-to-csv) · [Batch competitor](https://tools.maxhogan.dev/batch-processor/) · [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
