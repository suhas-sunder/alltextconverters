// Usage: node tests/tool-directory.browser.mjs <build/client or preview URL> <playwright-core module path> <Chromium executable>
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { createRequire } from "node:module";

const [target, playwrightPath, executablePath] = process.argv.slice(2);
if (!target || !playwrightPath || !executablePath) {
  throw new Error("Pass a local build directory or preview URL, playwright-core path and Chromium executable.");
}

async function serveStatic(root) {
  const directory = resolve(root);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".xml": "application/xml",
    ".txt": "text/plain",
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      let file = resolve(directory, "." + pathname);
      if (file !== directory && !file.startsWith(directory + sep)) throw new Error("Not found");
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      const bytes = await readFile(file);
      response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" }).end(bytes);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return { origin: "http://127.0.0.1:" + server.address().port, close: () => server.close() };
}

const local = /^https?:\/\//.test(target) ? null : await serveStatic(target);
const origin = local?.origin ?? target.replace(/\/+$/, "");
const { chromium } = createRequire(import.meta.url)(resolve(playwrightPath));
const browser = await chromium.launch({ executablePath, headless: true });



const directoryPath = "/tools/";
const nav = (page) => page.getByRole("navigation", { name: "Tasks", exact: true });
const main = (page) => page.getByRole("main");
const button = (page, name) => main(page).getByRole("button", { name, exact: true });
const textbox = (page, name) => main(page).getByRole("textbox", { name, exact: true });
const worked = (page, title) => main(page).getByRole("figure", { name: title, exact: true });

async function exampleValues(page, title) {
  const figure = worked(page, title);
  await figure.waitFor();
  const blocks = await figure.locator("code").allTextContents();
  assert.equal(blocks.length, 2);
  assert.ok(blocks.every(Boolean));
  return blocks;
}

async function unicodeOffsets(page) {
  const guide = main(page).getByRole("table", { name: /Offsets for A💡/ });
  await guide.waitFor();
  return guide.locator("tbody tr").evaluateAll((rows) => rows.map((row) => [...row.cells].map((cell) => cell.textContent)));
}

const journeys = [
  {
    task: "Compare revisions and lists", group: "review", tool: "Text Diff Checker",
    path: "/text-diff/", heading: /Text Diff Checker/, action: "Compare text",
    async complete(page) {
      await button(page, "Load example").click();
      await button(page, this.action).press("Enter");
      await main(page).getByRole("status").getByText("2 change groups. 2 removed, 2 added.").waitFor();
    },
  },
  {
    task: "Compare revisions and lists", group: "review", tool: "Compare Two Lists",
    path: "/compare-two-lists/", heading: /Compare Two Lists/i, action: "Compare lists",
    async complete(page) {
      await button(page, "Load example").click();
      await button(page, this.action).press("Enter");
      const results = main(page).getByRole("region", { name: "Comparison results", exact: true });
      await results.getByText("East", { exact: true }).first().waitFor();
      await results.getByText("West", { exact: true }).first().waitFor();
    },
  },
  {
    task: "Count and inspect text", group: "measure", tool: "Unicode Inspector",
    path: "/unicode-inspector/", heading: /Unicode Inspector/i, action: "Inspect text",
    async complete(page) {
      await textbox(page, "Source text").fill("A\u200BB");
      await button(page, this.action).press("Enter");
      await main(page).getByRole("region", { name: "Unicode inspection table" }).getByText("U+200B", { exact: true }).waitFor();
      const caption = main(page).getByRole("table", { name: /Offsets for A💡/ }).locator("caption code");
      await textbox(page, "Source text").fill(await caption.textContent());
      await button(page, this.action).press("Enter");
      const records = main(page).getByRole("region", { name: "Unicode inspection table" });
      await records.getByText("U+1F4A1", { exact: true }).waitFor();
      assert.deepEqual(await records.locator("tbody tr").evaluateAll((rows) => rows.map((row) => [
        row.cells[2].textContent, row.cells[5].textContent.split(" / ")[0], row.cells[6].textContent.split(" / ")[0],
      ])), await unicodeOffsets(page));
    },
  },
  {
    task: "Clean or format text", group: "cleanup", tool: "Line Break Remover",
    path: "/line-break-remover/", heading: /Line Break Remover/, action: "Convert",
    async complete(page) {
      await textbox(page, "Input text").fill("first line\nsecond line");
      await button(page, this.action).press("Enter");
      assert.equal(await textbox(page, "Output").inputValue(), "first line second line");
    },
  },
  {
    task: "Change letter case", group: "case", tool: "Case Converter",
    path: "/case-converter/", heading: /Case Converter/, action: "Convert",
    async complete(page) {
      await textbox(page, "Source text").fill("Café, Tokyo.");
      await main(page).getByLabel("Transformation", { exact: true }).selectOption("uppercase");
      await button(page, this.action).press("Enter");
      assert.equal(await textbox(page, "Converted text").inputValue(), "CAFÉ, TOKYO.");
    },
  },
  {
    task: "Prepare lists and spreadsheets", group: "tables", tool: "CSV and JSON Converter",
    path: "/csv-json-converter/", heading: /CSV.*JSON/i, action: "Convert table",
    async complete(page) {
      await textbox(page, "Source text").fill("sku,city\n0012,Montréal");
      await button(page, this.action).press("Enter");
      const preview = textbox(page, "Output preview");
      await preview.waitFor();
      assert.deepEqual(JSON.parse(await preview.inputValue()), [{ sku: "0012", city: "Montréal" }]);
    },
  },
  {
    task: "Encode text and URLs", group: "encoding", tool: "URL Query Builder",
    path: "/url-query-builder/", heading: /URL Query/i, action: "Load parameters",
    exampleTitle: "Keep repeated tags in ordered JSON",
    async complete(page) {
      await textbox(page, "URL or query input").fill("https://example.invalid/?tag=red&tag=blue#stay");
      await button(page, this.action).press("Enter");
      const parameters = main(page).getByRole("list", { name: "Editable parameters" });
      await parameters.getByRole("listitem").first().waitFor();
      assert.equal(await parameters.getByRole("listitem").count(), 2);
      assert.deepEqual(await parameters.locator("textarea").evaluateAll((fields) => fields.map((field) => field.value)), ["tag", "red", "tag", "blue"]);
      const [input, output] = await exampleValues(page, this.exampleTitle);
      await main(page).getByLabel("Input type", { exact: true }).selectOption("query");
      await textbox(page, "URL or query input").fill(input);
      await button(page, this.action).press("Enter");
      await main(page).getByLabel("Output format", { exact: true }).selectOption("json");
      await button(page, "Build output").click();
      assert.equal(await textbox(page, "Built output").inputValue(), output);
    },
  },
  {
    task: "Convert structured text", group: "documents", tool: "JSON to Text",
    path: "/json-to-text/", heading: /JSON to Text/i, action: "Extract values from JSON",
    async complete(page) {
      await textbox(page, "JSON input").fill('{"message":"Local task fixture"}');
      await button(page, this.action).press("Enter");
      const output = textbox(page, "Extracted text");
      await output.waitFor();
      assert.ok((await output.inputValue()).includes("Local task fixture"));
    },
  },
  {
    task: "Convert structured text", group: "documents", tool: "HTML and Markdown Converter",
    path: "/html-markdown-converter/", heading: /HTML and Markdown Converter/, action: "Convert content",
    exampleTitle: "Convert a table with a literal pipe",
    async complete(page) {
      const [html, markdown] = await exampleValues(page, this.exampleTitle);
      await textbox(page, "HTML source").fill(html);
      await button(page, this.action).press("Enter");
      await main(page).getByRole("status").getByText("Conversion complete.").waitFor();
      assert.equal(await textbox(page, "Markdown output").inputValue(), markdown);
      await main(page).getByLabel("Conversion direction", { exact: true }).selectOption("markdown-to-html");
      await textbox(page, "Markdown source").fill(markdown);
      await button(page, this.action).press("Enter");
      await main(page).getByRole("status").getByText("Conversion complete.").waitFor();
      assert.deepEqual(await textbox(page, "HTML output").evaluate((field) => {
        const document = new DOMParser().parseFromString(field.value, "text/html");
        return [document.querySelector("h2").textContent, document.querySelector("td").textContent, document.querySelector("td strong").textContent];
      }), ["Dispatch", "Kit | Spare", "Ready"]);
    },
  },
  {
    task: "Convert structured text", group: "documents", tool: "JSON Formatter",
    path: "/json-formatter/", heading: /JSON Formatter/, action: "Format JSON",
    exampleTitle: "Format JSON with two-space indentation",
    async complete(page) {
      const [source, output] = await exampleValues(page, this.exampleTitle);
      await textbox(page, "JSON source").fill(source);
      await button(page, this.action).press("Enter");
      await button(page, "Download JSON").waitFor();
      assert.equal(await textbox(page, "JSON output").inputValue(), output);
    },
  },
  {
    task: "Convert structured text", group: "documents", tool: "XML Formatter",
    path: "/xml-formatter/", heading: /XML Formatter/, action: "Format XML",
    exampleTitle: "Reindent a catalog while preserving the label text",
    async complete(page) {
      const [source, output] = await exampleValues(page, this.exampleTitle);
      await textbox(page, "XML source").fill(source);
      await main(page).getByRole("checkbox", { name: "Reindent element-only content", exact: true }).check();
      await button(page, this.action).press("Enter");
      await button(page, "Download XML").waitFor();
      assert.equal(await textbox(page, "XML output").inputValue(), output);
    },
  },
  {
    task: "Encode text and URLs", group: "encoding", tool: "File Base64 Converter",
    path: "/file-base64-converter/", heading: /File to Base64 and Base64 to File/, action: "Encode file",
    async complete(page) {
      const guide = main(page).getByRole("region", { name: "Choose a format", exact: true });
      const hex = await guide.getByText("00 01 02 03 FE FF", { exact: true }).textContent();
      const expected = await guide.getByText("AAECA/7/", { exact: true }).textContent();
      await main(page).getByLabel("Open binary file", { exact: true }).setInputFiles({
        name: "guide.bin", mimeType: "application/octet-stream", buffer: Buffer.from(hex.replaceAll(" ", ""), "hex"),
      });
      await button(page, this.action).press("Enter");
      await main(page).getByRole("status").getByText("Base64 is ready.").waitFor();
      assert.equal(await main(page).getByLabel("Base64 preview").textContent(), expected);
    },
  },
];

async function tabTo(page, locator, maximum = 28) {
  assert.ok(await locator.isVisible());
  for (let i = 0; i < maximum; i += 1) {
    if (await locator.evaluate((element) => element === document.activeElement)) return i;
    await page.keyboard.press("Tab");
  }
  throw new Error("Tab order did not reach " + await locator.textContent());
}

async function reflow(page) {
  const widths = await page.evaluate(() => [document.documentElement.clientWidth, document.documentElement.scrollWidth, document.body.scrollWidth]);
  assert.ok(widths[1] <= widths[0] && widths[2] <= widths[0], page.url() + " overflow " + JSON.stringify(widths));
}

function headerBrowse(page) {
  return page.getByRole("banner").getByRole("link", { name: "Browse tools", exact: true });
}

async function proveAdOrder(page, control) {
  const action = await control.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
  });
  const visibleSlots = await page.locator("[data-ad-placement]").evaluateAll((slots) => slots.flatMap((slot) => {
    const rect = slot.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 ? [{
      top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right,
      label: slot.getAttribute("data-ad-placement"), liveHost: Boolean(slot.querySelector("[data-ad-state]")),
    }] : [];
  }));
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  if (robots?.includes("noindex")) assert.deepEqual(visibleSlots, [], "staged tools carry no ad placements");
  for (const slot of visibleSlots) {
    const beside = slot.right <= action.left || slot.left >= action.right;
    assert.ok(beside || slot.bottom <= action.top || slot.top >= action.bottom, "placement intersects the primary action " + JSON.stringify(slot));
    if (!beside && slot.top < action.top) {
      // Legacy indexable pages can retain the root placeholder. A live host cannot precede controls.
      assert.equal(slot.label, "top-banner");
      assert.equal(slot.liveHost, false);
    }
  }
  return visibleSlots.length;
}

async function journey(context, spec, enabled, checkReturn) {
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  const errors = [];
  const navigation = [];
  const forbiddenRequests = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("request", (request) => {
    const address = request.url() + " " + (request.postData() ?? "");
    if (/googlesyndication|doubleclick|google-analytics|consentmanager|example\.invalid|Local.task.fixture/i.test(address)) forbiddenRequests.push(address);
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigation.push([new URL(request.url()).pathname, request.redirectedFrom()?.url() ?? null]);
    }
  });
  assert.equal((await page.goto(origin + "/"))?.status(), 200);
  const home = headerBrowse(page);
  await tabTo(page, home);
  assert.notEqual(await home.evaluate((element) => getComputedStyle(element).outlineStyle), "none");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/tools/");
  assert.equal(await headerBrowse(page).getAttribute("aria-current"), "page");
  assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex,follow");
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://www.alltextconverters.com/tools/");
  assert.equal(await main(page).locator("[data-ad-placement]").count(), 0);
  assert.equal(await main(page).getByRole("searchbox").count(), 0);
  await reflow(page);

  const task = nav(page).getByRole("link", { name: spec.task, exact: true });
  await tabTo(page, task);
  await page.keyboard.press("Enter");
  await page.waitForURL("**/tools/#task-" + spec.group);
  const active = main(page).getByRole("heading", { name: spec.task, exact: true });
  assert.ok(await active.evaluate((element) => element === document.activeElement), "task heading receives fragment focus");
  const group = main(page).getByRole("region", { name: spec.task, exact: true });
  const link = group.getByRole("link", { name: spec.tool, exact: true });
  await tabTo(page, link, 16);
  assert.notEqual(await link.evaluate((element) => getComputedStyle(element, "::after").outlineStyle), "none");
  await page.keyboard.press("Enter");
  await page.waitForURL("**" + spec.path);
  await main(page).getByRole("heading", { level: 1, name: spec.heading }).waitFor();
  const action = button(page, spec.action);
  await action.waitFor();
  const visibleSlots = await proveAdOrder(page, action);
  assert.deepEqual(navigation, [["/", null], [directoryPath, null], [spec.path, null]]);
  if (enabled) {
    await page.waitForLoadState("networkidle");
    await spec.complete(page);
    assert.equal(await proveAdOrder(page, action), visibleSlots);
  } else {
    if (spec.exampleTitle) await exampleValues(page, spec.exampleTitle);
    if (spec.path === "/unicode-inspector/") {
      assert.deepEqual(await unicodeOffsets(page), [["U+0041", "0", "0"], ["U+1F4A1", "1", "1"], ["U+0065", "5", "3"], ["U+0301", "6", "4"]]);
    }
    if (spec.path === "/file-base64-converter/") await main(page).getByText("00 01 02 03 FE FF", { exact: true }).waitFor();
  }
  await reflow(page);

  if (checkReturn) {
    await page.goBack();
    await page.waitForURL("**/tools/#task-" + spec.group);
    await link.waitFor();
    const back = group.getByRole("link", { name: "Back to tasks", exact: true });
    await back.focus();
    await page.keyboard.press("Enter");
    await page.waitForURL("**/tools/#tool-tasks");
    assert.ok(await main(page).getByRole("heading", { name: "Tasks", exact: true }).evaluate((element) => element === document.activeElement));
  }

  assert.deepEqual(errors, []);
  assert.deepEqual(forbiddenRequests, []);
  await page.close();
  return visibleSlots;
}

try {
  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const directory = await plain.newPage();
  assert.equal((await directory.goto(origin + directoryPath))?.status(), 200);
  const canonicalLinks = await main(directory).locator('section a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  assert.ok(canonicalLinks.length >= 56);
  assert.equal(new Set(canonicalLinks).size, canonicalLinks.length);
  for (const path of canonicalLinks) assert.match(path, /^\/[a-z0-9-]+\/$/);
  for (let index = 0; index < canonicalLinks.length; index += 4) {
    await Promise.all(canonicalLinks.slice(index, index + 4).map(async (path) => {
      const response = await directory.request.get(origin + path, { maxRedirects: 0 });
      assert.equal(response.status(), 200, path);
      assert.equal(new URL(response.url()).pathname, path);
      assert.equal(response.headers().location, undefined);
      const html = await response.text();
      assert.ok(html.includes('rel="canonical" href="https://www.alltextconverters.com' + path + '"'), path + " canonical");
    }));
  }
  const sitemap = await (await directory.request.get(origin + "/sitemap.xml")).text();
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 48);
  assert.ok(!sitemap.includes("alltextconverters.com/tools/"));
  const diff = main(directory).getByRole("link", { name: "Text Diff Checker", exact: true });
  const descriptionId = await diff.getAttribute("aria-describedby");
  assert.ok(descriptionId);
  const description = directory.locator("#" + descriptionId);
  await description.scrollIntoViewIfNeeded();
  const descriptionBox = await description.boundingBox();
  assert.ok(descriptionBox);
  await Promise.all([
    directory.waitForURL("**/text-diff/"),
    directory.mouse.click(descriptionBox.x + descriptionBox.width / 2, descriptionBox.y + descriptionBox.height / 2),
  ]);
  for (const [path, title, values] of [
    ["/batch-text-files/", "Trim the edges of each line", ["  Ada Lee  \n  North West  ", "Ada Lee\nNorth West"]],
    ["/markdown-table-converter/", "Keep pipes and commas inside their cells", [
      "| Item | Note |\n| --- | --- |\n| Kit \\| Spare | Red, blue |",
      'Item,Note\nKit | Spare,"Red, blue"\n',
    ]],
  ]) {
    assert.equal((await directory.goto(origin + path))?.status(), 200);
    assert.deepEqual(await exampleValues(directory, title), values);
  }
  await plain.close();
  console.log(canonicalLinks.length + " unique task links returned HTTP 200 directly, all with matching canonical metadata");

  let totalSlots = 0;
  for (const width of [320, 375, 768, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 800 } });
    for (const [index, spec] of journeys.entries()) totalSlots += await journey(context, spec, true, index === 0);
    await context.close();
    console.log(width + " px: " + journeys.length + " keyboard journeys used three activations and completed each tool task");
  }
  for (const width of [320, 1280]) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 800 } });
    for (const [index, spec] of journeys.entries()) totalSlots += await journey(context, spec, false, index === 0);
    await context.close();
    console.log(width + " px without JS: " + journeys.length + " keyboard journeys reached prerendered controls in three activations");
  }

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await desktop.newPage();
  await page.goto(origin + "/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => localStorage.setItem("atc.tool-favorites.v1", '["/word-counter"]'));
  const finderTrigger = page.getByRole("button", { name: "Find a tool", exact: true });
  await finderTrigger.focus();
  await page.keyboard.press("Control+k");
  const finder = page.getByRole("region", { name: "Find a tool", exact: true });
  const query = finder.getByRole("searchbox", { name: "Search by name or task" });
  await page.waitForFunction(() => document.activeElement?.id === "tool-finder-query");
  assert.ok(await query.evaluate((element) => element === document.activeElement));
  await finder.getByRole("button", { name: "Favorites only" }).click();
  assert.equal(await finder.getByRole("link", { name: "Word Counter", exact: true }).count(), 1);
  await finder.getByRole("button", { name: "Favorites only" }).click();
  await query.fill("reconcile ids");
  const listFavorite = finder.getByRole("button", { name: "Favorite Compare Two Lists", exact: true });
  await listFavorite.click();
  await query.press("Escape");
  await finder.waitFor({ state: "detached" });
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "Find a tool");
  assert.ok(await finderTrigger.evaluate((element) => element === document.activeElement));
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("atc.tool-favorites.v1"))), ["/word-counter", "/compare-two-lists"]);
  await desktop.close();

  const mobile = await browser.newContext({ viewport: { width: 320, height: 800 } });
  const small = await mobile.newPage();
  await small.goto(origin + "/");
  await small.waitForLoadState("networkidle");
  await small.getByRole("button", { name: "Open menu" }).click();
  const menu = small.getByRole("dialog", { name: "Menu", exact: true });
  await menu.getByRole("textbox", { name: "Search tools" }).fill("invisible characters");
  assert.equal(await menu.getByRole("link", { name: "Unicode Inspector", exact: true }).getAttribute("href"), "/unicode-inspector/");
  await menu.getByRole("link", { name: "Browse tools by task", exact: true }).click();
  await small.waitForURL("**/tools/");
  await reflow(small);
  await mobile.close();
  console.log("Existing desktop finder, shortcut, focus return, legacy and staged favorites, and mobile search passed. Visible ad placements inspected on destinations: " + totalSlots);
} finally {
  await browser.close();
  local?.close();
}
