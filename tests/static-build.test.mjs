import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

function extractPaths(config, exportName) {
  const section =
    config.match(
      new RegExp(`export const ${exportName} = \\[([\\s\\S]*?)\\] as const;`),
    )?.[1] ?? "";
  return [...section.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

async function doesNotExist(path) {
  await assert.rejects(access(new URL(path, root)), { code: "ENOENT" });
}

test("every canonical route has distinct prerendered HTML", async () => {
  const config = await read("app/site-config.ts");
  const paths = [
    ...extractPaths(config, "indexablePaths"),
    ...extractPaths(config, "noindexCanonicalPaths"),
  ];
  const hashes = new Set();

  for (const path of paths) {
    const output =
      path === "/"
        ? "build/client/index.html"
        : `build/client${path}/index.html`;
    const html = await read(output);
    const canonical =
      path === "/"
        ? "https://www.alltextconverters.com"
        : `https://www.alltextconverters.com${path}`;

    assert.match(html, /^<!DOCTYPE html>/i, `${output} is not a full HTML document`);
    assert.match(html, /<title>[^<]+<\/title>/i, `${output} has no title`);
    assert.match(html, /<meta name="description" content="[^"]+"/i, `${output} has no description`);
    assert.match(html, /<h1(?:\s[^>]*)?>/i, `${output} has no H1`);
    assert.doesNotMatch(
      html,
      /<!--\$!-->/,
      `${output} contains an incomplete Suspense boundary`,
    );
    assert.ok(
      html.includes(`rel="canonical" href="${canonical}"`),
      `${output} has the wrong canonical`,
    );
    hashes.add(createHash("sha256").update(html).digest("hex"));
  }

  assert.equal(hashes.size, paths.length, "canonical routes must not share a generic SPA shell");
});

test("the deploy directory has a real 404 and no server or SPA fallback", async () => {
  const notFound = await read("build/client/404.html");
  assert.match(notFound, /<title>Page Not Found \| AllTextConverters<\/title>/);
  assert.match(notFound, /name="robots" content="noindex,nofollow"/);
  assert.match(notFound, /<h1>Page not found<\/h1>/);

  await doesNotExist("build/server/");
  await doesNotExist("build/client/__spa-fallback.html");
  await doesNotExist("build/client/_redirects");
  await doesNotExist("build/client/sort-list/");
  await doesNotExist("build/client/deduplicate-list/");
});

test("browser-only conversion dependencies remain in the client build", async () => {
  const assets = (await readdir(new URL("build/client/assets/", root))).join("\n");
  for (const capability of [
    "html2canvas",
    "jspdf",
    "mammoth.browser",
    "pdf.worker",
  ]) {
    assert.match(assets, new RegExp(capability.replace(".", "\\."), "i"));
  }
});

test("search presentation covers canonical indexable tools with unique metadata and canonical internal links", async () => {
  const [config, presentation, redirects] = await Promise.all([
    read("app/site-config.ts"),
    read("app/client/components/content/RouteContent.tsx"),
    read("netlify.toml"),
  ]);
  const indexable = extractPaths(config, "indexablePaths");
  const titles = new Set();
  const descriptions = new Set();
  const canonical = new Set([...indexable, ...extractPaths(config, "noindexCanonicalPaths")]);
  const redirectSources = [...redirects.matchAll(/from = "([^"]+)"/g)].map((match) => match[1]);

  for (const path of indexable) {
    const output = path === "/" ? "build/client/index.html" : `build/client${path}/index.html`;
    const html = await read(output);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
    assert.ok(title, `${path} must have a title`);
    assert.ok(description, `${path} must have a description`);
    assert.ok(!titles.has(title), `${path} duplicates a title`);
    assert.ok(!descriptions.has(description), `${path} duplicates a description`);
    titles.add(title);
    descriptions.add(description);

    if (path !== "/") {
      assert.match(presentation, new RegExp(`"${path}"`), `${path} has no route-specific presentation entry`);
      assert.match(html, /Using this tool/, `${path} does not render its guide`);
    }

    for (const href of [...html.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)"/g)].map((match) => match[1])) {
      assert.ok(canonical.has(href), `${path} links to non-canonical internal path ${href}`);
      assert.ok(!redirectSources.includes(href), `${path} links through redirect ${href}`);
    }
  }
});
