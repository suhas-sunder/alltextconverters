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
  allowsUsState(state: string): boolean;
}

const countries = new Set(["US", "CA", "AU", "NZ"]);

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
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

  return market !== "US" || signals.allowsUsState(state.toUpperCase());
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
