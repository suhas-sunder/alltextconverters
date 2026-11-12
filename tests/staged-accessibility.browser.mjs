// Usage: node tests/staged-accessibility.browser.mjs <build or preview> <playwright-core> <Edge> <axe.min.js>
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { testStagedTool } from "./staged-tool-browser.mjs";

const axePath = process.argv[5];
if (!axePath) throw new Error("Pass the axe-core browser bundle as the fourth argument.");
const axeSource = await readFile(axePath, "utf8");

const scopes = [
  { path: "/", indexable: true },
  { path: "/csv-json-converter/", buttons: ["Load example", "Convert table"], status: /Converted / },
  { path: "/compare-two-lists/", buttons: ["Load example", "Compare lists"], result: "Comparison results" },
  { path: "/text-diff/", buttons: ["Load example", "Compare text"], result: "Comparison results" },
  { path: "/unicode-inspector/", buttons: ["Load example", "Inspect text"], result: "Unicode inspection table" },
  { path: "/url-query-builder/", buttons: ["Fill example", "Load parameters", "Build output"], result: "Built output" },
  { path: "/html-markdown-converter/", buttons: ["Fill example", "Convert content"], status: /Conversion complete/ },
  { path: "/json-formatter/" },
  { path: "/file-base64-converter/" },
];

for (const scope of scopes) {
  await testStagedTool(scope.path, async ({ page, width }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const name of scope.buttons ?? []) await page.getByRole("button", { name, exact: true }).click();
    if (scope.result) await page.getByLabel(scope.result, { exact: true }).or(page.getByRole("heading", { name: scope.result, exact: true })).first().waitFor();
    if (scope.status) await page.getByRole("status").getByText(scope.status).waitFor();
    if (scope.path === "/compare-two-lists/") {
      const preview = page.getByRole("list", { name: "Union preview" });
      await preview.focus();
      assert.ok(await preview.evaluate(element => element === document.activeElement));
      await page.keyboard.press("PageDown");
      await page.waitForFunction(() => {
        const element = document.activeElement;
        return element?.getAttribute("aria-label") === "Union preview" && (element.scrollHeight <= element.clientHeight || element.scrollTop > 0);
      });
    }
    if (scope.path === "/") {
      await page.getByText("Multi-step text workflow", { exact: true }).click();
      await page.getByRole("textbox", { name: "Workflow source", exact: true }).waitFor();
      await page.getByText("More cleanup recipes", { exact: true }).click();
      await page.getByRole("combobox", { name: "Advanced recipe" }).selectOption({ label: "Dedent copied code (4-column tabs)" });
      await page.getByRole("button", { name: "Load recipe", exact: true }).click();
    }

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async () => {
      const results = await axe.run({
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
      });
      return results.violations.map(violation => ({
        id: violation.id,
        nodes: violation.nodes.map(node => ({
          target: node.target,
          existingAd: node.target.length === 1 && document.querySelector(node.target[0])?.matches("aside[data-ad-placement]"),
        })),
      }));
    });
    const knownAdLandmark = violations.find(violation => violation.id === "landmark-unique" && violation.nodes.every(node => node.existingAd));
    if (knownAdLandmark) console.log("Existing advertisement landmark retained at " + width + "px");
    assert.deepEqual(violations.filter(violation => violation !== knownAdLandmark), []);

    if (width === 320) await page.setViewportSize({ width: 640, height: 900 });
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    const geometry = await page.evaluate(() => {
      const viewport = document.documentElement.clientWidth;
      const root = document.documentElement.getBoundingClientRect();
      return { viewport, width: Math.ceil(root.width) };
    });
    assert.ok(geometry.width <= geometry.viewport, "200% zoom " + JSON.stringify(geometry));
  }, { indexable: scope.indexable, widths: [320, 1280] });
}
