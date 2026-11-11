import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { parseArgs } from "node:util";
import { verifyConversions } from "./verify-browser-conversions.mjs";

const usage = `Usage: node scripts/verify-browser.mjs [options]

  --build-dir PATH     Expected static output directory (default build/client)
  --base URL           Check this host against the build instead of serving locally
  --normalized-host    Require ATC-01 redirects on the supplied HTTPS host
  --expect-no-placeholders  Require all visible ad placeholders to be suppressed
  --playwright PATH    Installed playwright-core package path or module name
  --executable PATH    Installed Chromium-based browser executable
  --help               Print this help

PLAYWRIGHT_CORE_PATH and BROWSER_EXECUTABLE can supply the browser options.`;
const { values } = parseArgs({ options: {
  "build-dir": { type: "string", default: "build/client" },
  base: { type: "string" },
  "normalized-host": { type: "boolean" },
  "expect-no-placeholders": { type: "boolean" },
  playwright: { type: "string" },
  executable: { type: "string" },
  help: { type: "boolean" },
} });

const MIME = {
  ".css": "text/css", ".html": "text/html; charset=utf-8", ".ico": "image/x-icon",
  ".js": "text/javascript", ".json": "application/json", ".png": "image/png",
  ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8", ".webp": "image/webp",
  ".woff2": "font/woff2", ".xml": "application/xml; charset=utf-8",
};
const adHost = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|googletagservices\.com|adservice\.google\.com|adtrafficquality\.google)$/i;
const addSlash = (path) => path.endsWith("/") ? path : path + "/";
const robotsNoindex = (content = "") => /(?:^|[,\s:])noindex(?:$|[,\s])/i.test(content);
const sitemapUrls = (xml) => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(([, url]) => new URL(url));

async function findDocuments(directory, path = "/") {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.filter((entry) => entry.isDirectory()).map(
    (entry) => findDocuments(join(directory, entry.name), path + encodeURIComponent(entry.name) + "/"),
  ));
  return (entries.some((entry) => entry.isFile() && entry.name === "index.html") ? [path] : []).concat(...nested);
}

async function serveBuild(build) {
  const notFound = await readFile(join(build, "404.html"));
  const server = createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      let file = resolve(build, "." + path);
      const fromBuild = relative(build, file);
      assert.ok(!isAbsolute(fromBuild) && !fromBuild.startsWith(".."), "path stays inside static output");
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      response.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404, { "Content-Type": MIME[".html"] });
      response.end(notFound);
    }
  });
  await new Promise((ready, reject) => server.once("error", reject).listen(0, "127.0.0.1", ready));
  return { server, base: new URL("http://127.0.0.1:" + server.address().port) };
}

async function request(base, path, status, destination) {
  const url = new URL(path, base);
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20_000) });
  assert.equal(response.status, status, path);
  const location = response.headers.get("location");
  assert.equal(location && new URL(location, url).href, destination ? new URL(destination, base).href : null, path);
  return response;
}

async function verifyFiles(base, urls, canonicalOrigin, normalized) {
  const robots = await (await request(base, "/robots.txt", 200)).text();
  assert.ok(robots.split(/\r?\n/).includes("Sitemap: " + canonicalOrigin + "/sitemap.xml"), "robots.txt sitemap");
  const sitemap = await (await request(base, "/sitemap.xml", 200)).text();
  assert.deepEqual(sitemapUrls(sitemap).map(String), urls.map(String), "served sitemap matches the expected build");
  for (const path of ["/__atc-browser-gate-missing", "/__atc-browser-gate-missing/"]) {
    const html = await (await request(base, path, 404)).text();
    assert.match(html, /<h1>Page not found<\/h1>/, path);
    assert.match(html, /name="robots" content="noindex,nofollow"/, path);
    assert.doesNotMatch(html, /rel="canonical"/, path);
  }
  if (!normalized) return;
  for (const path of ["/table-to-list", "/text-to-comma-separated-list", "/list-to-table", "/json-to-text",
    "/case-insensitive-sort", "/remove-duplicate-lines"]) {
    await request(base, path, 301, path + "/");
    await (await request(base, path + "/", 200)).body.cancel();
  }
  await request(base, "/table-to-list?atc=1", 301, "/table-to-list/?atc=1");
  for (const [legacy, target] of [
    ["/sort-list", "/case-insensitive-sort/"],
    ["/deduplicate-list", "/remove-duplicate-lines/"],
  ]) {
    await request(base, legacy, 301, target);
    await request(base, legacy + "/", 301, target);
  }
}

async function readDocument(page) {
  return page.evaluate(() => {
    const values = (selector, attribute) => [...document.querySelectorAll(selector)].map(
      (element) => (attribute ? element.getAttribute(attribute) : element.textContent)?.trim(),
    );
    return {
      canonical: values('link[rel="canonical"]', "href"),
      ogUrl: values('meta[property="og:url"]', "content"),
      robots: values('meta[name="robots"]', "content"),
      descriptions: values('meta[name="description"]', "content"),
      titles: values("title"),
      headings: values("main h1"),
      mainLength: document.querySelector("main")?.textContent.trim().length ?? 0,
      links: values("a[href]", "href"),
      anchors: [...values("[id]", "id"), ...values("a[name]", "name")],
      adSlots: document.querySelectorAll('[data-ad-placement]').length,
      adLabels: document.querySelectorAll('[data-ad-placement] p').length,
      liveAds: document.querySelectorAll('ins.adsbygoogle, script[src*="adsbygoogle"]').length,
      width: document.documentElement.scrollWidth,
    };
  });
}

function verifyDocument(doc, route, canonicalOrigin, indexable, normalized) {
  assert.equal(doc.headings.length, 1, route);
  assert.ok(doc.headings[0] && doc.mainLength > 50, "visible document content");
  assert.equal(doc.titles.length, 1, "one title");
  assert.ok(doc.titles[0], "document title");
  assert.equal(doc.descriptions.length, 1, "one meta description");
  assert.ok(doc.descriptions[0], "document description");
  assert.equal(doc.robots.some(robotsNoindex), !indexable, "robots indexability");
  assert.equal(doc.canonical.length, 1, "one canonical");
  assert.equal(doc.ogUrl.length, 1, "one og:url");
  for (const value of [...doc.canonical, ...doc.ogUrl]) {
    const url = new URL(value);
    assert.equal(url.origin, canonicalOrigin, "canonical origin");
    assert.equal(url.href, normalized ? canonicalOrigin + route : canonicalOrigin + url.pathname,
      "canonical URL shape");
    assert.equal(addSlash(url.pathname), route, "canonical route");
  }
  assert.equal(doc.liveAds, 0, "live ad markup in the default release build");
  if (!indexable || route === "/about/" || route === "/contact/") assert.equal(doc.adSlots, 0, "ad slot on an excluded route");
  if (values["expect-no-placeholders"]) assert.equal(doc.adLabels, 0, "advertisement placeholder is still rendered");
  assert.ok(doc.width <= 375, `375 px viewport overflows to ${doc.width} px`);
}

function verifyLinks(doc, route, docs, base, canonicalOrigin, normalized) {
  let internalCount = 0;
  for (const link of new Set(doc.links)) {
    const url = new URL(link, new URL(route, base));
    if (url.origin !== base.origin && url.origin !== canonicalOrigin) continue;
    const target = addSlash(url.pathname);
    assert.ok(docs.has(target), `internal link ${link} has no prerendered target`);
    if (normalized) assert.equal(url.pathname, target, `internal link ${link} needs a trailing slash`);
    if (url.hash) {
      assert.ok(docs.get(target).anchors.includes(decodeURIComponent(url.hash.slice(1))),
        `internal link ${link} has no matching anchor`);
    }
    internalCount++;
  }
  assert.ok(internalCount > 0, "crawlable internal links");
}

async function setGuards(context, base, failures, javaScriptEnabled) {
  await context.route((url) => adHost.test(url.hostname), async (route) => {
    const request = route.request();
    failures.add(`${request.frame().url()}: attempted ad network request ${new URL(request.url()).hostname}`);
    await route.abort();
  });
  context.on("response", (response) => {
    const url = new URL(response.url());
    if (url.origin === base.origin && response.status() >= 400) {
      failures.add(`${response.status()} ${url.pathname}`);
    }
  });
  context.on("requestfailed", (request) => {
    const url = new URL(request.url());
    const error = request.failure()?.errorText;
    // Chromium reports script preloads blocked by its JavaScript-disabled context as CSP failures.
    if (!javaScriptEnabled && request.resourceType() === "script" && error === "csp") return;
    if (url.origin === base.origin && error !== "net::ERR_ABORTED") failures.add(`${url.pathname}: ${error}`);
  });
  context.on("page", (page) => {
    page.on("pageerror", (error) => failures.add(`${page.url()}: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource:")) {
        failures.add(`${page.url()}: ${message.text()}`);
      }
    });
  });
}

async function verifyDocuments(browser, base, routes, indexablePaths, canonicalOrigin, normalized, failures) {
  const contexts = await Promise.all([true, false].map(async (javaScriptEnabled) => {
    const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 375, height: 900 }, serviceWorkers: "block" });
    await setGuards(context, base, failures, javaScriptEnabled);
    return context;
  }));
  const docs = new Map();
  const deployPreview = /^deploy-preview-\d+--.+\.netlify\.app$/i.test(base.hostname);
  try {
    for (const [i, context] of contexts.entries()) {
      const mode = i === 0 ? "hydrated" : "JavaScript disabled";
      const found = new Map();
      const pending = [...routes];
      await Promise.all(Array.from({ length: 4 }, async () => {
        const page = await context.newPage();
        page.setDefaultTimeout(8_000);
        for (let path; (path = pending.shift());) {
          try {
            const response = await page.goto(new URL(path, base).href, { waitUntil: "networkidle", timeout: 20_000 });
            assert.equal(response?.status(), 200, "route status");
            if (deployPreview) assert.ok(robotsNoindex((await response.allHeaders())["x-robots-tag"]), "preview indexing header");
            const doc = await readDocument(page);
            found.set(path, doc);
            verifyDocument(doc, path, canonicalOrigin, indexablePaths.has(path), normalized);
            if (i === 0) {
              await page.keyboard.press("Tab");
              assert.equal(await page.evaluate(() => document.activeElement?.textContent.trim()), "Skip to content", "first tab stop");
              await page.getByRole("button", { name: "Open menu", exact: true }).press("Enter");
              await page.getByRole("dialog").waitFor();
              await page.keyboard.press("Escape");
              await page.getByRole("dialog").waitFor({ state: "hidden" });
            }
          } catch (error) {
            failures.add(`${mode} ${path}: ${error.message}`);
          }
        }
      }));
      docs.set(mode, found);
      for (const [route, doc] of found) {
        try {
          verifyLinks(doc, route, found, base, canonicalOrigin, normalized);
        } catch (error) {
          failures.add(`${mode} ${route}: ${error.message}`);
        }
      }
      console.log(`${mode}: checked ${found.size} of ${routes.length} prerendered documents at 375 px`);
    }
    const staticDocs = docs.get("JavaScript disabled");
    for (const field of ["titles", "descriptions"]) {
      const present = [...indexablePaths].map((path) => staticDocs.get(path)?.[field][0]).filter(Boolean);
      assert.equal(new Set(present).size, present.length, `unique indexable ${field}`);
    }
    await verifyConversions(contexts[0], base, routes, failures);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
}

async function main() {
  if (values.help) return console.log(usage);
  const hosted = values.base ? new URL(values.base) : null;
  if (hosted) {
    assert.ok(["https:", "http:"].includes(hosted.protocol) && hosted.href === hosted.origin + "/",
      "--base must be an HTTP(S) origin with no credentials, path, query, or fragment");
  }
  assert.ok(!values["normalized-host"] || hosted?.protocol === "https:", "--normalized-host requires an HTTPS --base");
  const require = createRequire(import.meta.url);
  const packagePath = values.playwright ?? process.env.PLAYWRIGHT_CORE_PATH ?? "playwright-core";
  const moduleName = packagePath.startsWith(".") || isAbsolute(packagePath) ? resolve(packagePath) : packagePath;
  let chromium;
  try {
    ({ chromium } = require(moduleName));
  } catch (error) {
    throw new Error("Supply an installed playwright-core with --playwright or PLAYWRIGHT_CORE_PATH.", { cause: error });
  }

  const build = resolve(values["build-dir"]);
  const [sitemap, routes] = await Promise.all([readFile(join(build, "sitemap.xml"), "utf8"), findDocuments(build)]);
  const urls = sitemapUrls(sitemap);
  const canonicalOrigin = urls[0]?.origin;
  assert.ok(canonicalOrigin && urls.every((url) => url.origin === canonicalOrigin), "sitemap URLs share the canonical origin");
  if (values["normalized-host"]) assert.ok(urls.every((url) => url.pathname.endsWith("/")), "normalized sitemap URLs");
  const indexablePaths = new Set(urls.map((url) => addSlash(url.pathname)));
  assert.equal(indexablePaths.size, urls.length, "unique sitemap routes");
  assert.ok([...indexablePaths].every((path) => routes.includes(path)), "all sitemap routes are prerendered");
  console.log(`Expected indexing footprint: ${indexablePaths.size} indexable, ${routes.length - indexablePaths.size} noindex`);

  const { base, server } = hosted ? { base: hosted } : await serveBuild(build);
  const failures = new Set();
  try {
    try {
      await verifyFiles(base, urls, canonicalOrigin, values["normalized-host"]);
    } catch (error) {
      failures.add("Host files and redirects: " + error.message);
    }
    const browser = await chromium.launch({
      executablePath: values.executable ?? process.env.BROWSER_EXECUTABLE,
      headless: true,
    });
    try {
      await verifyDocuments(browser, base, routes, indexablePaths, canonicalOrigin, values["normalized-host"], failures);
    } finally {
      await browser.close();
    }
  } finally {
    if (server) await new Promise((done) => server.close(done));
  }
  if (failures.size) {
    for (const failure of failures) console.error(failure);
    throw new Error(`${failures.size} browser or host checks failed.`);
  }
  console.log(`Browser and ${values["normalized-host"] ? "normalized host" : "static output"} checks passed.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
