import { access, rm } from "node:fs/promises";

const clientDirectory = new URL("../build/client/", import.meta.url);
const spaFallback = new URL("__spa-fallback.html", clientDirectory);
const static404 = new URL("404.html", clientDirectory);
const serverDirectory = new URL("../build/server/", import.meta.url);

// React Router emits this opt-in fallback for partially prerendered sites. This
// deployment intentionally serves only route-specific HTML and a real 404 page.
await rm(spaFallback, { force: true });
await access(static404);

// React Router v8 retains a temporary rendering bundle even with ssr:false.
// The Netlify publish directory is build/client, so remove that build-only
// artifact explicitly and keep the static-output test as the deployment guard.
await rm(serverDirectory, { recursive: true, force: true });
