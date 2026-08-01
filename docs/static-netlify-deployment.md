# Static Netlify deployment

AllTextConverters is built as a fully prerendered React Router site. Netlify
publishes only `build/client`; ordinary requests never invoke a Function, Edge
Function, framework adapter, Express server, loader, or action.

## Architecture

| Surface | Classification after migration |
| --- | --- |
| Route components, metadata, schema, and sitemap registry | Deterministic build-time prerendering |
| Text transforms, clipboard, uploads, PDF/DOCX extraction, canvas/image export, and downloads | Browser-only logic |
| Consent preferences | Browser-only essential `localStorage` |
| Sitemap generation | Deterministic build-time script |
| Legacy aliases and trailing-slash normalization | Static Netlify 301 rules |
| Security and immutable asset caching headers | Static Netlify header rules |
| Unknown direct requests | Netlify's static `404.html` response |

The previous function path consisted of `ssr: true`, the Netlify React Router
Vite plugin, its generated `.netlify/v1/functions/react-router-server.mjs`,
the Express adapter and server, the production `build/server/server.js` import,
the root request-dependent redirect loader, two alias redirect loaders, and the
wildcard 404 loader. The legacy Remix Netlify adapter configuration and unused
server dependencies were additional obsolete deployment surfaces. All have
been removed.

React Router uses a temporary build-time rendering bundle to write each static
HTML document. The minimal `app/entry.server.tsx` uses React's built-in
streaming renderer only during that build and waits for all content before
writing each document; it does not import a server adapter or run in
production. React Router v8 retains that temporary bundle under `build/server`
even when `ssr: false`; the postbuild finalizer removes it and the optional
`__spa-fallback.html` artifact before the static-output audit runs. This
prevents the deploy directory from silently becoming a generic SPA or server
deployment.

## Build and validation

Use Node.js with the committed lockfile:

```sh
npm ci
npm run validate
```

`npm run validate` runs type generation/type checking, source tests, sitemap
generation, the production prerender build, finalization, and static-output
audits. The output audit verifies route-specific HTML, titles, descriptions,
H1s, canonicals, the standalone 404, browser conversion chunks, and the absence
of a server bundle, alias pages, `_redirects` SPA rewrite, and SPA fallback.

Netlify configuration:

- Build command: `npm run build`
- Publish directory: `build/client`
- Functions directory: none
- Edge Functions: none

The maintainer deploys the static `build/client` output to Netlify manually.
Do not add a runtime deployment trigger, Function, or Edge Function.

## Launch controls

- Preserve the fully static deployment: no catch-all `200` rewrite, runtime SSR, Functions, Edge Functions, loader, action, or converter API.
- `netlify.toml` supplies `nosniff`, strict cross-origin referrer policy, frame denial, a restrictive permissions policy, and immutable caching for hashed `/assets/*`. Verify HTML caching and host-level HTTPS/www redirects on a Deploy Preview.
- CSP is deliberately not enforced until report-only validation covers Vite hydration, inline JSON-LD, Google Fonts, workers, Blob downloads, and future consent-gated advertising.
- Never add live advertising code, ads.txt, or publisher identifiers without an approved account and explicit authorization. Future loading must remain consent-gated and exclude ineligible routes.
- Launch audits must distinguish local build evidence from hosted production evidence and review high/critical production dependency advisories.
