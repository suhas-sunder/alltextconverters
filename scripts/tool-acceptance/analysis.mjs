import assert from "node:assert/strict";

const nameOptions = (name) => ({ name, exact: typeof name === "string" });

function metricCounter(label, cases, { copy = "Copy", advanced = false } = {}) {
  return async ({ page, main, textbox, button, checkClipboard, checkDownload, checkWidths }) => {
    const input = textbox("Text to count");
    const metrics = main.getByRole("region", { name: "Primary text metrics" });
    const metric = metrics.getByText(label, { exact: true }).locator("..");
    const hasMetric = async (number) => {
      await metric.getByText(String(number), { exact: true }).waitFor();
    };
    await hasMetric(0);
    assert.equal(await input.inputValue(), "", "initial source");
    for (const [index, { source, count }] of cases.entries()) {
      await input.fill(source);
      await hasMetric(count);
      assert.equal(await input.inputValue(), source, "counting leaves the source unchanged");
      if (index === 0) {
        await checkClipboard(button(copy), source);
        await checkDownload(button("Download TXT"), source);
        await checkWidths(page);
      }
    }
    if (advanced) {
      const details = main.locator("summary").filter({ hasText: /advanced/i });
      await details.press("Enter");
      await main.getByText("Unicode code points", { exact: true }).waitFor();
    }
    await button("Clear").press("Enter");
    await hasMetric(0);
    assert.equal(await input.inputValue(), "", "source after Clear");
  };
}

export const analysisFixtures = {
  "word-counter": metricCounter("Words", [
    { source: "don't re-enter 42 items.", count: 5 },
    { source: "one\ntwo\tthree", count: 3 },
    { source: "😀 !!!", count: 0 },
  ]),
  "character-counter": metricCounter("Characters including spaces", [
    { source: "Café 👨‍👩‍👧‍👦", count: 6 },
    { source: "e\u0301", count: 1 },
    { source: "👍🏽\nA", count: 3 },
  ], { advanced: true }),
  "byte-counter": metricCounter("UTF-8 bytes", [
    { source: "Aé漢😀", count: 10 },
    { source: "e\u0301", count: 3 },
    { source: "👍🏽\nA", count: 10 },
  ], { copy: "Copy text" }),
  "text-case-checker": async ({ page, main, textbox, button, checkClipboard, checkWidths }) => {
    const input = textbox("Text to analyze");
    const classification = main.getByRole("region", nameOptions("Likely classification"));
    assert.equal(await input.inputValue(), "");
    for (const [source, expected] of [
      ["CAFÉ ΓΕΙΆ", "Uppercase"], ["漢字", "Uncased text"], ["mIxEd NASA text", "Mixed case"],
    ]) {
      await input.fill(source);
      await classification.locator("p").getByText(expected, { exact: true }).waitFor();
      assert.equal(await input.inputValue(), source);
    }
    await checkClipboard(button("Copy analysis"), /^Mixed case\n/);
    await checkWidths(page);
    await button("Clear").press("Enter");
    assert.equal(await input.inputValue(), "");
  },
};
