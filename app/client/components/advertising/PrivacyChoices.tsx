import { useState } from "react";
import { createGoogleConsentBridge, type GoogleCmpApproval, type TcfApi } from "./google-consent";
import { createOneTrustConsent, type OneTrustApproval, type OneTrustConsentWindow } from "./onetrust-consent";

type ConsentWindow = Window & {
  __tcfapi?: TcfApi;
  googlefc?: {
    callbackQueue?: { push(callback: { CONSENT_DATA_READY(): void }): unknown };
    showRevocationMessage?: () => void;
  };
};

// Owner must approve a provisioned Google Privacy & Messaging account and its TCF settings.
export const approvedGoogleCmp: GoogleCmpApproval | null = null;
export const approvedOneTrustCmp: OneTrustApproval | null = null;

export function configuredConsent(oneTrust: OneTrustApproval | null, google: GoogleCmpApproval | null) {
  if (!oneTrust) return configuredGoogleConsent(google);
  if (google || oneTrust.cmpId !== 28 || !Number.isSafeInteger(oneTrust.minimumPolicyVersion) ||
      oneTrust.minimumPolicyVersion <= 0) return null;
  return createOneTrustConsent(oneTrust, () => window as unknown as OneTrustConsentWindow);
}

export function configuredGoogleConsent(config: GoogleCmpApproval | null) {
  if (!config || !Number.isSafeInteger(config.cmpId) || config.cmpId <= 0 ||
      !Number.isSafeInteger(config.minimumPolicyVersion) || config.minimumPolicyVersion <= 0) return null;
  return createGoogleConsentBridge(config, {
    getApi() {
      const host = window as ConsentWindow;
      return typeof host.__tcfapi === "function" ? host.__tcfapi.bind(host) : undefined;
    },
    getPrivacyOpener() {
      const cmp = (window as ConsentWindow).googlefc;
      if (typeof cmp?.showRevocationMessage !== "function" || typeof cmp.callbackQueue?.push !== "function") return;
      const queue = cmp.callbackQueue;
      return () => queue.push({ CONSENT_DATA_READY() {
        try { cmp.showRevocationMessage?.(); } catch { /* The bridge already suspended permission. */ }
      } });
    },
  });
}

export function PrivacyChoices({ reopen }: { reopen(): boolean }) {
  const [message, setMessage] = useState("");
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-800">
      <button
        type="button"
        className="min-h-11 rounded px-2 underline focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => setMessage(reopen() ? "" : "Privacy choices are unavailable. Try again in a moment.")}
      >
        Privacy choices
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
