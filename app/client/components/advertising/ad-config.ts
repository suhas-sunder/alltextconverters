import { type AdConsentGate, type AdRuntime } from "./ad-runtime";
import { createAdSenseDisplayProvider } from "./adsense-provider";

// Existing below-utility hosts reviewed for the first converter-page pilot.
const pilotPaths = ["/", "/table-to-list", "/json-array-to-list", "/byte-counter"] as const;
type PilotPath = typeof pilotPaths[number];

export interface ApprovedAdDisplay {
  enabled: boolean;
  emergencyStop: boolean;
  publisher: string;
  units: Readonly<Partial<Record<PilotPath, string>>>;
}

// Shipping configuration stays empty until an owner-reviewed activation.
export const approvedDisplay: ApprovedAdDisplay | null = null;
const blocked: AdConsentGate = { isAllowed: () => false, subscribe: () => () => {} };

export function configuredDisplay(config: ApprovedAdDisplay | null, consent: AdConsentGate = blocked): AdRuntime | null {
  if (!config?.enabled || config.emergencyStop) return null;
  try {
    const units = new Map<string, string>();
    for (const [path, unit] of Object.entries(config.units)) {
      if (!pilotPaths.some((candidate) => candidate === path) || typeof unit !== "string") return null;
      units.set(path, unit);
    }
    if (new Set(units.values()).size !== units.size) return null;
    return {
      enabled: true,
      emergencyStop: false,
      approvedOrigin: "https://www.alltextconverters.com",
      allowedPaths: new Set(units.keys()),
      consent,
      provider: createAdSenseDisplayProvider(config.publisher, units),
    };
  } catch {
    return null;
  }
}
