import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { testStagedTool } from "./staged-tool-browser.mjs";

await testStagedTool("/url-query-builder/", async ({ page, width, sentinel, origin }) => {
  const button = name => page.getByRole("button", { name, exact: true });
  const field = name => page.getByLabel(name, { exact: true });
  const input = field("URL or query input");
  const output = field("Built output");
  await input.fill("https://Example.com:443/search?tag=red&tag=blue&note=" + sentinel + "%0Aline&=blank&flag#frag?x=y");
  await button("Load parameters").press("Enter");
  assert.match(await page.getByRole("status").textContent(), /5 parameters loaded/, await page.locator("main").innerText());
  assert.equal(await field("Value 3").inputValue(), sentinel + "\nline");
  await button("Move parameter 2 up").press("Enter");
  await page.waitForFunction(() => document.activeElement?.id.startsWith("url-query-key-"));
  assert.equal(await field("Value 1").inputValue(), "blue");
  await button("Remove parameter 4").click();
  await button("Add parameter").press("Enter");
  await page.waitForFunction(() => document.activeElement?.id.startsWith("url-query-key-"));
  await field("Key 5").fill("A B");
  await field("Value 5").fill("literal +");
  await field("Encode spaces as").selectOption("percent");
  await button("Build output").click();
  const query = "tag=blue&tag=red&note=" + sentinel + "%0Aline&flag=&A%20B=literal%20%2B";
  assert.equal(await output.inputValue(), "https://Example.com:443/search?" + query + "#frag?x=y");
  await button("Copy output").click();
  await page.getByRole("status").getByText("Output copied.").waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await output.inputValue());

  await field("Output format").selectOption("query");
  assert.equal(await output.count(), 0);
  await button("Build output").click();
  assert.equal(await output.inputValue(), query);
  await field("Output format").selectOption("json");
  await button("Build output").click();
  assert.deepEqual(JSON.parse(await output.inputValue()), [
    { key: "tag", value: "blue" },
    { key: "tag", value: "red" },
    { key: "note", value: sentinel + "\nline" },
    { key: "flag", value: "" },
    { key: "A B", value: "literal +" },
  ]);
  const [file] = await Promise.all([page.waitForEvent("download"), button("Download output").click()]);
  assert.equal(file.suggestedFilename(), "url-parameters.json");
  assert.equal(await readFile(await file.path(), "utf8"), await output.inputValue());
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, "writeText", { value: async () => { throw new Error("denied"); } });
  });
  await button("Copy output").click();
  await page.getByRole("status").getByText(/selected for manual copy/).waitFor();
  assert.equal(await output.evaluate(editor => editor.selectionEnd - editor.selectionStart), (await output.inputValue()).length);

  await field("Input type").selectOption("query");
  await input.fill("a=%F0%80%80%80");
  await button("Load parameters").click();
  await page.getByRole("alert").getByText(/invalid UTF-8/).waitFor();
  assert.equal(await output.count(), 0);
  await input.fill("?q=two+words&other=%2B");
  await button("Load parameters").click();
  await button("Build output").click();
  assert.equal(await output.inputValue(), "q=two%20words&other=%2B");

  if (width === 1280) {
    await input.fill(Array.from({ length: 250 }, () => "x=y").join("&"));
    await button("Load parameters").click();
    assert.equal(await page.getByRole("list", { name: "Editable parameters" }).locator("li").count(), 250);
    assert.ok(await button("Add parameter").isDisabled());
    await button("Build output").click();
    assert.equal((await output.inputValue()).split("&").length, 250);
    await input.fill("a=b&" + await input.inputValue());
    await button("Load parameters").click();
    await page.getByRole("alert").getByText(/at most 250/).waitFor();
    const oversized = "q=" + "x".repeat(65536);
    await input.fill(oversized);
    assert.equal(await input.inputValue(), oversized);
    await button("Load parameters").click();
    await page.getByRole("alert").getByText(/at most 64 KiB/).waitFor();
    const sitemap = await page.request.get(origin + "/sitemap.xml");
    assert.ok(sitemap.ok());
    assert.ok(!(await sitemap.text()).includes("/url-query-builder/"));
    await page.goto(origin + "/url-encode/");
    const link = page.getByRole("link", { name: "URL Query Builder" });
    assert.equal(await link.getAttribute("href"), "/url-query-builder/");
  }
});
