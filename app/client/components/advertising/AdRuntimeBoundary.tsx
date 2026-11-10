import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPlaceholderLatch, type AdRuntime } from "./ad-runtime";

import { approvedDisplay, configuredDisplay } from "./ad-config";

const RuntimeContext = createContext<AdRuntime | null>(null);
const PlaceholderContext = createContext<ReturnType<typeof createPlaceholderLatch> | null>(null);
const neverSuppressed = () => false;
const noopSubscribe = () => () => {};

export function AdRuntimeBoundary({ children, runtime }: { children: ReactNode; runtime?: AdRuntime | null }) {
  const [latch] = useState(createPlaceholderLatch);
  const [configured] = useState(() => configuredDisplay(approvedDisplay));
  return (
    <RuntimeContext.Provider value={runtime === undefined ? configured : runtime}>
      <PlaceholderContext.Provider value={latch}>{children}</PlaceholderContext.Provider>
    </RuntimeContext.Provider>
  );
}

export function useAdRuntime() {
  const runtime = useContext(RuntimeContext);
  const latch = useContext(PlaceholderContext);
  const suppressed = useSyncExternalStore(latch?.subscribe ?? noopSubscribe, latch?.getSnapshot ?? neverSuppressed, neverSuppressed);
  return { runtime, latch, suppressed };
}
