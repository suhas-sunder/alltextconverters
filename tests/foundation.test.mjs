import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("site configuration uses the production HTTPS www origin", async () => {
  const config = await read("app/site-config.ts");
  assert.match(config, /origin:\s*"https:\/\/www\.alltextconverters\.com"/);
  assert.doesNotMatch(config, /localhost/);
});

test("sitemap contains only canonical indexable URLs", async () => {
  const [config, sitemap] = await Promise.all([
    read("app/site-config.ts"),
    read("public/sitemap.xml"),
  ]);
  const section = config.match(/export const indexablePaths = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  const indexablePaths = [...section.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(sitemapUrls.length, indexablePaths.length);
  assert.equal(new Set(sitemapUrls).size, sitemapUrls.length);
  for (const path of indexablePaths) {
    const url = path === "/" ? "https://www.alltextconverters.com" : `https://www.alltextconverters.com${path}`;
    assert.ok(sitemapUrls.includes(url), `${url} is missing from the sitemap`);
  }
  for (const path of ["/sort-list", "/deduplicate-list", "/privacy-policy", "/terms-of-service", "/cookies-policy"]) {
    assert.doesNotMatch(sitemap, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(sitemap, /https:\/\/www\.alltextconverters\.com\/case-insensitive-sort/);
  assert.doesNotMatch(sitemap, /localhost/);
});

test("the root owns one absolute canonical system and no route adds a legacy canonical", async () => {
  const [root, routes] = await Promise.all([
    read("app/root.tsx"),
    Promise.all((await read("app/routes.ts")).matchAll(/"routes\/([^\"]+\.tsx)"/g)).then(async (matches) =>
      Promise.all(matches.map((match) => read(`app/routes/${match[1]}`))),
    ),
  ]);
  assert.match(root, /tagName:\s*"link"/);
  assert.match(root, /href:\s*canonicalUrl\(pathname\)/);
  for (const route of routes) {
    assert.doesNotMatch(route, /rel:\s*"canonical"/);
    assert.doesNotMatch(route, /localhost/);
  }
});

test("legacy aliases use one-hop canonical redirects", async () => {
  const sortList = await read("app/routes/sort-list.tsx");
  const deduplicate = await read("app/routes/deduplicate-list.tsx");
  assert.match(sortList, /redirect\("\/case-insensitive-sort", \{ status: 301 \}\)/);
  assert.doesNotMatch(sortList, /redirect\("\/sort-list"/);
  assert.match(deduplicate, /redirect\("\/remove-duplicate-lines", \{ status: 301 \}\)/);
});

test("404 route is non-indexable and returns a 404 response", async () => {
  const notFound = await read("app/routes/not-found.tsx");
  assert.match(notFound, /status: 404/);
  assert.match(notFound, /noindex,nofollow/);
  assert.doesNotMatch(notFound, /BreadcrumbList/);
});

test("metadata does not point to a missing social preview asset", async () => {
  const routes = await read("app/routes/home.tsx");
  assert.doesNotMatch(routes, /social-preview\.png/);
});

test("maintainer schema contains only approved facts", async () => {
  const [schema, config] = await Promise.all([
    read("app/client/components/about/AboutSchema.tsx"),
    read("app/site-config.ts"),
  ]);
  assert.match(config, /maintainerName: "Suhas Sunder"/);
  assert.match(config, /linkedInUrl: "https:\/\/www\.linkedin\.com\/in\/s-sunder\/"/);
  for (const unsupported of ["jobTitle", "alumniOf", "knowsAbout", "Ontario Tech University"]) {
    assert.doesNotMatch(schema, new RegExp(unsupported));
  }
});

test("placeholder mode contains no live advertising network code", async () => {
  const ads = await read("app/client/components/advertising/AdSlot.tsx");
  assert.match(ads, /adMode: "placeholder"|Advertisement/);
  assert.doesNotMatch(ads, /adsbygoogle|pagead2\.googlesyndication/);
});

test("consent storage contains choices only and optional categories default to off", async () => {
  const consent = await read("app/client/components/consent/ConsentProvider.tsx");
  assert.match(consent, /analytics:\s*false/);
  assert.match(consent, /advertising:\s*false/);
  assert.match(consent, /canLoad:/);
  assert.match(consent, /const saved = \{ \.\.\.choices, \.\.\.next, essential: true \}/);
  assert.match(consent, /localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(saved\)\)/);
});
