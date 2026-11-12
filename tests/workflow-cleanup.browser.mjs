import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { testStagedTool } from "./staged-tool-browser.mjs";

await testStagedTool("/", async ({ page, width, sentinel }) => {
  const button = name => page.getByRole("button", { name, exact: true });
  const source = page.getByRole("textbox", { name: "Workflow source", exact: true });
  const output = page.getByRole("textbox", { name: "Workflow result", exact: true });
  const chooser = page.getByRole("combobox", { name: "Advanced recipe" });
  const choose = async (label) => {
    await chooser.selectOption({ label });
    await button("Load recipe").press("Enter");
  };
  const preview = async expected => {
    await button("Preview workflow").press("Enter");
    await page.getByRole("status").getByText("Preview ready. The source text is unchanged.").waitFor();
    assert.equal(await output.inputValue(), expected);
  };
  const initialChunks = await page.evaluate(() => performance.getEntriesByType("resource").map(entry => entry.name));
  assert.ok(!initialChunks.some(name => /TextWorkflowPanel-/.test(name)));
  await page.getByText("Multi-step text workflow", { exact: true }).click();
  await source.waitFor();
  await page.getByText("More cleanup recipes", { exact: true }).click();
  const original = "• Montréal " + sentinel + "\n• 東京\n\n• isolated\n";
  const flattened = "Montréal " + sentinel + "\n東京\n\n• isolated\n";
  await source.fill(original);
  await choose("Flatten copied bullets");
  await preview(flattened);
  assert.equal(await source.inputValue(), original);

  await choose("Number excerpt lines");
  const numbered = "1: • Montréal " + sentinel + "\n2: • 東京\n\n3: • isolated\n";
  await preview(numbered);
  const [file] = await Promise.all([page.waitForEvent("download"), button("Download result TXT").click()]);
  assert.equal(await readFile(await file.path(), "utf8"), numbered);
  await button("Copy result").click();
  await page.getByRole("status").getByText("Result copied.").waitFor();
  assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replaceAll("\r\n", "\n"), numbered);

  await button("Undo step change").click();
  await preview(flattened);
  await button("Restore original").click();
  assert.equal(await output.inputValue(), original);
  await source.fill(numbered);
  assert.equal(await output.inputValue(), "");
  assert.ok(await button("Copy result").isDisabled());
  await choose("Remove excerpt line numbers");
  await preview(original);

  await source.fill("> > previous\n> " + sentinel + "\nplain\n>>> prompt");
  await choose("Unquote a pasted email reply");
  await preview("> previous\n" + sentinel + "\nplain\n>>> prompt");
  await source.fill("\tif ok:\n \t\twrite('\u200D漢')\n\n\treturn");
  await choose("Dedent copied code (4-column tabs)");
  await preview("if ok:\n    write('\u200D漢')\n\nreturn");
  const picker = page.getByRole("combobox", { name: "Choose a step" });
  await picker.selectOption("indent-8");
  assert.match(await picker.getAttribute("aria-describedby"), /workflow-step-description/);
  assert.match(await page.locator("#workflow-step-description").innerText(), /eight-column/);

  if (width === 1280) {
    const rows = "row\n".repeat(10000);
    await page.evaluate(value => navigator.clipboard.writeText(value), rows);
    await source.press("Control+a");
    await source.press("Control+v");
    await page.waitForFunction(length => document.querySelector("#workflow-source").value.length === length, rows.length);
    await choose("Number excerpt lines");
    const numberedRows = Array.from({ length: 10000 }, (_, index) => index + 1 + ": row\n").join("");
    await preview(numberedRows);
    const [longFile] = await Promise.all([page.waitForEvent("download"), button("Download result TXT").click()]);
    assert.equal(await readFile(await longFile.path(), "utf8"), numberedRows);
  }
}, { indexable: true });
