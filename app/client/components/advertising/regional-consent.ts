import type { AdConsentGate } from "./ad-runtime";
import type { TcfApplicability } from "./google-consent";

type WesternCountry = "US" | "CA" | "AU" | "NZ";

export interface RegionalApproval {
  // Match the provider's location and a dedicated, default-off advertising group for each approved market.
  markets: Readonly<Partial<Record<WesternCountry, { subdivisions: readonly string[]; advertisingGroup: string }>>>;
  usGppCmpId?: number;
}

export interface RegionalSignals {
  location: unknown;
  groups: unknown;
  choiceValid: boolean;
  globalPrivacyControl: boolean;
  gpp: unknown;
}

const countries = new Set(["US", "CA", "AU", "NZ"]);
const usOptOutFields = ["SaleOptOut", "SharingOptOut", "TargetedAdvertisingOptOut"] as const;

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function allowsUsNationalSignal(value: unknown, approvedCmpId: number | undefined) {
  const data = record(value);
  if (!data || !Number.isSafeInteger(approvedCmpId) || (approvedCmpId ?? 0) <= 0 ||
      data.cmpId !== approvedCmpId || data.gppVersion !== "1.1" ||
      data.cmpStatus !== "loaded" || data.signalStatus !== "ready" || data.cmpDisplayStatus === "visible" ||
      !Array.isArray(data.applicableSections) || data.applicableSections.length !== 1 || data.applicableSections[0] !== 7 ||
      !Array.isArray(data.sectionList) || !data.sectionList.includes(7) ||
      typeof data.gppString !== "string" || !data.gppString.trim()) return false;

  const usnat = record(data.parsedSections)?.usnat;
  if (!Array.isArray(usnat) || usnat.length < 1 || usnat.length > 2) return false;
  const core = record(usnat[0]);
  if (!core || core.Version !== 1 || !usOptOutFields.every((field) => core[field] === 2)) return false;
  const gpc = record(usnat[1]);
  return usnat.length === 1 || (gpc?.SubsectionType === 1 && gpc.Gpc === false);
}

export function allowsRegionalAdvertising(approval: RegionalApproval, signals: RegionalSignals) {
  if (!signals.choiceValid || signals.globalPrivacyControl) return false;
  const location = record(signals.location);
  const country = location?.country;
  const state = location?.state;
  if (typeof country !== "string" || !countries.has(country.toUpperCase()) ||
      typeof state !== "string" || !/^[a-z0-9]{1,3}$/i.test(state)) return false;
  const market = country.toUpperCase() as WesternCountry;
  const policy = approval.markets[market];
  if (!policy || !policy.subdivisions.includes(state.toUpperCase()) ||
      !/^[a-z0-9_-]+$/i.test(policy.advertisingGroup) ||
      typeof signals.groups !== "string" ||
      !signals.groups.split(",").includes(policy.advertisingGroup)) return false;

  // The national GPP section conveys US opt-outs. It never supplies the affirmative OneTrust choice.
  return market !== "US" || allowsUsNationalSignal(signals.gpp, approval.usGppCmpId);
}

export function allowsAdDecision(
  applicability: TcfApplicability,
  tcfAllowed: boolean,
  regional: () => boolean,
  optedOut: boolean,
) {
  if (optedOut) return false;
  if (applicability === "applies") return tcfAllowed;
  return applicability === "outside" && regional();
}

export interface ConsentController extends AdConsentGate {
  start(): () => void;
  reopenChoices(): boolean;
}
