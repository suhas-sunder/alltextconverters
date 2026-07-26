# AllTextConverters

Live On: https://www.AllTextConverters.com

The production site is fully prerendered and deployed from `build/client` on
Netlify. It does not use Netlify Functions, Edge Functions, React Router SSR,
or a production application server. See
[`docs/static-netlify-deployment.md`](docs/static-netlify-deployment.md) for
the architecture and validation contract.

```sh
npm ci
npm run validate
```
