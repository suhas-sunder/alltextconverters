import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { extname, resolve, sep } from "node:path";

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".xml": "application/xml", ".txt": "text/plain" };

export async function testStagedTool(path, exercise, { indexable = false, widths = [320, 375, 768, 1280, 1920] } = {}) {
  const [target, modulePath, executablePath] = process.argv.slice(2);
  if (!target || !modulePath || !executablePath) throw new Error("Pass the build directory or preview URL, playwright-core module and Chromium executable.");
  const { chromium } = createRequire(import.meta.url)(resolve(modulePath));
  const root = /^https?:\/\//.test(target) ? null : resolve(target);
  const server = root && createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      let file = resolve(root, "." + pathname);
      if (file !== root && !file.startsWith(root + sep)) throw new Error("Outside the build");
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      response.writeHead(200, { "Content-Type": (mime[extname(file)] ?? "application/octet-stream") + "; charset=utf-8" }).end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  if (server) await new Promise((ready, reject) => server.once("error", reject).listen(0, "127.0.0.1", ready));
  const origin = server ? "http://127.0.0.1:" + server.address().port : new URL(target).origin;
  let browser;
  try {
    browser = await chromium.launch({ executablePath, headless: true });
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 850 }, acceptDownloads: true });
      try {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        const page = await context.newPage();
        const requests = [];
        const errors = [];
        const sentinel = "PrivateStagedToolFixture123";
        page.on("request", request => requests.push({ url: request.url(), method: request.method(), body: request.postData() ?? "" }));
        page.on("pageerror", error => errors.push(String(error)));
        assert.equal((await page.goto(origin + path))?.status(), 200);
        await page.waitForLoadState("networkidle");
        const sitemap = await page.request.get(origin + "/sitemap.xml");
        assert.ok(sitemap.ok());
        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
        assert.equal((await sitemap.text()).includes("<loc>" + canonical + "</loc>"), indexable);
        const robots = await page.locator('meta[name="robots"]').getAttribute("content");
        if (indexable) {
          assert.ok(!robots?.includes("noindex"));
          assert.equal(await page.locator("ins.adsbygoogle").count(), 0);
        } else {
          assert.equal(robots, "noindex,follow");
          assert.equal(await page.locator("[data-ad-placement], ins.adsbygoogle").count(), 0);
        }
        try {
          await exercise({ page, width, sentinel, origin });
        } catch (error) {
          throw new Error(`Workflow failed at ${width}px. Browser errors: ${errors.join("; ")}`, { cause: error });
        }
        const size = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          root: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        assert.ok(size.root <= size.width && size.body <= size.width, JSON.stringify(size));
        assert.deepEqual(errors, []);
        assert.ok(requests.every(request => {
          const url = new URL(request.url);
          const font = (url.hostname === "fonts.googleapis.com" && url.pathname === "/css2")
            || (url.hostname === "fonts.gstatic.com" && url.pathname.startsWith("/s/inter/"));
          return request.method === "GET" && !request.body && !request.url.includes(sentinel) && (url.origin === origin || font);
        }), JSON.stringify(requests));
        const stored = await page.evaluate(() => JSON.stringify([localStorage, sessionStorage, document.cookie]));
        assert.ok(!stored.includes(sentinel));
        console.log(path + " browser acceptance passed at " + width + "px");
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser?.close();
    if (server) await new Promise(done => server.close(done));
  }
}
