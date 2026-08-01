# Launch checklist

Use this after a manual Netlify deployment. Local evidence is not hosted evidence.

- [x] Local prerender creates 51 route documents and no deployed server bundle, SPA fallback, Function, or Edge Function.
- [x] 48 sitemap URLs, unique metadata, canonical internal links, and real noindex 404 output pass static audit.
- [x] Placeholder-only advertising, consent defaults, policy routes, contact path, and maintainer information are present.
- [x] No live AdSense script, publisher ID, fake ads.txt, analytics transport, or converter transport was added.
- [x] Maintainer JPEG exists, is bundled, and is 360 x 360.
- [x] Resolve and validate dependency advisories without force or legacy peer-dependency installation; `npm audit` and `npm audit --omit=dev` report zero vulnerabilities.
- [ ] After manual deployment, verify 200 canonical routes, one-hop 301 aliases, true 404s, trailing-slash behaviour, HTTPS, and www host convention.
- [ ] Inspect headers, cache policy, workers, asset MIME types, and no Function/Edge deployment.
- [ ] Manually check responsive/keyboard behaviour at 320, 375, 768, 1180, 1440, and 1800 px.
- [ ] Run named lab Lighthouse/network checks; do not present results as field data.
- [ ] Correct remaining legacy long-form upload wording against visible converter actions.
- [ ] Test CSP as report-only after manual deployment before enforcement.
- [ ] If advertising is approved later, configure real identifiers outside source control, gate script loading on advertising consent, and create ads.txt only after account setup.
