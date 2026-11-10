import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const site = new URL(process.argv[2]);
assert.equal(site.protocol, "https:", "Supply an HTTPS Netlify Preview or production URL.");
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const expectedUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
const canonicalOrigin = new URL(expectedUrls[0]).origin;

async function check(path, status, target) {
  const url = new URL(path, site);
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
  const location = response.headers.get("location");
  const destination = location && new URL(location, url);
  console.log(path, response.status, destination?.href ?? "");
  assert.equal(response.status, status, path);
  if (target) {
    assert.equal(destination?.href, new URL(target, site).href, path);
  } else {
    assert.equal(location, null, path);
  }
  return response;
}

async function checkPage(path) {
  const response = await check(path, 200);
  const html = await response.text();
  const canonical = canonicalOrigin + path;
  const links = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(([, href]) => href);
  assert.deepEqual(links, [canonical], path);
  assert.ok(html.includes('property="og:url" content="' + canonical + '"'), path);
  if (response.headers.has("x-robots-tag")) {
    console.log(path, "X-Robots-Tag", response.headers.get("x-robots-tag"));
  }
}

await checkPage("/");
for (const path of [
  "/table-to-list",
  "/text-to-comma-separated-list",
  "/list-to-table",
  "/json-to-text",
  "/case-insensitive-sort",
  "/remove-duplicate-lines",
]) {
  await check(path, 301, path + "/");
  await checkPage(path + "/");
}
await check("/table-to-list?atc=1", 301, "/table-to-list/?atc=1");

for (const [legacy, target] of [
  ["/sort-list", "/case-insensitive-sort/"],
  ["/deduplicate-list", "/remove-duplicate-lines/"],
]) {
  await check(legacy, 301, target);
  await check(legacy + "/", 301, target);
}
for (const unknown of ["/__atc-unknown", "/__atc-unknown/"]) {
  const response = await check(unknown, 404);
  const html = await response.text();
  assert.match(html, /<h1>Page not found<\/h1>/);
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.doesNotMatch(html, /rel="canonical"/);
}

const hostedRobots = await (await check("/robots.txt", 200)).text();
assert.ok(hostedRobots.includes("Sitemap: " + canonicalOrigin + "/sitemap.xml"));
const hostedSitemap = await (await check("/sitemap.xml", 200)).text();
const hostedUrls = [...hostedSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
assert.deepEqual(hostedUrls, expectedUrls);
console.log("Verified canonical signals and", hostedUrls.length, "sitemap URLs.");
