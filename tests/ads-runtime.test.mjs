import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles } = await build({
  stdin: {
    contents: 'export * from "./app/client/components/advertising/ad-runtime"; export * from "./app/client/components/advertising/adsense-provider"; export * from "./app/client/components/advertising/ad-config";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true, write: false, platform: "node", format: "esm",
});
const api = await import("data:text/javascript;base64," + Buffer.from(outputFiles[0].text).toString("base64"));
const production = "https://www.alltextconverters.com";

function fixture(overrides = {}) {
  let allowed = false;
  let width = 200;
  let onConsent = () => {};
  let onSize = () => {};
  let signal;
  let report;
  let mounts = 0;
  let clears = 0;
  const states = [];
  const latch = api.createPlaceholderLatch();
  const runtime = {
    enabled: true, emergencyStop: false, approvedOrigin: production,
    allowedPaths: new Set(["/", "/privacy-policy"]),
    consent: { isAllowed: () => allowed, subscribe(cb) { onConsent = cb; return () => { onConsent = () => {}; }; } },
    provider: { async mount(_target, abort, update) { mounts++; signal = abort; report = update; } },
    ...overrides.runtime,
  };
  const cleanup = api.observeAdSlot({
    target: { replaceChildren() { clears++; } }, runtime, origin: production,
    pathname: "/", placement: "below-utility", getWidth: () => width,
    watchWidth(cb) { onSize = cb; return () => { onSize = () => {}; }; },
    onState: (state) => states.push(state), onFill: latch.confirmFill,
    ...overrides.options,
  });
  return {
    runtime, latch, states, cleanup, get mounts() { return mounts; }, get signal() { return signal; },
    get clears() { return clears; }, report(value) { report?.(value); },
    allow(value) { allowed = value; onConsent(); }, size(value) { width = value; onSize(); },
  };
}

test("ad configuration ships empty and the ad policy rejects disallowed surfaces", async () => {
  assert.equal(api.configuredDisplay(api.approvedDisplay), null);
  assert.equal(api.configuredDisplay({ enabled: true, emergencyStop: true }), null);
  for (const fixtureOptions of [
    { runtime: { emergencyStop: true } },
    { runtime: { enabled: false } },
    { options: { origin: "https://deploy-preview.example.net" } },
    { options: { pathname: "/privacy-policy" } },
    { options: { placement: "top-banner" } },
  ]) {
    const slot = fixture(fixtureOptions);
    slot.allow(true);
    slot.size(640);
    await Promise.resolve();
    assert.equal(slot.mounts, 0);
    slot.cleanup();
  }
});

test("approved converter placements use distinct route units and one below-utility slot", () => {
  const config = { enabled: true, emergencyStop: false, publisher: "ca-pub-" + "0".repeat(16),
    units: { "/table-to-list": "0000000001", "/byte-counter": "0000000002" } };
  const runtime = api.configuredDisplay(config);
  assert.ok(runtime);
  assert.equal(api.canMountLiveAd(runtime, production, "/", "below-utility"), false);
  assert.equal(api.canMountLiveAd(runtime, production, "/table-to-list", "below-utility"), true);
  assert.equal(api.canMountLiveAd(runtime, production, "/byte-counter", "below-utility"), true);
  assert.equal(api.canMountLiveAd(runtime, production, "/table-to-list", "info-square"), false);
  for (const units of [
    {}, { "/table-to-list/": "0000000001" }, { "/about": "0000000001" },
    { "/table-to-list": "invalid" }, { "/table-to-list": "0000000001", "/byte-counter": "0000000001" },
  ]) assert.equal(api.configuredDisplay({ ...config, units }), null);
});

test("converter slots decline narrow content and ignore a late response after navigation", async () => {
  let pathAtMount;
  let notify;
  const first = fixture({
    options: { pathname: "/table-to-list" },
    runtime: {
      allowedPaths: new Set(["/table-to-list", "/byte-counter"]),
      provider: { async mount(_target, _signal, report, path) { pathAtMount = path; notify = report; } },
    },
  });
  first.allow(true);
  first.size(272);
  await Promise.resolve();
  assert.equal(pathAtMount, undefined);
  first.size(288);
  await Promise.resolve();
  assert.equal(pathAtMount, undefined);
  first.size(320);
  await Promise.resolve();
  assert.equal(pathAtMount, "/table-to-list");
  first.cleanup();
  notify("filled");
  assert.equal(first.latch.getSnapshot(), false);
});

test("ad slot waits for width and consent, suppresses globally after verified fill, and retires without refresh", async () => {
  const slot = fixture();
  let announcements = 0;
  slot.latch.subscribe(() => announcements++);
  slot.allow(true);
  await Promise.resolve();
  assert.equal(slot.mounts, 0);
  slot.size(320);
  await Promise.resolve();
  assert.equal(slot.mounts, 1);
  slot.report("unknown");
  assert.equal(slot.latch.getSnapshot(), false);
  slot.report("filled");
  slot.report("filled");
  assert.equal(slot.latch.getSnapshot(), true);
  assert.equal(announcements, 1);
  slot.allow(false);
  assert.equal(slot.signal.aborted, true);
  assert.deepEqual(slot.states, ["requesting", "filled", "retired"]);
  slot.allow(true);
  slot.size(640);
  await Promise.resolve();
  assert.equal(slot.mounts, 1);
  slot.cleanup();
  assert.equal(slot.latch.getSnapshot(), true);
});

test("no-fill, script failure and stale navigation callbacks cannot suppress placeholders", async () => {
  const unfilled = fixture();
  unfilled.size(640); unfilled.allow(true);
  await Promise.resolve();
  unfilled.report("unfilled");
  assert.equal(unfilled.latch.getSnapshot(), false);
  assert.equal(unfilled.signal.aborted, true);
  unfilled.cleanup();
  const late = fixture();
  late.size(640); late.allow(true);
  await Promise.resolve();
  late.cleanup();
  late.report("filled");
  assert.equal(late.latch.getSnapshot(), false);
  const failed = fixture({ runtime: { provider: { async mount() { throw new Error("blocked"); } } } });
  failed.size(640); failed.allow(true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(failed.states, ["requesting", "failed"]);
  failed.cleanup();
  assert.equal(api.adSenseState("unfill-optimized"), "unfilled");
  assert.equal(api.adSenseState("filled"), "filled");
  assert.equal(api.adSenseState("done"), undefined);
});
test("the provider rechecks permission immediately before requesting a unit after script load", async () => {
  const { JSDOM } = await import("jsdom");
  const { window } = new JSDOM("<!doctype html><div id='target'></div>");
  const originalWindow = globalThis.window;
  globalThis.window = window;
  try {
    const node = window.document.getElementById("target");
    Object.defineProperty(node, "clientWidth", { value: 320 });
    let allowed = true;
    const states = [];
    const provider = api.createAdSenseDisplayProvider("ca-pub-" + "0".repeat(16), new Map([["/", "0000000001"]]));
    const pending = provider.mount(node, new AbortController().signal, state => states.push(state), "/", () => allowed);
    const script = window.document.querySelector("script");
    assert.ok(script);
    allowed = false;
    script.dispatchEvent(new window.Event("load"));
    await pending;
    assert.deepEqual(states, ["failed"]);
    assert.equal(node.childElementCount, 0);
    assert.equal(window.adsbygoogle, undefined);
  } finally {
    window.close();
    globalThis.window = originalWindow;
  }
});

import "./google-consent.test.mjs";
