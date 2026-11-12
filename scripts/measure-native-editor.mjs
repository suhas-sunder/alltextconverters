import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: {
  base: { type: "string" }, playwright: { type: "string" }, executable: { type: "string" },
  repeats: { type: "string", default: "3" }, throttle: { type: "string", default: "4" },
  "worker-transfer": { type: "boolean" },
  "app-only": { type: "boolean" },
  width: { type: "string" }, kib: { type: "string" },
} });
assert.ok(values.base && values.playwright && values.executable, "Supply --base, --playwright and --executable.");
const repetitions = Number(values.repeats);
const throttle = Number(values.throttle);
assert.ok(Number.isSafeInteger(repetitions) && repetitions >= 1 && repetitions <= 20);
assert.ok(Number.isFinite(throttle) && throttle >= 1);
const { chromium } = createRequire(import.meta.url)(resolve(values.playwright));
const origin = new URL(values.base).origin;
const browser = await chromium.launch({ executablePath: values.executable });
const widths = values.width ? values.width.split(",").map(Number) : [320, 375, 768, 1280, 1920];
const sizes = (values.kib ? values.kib.split(",").map(Number) : [10, 100, 1024, 5120]).map(kib => kib * 1024);
assert.ok(widths.every(width => Number.isSafeInteger(width) && width >= 320 && width <= 1920));
assert.ok(sizes.every(bytes => Number.isSafeInteger(bytes) && bytes >= 1024 && bytes <= 5120 * 1024));
const median = (numbers) => {
  const sorted = [...numbers].sort((a, b) => a - b);
  return Math.round((sorted[Math.floor((sorted.length - 1) / 2)] + sorted[Math.floor(sorted.length / 2)]) / 2);
};
const metrics = async (session) => Object.fromEntries((await session.send("Performance.getMetrics")).metrics.map(({ name, value }) => [name, value]));

async function sample(page, session, bytes, native) {
  await page.goto(origin + "/byte-counter/", { waitUntil: "networkidle" });
  const before = await metrics(session);
  const measured = await page.evaluate(async ({ bytes, native }) => {
    const text = "abc def ghi jkl\n".repeat(Math.ceil(bytes / 16)).slice(0, bytes);
    let input = document.querySelector("#bytes-counter-input");
    if (native) {
      const clone = input.cloneNode();
      input.replaceWith(clone);
      input = clone;
    }
    const longTasks = [];
    const observer = new PerformanceObserver(list => longTasks.push(...list.getEntries().map(entry => Math.round(entry.duration))));
    observer.observe({ type: "longtask" });
    const start = performance.now();
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(input, text);
    if (!native) input.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
    const paintMs = Math.round(performance.now() - start);
    const exactInput = input.value === text;
    const byteCount = document.querySelector('[aria-label="Primary text metrics"]')?.textContent.includes(bytes.toLocaleString("en-US"));
    await new Promise(done => setTimeout(done, 0));
    observer.disconnect();
    return { paintMs, maxLongTaskMs: Math.max(0, ...longTasks), exactInput, byteCount };
  }, { bytes, native });
  const after = await metrics(session);
  assert.ok(measured.exactInput && (native || measured.byteCount), "Exact input and immediate byte count");
  const field = (key) => Math.round((after[key] - before[key]) * 1000);
  return { paintMs: measured.paintMs, maxLongTaskMs: measured.maxLongTaskMs, layoutMs: field("LayoutDuration"),
    styleMs: field("RecalcStyleDuration"), scriptMs: field("ScriptDuration"),
    heapDeltaKiB: Math.round((after.JSHeapUsedSize - before.JSHeapUsedSize) / 1024) };
}

try {
  for (const width of values["worker-transfer"] ? [320, 1280] : widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send("Performance.enable");
    await session.send("Emulation.setCPUThrottlingRate", { rate: throttle });
    if (values["worker-transfer"]) {
      await page.addInitScript(() => {
        const original = Worker.prototype.postMessage;
        Worker.prototype.postMessage = function (value, ...options) {
          const start = performance.now();
          const result = original.call(this, value, ...options);
          if (typeof value === "string") {
            const callMs = performance.now() - start;
            this.addEventListener("message", () => {
              window.counterWorkerLab = { callMs: Math.round(callMs * 100) / 100, resultMs: Math.round(performance.now() - start) };
            }, { once: true });
          }
          return result;
        };
      });
      for (const bytes of sizes.slice(2)) {
        const samples = [];
        for (let i = 0; i < repetitions; i++) {
          await sample(page, session, bytes, false);
          await page.waitForFunction(() => Boolean(window.counterWorkerLab), undefined, { timeout: 30_000 });
          samples.push(await page.evaluate(() => window.counterWorkerLab));
        }
        console.log(JSON.stringify({ width, bytes, throttle, repetitions, workerTransferSamples: samples }));
      }
      await context.close();
      continue;
    }
    for (const bytes of sizes) {
      for (const native of values["app-only"] ? [false] : [false, true]) {
        const samples = [];
        for (let i = 0; i < repetitions; i++) samples.push(await sample(page, session, bytes, native));
        const summary = Object.fromEntries(Object.keys(samples[0]).map(key => [key, median(samples.map(s => s[key]))]));
        console.log(JSON.stringify({ width, bytes, native, throttle, repetitions, median: summary, samples }));
      }
    }
    // One full-size browser clipboard and download per width, with the same exact fixture.
    if (values.kib) {
      await context.close();
      continue;
    }
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await sample(page, session, 5120 * 1024, false);
    const started = performance.now();
    await page.getByRole("button", { name: "Copy text", exact: true }).click();
    await page.getByText("Text copied.", { exact: true }).waitFor();
    assert.equal(await page.evaluate(async () => (await navigator.clipboard.readText()).replaceAll("\r\n", "\n") === document.querySelector("#bytes-counter-input").value), true);
    const copyMs = Math.round(performance.now() - started);
    const downloadStarted = performance.now();
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download TXT" }).click()]);
    const { readFile } = await import("node:fs/promises");
    const expected = Buffer.from("abc def ghi jkl\n".repeat((5120 * 1024) / 16));
    assert.deepEqual(await readFile(await download.path()), expected);
    console.log(JSON.stringify({ width, bytes: expected.length, copyMs, downloadMs: Math.round(performance.now() - downloadStarted) }));
    await context.close();
  }
} finally {
  await browser.close();
}
