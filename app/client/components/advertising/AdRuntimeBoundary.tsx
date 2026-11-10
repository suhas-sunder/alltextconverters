import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPlaceholderLatch, type AdRuntime } from "./ad-runtime";

import { approvedDisplay, configuredDisplay } from "./ad-config";

import { siteConfig } from "../../../site-config";
import { approvedGoogleCmp, configuredGoogleConsent, PrivacyChoices } from "./PrivacyChoices";

const RuntimeContext = createContext<AdRuntime | null>(null);
const PlaceholderContext = createContext<ReturnType<typeof createPlaceholderLatch> | null>(null);
const neverSuppressed = () => false;
const noopSubscribe = () => () => {};

export function AdRuntimeBoundary({ children, runtime }: { children: ReactNode; runtime?: AdRuntime | null }) {
  const [latch] = useState(createPlaceholderLatch);
  const [consent] = useState(() => configuredGoogleConsent(approvedGoogleCmp));
  const [configured] = useState(() => configuredDisplay(approvedDisplay, consent ?? undefined));
  const [showPrivacyChoices, setShowPrivacyChoices] = useState(false);
  useEffect(() => {
    if (!consent || window.location.origin !== siteConfig.origin) return;
    setShowPrivacyChoices(true);
    return consent.start();
  }, [consent]);
  return (
    <RuntimeContext.Provider value={runtime === undefined ? configured : runtime}>
      <PlaceholderContext.Provider value={latch}>
        {children}
        {consent && showPrivacyChoices && <PrivacyChoices reopen={consent.reopenChoices} />}
      </PlaceholderContext.Provider>
    </RuntimeContext.Provider>
  );
}

export function useAdRuntime() {
  const runtime = useContext(RuntimeContext);
  const latch = useContext(PlaceholderContext);
  const suppressed = useSyncExternalStore(latch?.subscribe ?? noopSubscribe, latch?.getSnapshot ?? neverSuppressed, neverSuppressed);
  return { runtime, latch, suppressed };
}
