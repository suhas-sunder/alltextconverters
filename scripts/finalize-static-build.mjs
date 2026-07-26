import { access, rm } from "node:fs/promises";

const clientDirectory = new URL("../build/client/", import.meta.url);
const spaFallback = new URL("__spa-fallback.html", clientDirectory);
const static404 = new URL("404.html", clientDirectory);
const serverDirectory = new URL("../build/server/", import.meta.url);

// React Router emits this opt-in fallback for partially prerendered sites. This
// deployment intentionally serves only route-specific HTML and a real 404 page.
await rm(spaFallback, { force: true });
await access(static404);

try {
  await access(serverDirectory);
  throw new Error("Static build validation failed: build/server still exists.");
} catch (error) {
  if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
    // Expected: React Router removes its build-time rendering bundle for ssr:false.
  } else {
    throw error;
  }
}
