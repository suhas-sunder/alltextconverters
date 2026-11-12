import { constants, open, readFile } from "node:fs/promises";

const MAX_FILES = 24;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 10_000;
const MAX_TOTAL_ROWS = 20_000;
const regionNames = new Intl.DisplayNames("en", { type: "region", fallback: "none" });
const timeZones = new Set(["UTC", ...Intl.supportedValuesOf("timeZone")]);
const currencies = new Set(Intl.supportedValuesOf("currency"));

const count = (value) => Number.isSafeInteger(value) && value >= 0;
const decimal = (value) => Number.isFinite(value) && value >= 0;
const ratio = (numerator, denominator) =>
  numerator != null && denominator > 0 ? numerator / denominator : null;
const rpm = (micros, denominator) => {
  const microsPerUnit = ratio(micros, denominator);
  return microsPerUnit === null ? null : microsPerUnit / 1000;
};

const sources = {
  "search-console": {
    fields: { clicks: count, impressions: count, averagePosition: (value) => decimal(value) && value >= 1 },
    subsets: [["clicks", "impressions"]],
    rates: (m) => ({ ctr: ratio(m.clicks, m.impressions) }),
  },
  traffic: {
    fields: {
      sessions: count,
      organicLandingSessions: count,
      engagedSessions: count,
      pageviews: count,
      adEligiblePageviews: count,
    },
    subsets: [
      ["organicLandingSessions", "sessions"],
      ["engagedSessions", "sessions"],
      ["adEligiblePageviews", "pageviews"],
    ],
    rates: (m) => ({
      organicLandingRate: ratio(m.organicLandingSessions, m.sessions),
      engagementRate: ratio(m.engagedSessions, m.sessions),
      adEligiblePageviewRate: ratio(m.adEligiblePageviews, m.pageviews),
    }),
  },
  adsense: {
    monetary: true,
    fields: {
      estimatedRevenueMicros: Number.isSafeInteger,
      pageViews: count,
      adImpressions: count,
      adRequests: count,
      matchedAdRequests: count,
      measurableImpressions: count,
      viewableImpressions: count,
    },
    subsets: [
      ["matchedAdRequests", "adRequests"],
      ["measurableImpressions", "adImpressions"],
      ["viewableImpressions", "measurableImpressions"],
      ["viewableImpressions", "adImpressions"],
    ],
    rates: (m) => ({
      pageRpm: rpm(m.estimatedRevenueMicros, m.pageViews),
      adImpressionRpm: rpm(m.estimatedRevenueMicros, m.adImpressions),
      coverage: ratio(m.matchedAdRequests, m.adRequests),
      viewability: ratio(m.viewableImpressions, m.measurableImpressions),
    }),
  },
  "session-revenue": {
    monetary: true,
    fields: { estimatedRevenueMicros: Number.isSafeInteger, eligibleSessions: count },
    subsets: [],
    rates: (m) => ({ eligibleSessionRpm: rpm(m.estimatedRevenueMicros, m.eligibleSessions) }),
  },
  converters: {
    fields: { attempts: count, completedAttempts: count, erroredAttempts: count, successfulCopies: count, initiatedDownloads: count },
    subsets: [["completedAttempts", "attempts"], ["erroredAttempts", "attempts"]],
    rates: (m) => ({
      completionRate: ratio(m.completedAttempts, m.attempts),
      errorRate: ratio(m.erroredAttempts, m.attempts),
    }),
  },
  "field-vitals": {
    fields: { lcpP75Ms: decimal, inpP75Ms: decimal, clsP75: decimal },
    subsets: [],
    rates: () => ({}),
  },
};
const sourceNames = Object.keys(sources);

class InvalidInput extends Error {}

function requireCondition(condition, message) {
  if (!condition) throw new InvalidInput(message);
}

function hasOnlyKeys(value, keys) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).every((key) => keys.includes(key));
}

function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizePage(page, allowedPaths) {
  if (page === null) return null;
  return allowedPaths.get(page);
}

function validateMetrics(metrics, schema, where) {
  const fields = Object.keys(schema.fields);
  requireCondition(hasOnlyKeys(metrics, fields), where + " has an unsupported metrics field or structure.");
  const normalized = {};
  for (const field of fields) {
    const value = metrics[field] ?? null;
    requireCondition(value === null || schema.fields[field](value), where + " has an invalid " + field + ".");
    normalized[field] = value;
  }
  requireCondition(Object.values(normalized).some((value) => value !== null), where + " requires at least one metric.");
  for (const [part, total] of schema.subsets) {
    const left = normalized[part];
    const right = normalized[total];
    requireCondition(left === null || right === null || left <= right, where + " has " + part + " greater than " + total + ".");
  }
  return normalized;
}

function importEnvelope(document, index, site, allowedPaths, cohorts, sourceCounts) {
  const where = "Input " + index;
  requireCondition(
    hasOnlyKeys(document, ["version", "site", "source", "window", "currency", "rows"]),
    where + " has an unsupported envelope field or structure.",
  );
  const { source, window, currency, rows } = document;
  requireCondition(document.version === 1 && document.site === site, where + " requires version 1 and the canonical site origin.");
  requireCondition(sourceNames.includes(source), where + " has an unsupported source.");
  const schema = sources[source];
  requireCondition(schema.monetary ? currencies.has(currency) : currency === undefined, where + " has an invalid or unsupported currency.");
  requireCondition(
    hasOnlyKeys(window, ["start", "end", "timeZone"]) && isDate(window.start) && isDate(window.end)
      && window.start <= window.end && timeZones.has(window.timeZone),
    where + " requires an inclusive calendar window and supported reporting time zone.",
  );
  requireCondition(
    source !== "search-console" || window.timeZone === "America/Los_Angeles",
    where + " requires America/Los_Angeles for Search Console.",
  );
  requireCondition(Array.isArray(rows) && rows.length >= 1 && rows.length <= MAX_ROWS, where + " requires 1 to 10,000 rows.");

  for (const [offset, row] of rows.entries()) {
    const rowLocation = where + ", row " + (offset + 1);
    requireCondition(hasOnlyKeys(row, ["page", "country", "device", "metrics"]), rowLocation + " has an unsupported row field or structure.");
    const { country, device } = row;
    const page = normalizePage(row.page, allowedPaths);
    requireCondition(page !== undefined, rowLocation + " requires a canonical page path or null.");
    requireCondition(country === null || (
      typeof country === "string" && /^[A-Z]{2}$/.test(country) && country !== "ZZ" && regionNames.of(country)
    ), rowLocation + " requires a recognized two-letter country or region code or null.");
    requireCondition([null, "desktop", "mobile", "tablet"].includes(device), rowLocation + " has an invalid device.");
    const metrics = validateMetrics(row.metrics, schema, rowLocation);
    if (source === "converters" && metrics.attempts !== null && metrics.completedAttempts !== null && metrics.erroredAttempts !== null) {
      requireCondition(
        metrics.completedAttempts <= metrics.attempts - metrics.erroredAttempts,
        rowLocation + " has more completed and errored attempts than total attempts.",
      );
    }

    const key = JSON.stringify([window.start, window.end, window.timeZone, page, country, device]);
    const cohort = cohorts.get(key) ?? { window, page, country, device, sources: {} };
    requireCondition(!Object.hasOwn(cohort.sources, source), rowLocation + " duplicates a source for the same window and segment.");
    cohort.sources[source] = { ...(schema.monetary ? { currency } : {}), metrics, rates: schema.rates(metrics) };
    cohorts.set(key, cohort);
    sourceCounts[source]++;
  }
}

async function readEnvelope(path, index) {
  const where = "Input " + index;
  try {
    const file = await open(path, constants.O_RDONLY | constants.O_NONBLOCK);
    try {
      const stat = await file.stat();
      requireCondition(stat.isFile() && stat.size <= MAX_BYTES, where + " requires a regular file up to 2 MiB.");
      const buffer = Buffer.allocUnsafe(MAX_BYTES + 1);
      let length = 0;
      while (length < buffer.length) {
        const { bytesRead } = await file.read(buffer, length, buffer.length - length, length);
        if (bytesRead === 0) break;
        length += bytesRead;
      }
      requireCondition(length <= MAX_BYTES, where + " exceeds 2 MiB.");
      return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, length)));
    } finally {
      await file.close();
    }
  } catch (error) {
    if (error instanceof InvalidInput) throw error;
    throw new InvalidInput(where + " could not be read as local UTF-8 JSON.");
  }
}

async function loadPageRegistry() {
  const xml = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
  if (urls.length === 0) throw new Error("The local sitemap contains no URLs.");
  const site = urls[0].origin;
  const allowedPaths = new Map([["/", "/"]]);
  for (const { pathname } of urls) {
    if (pathname === "/") continue;
    const base = pathname.replace(/\/$/, "");
    allowedPaths.set(base, pathname);
    allowedPaths.set(base + "/", pathname);
  }
  return { site, allowedPaths };
}

function formatMarkdown(report) {
  const lines = ["# AllTextConverters aggregate measurement", "", "## Rows by source", ""];
  for (const [source, count] of Object.entries(report.sourceCounts)) lines.push("- " + source + " | " + (count || "unavailable"));
  for (const cohort of report.cohorts) {
    const { window, page, country, device } = cohort;
    const segment = [page ?? "site-wide", country ?? "all countries", device ?? "all devices"];
    lines.push("", "## " + window.start + " to " + window.end + " (" + window.timeZone + ")", "", segment.join(" | "));
    for (const [source, data] of Object.entries(cohort.sources)) {
      lines.push("", "### " + source + (data.currency ? " (" + data.currency + ")" : ""), "", "| Metric | Value |", "| --- | --- |");
      for (const [name, value] of Object.entries(data.metrics)) {
        const displayed = name === "estimatedRevenueMicros" && value !== null ? value / 1_000_000 : value;
        lines.push("| " + (name === "estimatedRevenueMicros" ? "estimatedRevenue" : name) + " | " + (displayed ?? "unavailable") + " |");
      }
      for (const [name, value] of Object.entries(data.rates)) {
        const displayed = value === null ? "unavailable" : name.endsWith("Rpm") ? value.toFixed(4) : (value * 100).toFixed(2) + "%";
        lines.push("| " + name + " | " + displayed + " |");
      }
    }
  }
  return lines.join("\n") + "\n";
}

const usage = "Usage: node scripts/measurement-report.mjs [--format json|markdown] FILE [FILE ...]";

async function main(args) {
  if (args.length === 1 && args[0] === "--help") {
    process.stdout.write(usage + "\n");
    return;
  }
  const format = args[0] === "--format" ? args[1] : "json";
  const files = args[0] === "--format" ? args.slice(2) : args;
  requireCondition(
    ["json", "markdown"].includes(format) && files.length > 0 && files.length <= MAX_FILES
      && files.every((path) => !path.startsWith("--")),
    usage,
  );
  const { site, allowedPaths } = await loadPageRegistry();
  const cohorts = new Map();
  const sourceCounts = Object.fromEntries(sourceNames.map((source) => [source, 0]));
  let rowCount = 0;
  for (const [offset, path] of files.entries()) {
    const index = offset + 1;
    const document = await readEnvelope(path, index);
    if (Array.isArray(document?.rows)) {
      rowCount += document.rows.length;
      requireCondition(rowCount <= MAX_TOTAL_ROWS, "The report supports up to 20,000 total rows.");
    }
    importEnvelope(document, index, site, allowedPaths, cohorts, sourceCounts);
  }
  const report = {
    version: 1, site, sourceCounts,
    cohorts: [...cohorts.keys()].sort().map((key) => cohorts.get(key)),
  };
  process.stdout.write(format === "json" ? JSON.stringify(report, null, 2) + "\n" : formatMarkdown(report));
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  const message = error instanceof InvalidInput ? error.message : "Could not generate the measurement report.";
  process.stderr.write(message + "\n");
  process.exitCode = 1;
}
