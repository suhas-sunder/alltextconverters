import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { toolFixtures } from "./fixtures.mjs";

const widths = [320, 375, 768, 1280, 1920];
const infoRoutes = new Set(["/about/", "/contact/"]);
const networkMarker = "example.invalid/atc-external";
const syntheticClipboard = "ATC-C03 clipboard fixture";
const names = (name) => ({ name, exact: typeof name === "string" });
const normalizeClipboard = (text) => text.replaceAll("\r\n", "\n");
const errorMessage = (main, error) => main.locator('[role="alert"], .bg-red-50, .text-red-700')
  .filter({ hasText: error }).first();

function matches(actual, expected, format, message) {
  if (expected instanceof RegExp) assert.match(actual, expected, message);
  else if (format === "json") assert.deepEqual(JSON.parse(actual), expected, message);
  else assert.equal(actual, expected, message);
}

async function checkWidths(page) {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const actual = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(actual <= width, `at ${width} px, document overflows to ${actual} px`);
  }
  await page.setViewportSize({ width: widths[0], height: 900 });
}

async function applySettings(main, settings = []) {
  const roles = { select: "combobox", arrowDown: "combobox", radio: "radio", check: "checkbox", uncheck: "checkbox", fill: "textbox", number: "spinbutton", press: "button" };
  for (const [action, name, value] of settings) {
    const control = main.getByRole(roles[action], names(name));
    if (action === "select") await control.selectOption(value);
    else if (action === "arrowDown") {
      await control.press("ArrowDown");
      assert.equal(await control.inputValue(), value, "keyboard column selection");
    }
    else if (action === "press") await control.press("Enter");
    else if (action === "radio" || action === "check") await control.check();
    else if (action === "uncheck") await control.uncheck();
    else await control.fill(value);
  }
}

async function readPreview(locator, expected) {
  const preview = locator.filter({ hasText: expected });
  await preview.waitFor();
  return (await preview.textContent()).trim();
}

async function runFixture(fixture, tools) {
  const { page, main, textbox, button, checkClipboard, checkDownload, reportGap } = tools;
  if (typeof fixture === "function") return fixture(tools);
  const input = fixture.input ? textbox(fixture.input) : main.locator("textarea:not([readonly])");
  const output = fixture.output === true ? main.locator("textarea[readonly]")
    : fixture.output ? textbox(fixture.output) : input;

  assert.equal(await input.inputValue(), "", "initial source is empty");
  if (fixture.output) assert.equal(await output.inputValue(), "", "initial result is empty");

  for (const [index, testCase] of fixture.cases.entries()) {
    const { source, filename, settings, error, notice, expected, format } = testCase;
    try {
      if (filename) {
        await main.locator('input[type="file"]').setInputFiles({
          name: filename, mimeType: filename.endsWith(".csv") ? "text/csv" : "text/plain", buffer: Buffer.from(source),
        });
        await page.waitForFunction((source) => [...document.querySelectorAll("main textarea")].some((field) => field.value === source), source);
      } else {
        await input.fill(source);
      }
      await applySettings(main, settings);
      const convert = button(testCase.button ?? fixture.button);
      if (await convert.isEnabled()) await convert.press("Enter");
      else assert.ok(error, "the converter is enabled with valid input");
      if (error) {
        await errorMessage(main, error).waitFor();
        assert.equal(await input.inputValue(), source, "invalid source is preserved");
        if (fixture.output) assert.equal(await output.inputValue(), "", "a failed conversion clears prior results");
        continue;
      }

      const actual = fixture.preview
        ? await readPreview(page.locator(fixture.preview), expected)
        : await output.inputValue();
      if (testCase.gap && actual === testCase.gap.observed) reportGap(testCase.gap.id);
      else matches(actual, expected, format, "visible conversion result" + (expected instanceof RegExp ? `: ${JSON.stringify(actual)}` : ""));
      if (notice) await main.getByText(notice).first().waitFor();

      if (index === 0) {
        await checkWidths(page);
        if (fixture.copy) await checkClipboard(button(fixture.copy), actual, fixture.copyGap);
        if (fixture.download) await checkDownload(button(fixture.download), testCase.download ?? actual, fixture.downloadGap);
        if (fixture.pdf) await checkDownload(button(fixture.pdf), /^%PDF-/);
        if (fixture.clearOnEdit) {
          await input.fill("new source before converting");
          if ((await output.inputValue()) === actual && await button(fixture.download).isEnabled()) {
            reportGap(fixture.clearOnEdit.id);
          } else {
            assert.equal(await output.inputValue(), "", "editing the source invalidates the result");
            assert.ok(await button(fixture.download).isDisabled(), "editing the source disables export");
          }
        }
        if (fixture.undo) {
          await button(fixture.undo).press("Enter");
          assert.equal(await input.inputValue(), source, "Undo restores the original");
        }
      }
    } catch (error) {
      throw new Error(`fixture ${index + 1}: ${error.message}`, { cause: error });
    }
  }

  await button(fixture.clear).press("Enter");
  assert.equal(await input.inputValue(), "", "clear empties the editor");
  if (fixture.output) assert.equal(await output.inputValue(), "", "clear empties the result");
}

function assertCoverage(indexablePaths) {
  const expected = [...indexablePaths].filter((route) => !infoRoutes.has(route)).sort();
  const actual = [...toolFixtures.keys()].sort();
  const missing = expected.filter((route) => !toolFixtures.has(route));
  const obsolete = actual.filter((route) => !expected.includes(route));
  assert.deepEqual({ missing, obsolete }, { missing: [], obsolete: [] }, "each indexable converter has a functional fixture");
  return expected.length;
}

export async function verifyAllTools(context, base, indexablePaths, failures, { selected, allowKnownGaps } = {}) {
  const count = assertCoverage(indexablePaths);
  const priority = ["/", "/table-to-list/", "/text-to-comma-separated-list/", "/list-to-table/",
    "/json-to-text/", "/json-array-to-list/", "/text-to-xml/"];
  const routes = selected ?? [...new Set([...priority, ...toolFixtures.keys()])];
  for (const route of routes) assert.ok(toolFixtures.has(route), `unknown converter ${route}`);
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base.origin });
  const page = await context.newPage();
  const main = page.locator("main");
  const gaps = new Set();
  let passed = 0;
  let withGaps = 0;
  let failed = 0;
  page.setDefaultTimeout(4_000);
  await page.setViewportSize({ width: widths[0], height: 900 });
  await page.route((url) => url.href.includes(networkMarker), (route) => {
    failures.add(`${page.url()}: pasted markup attempted a network request`);
    return route.abort();
  });

  const reportGap = (id) => {
    gaps.add(id);
    console.log(`  observed known gap ${id}`);
    if (!allowKnownGaps) failures.add(`Functional gap ${id} on ${new URL(page.url()).pathname}`);
  };

  const checkClipboard = async (control, expected, knownGap) => {
    await page.evaluate((seed) => navigator.clipboard.writeText(seed), syntheticClipboard);
    if (knownGap && await control.isDisabled()) {
      reportGap(knownGap);
      return;
    }
    await control.press("Enter");
    const deadline = Date.now() + 2_000;
    let copied = await page.evaluate(() => navigator.clipboard.readText());
    while (copied === syntheticClipboard && Date.now() < deadline) {
      await delay(25);
      copied = await page.evaluate(() => navigator.clipboard.readText());
    }
    if (knownGap && copied === syntheticClipboard) {
      reportGap(knownGap);
      return;
    }
    matches(normalizeClipboard(copied), expected instanceof RegExp ? expected : normalizeClipboard(expected), undefined, "clipboard output");
  };

  const checkDownload = async (control, expected, knownGap) => {
    let file;
    try {
      [file] = await Promise.all([
        page.waitForEvent("download", { timeout: knownGap ? 2_000 : 8_000 }), control.press("Enter"),
      ]);
    } catch (error) {
      if (!knownGap || !(await errorMessage(main, /Invalid JSON/i).isVisible())) throw error;
      reportGap(knownGap);
      return;
    }
    const content = await readFile(await file.path(), "utf8");
    matches(content, expected, undefined, "downloaded content");
  };

  try {
    for (const route of routes) {
      const previousGaps = gaps.size;
      try {
        const response = await page.goto(new URL(route, base).href, { waitUntil: "networkidle", timeout: 20_000 });
        assert.equal(response?.status(), 200, "converter response");
        await runFixture(toolFixtures.get(route), {
          page, main, checkClipboard, checkDownload, checkWidths, reportGap,
          button: (name) => main.getByRole("button", names(name)),
          textbox: (name) => main.getByRole("textbox", names(name)),
        });
        if (gaps.size === previousGaps) passed++;
        else withGaps++;
        console.log(`Functional ${route} exercised${gaps.size > previousGaps ? " with known gaps" : ""}`);
      } catch (error) {
        failed++;
        failures.add(`Functional ${route}: ${error.message}`);
      }
    }
  } finally {
    await page.close();
  }
  console.log(`Converter acceptance: ${passed}/${routes.length} fully passed, ${withGaps} exercised with ${gaps.size} known gap(s), ${failed} failed, ${count - routes.length} not selected, ${count} indexable converter(s).`);
}
