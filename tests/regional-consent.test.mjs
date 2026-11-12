import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const { outputFiles } = await build({
  stdin: {
    contents: 'export * from "./app/client/components/advertising/google-consent"; export * from "./app/client/components/advertising/regional-consent"; export * from "./app/client/components/advertising/onetrust-consent"; export * from "./app/client/components/advertising/ad-runtime";',
    resolveDir: fileURLToPath(new URL("../", import.meta.url)),
  },
  bundle: true, write: false, platform: "node", format: "esm",
});
const api = await import("data:text/javascript;base64," + Buffer.from(outputFiles[0].text).toString("base64"));

const regional = {
  usGppCmpId: 28,
  markets: {
    US: { subdivisions: ["CA"], advertisingGroup: "ads-us" },
    CA: { subdivisions: ["ON", "QC"], advertisingGroup: "ads-ca" },
    AU: { subdivisions: ["NSW"], advertisingGroup: "ads-au" },
    NZ: { subdivisions: ["AUK"], advertisingGroup: "ads-nz" },
  },
};
const approval = { cmpId: 28, minimumPolicyVersion: 4, regional };
const tcfOutside = { cmpId: 28, tcfPolicyVersion: 4, gdprApplies: false, listenerId: 6 };
const gpp = {
  cmpId: 28, gppVersion: "1.1", cmpStatus: "loaded", signalStatus: "ready", cmpDisplayStatus: "hidden",
  applicableSections: [7], sectionList: [7], gppString: "test-fixture",
  parsedSections: { usnat: [{ Version: 1, SaleOptOut: 2, SharingOptOut: 2, TargetedAdvertisingOptOut: 2 }] },
};
const affirmative = { ...tcfOutside, gdprApplies: true, cmpStatus: "loaded", eventStatus: "tcloaded", tcString: "test-fixture",
  vendor: { consents: { 755: true } }, purpose: { consents: { 1: true, 2: true, 3: true, 4: true, 7: true, 9: true, 10: true } } };

test("approved TCF non-applicability is distinct from unknown and from TCF consent", () => {
  assert.equal(api.readTcfApplicability(tcfOutside, true, approval), "outside");
  for (const candidate of [
    { ...tcfOutside, gdprApplies: undefined }, { ...tcfOutside, gdprApplies: "false" },
    { ...tcfOutside, cmpId: 7 }, { ...tcfOutside, tcfPolicyVersion: 3 }, { ...tcfOutside, cmpStatus: "stub" },
  ]) assert.equal(api.readTcfApplicability(candidate, true, approval), "unknown");
  assert.equal(api.readTcfApplicability(tcfOutside, false, approval), "unknown");
  assert.equal(api.readTcfApplicability(affirmative, true, approval), "applies");
  assert.notEqual(api.evaluateGoogleConsent(tcfOutside, true, approval), "allowed");
  const outside = () => true;
  assert.equal(api.allowsAdDecision("unknown", false, outside, false), false);
  assert.equal(api.allowsAdDecision("applies", false, outside, false), false);
  assert.equal(api.allowsAdDecision("applies", true, outside, false), true);
  assert.equal(api.allowsAdDecision("applies", true, outside, true), false);
});

test("each reviewed subdivision requires its own affirmative CMP advertising choice", () => {
  for (const [country, state] of [["us", "ca"], ["ca", "on"], ["au", "nsw"], ["nz", "auk"]]) {
    const fixture = { location: { country, state }, groups: ",necessary,ads-" + country + ",",
      choiceValid: true, globalPrivacyControl: false, gpp };
    assert.equal(api.allowsRegionalAdvertising(regional, fixture), true, country);
    for (const override of [
      { groups: "necessary,ads-" + country + "-similar" }, { choiceValid: false }, { globalPrivacyControl: true },
      { location: { country } }, { location: { country, state: "XX" } }, { location: { country: "GB", state } },
    ]) assert.equal(api.allowsRegionalAdvertising(regional, { ...fixture, ...override }), false, country);
  }
});

test("US refuses stale, unapproved, ambiguous, or opted-out GPP", () => {
  const fixture = { location: { country: "US", state: "CA" }, groups: "ads-us", choiceValid: true, globalPrivacyControl: false };
  const core = gpp.parsedSections.usnat[0];
  for (const candidate of [
    undefined, { ...gpp, cmpId: 9 }, { ...gpp, signalStatus: "not ready" }, { ...gpp, applicableSections: [7, 8] },
    { ...gpp, cmpDisplayStatus: "visible" }, { ...gpp, gppString: "" },
    { ...gpp, parsedSections: { usnat: [core, { SubsectionType: 1, Gpc: true }] } },
    ...["SaleOptOut", "SharingOptOut", "TargetedAdvertisingOptOut"].map(field =>
      ({ ...gpp, parsedSections: { usnat: [{ ...core, [field]: 1 }] } })),
  ]) assert.equal(api.allowsRegionalAdvertising(regional, { ...fixture, gpp: candidate }), false);
});

test("consent transitions block pending requests, revoke a filled slot and keep the global latch", async () => {
  let tcfCallback, gppCallback, mounts = 0, cleared = 0, shown = 0, removed = 0, report;
  const host = Object.assign(new EventTarget(), {
    navigator: {},
    OneTrust: {
      getGeolocationData: () => ({ country: "US", state: "CA" }),
      IsAlertBoxClosed: () => true,
      ToggleInfoDisplay() { shown++; },
    },
    OnetrustActiveGroups: "ads-us",
    __tcfapi(command, _version, callback) {
      if (command === "addEventListener") tcfCallback = callback;
      else removed++;
    },
    __gpp(command, callback) {
      if (command === "addEventListener") gppCallback = callback;
      else removed++;
    },
  });
  const consent = api.createOneTrustConsent(approval, () => host);
  const origin = "https://www.alltextconverters.com";
  const latch = api.createPlaceholderLatch();
  const states = [];
  const unmount = api.observeAdSlot({
    target: { replaceChildren() { cleared++; } }, origin, pathname: "/", placement: "below-utility",
    runtime: { enabled: true, emergencyStop: false, approvedOrigin: origin, allowedPaths: new Set(["/"]), consent,
      provider: { async mount(_node, _signal, onReport) { mounts++; report = onReport; } } },
    getWidth: () => 320, watchWidth: () => () => {}, onState: value => states.push(value), onFill: latch.confirmFill,
  });
  const stop = consent.start();
  try {
    tcfCallback(tcfOutside, true);
    await Promise.resolve();
    assert.equal(mounts, 0);
    gppCallback({ eventName: "signalStatus", listenerId: 7, pingData: gpp }, true);
    await Promise.resolve();
    assert.equal(mounts, 1);
    report("filled");
    assert.equal(latch.getSnapshot(), true);
    assert.equal(consent.reopenChoices(), true);
    assert.equal(shown, 1);
    assert.equal(consent.isAllowed(), false);
    assert.equal(cleared, 1);
    assert.deepEqual(states, ["requesting", "filled", "retired"]);
    host.dispatchEvent(new Event("OneTrustGroupsUpdated"));
    assert.equal(consent.isAllowed(), false);
    host.OnetrustActiveGroups = "necessary";
    host.dispatchEvent(new Event("OTConsentApplied"));
    assert.equal(consent.isAllowed(), false);
    host.OnetrustActiveGroups = "ads-us";
    host.dispatchEvent(new Event("OTConsentApplied"));
    assert.equal(consent.isAllowed(), true);
    assert.equal(mounts, 1);
    assert.equal(latch.getSnapshot(), true);
  } finally {
    unmount();
    stop();
  }
  assert.equal(removed, 2);
  assert.equal(consent.isAllowed(), false);
});
