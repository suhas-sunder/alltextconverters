type ConsentStatus = "pending" | "denied" | "allowed";
type TcfCallback = (payload: unknown, success: boolean) => void;
export type TcfApi = (
  command: "addEventListener" | "removeEventListener", version: 2,
  callback: TcfCallback, listenerId?: number,
) => void;

export interface GoogleCmpApproval {
  cmpId: number;
  minimumPolicyVersion: number;
}

export type TcfApplicability = "unknown" | "applies" | "outside";

export function readTcfApplicability(value: unknown, success: boolean, approval: GoogleCmpApproval): TcfApplicability {
  const data = record(value);
  if (!success || !data || data.cmpId !== approval.cmpId ||
      typeof data.tcfPolicyVersion !== "number" ||
      !Number.isInteger(data.tcfPolicyVersion) ||
      data.tcfPolicyVersion < approval.minimumPolicyVersion) return "unknown";
  // The TCF API can omit cmpStatus and eventStatus from a non-applicable TCData response.
  if (data.gdprApplies === false && (data.cmpStatus === undefined || data.cmpStatus === "loaded")) return "outside";
  return data.gdprApplies === true && data.cmpStatus === "loaded" ? "applies" : "unknown";
}

interface ConsentSource {
  getApi(): TcfApi | undefined;
  getPrivacyOpener(): (() => void) | undefined;
}

const googleVendor = 755;
const purposes = [1, 2, 3, 4, 7, 9, 10] as const;
const settledEvents = new Set(["tcloaded", "useractioncomplete"]);

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

export function evaluateGoogleConsent(value: unknown, success: boolean, approval: GoogleCmpApproval): ConsentStatus {
  const data = record(value);
  if (!success || !data || data.cmpStatus !== "loaded") return "pending";
  if (data.cmpId !== approval.cmpId ||
      typeof data.tcfPolicyVersion !== "number" ||
      !Number.isInteger(data.tcfPolicyVersion) ||
      data.tcfPolicyVersion < approval.minimumPolicyVersion) return "denied";
  if (typeof data.eventStatus !== "string" || !settledEvents.has(data.eventStatus)) return "pending";

  // Outside the reviewed regional integration, there is no affirmative grant.
  if (data.gdprApplies !== true || typeof data.tcString !== "string" || !data.tcString.trim()) return "denied";
  const vendor = record(record(data.vendor)?.consents);
  const allowedPurposes = record(record(data.purpose)?.consents);
  const restrictions = record(record(data.publisher)?.restrictions);
  if (!vendor || !Object.hasOwn(vendor, googleVendor) || vendor[googleVendor] !== true) return "denied";

  // This pilot requires explicit consent even where Google also accepts legitimate interest.
  return purposes.every((id) => {
    const restriction = record(restrictions?.[id])?.[googleVendor];
    return allowedPurposes && Object.hasOwn(allowedPurposes, id) && allowedPurposes[id] === true && (restriction === undefined || restriction === 1);
  }) ? "allowed" : "denied";
}

export function createGoogleConsentBridge(approval: GoogleCmpApproval, source: ConsentSource) {
  const listeners = new Set<() => void>();
  let status: ConsentStatus = "pending";
  let applicability: TcfApplicability = "unknown";

  function publish(next: ConsentStatus, nextApplicability: TcfApplicability = "unknown") {
    if (status === next && applicability === nextApplicability) return;
    status = next;
    applicability = nextApplicability;
    listeners.forEach((listener) => listener());
  }

  function start(pollInterval = 250, timeout = 15_000) {
    let stopped = false;
    let api: TcfApi | undefined;
    let listenerId: number | undefined;

    const tryAttach = () => {
      if (stopped || api) return;
      try {
        const next = source.getApi();
        if (!next) return;
        api = next;
        next("addEventListener", 2, (data, success) => {
          const id = record(data)?.listenerId;
          if (typeof id === "number" && Number.isSafeInteger(id)) listenerId = id;
          if (stopped) {
            if (listenerId !== undefined) detach(next, listenerId);
            return;
          }
          publish(evaluateGoogleConsent(data, success, approval), readTcfApplicability(data, success, approval));
        });
      } catch {
        api = undefined;
        publish("pending");
      }
    };

    const timer = setInterval(tryAttach, pollInterval);
    const deadline = setTimeout(() => clearInterval(timer), timeout);
    tryAttach();

    return () => {
      stopped = true;
      clearInterval(timer);
      clearTimeout(deadline);
      if (api && listenerId !== undefined) detach(api, listenerId);
      publish("pending");
    };
  }

  function detach(api: TcfApi, listenerId: number) {
    try { api("removeEventListener", 2, () => {}, listenerId); } catch { /* Late events remain ignored. */ }
  }

  return {
    start,
    getSnapshot: () => status,
    getApplicability: () => applicability,
    isAllowed: () => status === "allowed",
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    reopenChoices() {
      try {
        const open = source.getPrivacyOpener();
        publish("pending");
        if (!open) return false;
        open();
        return true;
      } catch {
        publish("pending");
        return false;
      }
    },
  };
}
