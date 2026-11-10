import { type AdConsentGate, type AdRuntime } from "./ad-runtime";
import { createAdSenseDisplayProvider } from "./adsense-provider";

export interface ApprovedAdDisplay {
  enabled: boolean;
  emergencyStop: boolean;
  publisher: string;
  unit: string;
}

// Shipping configuration stays empty until an owner-reviewed activation.
export const approvedDisplay: ApprovedAdDisplay | null = null;
const blocked: AdConsentGate = { isAllowed: () => false, subscribe: () => () => {} };

export function configuredDisplay(config: ApprovedAdDisplay | null, consent: AdConsentGate = blocked): AdRuntime | null {
  if (!config?.enabled || config.emergencyStop) return null;
  try {
    return {
      enabled: true,
      emergencyStop: false,
      approvedOrigin: "https://www.alltextconverters.com",
      allowedPaths: new Set(["/"]),
      consent,
      provider: createAdSenseDisplayProvider(config.publisher, config.unit),
    };
  } catch {
    return null;
  }
}
