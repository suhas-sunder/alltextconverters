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

## Functional converter acceptance

Add `--all-tools` to the browser gate to exercise all sitemap-listed conversion and analysis routes. The homepage is included. About and Contact are covered by the crawl checks. The separate browser checks for the noindex batch tool still run as part of the browser gate.

```text
node scripts/verify-browser.mjs --all-tools
node scripts/verify-browser.mjs --all-tools --base https://deploy-preview-123--alltextconverters.netlify.app --normalized-host
node scripts/verify-browser.mjs --tool /json-to-text/ --tool /text-to-json/
```

Each converter has a default fixture and at least two edge or settings fixtures. Functional actions use the 320 px viewport and keyboard activation. The suite also checks each route with a rendered result at 320, 375, 768, 1280, and 1920 px. Where the route offers copy or a text-format download, a representative fixture checks the native clipboard or downloaded bytes. The suite exercises real file selections on the homepage and Table to List. It checks that XML and HTML fixture markup cannot request the supplied external URL.

Add new routes to the fixture group under `scripts/tool-acceptance/` when they enter the sitemap. The command compares the fixture registry with the sitemap and fails on missing and obsolete fixtures. Assertions use expected results independent of the converter engines. When the UI exposes a label, reference it by name. Unlabelled legacy editors use a scoped textarea locator.

The full suite exits nonzero for functional gaps, including those that reproduce on the Tranche B reference. For baseline characterization only, `--allow-known-tool-gaps` lets an exact, documented Tranche B symptom be counted and reported without suppressing unrelated assertions. The reported route pass count excludes routes with observed gaps. Use the default strict mode to verify a release candidate. The baseline cases include JSON to Text copy and TXT export after conversion, Text to JSON invalidation after editing the source, the Remove Extra Spaces line-break setting, and preservation of the Text Cleaner family emoji.

## Combined staged acceptance

Run the entire release gate with `--all-staged`. The command exercises the indexable converter fixtures, checks every noindex page at all five widths and launches each staged workflow's functional suite. Legal pages have layout and document checks. A newly staged tool without a functional fixture fails the gate. Features that extend an existing route require their dedicated suites when the feature source is present.

```text
node scripts/verify-browser.mjs --all-staged --base https://<deploy-id>--alltextconverters.netlify.app --normalized-host
```

Read Netlify's deploy metadata to confirm the immutable URL, `commit_ref`, ready state and `deploy-preview` context before running the command. The expected build should come from that exact commit. The gate checks preview indexing headers and blocks attempted ad, CMP and analytics requests. It records same-origin HTTP failures with resource type and the Netlify request ID when available. Retain the original failure when a diagnostic rerun passes.

The HTTPS document crawl uses two concurrent readers. Each canonical URL still requires a 200 response. An unavailable document is reported by its own crawl check, so one failed fetch does not produce repeated link-target errors on every page that links to it.
