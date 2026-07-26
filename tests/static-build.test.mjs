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
