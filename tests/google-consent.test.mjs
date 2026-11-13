import assert from "node:assert/strict";
import test from "node:test";
import { createGoogleConsentBridge, evaluateGoogleConsent } from "../app/client/components/advertising/google-consent.ts";

const approval = { cmpId: 42, minimumPolicyVersion: 5 };
const granted = {
  cmpId: approval.cmpId, tcfPolicyVersion: 5, cmpStatus: "loaded", eventStatus: "tcloaded",
  gdprApplies: true, tcString: "fixture", listenerId: 7,
  vendor: { consents: { 755: true } },
  purpose: { consents: Object.fromEntries([1, 2, 3, 4, 7, 9, 10].map((id) => [id, true])) },
};

test("TCF gate requires a settled positive consent from the approved CMP", () => {
  assert.equal(evaluateGoogleConsent(granted, true, approval), "allowed");
  for (const data of [
    { ...granted, cmpId: 99 },
    { ...granted, tcfPolicyVersion: 4 },
    { ...granted, gdprApplies: false },
    { ...granted, tcString: "" },
    { ...granted, vendor: { consents: { 755: "true" } } },
    { ...granted, publisher: { restrictions: { 4: { 755: 0 } } } },
    { ...granted, purpose: { consents: { 1: true } } },
  ]) assert.equal(evaluateGoogleConsent(data, true, approval), "denied");
  assert.equal(evaluateGoogleConsent({ ...granted, eventStatus: "cmpuishown" }, true, approval), "pending");
  assert.equal(evaluateGoogleConsent(granted, false, approval), "pending");
});

test("consent bridge handles delayed readiness, privacy reopening, refusal, and removal", async () => {
  let api;
  let callback;
  const removed = [];
  let reopened = 0;
  const source = { getApi: () => api, getPrivacyOpener: () => () => reopened++ };
  const bridge = createGoogleConsentBridge(approval, source);
  const transitions = [];
  bridge.subscribe(() => transitions.push(bridge.getSnapshot()));
  const stop = bridge.start(1, 500);
  try {
    assert.equal(bridge.isAllowed(), false);
    api = (command, version, next, id) => {
      assert.equal(version, 2);
      if (command === "addEventListener") callback = next;
      else removed.push(id);
    };
    for (let i = 0; i < 50 && !callback; i++) await new Promise((resolve) => setTimeout(resolve, 4));
    assert.equal(typeof callback, "function");
    callback(granted, true);
    assert.equal(bridge.isAllowed(), true);
    assert.equal(bridge.reopenChoices(), true);
    assert.equal(reopened, 1);
    assert.equal(bridge.isAllowed(), false);
    callback({ ...granted, vendor: {}, eventStatus: "useractioncomplete" }, true);
    assert.deepEqual(transitions, ["allowed", "pending", "denied"]);
  } finally { stop(); }
  assert.deepEqual(removed, [7]);
  callback(granted, true);
  assert.equal(bridge.isAllowed(), false);
});
