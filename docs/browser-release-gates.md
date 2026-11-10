# Browser release gates

Run this opt-in check after `npm run validate`. It uses Node 22, a separate installation of `playwright-core`, and an installed Chromium-based browser. The app and its lockfile do not install the browser tooling.

```text
node scripts/verify-browser.mjs --playwright /path/to/node_modules/playwright-core --executable /path/to/browser
```

The command serves `build/client` on an ephemeral loopback port. Use `--build-dir` to point at a different validated build. `PLAYWRIGHT_CORE_PATH` and `BROWSER_EXECUTABLE` can supply the two browser options. On Windows, quote the browser path if it contains spaces.

To verify the corresponding Netlify Deploy Preview, keep the expected build from the same commit and add the preview origin. Add `--normalized-host` after the ATC-01 URL rules are staged on that origin.

```text
node scripts/verify-browser.mjs --build-dir build/client --base https://deploy-preview-123--alltextconverters.netlify.app --normalized-host --playwright /path/to/node_modules/playwright-core --executable /path/to/browser
```

The command discovers sitemap routes and built noindex documents. It verifies crawlable HTML with JavaScript disabled, hydration with a keyboard interaction, metadata, internal link destinations and anchors, layout, and real 404 responses. Hosted checks compare the served sitemap with the build, verify preview indexing headers, and enforce the ATC-01 redirect matrix when selected. The local server cannot demonstrate Netlify redirect handling.

The six protected tools run actual conversions at a 320 px viewport and layout checks at 320, 375, 768, 1280, and 1920 px. The browser also checks a quoted Unicode CSV round trip, malformed input, a large homepage conversion, a synthetic file, and PDF download where offered. The PDF smoke test checks format and input preservation. Unicode text extraction and layout fidelity are covered by the export-specific acceptance tests. The batch smoke test runs when the batch document is present. The workflow smoke test runs when the built homepage has the advanced launcher.

The gate fails on attempted ad-network requests and intercepts those requests before they leave the browser. It also checks excluded-route ad slots and uses a synthetic marker to detect editor content in requests or web storage. Use `--expect-no-placeholders` when verifying a build configured to suppress all visible placeholders. Live ad failure and consent state coverage belongs to the ad runtime tests under `npm run validate` when those packages are present.

A failed gate exits nonzero. Record the expected build commit, the exact preview commit/status when testing a hosted deployment, the command, and any failures with the release evidence.
