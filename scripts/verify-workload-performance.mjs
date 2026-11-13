import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, rmdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { parseArgs } from "node:util";
import { gzipSync } from "node:zlib";

const { values } = parseArgs({ options: {
  "build-dir": { type: "string", default: "build/client" },
  "binary-build": { type: "string" },
  "json-build": { type: "string" },
  "xml-build": { type: "string" },
  "csv-build": { type: "string" },
  playwright: { type: "string" },
  executable: { type: "string" },
  report: { type: "string" },
  flow: { type: "string", multiple: true },
  width: { type: "string", multiple: true },
  "size-kib": { type: "string", multiple: true },
  samples: { type: "string", default: "3" },
  throttle: { type: "string", default: "4" },
  help: { type: "boolean" },
} });

if (values.help) {
  console.log(`Usage: node scripts/verify-workload-performance.mjs [options]

Uses a validated static build and installed Chromium (Edge is supported).
--build-dir PATH                Default build/client
--binary-build PATH             Override the build for file Base64
--json-build PATH               Override the build for JSON formatting
--xml-build PATH                Override the build for XML formatting
--csv-build PATH                Override the build for CSV/JSON
--playwright PATH               Installed playwright-core, or PLAYWRIGHT_CORE_PATH
--executable PATH               Browser executable, or BROWSER_EXECUTABLE
--flow NAME                     Repeat to select binary-encode, binary-decode,
                                json-minify, xml-compact, csv-to-json, json-to-csv
--width PX                      Repeat to select widths (default 320 and 1280)
--size-kib KIB                  Repeat to select workload sizes (default 10, 100,
                                1024, 5120 and the 512 KiB XML boundary)
--samples N                     Default 3 cold sessions per case
--throttle N                    Default 4x Chromium CPU throttle
--report PATH                   Write incremental raw JSON evidence`);
  process.exit(0);
}

function positive(value, maximum, name) {
  const number = Number(value);
  assert.ok(Number.isInteger(number) && number > 0 && number <= maximum, name);
  return number;
}

const packagePath = values.playwright ?? process.env.PLAYWRIGHT_CORE_PATH ?? "playwright-core";
const moduleName = packagePath.startsWith(".") || isAbsolute(packagePath) ? resolve(packagePath) : packagePath;
const { chromium } = createRequire(import.meta.url)(moduleName);
const executablePath = values.executable ?? process.env.BROWSER_EXECUTABLE;
const MiB = 1024 * 1024;
const sizes = (values["size-kib"] ?? ["10", "100", "1024", "5120"]).map((size) => positive(size, 12 * 1024, "size in KiB") * 1024);
const widths = (values.width ?? ["320", "1280"]).map((width) => positive(width, 3840, "viewport width"));
const samples = positive(values.samples, 10, "sample count");
const throttle = positive(values.throttle, 20, "CPU throttle");
const ad = /googlesyndication|doubleclick|googleadservices|fundingchoices|googletagmanager|google-analytics|onetrust|cookiebot/i;

const scenarios = [
  { name: "binary-encode", tool: "binary", route: "/file-base64-converter/", picker: "Open binary file", action: "Encode file", imported: "File selected.", ready: "Base64 is ready.", download: "Download Base64 text", cap: 12 * MiB, ext: ".bin", type: "application/octet-stream" },
  { name: "binary-decode", tool: "binary", route: "/file-base64-converter/", setting: ["Convert", "decode"], picker: "Open Base64 text file", action: "Decode to file", imported: "File selected.", ready: "Decoded file is ready.", download: "Download decoded file", cap: 12 * MiB, ext: ".base64", type: "text/plain" },
  { name: "json-minify", tool: "json", route: "/json-formatter/", picker: "Import JSON file", action: "Minify JSON", imported: "Local JSON file loaded.", ready: "JSON result ready.", download: "Download JSON", cap: MiB, capMessage: "Choose a UTF-8 file up to 1 MiB.", ext: ".json", type: "application/json" },
  { name: "xml-compact", tool: "xml", route: "/xml-formatter/", check: "Reindent element-only content", picker: "Import XML file", action: "Compact XML", imported: "Local XML file loaded.", ready: "XML result ready.", download: "Download XML", cap: MiB / 2, capMessage: "Choose a UTF-8 file up to 512 KiB.", ext: ".xml", type: "application/xml" },
  { name: "csv-to-json", tool: "csv", route: "/csv-json-converter/", picker: "Open UTF-8 file", action: "Convert table", imported: "File loaded.", ready: "Converted ", download: "Download JSON", cap: MiB, capMessage: "Choose a UTF-8 file of 1 MiB or less.", ext: ".csv", type: "text/csv" },
  { name: "json-to-csv", tool: "csv", route: "/csv-json-converter/", setting: ["Direction", "json-to-csv"], picker: "Open UTF-8 file", action: "Convert table", imported: "File loaded.", ready: "Converted ", download: "Download CSV", cap: MiB, capMessage: "Choose a UTF-8 file of 1 MiB or less.", ext: ".json", type: "application/json" },
];

async function serve(path) {
  const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".xml": "application/xml", ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2" };
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      let asset = resolve(path, "." + decodeURIComponent(url.pathname));
      const local = relative(path, asset);
      assert.ok(!isAbsolute(local) && !local.startsWith(".."));
      if ((await stat(asset)).isDirectory()) asset = join(asset, "index.html");
      const bytes = await readFile(asset);
      response.writeHead(200, { "Content-Type": mime[extname(asset)] ?? "application/octet-stream", "Cache-Control": "no-store" }).end(bytes);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise((ready, fail) => server.once("error", fail).listen(0, "127.0.0.1", ready));
  return { path, origin: "http://127.0.0.1:" + server.address().port, close: () => new Promise((done) => server.close(done)) };
}

const binary = (size) => {
  const data = Buffer.allocUnsafe(size);
  for (let i = 0; i < size; i++) data[i] = (i * 131 + 7) & 255;
  return data;
};

function fixture(scenario, size) {
  if (size > scenario.cap) return { bytes: Buffer.alloc(size, 97), capped: true };
  if (scenario.tool === "binary") {
    const source = binary(size);
    const base64 = Buffer.from(source.toString("base64"));
    return scenario.name === "binary-encode" ? { bytes: source, expected: base64 } : { bytes: base64, expected: source };
  }

  const data = [];
  if (scenario.name === "csv-to-json") {
    const header = "sku,city,qty,note\n";
    const row = (index) => `ID-${String(index).padStart(5, "0")},"Quebec, QC",3,"${"x".repeat(95)}"\n`;
    const count = Math.floor((size - header.length) / row(0).length);
    for (let i = 0; i < count; i++) data.push(row(i));
    const extra = size - header.length - data.join("").length;
    data[count - 1] = data[count - 1].replace(/"\n$/, "x".repeat(extra) + '"\n');
    const bytes = Buffer.from(header + data.join(""));
    assert.equal(bytes.length, size);
    return { bytes, count };
  }

  if (scenario.tool === "xml") {
    const row = (index) => `<item sku="ID-${String(index).padStart(5, "0")}" city="QC" note="${"x".repeat(79)}"/>\n`;
    const count = Math.floor((size - 15) / row(0).length);
    for (let i = 0; i < count; i++) data.push(row(i));
    const document = "<root>\n" + data.join("") + "</root>";
    const bytes = Buffer.from(document + " ".repeat(size - document.length));
    assert.equal(bytes.length, size);
    return { bytes, expected: Buffer.from("<root>" + data.join("").replaceAll("\n", "") + "</root>") };
  }

  const row = (index) => `{"sku":"ID-${String(index).padStart(5, "0")}","city":"Quebec, QC","qty":3,"note":"${"x".repeat(95)}"}`;
  const count = Math.floor((size - 4) / (row(0).length + 2));
  for (let i = 0; i < count; i++) data.push(row(i));
  const document = "[\n" + data.join(",\n") + "\n]";
  const bytes = Buffer.from(document + " ".repeat(size - document.length));
  assert.equal(bytes.length, size);
  return { bytes, count, expected: scenario.tool === "json" ? Buffer.from("[" + data.join(",") + "]") : undefined };
}

async function observe(context) {
  await context.addInitScript(() => {
    window.__atcM16 = { tasks: [], steps: {}, nativeXml: [] };
    const parseXml = DOMParser.prototype.parseFromString;
    DOMParser.prototype.parseFromString = function (source, type) {
      const start = performance.now();
      const result = parseXml.call(this, source, type);
      if (type === "application/xml") window.__atcM16.nativeXml.push({ start, elapsed: performance.now() - start });
      return result;
    };
    new PerformanceObserver((batch) => {
      window.__atcM16.tasks.push(...batch.getEntries().map(({ startTime, duration }) => ({ startTime, duration })));
    }).observe({ type: "longtask", buffered: true });
  });
}

async function arm(page, phase, expected, capped, action) {
  await page.evaluate(({ phase, expected, capped, action }) => {
    const main = document.querySelector("main");
    const step = window.__atcM16.steps[phase] = {};
    const event = phase === "import" ? "change" : "click";
    function onStart(e) {
      if (phase === "import" ? !e.target.matches('input[type="file"]') : e.target.closest("button")?.textContent.trim() !== action) return;
      step.start = performance.now();
      document.removeEventListener(event, onStart, true);
    }
    document.addEventListener(event, onStart, true);
    const observer = new MutationObserver(() => {
      if (step.start === undefined || step.done !== undefined) return;
      const error = main.querySelector('[role="alert"]');
      const status = main.querySelector('[role="status"]');
      const found = (capped ? error : status)?.textContent.includes(expected);
      if (!found && !error) return;
      step.done = performance.now();
      step.actual = (found ? (capped ? error : status) : error)?.textContent.trim();
      step.expected = Boolean(found);
      observer.disconnect();
      requestAnimationFrame(() => requestAnimationFrame(() => { step.frame = performance.now(); }));
    });
    observer.observe(main, { subtree: true, childList: true, characterData: true });
  }, { phase, expected, capped, action });
}

async function getStep(page, phase) {
  await page.waitForFunction((name) => window.__atcM16.steps[name]?.frame !== undefined, phase, { timeout: 20_000 });
  return page.evaluate((name) => {
    const { steps, tasks, nativeXml } = window.__atcM16;
    const step = steps[name];
    const durations = tasks.filter((task) => task.startTime < step.frame && task.startTime + task.duration > step.start).map((task) => task.duration);
    const nativeXmlMs = Math.round(nativeXml.filter((parse) => parse.start >= step.start && parse.start <= step.done).reduce((total, parse) => total + parse.elapsed, 0));
    return { nativeXmlMs, stateMs: Math.round(step.done - step.start), frameMs: Math.round(step.frame - step.start), longestTaskMs: Math.max(0, ...durations), longTasks: durations.length, expected: step.expected, actual: step.actual };
  }, phase);
}

async function sizesFor(path, urls) {
  const assets = [];
  for (const asset of urls) {
    const content = await readFile(join(path, asset.slice(1)));
    assets.push({ asset, bytes: content.length, gzipBytes: gzipSync(content).length });
  }
  return assets;
}

const selected = scenarios.filter((scenario) => !values.flow || values.flow.includes(scenario.name));
assert.ok(selected.length && (!values.flow || new Set(values.flow).size === selected.length), "Unknown workflow name");
const builds = {};
const savedFiles = [];
const fixtures = await mkdtemp(join(tmpdir(), "atc-workload-"));
let browser;
try {
  for (const tool of new Set(selected.map(({ tool }) => tool))) {
    const path = resolve(values[tool + "-build"] ?? values["build-dir"]);
    await stat(join(path, "index.html"));
    const endpoint = await serve(path);
    let commit = null;
    try {
      commit = execFileSync("git", ["-C", path, "rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch {
      // The command also accepts static artifacts outside a Git worktree.
    }
    builds[tool] = { ...endpoint, commit };
  }
  browser = await chromium.launch({ executablePath, headless: true });
  const report = { browser: browser.version(), node: process.version, cpuThrottle: throttle, builds: Object.fromEntries(Object.entries(builds).map(([tool, build]) => [tool, build.commit])), results: [] };
  console.log(JSON.stringify({ ...report, results: undefined }));
  for (const scenario of selected) {
    const build = builds[scenario.tool];
    const workload = scenario.tool === "xml" && !values["size-kib"] ? [...sizes, scenario.cap].sort((a, b) => a - b) : sizes;
    for (const width of widths) {
      for (const workloadBytes of workload) {
        const data = fixture(scenario, workloadBytes);
        const fixturePath = join(fixtures, `${scenario.name}-${width}-${workloadBytes}${scenario.ext}`);
        await writeFile(fixturePath, data.bytes);
        savedFiles.push(fixturePath);
        for (let sample = 0; sample < samples; sample++) {
          const context = await browser.newContext({ viewport: { width, height: 900 }, locale: "en-US", serviceWorkers: "block" });
          await observe(context);
          await context.route((url) => ad.test(url.hostname), (request) => request.abort());
          const page = await context.newPage();
          page.setDefaultTimeout(20_000);
          const cdp = await context.newCDPSession(page);
          await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
          const assetUrls = new Set();
          const external = [];
          const errors = [];
          context.on("request", (request) => {
            const url = new URL(request.url());
            if (url.origin === build.origin && /\.(?:js|css)$/.test(url.pathname)) assetUrls.add(url.pathname);
            if (ad.test(url.hostname)) external.push(url.hostname);
          });
          page.on("pageerror", (error) => errors.push(error.message));
          try {
            const response = await page.goto(build.origin + scenario.route, { waitUntil: "networkidle" });
            assert.equal(response.status(), 200);
            const initialAssets = new Set(assetUrls);
            if (scenario.setting) await page.getByRole("combobox", { name: scenario.setting[0], exact: true }).selectOption(scenario.setting[1]);
            if (scenario.check) await page.getByRole("checkbox", { name: scenario.check, exact: true }).check();
            await arm(page, "import", data.capped ? scenario.capMessage : scenario.imported, data.capped, "");
            await page.getByLabel(scenario.picker, { exact: true }).setInputFiles(fixturePath);
            const imported = await getStep(page, "import");
            assert.ok(imported.expected, scenario.name + " import: " + imported.actual);
            const importAssets = new Set(assetUrls);
            let converted = null;
            let outputBytes = null;
            if (!data.capped) {
              await arm(page, "convert", scenario.ready, false, scenario.action);
              await page.getByRole("button", { name: scenario.action, exact: true }).press("Enter");
              converted = await getStep(page, "convert");
              assert.ok(converted.expected, scenario.name + " conversion: " + converted.actual);
              if (sample === 0) {
                const [download] = await Promise.all([
                  page.waitForEvent("download"),
                  page.getByRole("button", { name: scenario.download, exact: true }).press("Enter"),
                ]);
                const output = await readFile(await download.path());
                outputBytes = output.length;
                if (data.expected) assert.ok(output.equals(data.expected), scenario.name + " output mismatch");
                else if (scenario.name === "csv-to-json") {
                  const parsed = JSON.parse(output.toString("utf8"));
                  assert.equal(parsed.length, data.count);
                  assert.equal(parsed[0].sku, "ID-00000");
                } else {
                  const parsed = output.toString("utf8").trimEnd().split(/\r?\n/);
                  assert.equal(parsed.length, data.count + 1);
                  assert.match(parsed[1], /^ID-00000,"Quebec, QC",3,/);
                }
              }
            } else assert.equal(await page.getByRole("button", { name: scenario.download, exact: true }).count(), 0);
            assert.deepEqual(external, [], "ad or CMP network");
            assert.deepEqual(errors, [], "uncaught browser error");
            const startup = await sizesFor(build.path, initialAssets);
            const afterImport = await sizesFor(build.path, [...importAssets].filter((url) => !initialAssets.has(url)));
            const afterAction = await sizesFor(build.path, [...assetUrls].filter((url) => !importAssets.has(url)));
            report.results.push({
              flow: scenario.name, width, sample: sample + 1, workloadBytes, inputBytes: data.bytes.length,
              outputBytes, capped: Boolean(data.capped), imported, converted, startup, afterImport, afterAction,
            });
            console.log(scenario.name, width, workloadBytes, sample + 1, "import", imported.stateMs,
              converted ? "action " + converted.stateMs + " frame " + converted.frameMs + " task " + converted.longestTaskMs : "refused");
            if (values.report) await writeFile(values.report, JSON.stringify(report, null, 2));
          } finally {
            await context.close();
          }
        }
      }
    }
  }
} finally {
  await browser?.close();
  await Promise.all(Object.values(builds).map((build) => build.close()));
  await Promise.all(savedFiles.map((path) => rm(path, { force: true })));
  await rmdir(fixtures);
}
