# Site foundation conventions

- Canonical origin: `https://www.alltextconverters.com` with no trailing slash except the homepage.
- Every new indexable route must be added to `indexablePaths` in `app/site-config.ts`; `npm run generate:sitemap` then updates the sitemap.
- Legacy routes use one permanent redirect to the closest canonical route and are never added to the sitemap.
- All route modules must remain free of loaders, actions, request middleware, and server-only imports. Hosting behavior belongs in static Netlify configuration.
- Every canonical route is prerendered to route-specific HTML. Do not add a wildcard `200` rewrite or deploy React Router's `__spa-fallback.html`.
- The root metadata system owns canonical links. Route metadata must not add a second canonical.
- Use `createPageMeta` for route title, description, Open Graph URL, social-card type, and robots. It intentionally omits a canonical because the root supplies one.
- Breadcrumb schema must match visible breadcrumbs. Do not add FAQ schema solely for rich-result hopes.
- Approved maintainer facts: Suhas Sunder builds and maintains AllTextConverters; he has a bachelor's degree in Engineering and Management and a master's degree in Electrical and Computer Engineering; approved links are the portfolio and LinkedIn URLs in `siteConfig`.
- Do not add a maintainer image or social image URL until the real asset is present and directly serves an image MIME type. The expected maintainer source is `app/client/assets/images/suhas.jpg`.
- Converter input, output, clipboard data, and filenames must never be sent to analytics, error monitoring, consent storage, or advertising integrations.
- Ad slots are placeholders only until policy and consent review approves a live integration. Never place an ad between utility controls, input/output, status, copy, or download actions.
- New indexable synonym pages require demonstrated distinct intent, input/output, validation, or workflow evidence.
- Case routes share `app/client/text/case.ts`; route-local case algorithms are not permitted. User-facing character counts use grapheme clusters, while code points, UTF-16 code units, and UTF-8 bytes remain separately labeled.
- Live counters use restrained debounced updates and never announce every keystroke. Counter text, metrics, uploads, copies, and downloads remain browser-local under the shared 100 KB / 1 MB / 5 MB size policy.
- Launch audits must preserve static output, verify generated HTML and canonical internal links, and distinguish local results from production-host verification.
- Do not send converter input, output, filenames, or clipboard data to analytics, advertising, logs, storage, error reporting, URLs, or a server. High and critical production dependency advisories require documented review before launch.

## Validation

Run `npm run validate`. There is currently no standalone lint script; do not report lint as passing unless a configured linter is added and run.
