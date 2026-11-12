import { createGoogleConsentBridge, type GoogleCmpApproval, type TcfApi } from "./google-consent";
import { allowsAdDecision, allowsRegionalAdvertising, type ConsentController, type RegionalApproval } from "./regional-consent";

type GppApi = (
  command: "addEventListener" | "removeEventListener",
  callback: (event: GppEvent | undefined, success: boolean) => void,
  listenerId?: number,
) => void;

interface GppEvent {
  eventName: string;
  data?: unknown;
  listenerId?: number;
  pingData?: unknown;
}

export interface OneTrustConsentWindow extends EventTarget {
  OneTrust?: {
    getGeolocationData(): unknown;
    IsAlertBoxClosed(): boolean;
    ToggleInfoDisplay(): void;
  };
  OnetrustActiveGroups?: string;
  __tcfapi?: TcfApi;
  __gpp?: GppApi;
  navigator: { globalPrivacyControl?: boolean };
}

export interface OneTrustApproval extends GoogleCmpApproval {
  regional: RegionalApproval;
}

export function createOneTrustConsent(approval: OneTrustApproval, getWindow: () => OneTrustConsentWindow): ConsentController {
  const tcf = createGoogleConsentBridge(approval, {
    getApi() {
      const host = getWindow();
      return typeof host.__tcfapi === "function" ? host.__tcfapi.bind(host) : undefined;
    },
    getPrivacyOpener: () => undefined,
  });
  const listeners = new Set<() => void>();
  let started = false;
  let preferenceCenterOpen = false;
  let gpp: unknown;
  let allowsUsGpp: typeof import("./us-gpp").allowsUsGpp | undefined;

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function isAllowed() {
    if (!started || preferenceCenterOpen) return false;
    try {
      const host = getWindow();
      const cmp = host.OneTrust;
      return allowsAdDecision(tcf.getApplicability(), tcf.isAllowed(), () => allowsRegionalAdvertising(approval.regional, {
        location: cmp?.getGeolocationData(),
        groups: host.OnetrustActiveGroups,
        choiceValid: cmp?.IsAlertBoxClosed() === true,
        globalPrivacyControl: host.navigator.globalPrivacyControl === true,
        allowsUsState: (state) => allowsUsGpp?.(gpp, approval.regional.usGppCmpId, state) === true,
      }), host.navigator.globalPrivacyControl === true);
    } catch {
      return false;
    }
  }

  function start() {
    const host = getWindow();
    started = true;
    const applied = () => {
      preferenceCenterOpen = false;
      notify();
    };
    host.addEventListener("OneTrustGroupsUpdated", notify);
    host.addEventListener("OTConsentApplied", applied);
    host.addEventListener("pageshow", notify);
    host.addEventListener("focus", notify);
    const unsubscribe = tcf.subscribe(notify);
    const stopTcf = tcf.start();

    let stopped = false;
    if (approval.regional.markets.US) {
      void import("./us-gpp").then((module) => {
        if (stopped) return;
        allowsUsGpp = module.allowsUsGpp;
        notify();
      }).catch(() => {
        // A missing decoder leaves US serving denied.
      });
    }
    let api: GppApi | undefined;
    let listenerId: number | undefined;
    const detach = (provider: GppApi, id: number) => {
      try { provider("removeEventListener", () => {}, id); } catch { /* A late callback stays blocked. */ }
    };
    function attachGpp() {
      if (stopped || api || typeof host.__gpp !== "function") return;
      const provider = host.__gpp.bind(host);
      api = provider;
      try {
        provider("addEventListener", (event, success) => {
          if (event?.listenerId && Number.isSafeInteger(event.listenerId)) listenerId = event.listenerId;
          if (stopped) {
            if (listenerId !== undefined) detach(provider, listenerId);
            return;
          }
          const registered = event?.eventName !== "listenerRegistered" || event.data === true;
          gpp = success && registered && event?.eventName !== "error" ? event?.pingData : undefined;
          notify();
        });
      } catch {
        api = undefined;
        gpp = undefined;
        notify();
      }
    }
    const timer = approval.regional.markets.US ? setInterval(attachGpp, 250) : undefined;
    const deadline = timer === undefined ? undefined : setTimeout(() => clearInterval(timer), 15_000);
    if (timer !== undefined) attachGpp();
    notify();

    return () => {
      stopped = true;
      started = false;
      preferenceCenterOpen = false;
      gpp = undefined;
      allowsUsGpp = undefined;
      clearInterval(timer);
      clearTimeout(deadline);
      host.removeEventListener("OneTrustGroupsUpdated", notify);
      host.removeEventListener("OTConsentApplied", applied);
      host.removeEventListener("pageshow", notify);
      host.removeEventListener("focus", notify);
      if (api && listenerId !== undefined) detach(api, listenerId);
      stopTcf();
      unsubscribe();
      notify();
    };
  }

  return {
    isAllowed,
    start,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    reopenChoices() {
      preferenceCenterOpen = true;
      notify();
      try {
        const cmp = getWindow().OneTrust;
        if (!cmp || typeof cmp.ToggleInfoDisplay !== "function") return false;
        cmp.ToggleInfoDisplay();
        return true;
      } catch {
        return false;
      }
    },
  };
}
