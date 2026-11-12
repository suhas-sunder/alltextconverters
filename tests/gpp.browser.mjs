import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const [base, playwright, executablePath] = process.argv.slice(2);
assert.ok(base && playwright && executablePath, "Pass a built origin, Playwright Core path and Edge executable.");
const root = fileURLToPath(new URL("../", import.meta.url));
const { chromium } = createRequire(import.meta.url)(resolve(playwright));
const source = [
  'import { CmpApi } from "@iabgpp/cmpapi";',
  'import { createOneTrustConsent } from "./app/client/components/advertising/onetrust-consent";',
  'import { observeAdSlot, createPlaceholderLatch } from "./app/client/components/advertising/ad-runtime";',
  'window.adFixture = { CmpApi, createOneTrustConsent, observeAdSlot, createPlaceholderLatch };',
].join("\n");
const { outputFiles } = await build({ stdin: { contents: source, resolveDir: root }, bundle: true, write: false, format: "iife" });
const browser = await chromium.launch({ executablePath });
try {
  for (const width of [320, 375, 768, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width <= 768, serviceWorkers: "block" });
    const providerAttempts = [];
    await context.route(url => /googlesyndication|doubleclick|fundingchoicesmessages|onetrust|cookielaw|google-analytics|googletagmanager/i.test(url.hostname), route => {
      providerAttempts.push(route.request().url());
      return route.abort();
    });
    const page = await context.newPage();
    for (const path of ["/", "/table-to-list/", "/json-array-to-list/", "/byte-counter/"]) {
      await page.goto(new URL(path, base).href, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => {
        const placements = document.querySelectorAll('main [data-ad-placement="below-utility"]');
        const slot = placements[0];
        return { slots: placements.length, gap: slot.getBoundingClientRect().top - slot.previousElementSibling.getBoundingClientRect().bottom,
          live: document.querySelectorAll('ins.adsbygoogle').length, cmp: Boolean(window.__gpp || window.__tcfapi || window.googlefc || window.OneTrust) };
      });
      assert.equal(metrics.slots, 1, path);
      assert.ok(metrics.gap >= 16, path);
      assert.equal(metrics.live, 0, path);
      assert.equal(metrics.cmp, false, path);
    }
    await page.addScriptTag({ content: outputFiles[0].text });
    const trace = await page.evaluate(async () => {
      const { CmpApi, createOneTrustConsent, observeAdSlot, createPlaceholderLatch } = window.adFixture;
      const cmp = new CmpApi(28, 1);
      let tcf;
      let state = "CA";
      let choiceValid = true;
      const host = Object.assign(new EventTarget(), {
        navigator: {}, OnetrustActiveGroups: "ads",
        __tcfapi(command, _version, callback) { if (command === "addEventListener") tcf = callback; },
        OneTrust: { getGeolocationData: () => ({ country: "US", state }),
          IsAlertBoxClosed: () => choiceValid, ToggleInfoDisplay() {} },
      });
      const consent = createOneTrustConsent({ cmpId: 28, minimumPolicyVersion: 4,
        regional: { usGppCmpId: 28, markets: { US: { subdivisions: ["CA", "VA"], advertisingGroup: "ads" } } } }, () => host);
      const stop = consent.start();
      const results = [consent.isAllowed()];
      host.__gpp = window.__gpp;
      const update = (section, id, fields) => {
        cmp.setSignalStatus("not ready");
        cmp.clear();
        cmp.setApplicableSections([id]);
        for (const [key, value] of Object.entries(fields)) cmp.setFieldValue(section, key, value);
        cmp.setCmpStatus("loaded");
        cmp.setCmpDisplayStatus("hidden");
        cmp.setSignalStatus("ready");
      };
      const national = { Version: 1, SaleOptOut: 2, SharingOptOut: 2, TargetedAdvertisingOptOut: 2 };
      update("usnat", 7, national);
      tcf({ cmpId: 28, tcfPolicyVersion: 4, gdprApplies: false }, true);
      const deadline = performance.now() + 3000;
      while (!consent.isAllowed() && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 30));
      results.push(consent.isAllowed());
      update("usnat", 7, { ...national, Version: 2 });
      results.push(consent.isAllowed());
      update("usca", 8, { SaleOptOut: 2, SharingOptOut: 2 });
      results.push(consent.isAllowed());
      state = "VA";
      host.dispatchEvent(new Event("pageshow"));
      results.push(consent.isAllowed());
      update("usva", 9, { SaleOptOut: 2, TargetedAdvertisingOptOut: 2 });
      results.push(consent.isAllowed());
      const node = document.createElement("div");
      document.body.append(node);
      const origin = "https://www.alltextconverters.com";
      const latch = createPlaceholderLatch();
      let measuredWidth = 288;
      let refresh;
      let mounts = 0;
      const states = [];
      const runtime = { enabled: true, emergencyStop: false, approvedOrigin: origin, allowedPaths: new Set(["/byte-counter"]), consent,
        provider: { async mount(target, _abort, report) { mounts++; target.textContent = "simulated creative"; report("filled"); } } };
      const options = { target: node, runtime, origin, pathname: "/byte-counter", placement: "below-utility",
        getWidth: () => measuredWidth, watchWidth: callback => { refresh = callback; return () => {}; },
        onState: state => states.push(state), onFill: latch.confirmFill };
      const dispose = observeAdSlot(options);
      await Promise.resolve();
      const narrowMounts = mounts;
      measuredWidth = 320;
      refresh();
      await Promise.resolve();
      consent.reopenChoices();
      results.push(consent.isAllowed());
      choiceValid = false;
      host.dispatchEvent(new Event("OTConsentApplied"));
      results.push(consent.isAllowed());
      choiceValid = true;
      host.dispatchEvent(new Event("OneTrustGroupsUpdated"));
      update("usva", 9, { SaleOptOut: 1, TargetedAdvertisingOptOut: 2 });
      results.push(consent.isAllowed());
      update("usva", 9, { SaleOptOut: 2, TargetedAdvertisingOptOut: 2 });
      host.navigator.globalPrivacyControl = true;
      results.push(consent.isAllowed());
      dispose();
      const off = observeAdSlot({ ...options, runtime: { ...runtime, emergencyStop: true } });
      off();
      stop();
      node.remove();
      return { results, narrowMounts, mounts, states, latched: latch.getSnapshot() };
    });
    assert.deepEqual(trace, { results: [false, true, true, true, false, true, false, false, false, false],
      narrowMounts: 0, mounts: 1, states: ["requesting", "filled", "retired"], latched: true });
    assert.deepEqual(providerAttempts, []);
    await context.close();
    console.log(width + " px passed IAB reference CMP events, placement, denial, withdrawal and the fill latch");
  }
} finally {
  await browser.close();
}
