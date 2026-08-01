import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
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
  const section =
    config.match(/export const indexablePaths = \[([\s\S]*?)\] as const;/)?.[1] ??
    "";
  const indexablePaths = [...section.matchAll(/"([^"]+)"/g)].map(
    (match) => match[1],
  );
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  assert.equal(sitemapUrls.length, indexablePaths.length);
  assert.equal(new Set(sitemapUrls).size, sitemapUrls.length);
  for (const path of indexablePaths) {
    const url =
      path === "/"
        ? "https://www.alltextconverters.com"
        : `https://www.alltextconverters.com${path}`;
    assert.ok(sitemapUrls.includes(url), `${url} is missing from the sitemap`);
  }
  for (const path of [
    "/sort-list",
    "/deduplicate-list",
    "/privacy-policy",
    "/terms-of-service",
    "/cookies-policy",
  ]) {
    assert.doesNotMatch(
      sitemap,
      new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
  assert.match(
    sitemap,
    /https:\/\/www\.alltextconverters\.com\/case-insensitive-sort/,
  );
  assert.doesNotMatch(sitemap, /localhost/);
});

test("the root owns one absolute canonical system and no route adds a legacy canonical", async () => {
  const [root, routeRegistry] = await Promise.all([
    read("app/root.tsx"),
    read("app/routes.ts"),
  ]);
  const routes = await Promise.all(
    [...routeRegistry.matchAll(/"routes\/([^"]+\.tsx)"/g)].map((match) =>
      read(`app/routes/${match[1]}`),
    ),
  );
  assert.match(root, /<link rel="canonical" href=\{canonicalUrl\(pathname\)\} \/>/);
  for (const route of routes) {
    assert.doesNotMatch(route, /rel:\s*"canonical"/);
    assert.doesNotMatch(route, /localhost/);
  }
});

test("legacy aliases and trailing slashes use static Netlify redirects", async () => {
  const [netlify, routes] = await Promise.all([
    read("netlify.toml"),
    read("app/routes.ts"),
  ]);
  assert.match(
    netlify,
    /from = "\/sort-list"[\s\S]*?to = "\/case-insensitive-sort"[\s\S]*?status = 301/,
  );
  assert.match(
    netlify,
    /from = "\/deduplicate-list"[\s\S]*?to = "\/remove-duplicate-lines"[\s\S]*?status = 301/,
  );
  assert.match(
    netlify,
    /from = "\/\*\/"[\s\S]*?to = "\/:splat"[\s\S]*?status = 301/,
  );
  assert.doesNotMatch(netlify, /status = 200/);
  assert.doesNotMatch(routes, /sort-list|deduplicate-list/);
});

test("404 handling is non-indexable and fully static", async () => {
  const [notFound, static404] = await Promise.all([
    read("app/routes/not-found.tsx"),
    read("public/404.html"),
  ]);
  assert.match(notFound, /noindex,nofollow/);
  assert.doesNotMatch(notFound, /export (async )?function loader/);
  assert.doesNotMatch(notFound, /BreadcrumbList/);
  assert.match(static404, /<meta name="robots" content="noindex,nofollow"/);
  assert.match(static404, /<h1>Page not found<\/h1>/);
});

test("production architecture is prerender-only and has no server adapter", async () => {
  const [routerConfig, vite, pkg, root, routeRegistry] = await Promise.all([
    read("react-router.config.ts"),
    read("vite.config.ts"),
    read("package.json").then(JSON.parse),
    read("app/root.tsx"),
    read("app/routes.ts"),
  ]);

  assert.match(routerConfig, /ssr:\s*false/);
  assert.match(routerConfig, /prerender:\s*true/);
  assert.doesNotMatch(vite, /netlifyPlugin|@netlify/);
  assert.equal(pkg.scripts.dev, "react-router dev");
  assert.equal(pkg.scripts.start, undefined);

  const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const dependency of [
    "@netlify/vite-plugin-react-router",
    "@remix-run/netlify",
    "@react-router/express",
    "@react-router/node",
    "compression",
    "express",
    "isbot",
    "morgan",
  ]) {
    assert.equal(dependencies[dependency], undefined, `${dependency} must be removed`);
  }
  const buildEntry = await read("app/entry.server.tsx");
  assert.match(buildEntry, /renderToPipeableStream/);
  assert.match(buildEntry, /onAllReady/);
  assert.doesNotMatch(buildEntry, /@react-router\/node|express|isbot/);

  const routeSources = await Promise.all([
    Promise.resolve(root),
    ...[...routeRegistry.matchAll(/"routes\/([^"]+\.tsx)"/g)].map((match) =>
      read(`app/routes/${match[1]}`),
    ),
  ]);
  for (const source of routeSources) {
    assert.doesNotMatch(
      source,
      /export\s+(?:async\s+)?(?:function|const)\s+(?:loader|clientLoader|action|clientAction|headers)\b/,
    );
  }

  for (const removedPath of [
    "server.js",
    "server/app.ts",
    "remixconfig.js",
    ".netlify/v1/functions/react-router-server.mjs",
  ]) {
    await assert.rejects(access(new URL(`../${removedPath}`, import.meta.url)), {
      code: "ENOENT",
    });
  }
});

test("browser-side file and download capabilities remain installed", async () => {
  const pkg = JSON.parse(await read("package.json"));
  for (const dependency of ["html2canvas", "jspdf", "mammoth", "pdfjs-dist"]) {
    assert.ok(pkg.dependencies[dependency], `${dependency} must remain installed`);
  }

  const tool = await read(
    "app/client/components/counter/CounterToolCard.tsx",
  );
  for (const capability of [
    "FileReader",
    "pdfjs-dist",
    "mammoth/mammoth.browser",
    "new Blob",
    "URL.createObjectURL",
    "navigator.clipboard",
    "jspdf",
    "window.print",
  ]) {
    assert.ok(tool.includes(capability), `${capability} browser capability is missing`);
  }
});

test("async file inputs retain their DOM element before awaiting extraction", async () => {
  const componentDirectory = new URL(
    "../app/client/components/",
    import.meta.url,
  );
  const files = (await readdir(componentDirectory, { recursive: true })).filter(
    (path) => path.endsWith(".tsx"),
  );
  let asyncFileInputs = 0;
  let retainedInputs = 0;

  for (const path of files) {
    const source = await readFile(new URL(path, componentDirectory), "utf8");
    asyncFileInputs += [...source.matchAll(/onChange=\{async \(e\) => \{/g)].length;
    retainedInputs += [
      ...source.matchAll(/const inputElement = e\.currentTarget;/g),
    ].length;
  }

  assert.ok(asyncFileInputs > 0);
  assert.equal(retainedInputs, asyncFileInputs);
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
  assert.match(
    config,
    /linkedInUrl: "https:\/\/www\.linkedin\.com\/in\/s-sunder\/"/,
  );
  for (const unsupported of [
    "jobTitle",
    "alumniOf",
    "knowsAbout",
    "Ontario Tech University",
  ]) {
    assert.doesNotMatch(schema, new RegExp(unsupported));
  }
});

test("placeholder mode contains no live advertising network code", async () => {
  const ads = await read("app/client/components/advertising/AdSlot.tsx");
  assert.match(ads, /adMode: "placeholder"|Advertisement/);
  assert.doesNotMatch(ads, /adsbygoogle|pagead2\.googlesyndication/);
});

test("consent storage contains choices only and optional categories default to off", async () => {
  const consent = await read(
    "app/client/components/consent/ConsentProvider.tsx",
  );
  assert.match(consent, /analytics:\s*false/);
  assert.match(consent, /advertising:\s*false/);
  assert.match(consent, /canLoad:/);
  assert.match(
    consent,
    /const saved = \{ \.\.\.choices, \.\.\.next, essential: true \}/,
  );
  assert.match(
    consent,
    /localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(saved\)\)/,
  );
});
