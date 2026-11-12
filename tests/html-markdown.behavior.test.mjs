import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const { outputFiles: [bundle] } = await build({
  entryPoints: [fileURLToPath(new URL("../app/client/text/html-markdown.ts", import.meta.url))],
  bundle: true, write: false, format: "esm", platform: "browser",
});
const { convertRichText } = await import("data:text/javascript;base64," + Buffer.from(bundle.contents).toString("base64"));
const { document } = new JSDOM("").window;
const toMarkdown = value => convertRichText(value, "html-to-markdown", document);
const toHtml = value => convertRichText(value, "markdown-to-html", document);
const read = html => {
  const fragment = document.createElement("template");
  fragment.innerHTML = html;
  return fragment.content;
};

test("rich-text round trip retains nested lists, headings, links, quotes, code and tables", () => {
  const input = [
    "<h2>Résumé &amp; 東京</h2>",
    '<blockquote><p>Use <strong>bold</strong> and <em>italic</em>.</p></blockquote>',
    '<ol start="3"><li>First<ul><li>Nested</li></ul></li><li>Second</li></ol>',
    '<p><a href="https://example.com/a(b)?x=1&amp;y=2" title="&quot;quoted&quot; &amp; exact">Read [this]</a></p>',
    '<pre><code class="language-js">a &lt; b\r\n  ~~~\r\n&lt;script&gt;\r\n</code></pre>',
    '<table><caption>Names</caption><thead><tr><th align="right">Name</th><th>Place</th></tr></thead><tbody><tr><td>A | B</td><td><em>London</em></td></tr></tbody></table>',
  ].join("\n");
  const { output, preview } = toMarkdown(input);
  assert.match(output, /## Résumé &amp; 東京/);
  assert.match(output, /^3\. +First/m);
  assert.match(output, /~~~~js\n/);
  assert.match(output, /A \\\| B/);
  const html = read(toHtml(output).output);
  assert.equal(html.querySelector("h2").textContent, "Résumé & 東京");
  assert.equal(html.querySelector("blockquote strong").textContent, "bold");
  assert.equal(html.querySelector("ol").getAttribute("start"), "3");
  assert.equal(html.querySelector("ol li ul li").textContent, "Nested");
  assert.equal(html.querySelector("a").getAttribute("href"), "https://example.com/a(b)?x=1&y=2");
  assert.equal(html.querySelector("a").getAttribute("title"), '"quoted" & exact');
  assert.equal(html.querySelector("pre code").textContent, "a < b\n  ~~~\n<script>\n");
  assert.equal(html.querySelector("table td").textContent, "A | B");
  assert.match(html.querySelector("th").getAttribute("style"), /text-align:right/);
  assert.equal(read(preview).querySelector("a").hasAttribute("href"), false);
});

test("inert HTML source drops resource URLs, foreign elements and active content", () => {
  const source = [
    '<base href="https://invalid.example"><link rel="stylesheet" href="https://invalid.example/style">',
    '<script>alert(1)</script><iframe src="https://invalid.example/frame"></iframe>',
    '<svg><a href="javascript:alert(1)"><text>foreign</text></a></svg><object data="//invalid.example"></object>',
    '<form action="//invalid.example"><button>send</button></form>',
    '<img alt="photo" src="https://invalid.example/tracker" onerror="alert(1)">',
    '<a href="java&#x09;script:alert(1)" onclick="alert(1)">bad link</a>',
    '<p>&lt;img src=&quot;https://invalid.example/literal&quot;&gt;</p>',
  ].join("");
  const { output, preview, notes } = toMarkdown(source);
  assert.match(output, /photo/);
  assert.match(output, /bad link/);
  assert.match(output, /&lt;img/);
  assert.doesNotMatch(output, /alert\(1\)|foreign|stylesheet|tracker/);
  assert.equal(read(preview).querySelectorAll("img,iframe,form,svg,script,a[href]").length, 0);
  assert.ok(notes.length >= 3);
});

test("Markdown input displays raw HTML as text, omits images and strips preview navigation", () => {
  const source = [
    "![safe **alt**](https://invalid.example/track)",
    "[safe](https://example.com/path) [internal](../foo#section) [mail](mailto:test@example.com)",
    "[unsafe](javascript:alert%281%29) [data](data:text/html;base64,AA==) [relative-host](//invalid.example)",
    '<img src="https://invalid.example" onerror="alert(1)">',
    '<script>alert(1)</script>',
  ].join("\n\n");
  const result = toHtml(source);
  const html = read(result.output);
  assert.equal(html.querySelectorAll("img,script").length, 0);
  assert.deepEqual([...html.querySelectorAll("a")].map(link => link.getAttribute("href")), [
    "https://example.com/path", "../foo#section", "mailto:test@example.com",
  ]);
  assert.equal(read(result.preview).querySelectorAll("[href]").length, 0);
  assert.match(html.textContent, /<script>alert\(1\)<\/script>/);
  assert.match(html.textContent, /safe/);
});

test("headerless and ragged HTML tables retain data with a blank synthetic header", () => {
  const source = "<table><tr><td>A</td><td>B</td></tr><tr><td>C</td></tr></table>";
  const { output, notes } = toMarkdown(source);
  assert.match(output, /^\|  \|  \|/);
  assert.match(output, /\| C \|  \|/);
  assert.ok(notes.some(note => /blank Markdown header/.test(note)));
  assert.deepEqual([...read(toHtml(output).output).querySelectorAll("td")].map(cell => cell.textContent), ["A", "B", "C", ""]);
  assert.throws(() => toMarkdown("<table><tr><td><table><tr><td>x</td></tr></table></td></tr></table>"), /nested tables/);
});

test("limits reject oversized, malformed Unicode and deeply nested source", () => {
  assert.throws(() => toHtml("é".repeat(65537)), /128 KiB/);
  assert.throws(() => toMarkdown("a\uD800"), /unpaired/);
  assert.throws(() => toMarkdown("<div>".repeat(50) + "x" + "</div>".repeat(50)), /48 levels/);
  assert.throws(() => toHtml("> ".repeat(60) + "quoted"), /48 levels/);
  assert.equal(toMarkdown("").output, "");
});

test("empty and whitespace-only preformatted blocks survive conversion", () => {
  for (const literal of ["", "   \t\n  \n"]) {
    const markdown = toMarkdown("<pre><code>" + literal + "</code></pre>").output;
    assert.equal(read(toHtml(markdown).output).querySelector("pre code").textContent, literal);
  }
});

test("HTML prose and inline table code survive Markdown block and image syntax", () => {
  const source = '<p>literal ~~strike~~</p><p>1) First line</p><p>!<a href="https://example.com">link</a></p>'
    + '<table><tr><th>Code</th><th>Plain</th></tr><tr><td><code>one \\| two</code></td><td>one \\| two</td></tr></table>';
  const html = read(toHtml(toMarkdown(source).output).output);
  assert.deepEqual([...html.querySelectorAll("p")].map(node => node.textContent), ["literal ~~strike~~", "1) First line", "!link"]);
  assert.equal(html.querySelector("s, ol, img"), null);
  assert.equal(html.querySelector("a").getAttribute("href"), "https://example.com");
  assert.deepEqual([...html.querySelectorAll("td")].map(node => node.textContent), ["one \\| two", "one \\| two"]);
  assert.throws(() => toMarkdown("<table><tr><td colspan=2>X</td><td>Y</td></tr></table>"), /Split merged table cells/);
  assert.throws(() => toMarkdown("<table><tr><td rowspan=0>X</td></tr></table>"), /Split merged table cells/);
});
