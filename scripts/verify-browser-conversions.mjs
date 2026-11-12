import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const viewports = [320, 375, 768, 1280, 1920];
const privateMarker = "ATC-local-fixture-a724de";
const nl = (text) => text.replaceAll("\r\n", "\n");
const button = (page, name) => page.getByRole("button", { name, exact: typeof name === "string" });
const textbox = (page, name) => page.getByRole("textbox", { name, exact: true });
const firstTextarea = (page) => page.locator("main textarea").first();

async function download(page, control) {
  const [result] = await Promise.all([page.waitForEvent("download"), control.click()]);
  return { name: result.suggestedFilename(), bytes: await readFile(await result.path()) };
}

async function homepage(page) {
  const input = page.locator("#textInput");
  const original = "café 東京 " + privateMarker;
  await page.locator('main input[type="file"]').first().setInputFiles({
    name: "fixture.txt", mimeType: "text/plain", buffer: Buffer.from(original),
  });
  await page.waitForFunction((expected) => document.querySelector("#textInput")?.value === expected, original);
  await button(page, "UPPERCASE").click();
  assert.equal(await input.inputValue(), original.toUpperCase());
  await button(page, /Undo$/).click();
  assert.equal(await input.inputValue(), original);

  const large = ("café—東京 ".repeat(30) + "\n").repeat(400);
  await page.locator('main input[type="file"]').first().setInputFiles({
    name: "large-fixture.txt", mimeType: "text/plain", buffer: Buffer.from(large),
  });
  await page.waitForFunction((size) => document.querySelector("#textInput")?.value.length === size, large.length);
  await button(page, "UPPERCASE").click();
  assert.equal(await input.inputValue(), large.toUpperCase());
  await button(page, /Undo$/).click();
  assert.equal(await input.inputValue(), large);
  const printable = "Printable fixture " + privateMarker;
  await page.locator('main input[type="file"]').first().setInputFiles({
    name: "print-fixture.txt", mimeType: "text/plain", buffer: Buffer.from(printable),
  });
  await page.waitForFunction((text) => document.querySelector("#textInput")?.value === text, printable);
  const pdf = await download(page, button(page, /^🖨️ PDF$/));
  assert.match(pdf.name, /\.pdf$/i);
  assert.equal(pdf.bytes.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.equal(await input.inputValue(), printable, "PDF export preserves the editor");
}

async function tableToList(page) {
  const csv = 'City,Note\nQuébec,"snow, sleet"\n東京,clear';
  const input = firstTextarea(page);
  await page.locator('main input[type="file"]').first().setInputFiles({
    name: "table.csv", mimeType: "text/csv", buffer: Buffer.from(csv),
  });
  await page.waitForFunction((expected) => document.querySelector("main textarea")?.value === expected, csv);
  const column = page.getByRole("combobox").first();
  await column.focus();
  await page.keyboard.press("ArrowDown");
  await page.waitForFunction(() => document.querySelector("main select")?.value === "1");
  await button(page, "Extract column as list").click();
  assert.equal(await input.inputValue(), "Note\nsnow, sleet\nclear");
}

async function listToTable(page) {
  const input = firstTextarea(page);
  await input.fill("café\n東京");
  await button(page, "Build table").click();
  const previews = await page.locator("main pre, main textarea[readonly], main td").allTextContents();
  const content = previews.join("\n");
  assert.match(content, /café/);
  assert.match(content, /東京/);
  assert.ok(previews.some((preview) => preview.includes("<td>") || preview === "東京"), "HTML table output");
}

async function textToXml(page) {
  await firstTextarea(page).fill("Alpha & Café 東京");
  await button(page, "Convert").click();
  const xml = await textbox(page, "Generated XML").inputValue();
  assert.match(xml, /Alpha &amp; Café 東京/);
  assert.equal(await page.evaluate(
    (source) => new DOMParser().parseFromString(source, "application/xml").documentElement.textContent.trim(), xml,
  ), "Alpha & Café 東京");
}

async function csvRoundTrip(page, open) {
  const source = 'Québec, Canada\nHe said "東京"\né';
  await textbox(page, "One item per line").fill(source);
  await button(page, "Generate CSV").click();
  const csv = await download(page, button(page, "Download CSV"));
  assert.equal(nl(csv.bytes.toString("utf8")), '"Québec, Canada"\n"He said ""東京"""\né\n');
  await open("/csv-to-list/");
  await textbox(page, "CSV or delimited text").fill(csv.bytes.toString("utf8"));
  await button(page, "Convert").click();
  assert.equal(await textbox(page, "List output").inputValue(), source);
  await textbox(page, "CSV or delimited text").fill('"unterminated');
  await page.getByRole("alert").waitFor();
  assert.equal(await textbox(page, "CSV or delimited text").inputValue(), '"unterminated');
}

async function textWorkflow(page) {
  const launcher = page.locator("summary").filter({ hasText: "Multi-step text workflow" });
  if (!(await launcher.count())) return;
  const original = " Café  \r\nCafé\r\n東京\r\n";
  await page.locator('main input[type="file"]').first().setInputFiles({
    name: "workflow.txt", mimeType: "text/plain", buffer: Buffer.from(original),
  });
  await page.waitForFunction((text) => document.querySelector("#textInput")?.value === text, nl(original));
  await launcher.focus();
  await launcher.press("Enter");
  await button(page, "Clean a pasted spreadsheet column").click();
  await button(page, "Preview workflow").click();
  const result = textbox(page, "Workflow result");
  await result.waitFor();
  await page.waitForFunction(() => [...document.querySelectorAll("textarea")].some(
    (area) => area.readOnly && area.value === "Café\n東京\n",
  ));
  await button(page, "Restore original").click();
  const restored = await download(page, button(page, "Download result TXT"));
  assert.deepEqual(restored.bytes, Buffer.from(original));
  assert.equal(await page.locator("#textInput").inputValue(), nl(original));

  let finish;
  const waiting = new Promise((resolve) => { finish = resolve; });
  const worker = /textWorkflow\.worker-[^/]+\.js$/;
  const holdWorker = async (route) => {
    await waiting;
    await route.continue().catch(() => {});
  };
  await page.route(worker, holdWorker);
  try {
    await button(page, "Preview workflow").click();
    await button(page, "Cancel preview").click();
    await page.getByRole("status").filter({ hasText: /canceled/i }).waitFor();
    assert.equal(await result.inputValue(), "");
  } finally {
    finish();
    await page.unroute(worker, holdWorker);
  }
  console.log("Optional multi-step workflow: Unicode preview, exact TXT restoration and cancellation");
}

async function batchExport(page) {
  const chooser = page.getByLabel("Choose .txt files");
  await chooser.setInputFiles([
    { name: "cities.txt", mimeType: "text/plain", buffer: Buffer.from("café\r\n東京") },
    { name: "second.txt", mimeType: "text/plain", buffer: Buffer.from("helsinki") },
  ]);
  await page.getByLabel("Transformation").selectOption("normalize-lines");
  await button(page, "Convert files").click();
  const txt = await download(page, button(page, /^Download cities/));
  assert.equal(txt.bytes.toString("utf8"), "café\n東京");
  await button(page, "Prepare ZIP of ready files").click();
  const zip = await download(page, button(page, "Download ZIP"));
  assert.equal(zip.name, "processed-text-files.zip");
  assert.equal(zip.bytes.readUInt32LE(0), 0x04034b50, "ZIP local file signature");
  assert.ok(zip.bytes.includes(Buffer.from(txt.name)), "archive lists the processed file");
}

const conversions = [
  ["/", homepage],
  ["/table-to-list/", tableToList],
  ["/list-to-table/", listToTable],
  ["/json-array-to-list/", async (page) => {
    const input = firstTextarea(page);
    await input.fill('["one","Québec","東京"]');
    await button(page, "Convert JSON array to list").click();
    assert.equal(await input.inputValue(), "one\nQuébec\n東京");
    await input.fill('["unterminated');
    await button(page, "Convert JSON array to list").click();
    assert.equal(await input.inputValue(), '["unterminated');
  }],
  ["/json-to-text/", async (page) => {
    const input = firstTextarea(page);
    await input.fill('{"first":"café","next":"東京"}');
    await button(page, "Extract values from JSON").click();
    assert.equal(await input.inputValue(), "café\n東京");
  }],
  ["/text-to-xml/", textToXml],
  ["/list-to-csv/", csvRoundTrip],
];

export async function verifyConversions(context, base, routes, failures) {
  const page = await context.newPage();
  page.setDefaultTimeout(8_000);
  page.on("request", (request) => {
    const outgoing = request.url() + (request.postData() ?? "");
    if (outgoing.toLowerCase().includes(privateMarker.toLowerCase())) {
      failures.add("Synthetic converter text reached an outbound request.");
    }
  });
  const open = (path) => page.goto(new URL(path, base).href, { waitUntil: "networkidle", timeout: 20_000 });
  const checks = [...conversions];
  if (routes.includes("/batch-text-files/")) checks.push(["/batch-text-files/", batchExport]);
  try {
    for (const [path, verify] of checks) {
      try {
        await open(path);
        for (const width of viewports) {
          await page.setViewportSize({ width, height: 900 });
          const actual = await page.evaluate(() => document.documentElement.scrollWidth);
          assert.ok(actual <= width, `${width} px viewport overflows to ${actual} px`);
        }
        await page.setViewportSize({ width: 320, height: 900 });
        await verify(page, open);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth) <= 320, "output overflows at 320 px");
        const stored = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
        assert.ok(!stored.toLowerCase().includes(privateMarker.toLowerCase()), "converter text was persisted");
        if (path === "/") await textWorkflow(page);
        console.log(`${path} conversion and ${viewports.join("/")} px checks passed`);
      } catch (error) {
        failures.add(`Conversion ${path}: ${error.message}`);
      }
    }
  } finally {
    await page.close();
  }
}
