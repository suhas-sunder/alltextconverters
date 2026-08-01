# Final launch audit

Audit date: 2026-08-01. Scope: local workspace and production-equivalent static build only. No hosted Netlify deployment, DNS, HTTP-to-HTTPS redirect, cache-header, or real-browser production verification was performed.

## Local blockers

None. `npm audit` and `npm audit --omit=dev` both report zero vulnerabilities after controlled dependency updates and a clean-lockfile installation.

## High priority

| Finding | Evidence | Action / status | Remaining risk |
| --- | --- | --- | --- |
| Production host behaviour is unverified | Deployment is performed manually by the maintainer and no hosted deployment was requested for this audit. | Manual post-deployment checklist supplied. | Redirect, HTTPS, host, header, caching, MIME, and HTTP-404 behaviour can differ from local output. |
| Static CSP is not configured | `netlify.toml` sets `nosniff`, referrer, frame, and feature-permission headers but no CSP. | Deferred deliberately: static Vite hydration, JSON-LD, workers, Blob downloads, Google Fonts, and future consent-gated advertising need a tested policy. | Introduce report-only CSP after deployment first. |

## Medium priority

| Finding | Evidence | Action / status | Remaining risk |
| --- | --- | --- | --- |
| Test runner was nondeterministic under file concurrency | A clean combined test run failed while `case-counter.behavior.test.mjs` passed directly. | Node test files now run serially through `--test-concurrency=1`. | Slower tests only. |
| Optional file libraries are large | PDF worker ~1.10 MB, Mammoth ~500 KB, jsPDF ~386 KB, html2canvas ~201 KB. | Dynamic output chunks verified; budgets documented. | Verify actual browser waterfall after deployment. |
| Vite reports large optional chunks and unused legacy React default imports | Build emits advisory warnings only; static output remains valid. | Deferred as non-blocking optimization and cleanup work. | No local functionality or static-deployment failure was observed. |

## Verified and passing

- `npm ci` completed from the committed lockfile; `npm audit` and `npm audit --omit=dev` both report zero vulnerabilities.
- Controlled upgrades: jsPDF 4.2.1; React 19.2.8; React Router and its dev package 8.3.0; Vite 7.3.6; patched transitive DOMPurify, xmldom, Underscore, PostCSS, Rollup, and tar packages.
- `npm run typecheck` passes, `npm test` passes all 42 tests, `npm run build` passes, and `npm run audit:static` passes all 4 static-output tests.
- 48 indexable canonical routes, 3 noindex policy routes, and 51 generated route HTML documents.
- Sitemap contains 48 production-host canonical URLs; `robots.txt` allows crawlers and points to the sitemap.
- Generated HTML has no missing title, description, H1, or canonical; 95 JSON-LD blocks parse as valid JSON; no localhost or Windows paths were found.
- Static deployment remains `ssr: false` and `prerender: true`; React Router's temporary build-only server directory and SPA fallback are removed before static-output validation, while Functions and Edge Functions remain absent.
- Static audit verifies canonical internal navigation, redirect avoidance, real 404 output, and distinct prerendered pages.
- No converter-path `fetch`, `XMLHttpRequest`, `sendBeacon`, live-ad identifier, or ads.txt publisher record was found in application source.
- Consent defaults optional analytics and advertising to off; consent tests verify only preference state is persisted.
- Placeholder-only ad slots remain reserved and non-focusable.
- Approved maintainer image: real 360 x 360 JPEG, 51,006 bytes; enabled from the bundled asset. Social image remains deliberately unset.

## Requires manual production verification

1. After the maintainer's manual Netlify deployment, request canonical paths, aliases, unknown routes/assets, trailing-slash, and query-string variants; record status and redirect hops.
2. Confirm Netlify serves `build/client`, applies headers, deploys no Function or Edge Function, and returns the real `404.html` with HTTP 404.
3. Verify HTTPS and non-www-to-www at Netlify/DNS.
4. Review desktop and 320/375/768/1180/1440/1800 px layouts, keyboard paths, console, requests, uploads, downloads, copy errors, and consent persistence.
5. Run lab Lighthouse on homepage, Line Break Remover, List to CSV, HTML to Text, Character Counter, and a file-capable route.

## Deliberately deferred

- Live AdSense, publisher/client IDs, slots, sellers.json, and ads.txt.
- CSP enforcement until report-only verification covers Vite hydration, inline JSON-LD, Google Fonts, workers, Blob downloads, and future consent-gated advertising.
- Browser-device and production-host testing.
- Further bundle splitting and cleanup of legacy unused default imports.

## Launch recommendation

**Ready for manual deployment, with non-blocking post-deployment verification required.** All local launch checks, static-output checks, and dependency audits pass. Hosted behaviour remains intentionally unverified until the maintainer deploys.
