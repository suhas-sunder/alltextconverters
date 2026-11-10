import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../scripts/measurement-report.mjs", import.meta.url));
const site = "https://www.alltextconverters.com";
const window = { start: "2026-10-11", end: "2026-11-07", timeZone: "America/Los_Angeles" };
const row = (metrics, dimensions = {}) => ({ page: null, country: null, device: null, ...dimensions, metrics });
const envelope = (source, rows, extra = {}) => ({ version: 1, site, source, window, rows, ...extra });

async function fixtureRunner(t) {
  const directory = await mkdtemp(join(tmpdir(), "atc-measurement-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return async (inputs, args = []) => {
    const files = await Promise.all(inputs.map(async (input, index) => {
      const file = join(directory, "private-export-" + (index + 1) + ".json");
      await writeFile(file, Buffer.isBuffer(input) || typeof input === "string" ? input : JSON.stringify(input));
      return file;
    }));
    const result = spawnSync(process.execPath, [script, ...args, ...files], { cwd: directory, encoding: "utf8" });
    assert.ifError(result.error);
    return result;
  };
}

test("the owner-supplied Search Console baseline remains an aggregate and leaves other sources unavailable", async (t) => {
  const run = await fixtureRunner(t);
  const baseline = envelope("search-console", [row({ clicks: 194, impressions: 13880, averagePosition: 14.18 })]);
  const result = await run([baseline]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.site, site);
  assert.deepEqual(report.sourceCounts, {
    "search-console": 1, traffic: 0, adsense: 0, "session-revenue": 0, converters: 0, "field-vitals": 0,
  });
  assert.deepEqual(report.cohorts, [{
    window, page: null, country: null, device: null, sources: {
      "search-console": {
        metrics: { clicks: 194, impressions: 13880, averagePosition: 14.18 },
        rates: { ctr: 194 / 13880 },
      },
    },
  }]);
  const markdown = await run([baseline], ["--format", "markdown"]);
  assert.equal(markdown.status, 0, markdown.stderr);
  assert.match(markdown.stdout, /adsense \| unavailable/);
  assert.match(markdown.stdout, /\| ctr \| 1\.40% \|/);
});

test("synthetic authorized-format fixtures keep each derived rate tied to its own source row", async (t) => {
  const run = await fixtureRunner(t);
  const scope = { page: "/table-to-list/", country: "US", device: "mobile" };
  const scopeWithoutSlash = { ...scope, page: "/table-to-list" };
  const result = await run([
    envelope("traffic", [row({
      sessions: 1000, organicLandingSessions: 500, engagedSessions: 250, pageviews: 2000, adEligiblePageviews: 800,
    }, scope)]),
    envelope("adsense", [row({
      estimatedRevenueMicros: 1234500, pageViews: 200, adImpressions: 400,
      adRequests: 600, matchedAdRequests: 480, measurableImpressions: 360, viewableImpressions: 270,
    }, scopeWithoutSlash)], { currency: "USD" }),
    envelope("session-revenue", [row({ estimatedRevenueMicros: 1000000, eligibleSessions: 200 }, scope)], { currency: "USD" }),
    envelope("converters", [row({
      attempts: 20, completedAttempts: 17, erroredAttempts: 2, successfulCopies: 22, initiatedDownloads: 5,
    }, scope)]),
    envelope("field-vitals", [row({ lcpP75Ms: 2800, inpP75Ms: 125, clsP75: 0 }, scope)]),
  ]);
  assert.equal(result.status, 0, result.stderr);
  const { cohorts } = JSON.parse(result.stdout);
  assert.equal(cohorts.length, 1);
  assert.match(cohorts[0].page, /^\/table-to-list\/?$/);
  const sources = cohorts[0].sources;
  assert.deepEqual(sources.traffic.rates, {
    organicLandingRate: 0.5, engagementRate: 0.25, adEligiblePageviewRate: 0.4,
  });
  assert.deepEqual(sources.adsense.rates, {
    pageRpm: 6.1725, adImpressionRpm: 3.08625, coverage: 0.8, viewability: 0.75,
  });
  assert.equal(sources.adsense.metrics.estimatedRevenueMicros, 1234500);
  assert.equal(sources.adsense.currency, "USD");
  assert.deepEqual(sources["session-revenue"].rates, { eligibleSessionRpm: 5 });
  assert.deepEqual(sources.converters.rates, { completionRate: 0.85, errorRate: 0.1 });
  assert.deepEqual(sources["field-vitals"].metrics, { lcpP75Ms: 2800, inpP75Ms: 125, clsP75: 0 });
});

test("separate dates, time zones and segmentation never backfill an unavailable denominator", async (t) => {
  const run = await fixtureRunner(t);
  const result = await run([
    envelope("adsense", [
      row({ estimatedRevenueMicros: 1234567 }),
      row({ estimatedRevenueMicros: 0, pageViews: 10 }, { country: "US" }),
      row({ estimatedRevenueMicros: 0, pageViews: 0 }, { device: "mobile" }),
    ], { currency: "USD" }),
    envelope("adsense", [row({ pageViews: 22 })], { currency: "USD", window: { ...window, timeZone: "UTC" } }),
    envelope("adsense", [row({ pageViews: 22 })], { currency: "CAD", window: { ...window, end: "2026-11-06" } }),
    envelope("traffic", [row({ sessions: 1200, pageviews: 1234 })]),
  ]);
  assert.equal(result.status, 0, result.stderr);
  const { cohorts, sourceCounts } = JSON.parse(result.stdout);
  assert.equal(cohorts.length, 5);
  assert.equal(cohorts.find((cohort) => cohort.country === "US").sources.adsense.rates.pageRpm, 0);
  assert.equal(cohorts.filter((cohort) => cohort.sources.adsense.rates.pageRpm === null).length, 4);
  assert.equal(cohorts.find((cohort) => cohort.sources.traffic).sources.adsense.metrics.pageViews, null);
  assert.equal(sourceCounts["session-revenue"], 0);
});

test("malformed or unsafe inputs fail without printing filenames, rejected keys or partial report data", async (t) => {
  const run = await fixtureRunner(t);
  const valid = envelope("search-console", [row({ clicks: 4, impressions: 20 })]);
  const ad = { currency: "USD" };
  const cases = [
    [envelope("converters", [row({ attempts: 1, privateUserContent: "private-value" })]), /unsupported metrics/],
    [envelope("search-console", [row({ clicks: 2 }, { page: "/table-to-list?user=private-value" })]), /canonical page/],
    [envelope("search-console", [row({ clicks: 2 }, { page: "//" })]), /canonical page/],
    [envelope("search-console", [row({ clicks: 2 }, { page: "/never-a-route" })]), /canonical page/],
    [envelope("search-console", [row({ clicks: 2 }, { country: "ZZ" })]), /country or region code/],
    [envelope("search-console", [row({ clicks: 2 }, { device: "private-value" })]), /invalid device/],
    [envelope("search-console", [row({ clicks: 2 })], { window: { ...window, start: "2026-02-30" } }), /calendar window/],
    [envelope("search-console", [row({ clicks: 2 })], { window: { ...window, timeZone: "UTC" } }), /America\/Los_Angeles/],
    [envelope("adsense", [row({ adRequests: 2, matchedAdRequests: 3 })], ad), /greater than adRequests/],
    [envelope("adsense", [row({ viewableImpressions: 4, measurableImpressions: 3 })], ad), /greater than measurableImpressions/],
    [envelope("adsense", [row({ estimatedRevenueMicros: 3.1 })], ad), /invalid estimatedRevenueMicros/],
    [envelope("adsense", [row({ estimatedRevenueMicros: 3 })], { currency: "private-value" }), /currency/],
    [envelope("converters", [row({ attempts: 3, completedAttempts: 2, erroredAttempts: 2 })]), /more completed and errored attempts/],
    [envelope("field-vitals", [row({ clsP75: -1 })]), /invalid clsP75/],
    [envelope("traffic", [row({ sessions: 1, pageviews: null, engagedSessions: 2 })]), /greater than sessions/],
    [envelope("traffic", [row({ sessions: null })]), /at least one metric/],
    [Buffer.from([0xff]), /local UTF-8 JSON/],
    ['{"privateUserContent":"private-value"', /local UTF-8 JSON/],
    [Buffer.alloc(2 * 1024 * 1024 + 1), /up to 2 MiB/],
  ];
  for (const [invalid, expected] of cases) {
    const result = await run([valid, invalid]);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /Input 2/);
    assert.match(result.stderr, expected);
    assert.doesNotMatch(result.stderr, /private-value|privateUserContent|private-export-/);
  }
});

test("duplicate source cohorts fail even when canonical path spellings differ across files", async (t) => {
  const run = await fixtureRunner(t);
  const result = await run([
    envelope("search-console", [row({ clicks: 1 }, { page: "/table-to-list" })]),
    envelope("search-console", [row({ clicks: 2 }, { page: "/table-to-list/" })]),
  ]);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Input 2, row 1 duplicates a source/);
});
