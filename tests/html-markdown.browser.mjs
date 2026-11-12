import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { testStagedTool } from "./staged-tool-browser.mjs";

await testStagedTool("/html-markdown-converter/", async ({ page, width, sentinel, origin }) => {
  const button = name => page.getByRole("button", { name, exact: true });
  const text = name => page.getByRole("textbox", { name, exact: true });
  const input = text("HTML source");
  const markdown = text("Markdown output");
  const html = text("HTML output");
  const hidden = "https://invalid.example/" + sentinel;
  const source = [
    '<h2>Résumé &amp; 東京</h2>',
    '<p>Private ' + sentinel + ' and <a href="https://example.com/help">link</a>.</p>',
    '<ol start="4"><li>Prepare<ul><li>Nested</li></ul></li></ol>',
    '<blockquote><p>Use <strong>bold</strong>.</p></blockquote>',
    '<pre><code class="language-js">a &lt; b\n~~~\n&lt;script&gt;\n</code></pre>',
    '<table><tr><th>A</th><th>B</th></tr><tr><td>A | B</td><td>é</td></tr></table>',
    '<svg><image href="' + hidden + '/svg"></image></svg>',
    '<style>@import url("' + hidden + '/style");</style>',
    '<link rel="stylesheet" href="' + hidden + '/stylesheet">',
    '<script>window.top.postMessage("unsafe","*")</script>',
    '<iframe src="' + hidden + '/frame"></iframe>',
    '<img alt="image text" src="' + hidden + '/img" onerror="alert(1)">',
    '<form action="' + hidden + '/form"><button>submit</button></form>',
    '<a href="java&#x09;script:alert(1)">unsafe link</a>',
  ].join("\n");
  const before = await page.evaluate(() => performance.getEntriesByType("resource").map(entry => entry.name));
  assert.ok(!before.some(name => /\/html-markdown-(?!converter-)[\w-]+\.js$/.test(name)));
  await input.fill(source);
  await button("Convert content").press("Enter");
  await page.getByRole("status").getByText("Conversion complete.").waitFor();
  const content = await markdown.inputValue();
  assert.equal(await input.inputValue(), source);
  assert.match(content, /## Résumé &amp; 東京/);
  assert.match(content, /A \\\| B/);
  assert.match(content, /image text/);
  assert.doesNotMatch(content, /invalid\.example|alert\(1\)|postMessage/);
  await button("Show safe preview").click();
  const frame = page.frameLocator('iframe[title="Safe content preview"]');
  await frame.getByRole("heading", { name: "Résumé & 東京" }).waitFor();
  assert.equal(await frame.locator("a[href], script, img, svg, iframe, form").count(), 0);
  assert.equal(await page.locator('iframe[title="Safe content preview"]').getAttribute("sandbox"), "");
  assert.equal(await frame.locator("ol ul").innerText(), "Nested");
  assert.equal(await frame.locator("table td").first().textContent(), "A | B");
  assert.match(await frame.locator("pre").innerText(), /<script>/);

  await button("Copy output").click();
  await page.getByRole("status").getByText("Output copied.").waitFor();
  assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replaceAll("\r\n", "\n"), content);
  for (const format of ["MD", "TXT"]) {
    const [file] = await Promise.all([page.waitForEvent("download"), button("Download " + format).click()]);
    assert.equal(file.suggestedFilename(), "converted-content." + format.toLowerCase());
    assert.equal(await readFile(await file.path(), "utf8"), content);
  }

  const direction = page.getByRole("combobox", { name: "Conversion direction" });
  await direction.selectOption("markdown-to-html");
  assert.equal(await page.locator("iframe").count(), 0);
  assert.equal(await html.inputValue(), "");
  const markdownSource = content + '\n\n![safe image](' + hidden + '/md)\n\n<img src="' + hidden + '/raw">\n\n[unsafe](javascript:alert%281%29)';
  await text("Markdown source").fill(markdownSource);
  await button("Convert content").click();
  await page.getByRole("status").getByText("Conversion complete.").waitFor();
  const exported = await html.inputValue();
  assert.match(exported, /<h2>Résumé &amp; 東京<\/h2>/);
  assert.match(exported, /&lt;img src=/);
  assert.doesNotMatch(exported, /<img|href="javascript:/);
  await button("Show safe preview").click();
  await frame.getByText("safe image", { exact: true }).waitFor();
  assert.equal(await frame.locator("[href],img,script").count(), 0);
  const [file] = await Promise.all([page.waitForEvent("download"), button("Download HTML").click()]);
  assert.equal(file.suggestedFilename(), "converted-content.html");
  assert.equal(await readFile(await file.path(), "utf8"), exported);

  if (width === 1280) {
    await direction.selectOption("html-to-markdown");
    await input.fill("");
    await page.getByLabel("Prefer formatted HTML when pasting").check();
    await page.evaluate(async () => {
      await navigator.clipboard.write([new ClipboardItem({
        "text/plain": new Blob(["Plain clipboard"], { type: "text/plain" }),
        "text/html": new Blob(["<p><strong>Rich clipboard</strong></p>"], { type: "text/html" }),
      })]);
    });
    await input.press("Control+v");
    await page.getByRole("status").getByText("Formatted clipboard HTML inserted.").waitFor();
    await button("Convert content").click();
    await page.getByRole("status").getByText("Conversion complete.").waitFor();
    assert.equal(await markdown.inputValue(), "**Rich clipboard**");
    await page.locator('input[type="file"]').setInputFiles({ name: "malformed.txt", mimeType: "text/plain", buffer: Buffer.from([255, 254]) });
    await page.getByRole("alert").getByText(/valid UTF-8/).waitFor();
    await input.fill("<div>".repeat(49) + "x" + "</div>".repeat(49));
    await button("Convert content").click();
    await page.getByRole("alert").getByText(/48 levels/).waitFor();
    assert.equal(await button("Download MD").count(), 0);

    await page.goto(origin + "/html-to-text/");
    await page.waitForLoadState("networkidle");
    assert.equal(await page.getByRole("link", { name: "HTML and Markdown Converter" }).getAttribute("href"), "/html-markdown-converter/");
  }
});
