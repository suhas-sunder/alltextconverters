import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";

const origin = "https://www.alltextconverters.com";
const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("staged guides ship visible input and output examples in prerendered HTML", async () => {
  const examples = [
    ["html-markdown-converter", "Convert a table with a literal pipe", /<strong>Ready<\/strong>/, /Kit \\\| Spare \| \*\*Ready\*\*/],
    ["url-query-builder", "Keep repeated tags in ordered JSON", /tag=red&tag=blue&label=A\+B&flag/, /"key": "flag",\n    "value": ""/],
    ["json-formatter", "Format JSON with two-space indentation", /"label":"\\u00E9"/, /"id": 900719925474099312345,\n  "label": "\\u00E9"/],
    ["xml-formatter", "Reindent a catalog while preserving the label text", /<catalog  owner = "team">/, /<item id="01"\/>\n  <label>Pack <b>spare<\/b> parts\.<\/label>/],
    ["markdown-table-converter", "Keep pipes and commas inside their cells", /Kit \\\| Spare/, /Kit \| Spare,"Red, blue"/],
    ["batch-text-files", "Trim the edges of each line", /^  Ada Lee  \n  North West  $/, /^Ada Lee\nNorth West$/],
  ];
  for (const [route, title, source, result] of examples) {
    const html = await read("build/client/" + route + "/index.html");
    const figure = JSDOM.fragment(html).querySelector('figure[aria-labelledby="worked-example-title"]');
    assert.equal(figure?.querySelector("figcaption")?.textContent, title, route);
    const blocks = figure.querySelectorAll("code");
    assert.equal(blocks.length, 2, route);
    assert.match(blocks[0].textContent, source, route);
    assert.match(blocks[1].textContent, result, route);
    assert.match(html, /name="robots" content="noindex,follow"/, route);
  }
  const unicode = JSDOM.fragment(await read("build/client/unicode-inspector/index.html"));
  assert.equal(unicode.querySelector('[aria-labelledby="unicode-reading"] caption code').textContent, "A💡e\u0301");
  assert.deepEqual([...unicode.querySelectorAll('[aria-labelledby="unicode-reading"] tbody tr')].map(
    (row) => [...row.cells].map((cell) => cell.textContent),
  ), [["U+0041", "0", "0"], ["U+1F4A1", "1", "1"], ["U+0065", "5", "3"], ["U+0301", "6", "4"]]);
  const diff = JSDOM.fragment(await read("build/client/text-diff/index.html"));
  assert.deepEqual([...diff.querySelectorAll('[aria-labelledby="text-diff-guide"] p code')].map((code) => code.textContent), [
    '- 2 [LF] "Payment is due in 30 days."', '+ 2 [LF] "Payment is due in 45 days."',
  ]);
  const base64 = JSDOM.fragment(await read("build/client/file-base64-converter/index.html"));
  assert.deepEqual([...base64.querySelectorAll('[aria-labelledby="file-base64-guide"] p code')].slice(-2).map((code) => code.textContent), [
    "AAECA/7/", "00 01 02 03 FE FF",
  ]);
});

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

test("dependency lock retains Linux native packages for the Vite and Tailwind build", async () => {
  const lockfile = JSON.parse(await read("package-lock.json"));
  const packages = lockfile.packages;
  const lightningcss = packages["node_modules/lightningcss"];
  const linuxLightningcss = packages["node_modules/lightningcss-linux-x64-gnu"];

  assert.ok(lightningcss?.version, "package-lock.json must contain lightningcss");
  assert.ok(
    linuxLightningcss,
    "package-lock.json must contain lightningcss-linux-x64-gnu for Netlify Linux builds",
  );
  assert.equal(
    linuxLightningcss.version,
    lightningcss.version,
    "lightningcss-linux-x64-gnu must exactly match lightningcss",
  );
  assert.match(linuxLightningcss.resolved ?? "", /lightningcss-linux-x64-gnu-/);
  assert.match(linuxLightningcss.integrity ?? "", /^sha512-/);
  assert.deepEqual(linuxLightningcss.cpu, ["x64"]);
  assert.deepEqual(linuxLightningcss.os, ["linux"]);
  assert.equal(linuxLightningcss.optional, true);

  for (const nativePackage of [
    "node_modules/@tailwindcss/oxide-linux-x64-gnu",
    "node_modules/@rollup/rollup-linux-x64-gnu",
  ]) {
    const entry = packages[nativePackage];
    assert.ok(entry, `package-lock.json must contain ${nativePackage} for Linux builds`);
    assert.match(entry.resolved ?? "", /linux-x64-gnu-/);
    assert.match(entry.integrity ?? "", /^sha512-/);
    assert.deepEqual(entry.cpu, ["x64"]);
    assert.deepEqual(entry.os, ["linux"]);
    assert.equal(entry.optional, true);
  }
});

test("every canonical route has distinct prerendered HTML", async () => {
  const config = await read("app/site-config.ts");
  const indexable = new Set(extractPaths(config, "indexablePaths"));
  const paths = [
    ...indexable,
    ...extractPaths(config, "noindexCanonicalPaths"),
  ];
  const hashes = new Set();

  for (const path of paths) {
    const output =
      path === "/"
        ? "build/client/index.html"
        : `build/client${path}/index.html`;
    const html = await read(output);
    const canonical = origin + (path === "/" ? path : path + "/");

    assert.match(html, /^<!DOCTYPE html>/i, `${output} is not a full HTML document`);
    assert.match(html, /<title>[^<]+<\/title>/i, `${output} has no title`);
    assert.match(html, /<meta name="description" content="[^"]+"/i, `${output} has no description`);
    assert.match(html, /<h1(?:\s[^>]*)?>/i, `${output} has no H1`);
    assert.doesNotMatch(
      html,
      /<p\b[^>]*>(?:(?!<\/p>)[\s\S])*?<p\b[^>]*>/i,
      output + " contains nested paragraphs",
    );
    assert.doesNotMatch(
      html,
      /<!--\$!-->/,
      `${output} contains an incomplete Suspense boundary`,
    );
    const canonicalLinks = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
    assert.deepEqual(canonicalLinks.map((match) => match[1]), [canonical], `${output} canonical`);
    assert.ok(html.includes(`property="og:url" content="${canonical}"`), `${output} Open Graph URL`);
    assert.equal([...html.matchAll(/<h1(?:\s[^>]*)?>/gi)].length, 1, `${output} H1`);
    const robots = [...html.matchAll(/<meta name="robots" content="([^"]+)"/g)].map((match) => match[1]);
    if (indexable.has(path)) {
      assert.ok(robots.length === 0 || (robots.length === 1 && /^index,\s*follow$/.test(robots[0])), output + " robots");
    } else {
      assert.deepEqual(robots, ["noindex,follow"], output + " robots");
    }

    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)]
      .flatMap(([, json]) => {
        const schema = JSON.parse(json);
        return schema["@graph"] ?? [schema];
      });
    for (const schema of schemas) {
      if (schema["@type"] === "BreadcrumbList") {
        assert.deepEqual(schema.itemListElement.map((item) => item.item), [origin + "/", canonical]);
      }
      if (schema.url?.startsWith(origin)) {
        const expected = schema["@type"] === "WebSite" ? origin + "/" : canonical;
        assert.equal(schema.url, expected);
      }
    }
    if (path === "/about" || path === "/contact") {
      assert.doesNotMatch(html, /data-ad-placement=/);
    }
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
  const assetFiles = await readdir(new URL("build/client/assets/", root));
  const assets = assetFiles.join("\n");
  for (const capability of [
    "html2canvas",
    "jspdf",
    "pdf.worker",
  ]) {
    assert.match(assets, new RegExp(capability.replace(".", "\\."), "i"));
  }

  const scripts = await Promise.all(
    assetFiles.filter((name) => name.endsWith(".js")).map((name) => read("build/client/assets/" + name)),
  );
  assert.ok(scripts.some((script) => script.includes("cannot open linked files from a web browser")));
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
  const canonical = new Set([...indexable, ...extractPaths(config, "noindexCanonicalPaths")].map((path) => path === "/" ? path : path + "/"));
  const redirectSources = [...redirects.matchAll(/from = "([^"]+)"/g)].map((match) => match[1]);

  const notFound = await read("build/client/404.html");
  for (const [, href] of notFound.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)"/g)) {
    assert.ok(canonical.has(href), "404 links to a non-canonical internal path: " + href);
  }

  for (const path of [...indexable, ...extractPaths(config, "noindexCanonicalPaths")]) {
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

    if (!["/", "/about", "/contact"].includes(path) && indexable.includes(path)) {
      assert.match(presentation, new RegExp(`"${path}"`), `${path} has no route-specific presentation entry`);
      assert.match(html, /Using this tool/, `${path} does not render its guide`);
    }

    for (const href of [...html.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)"/g)].map((match) => match[1])) {
      assert.ok(canonical.has(href), `${path} links to non-canonical internal path ${href}`);
      assert.ok(!redirectSources.includes(href), `${path} links through redirect ${href}`);
    }
  }
});

test("XML Formatter is discoverable, noindex, and omitted from sitemap and ad placement", async () => {
  const [document, sitemap, related] = await Promise.all([
    read("build/client/xml-formatter/index.html"),
    read("build/client/sitemap.xml"),
    read("build/client/xml-to-text/index.html"),
  ]);
  assert.match(document, /<h1[^>]*>XML Formatter<\/h1>/);
  assert.match(document, /<meta name="robots" content="noindex,follow"/);
  assert.match(document, /href="https:\/\/www\.alltextconverters\.com\/xml-formatter\/"/);
  assert.doesNotMatch(document, /data-ad-placement/);
  assert.doesNotMatch(sitemap, /xml-formatter/);
  assert.match(related, /<a[^>]*href="\/xml-formatter\/"[^>]*>XML Formatter<\/a>/);
});
test("the batch text workspace is prerendered, noindex, ad-free and outside the sitemap", async () => {
  const [html, sitemap] = await Promise.all([
    read("build/client/batch-text-files/index.html"),
    read("build/client/sitemap.xml"),
  ]);
  assert.match(html, /<meta name="robots" content="noindex,follow"/);
  assert.match(html, /type="file"[^>]+multiple=""/);
  assert.doesNotMatch(html, /data-ad-placement=/);
  assert.doesNotMatch(sitemap, /batch-text-files/);
});

test("JSON Formatter is prerendered and discoverable without indexing or ads", async () => {
  const [document, sitemap, related] = await Promise.all([
    read("build/client/json-formatter/index.html"),
    read("build/client/sitemap.xml"),
    read("build/client/json-to-text/index.html"),
  ]);
  assert.match(document, /<h1[^>]*>JSON Formatter<\/h1>/);
  assert.match(document, /<meta name="robots" content="noindex,follow"/);
  assert.match(document, /href="https:\/\/www\.alltextconverters\.com\/json-formatter\/"/);
  assert.doesNotMatch(document, /data-ad-placement/);
  assert.doesNotMatch(sitemap, /json-formatter/);
  assert.match(related, /<a[^>]*href="\/json-formatter\/"[^>]*>JSON Formatter<\/a>/);
});
test("the Markdown table converter is linked from List to Table and staged without indexing or ads", async () => {
  const [html, related, sitemap] = await Promise.all([
    read("build/client/markdown-table-converter/index.html"),
    read("build/client/list-to-table/index.html"),
    read("build/client/sitemap.xml"),
  ]);
  assert.match(html, /<h1[^>]*>Markdown Table Converter<\/h1>/);
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.doesNotMatch(html, /data-ad-placement=/);
  assert.match(related, /<a[^>]*href="\/markdown-table-converter\/"[^>]*>Markdown Table Converter<\/a>/);
  assert.doesNotMatch(sitemap, /markdown-table-converter/);
});

test("the task directory is linked by native navigation and remains outside the sitemap", async () => {
  const [html, home, sitemap] = await Promise.all([
    read("build/client/tools/index.html"),
    read("build/client/index.html"),
    read("build/client/sitemap.xml"),
  ]);
  assert.match(html, /<h1[^>]*>Browse tools by task<\/h1>/);
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.match(html, /<h2[^>]+id="task-review"/);
  const directory = JSDOM.fragment(html);
  const diff = directory.querySelector('a[href="/text-diff/"]');
  assert.equal(diff.textContent.trim(), "Text Diff Checker");
  const purpose = directory.getElementById(diff.getAttribute("aria-describedby"));
  assert.ok(purpose && purpose.parentElement === diff.parentElement);
  assert.match(home, /<a href="\/tools\/" aria-label="Browse tools"/);
  assert.doesNotMatch(sitemap, /alltextconverters\.com\/tools\//);
});

test("the CSV and JSON converter is linked from CSV to List and staged without indexing or ads", async () => {
  const [html, related, sitemap] = await Promise.all([
    read("build/client/csv-json-converter/index.html"),
    read("build/client/csv-to-list/index.html"),
    read("build/client/sitemap.xml"),
  ]);
  assert.match(html, /<h1[^>]*>CSV and JSON Converter<\/h1>/);
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.match(html, /href="https:\/\/www\.alltextconverters\.com\/csv-json-converter\/"/);
  assert.doesNotMatch(html, /data-ad-placement=/);
  assert.match(related, /<a[^>]*href="\/csv-json-converter\/"[^>]*>CSV and JSON Converter<\/a>/);
  assert.doesNotMatch(sitemap, /csv-json-converter/);
});

test("Compare Two Lists stages a noindex document and stays outside the sitemap", async () => {
  const [document, sitemap, related] = await Promise.all([
    read("build/client/compare-two-lists/index.html"),
    read("build/client/sitemap.xml"),
    read("build/client/remove-duplicate-lines/index.html"),
  ]);
  assert.match(document, /<h1[^>]*>Compare Two Lists<\/h1>/);
  assert.match(document, /<meta name="robots" content="noindex,follow"/);
  assert.match(document, /href="https:\/\/www\.alltextconverters\.com\/compare-two-lists\/"/);
  assert.doesNotMatch(document, /data-ad-placement/);
  assert.doesNotMatch(sitemap, /compare-two-lists/);
  assert.match(related, /<a[^>]*href="\/compare-two-lists\/"[^>]*>Compare Two Lists<\/a>/);
});

test("the text diff viewer prerenders ad-free, ships its dependency notice, and stays outside the sitemap", async () => {
  const [html, cleaner, sitemap] = await Promise.all([
    read("build/client/text-diff/index.html"),
    read("build/client/text-cleaner/index.html"),
    read("build/client/sitemap.xml"),
  ]);
  assert.match(html, /<h1[^>]*>Text Diff Checker<\/h1>/);
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.match(html, /BSD 3-Clause License/);
  assert.match(html, /Copyright \(c\) 2009-2015, Kevin Decker/);
  assert.doesNotMatch(html, /data-ad-placement=|text-diff\.worker-[^"]+\.js/);
  assert.match(cleaner, /<a[^>]*href="\/text-diff\/"[^>]*>Text Diff Checker<\/a>/);
  assert.doesNotMatch(sitemap, /text-diff/);
});

test("the file Base64 converter is linked from the text encoder and staged without indexing or ads", async () => {
  const [html, encoder, sitemap] = await Promise.all([
    read("build/client/file-base64-converter/index.html"),
    read("build/client/base64-encode/index.html"),
    read("build/client/sitemap.xml"),
  ]);
  assert.match(html, /<h1[^>]*>File to Base64 and Base64 to File<\/h1>/);
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.doesNotMatch(html, /data-ad-placement=|file-base64\.worker-[^"]+\.js/);
  assert.match(encoder, /<a[^>]*href="\/file-base64-converter\/"[^>]*>File Base64 Converter<\/a>/);
  assert.doesNotMatch(sitemap, /file-base64-converter/);
});
