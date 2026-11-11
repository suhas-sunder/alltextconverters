export type AdState = "idle" | "requesting" | "filled" | "unfilled" | "failed" | "retired";
type ProviderState = "filled" | "unfilled" | "failed";

export interface AdConsentGate {
  isAllowed(): boolean;
  subscribe(onChange: () => void): () => void;
}

export interface AdProvider {
  mount(target: HTMLElement, signal: AbortSignal, report: (state: ProviderState) => void): Promise<void>;
}

export interface AdRuntime {
  enabled: boolean;
  emergencyStop: boolean;
  approvedOrigin: string;
  allowedPaths: ReadonlySet<string>;
  consent: AdConsentGate;
  provider: AdProvider;
}

export const belowUtilityDisplay = { width: 320, height: 50 } as const;

export function canMountLiveAd(
  runtime: AdRuntime,
  origin: string,
  path: string,
  placement: string,
) {
  return runtime.enabled && !runtime.emergencyStop &&
    origin === runtime.approvedOrigin &&
    origin === "https://www.alltextconverters.com" &&
    runtime.allowedPaths.has(path) &&
    !["/about", "/contact", "/privacy-policy", "/cookies-policy", "/terms-of-service", "/not-found"].includes(path) &&
    placement === "below-utility";
}

export function createPlaceholderLatch() {
  let suppressed = false;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => suppressed,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    confirmFill() {
      if (suppressed) return;
      suppressed = true;
      listeners.forEach((listener) => listener());
    },
  };
}

interface SlotOptions {
  target: HTMLElement;
  runtime: AdRuntime;
  origin: string;
  pathname: string;
  placement: string;
  getWidth(): number;
  watchWidth(refresh: () => void): () => void;
  onState(state: AdState): void;
  onFill(): void;
}

export function observeAdSlot(options: SlotOptions): () => void {
  const { target, runtime, origin, pathname, placement, onState, onFill } = options;
  if (!canMountLiveAd(runtime, origin, pathname, placement)) return () => {};
  let disposed = false;
  let attempt: AbortController | undefined;
  let terminal = false;
  let reported = false;

  function retire(state: "retired" | "failed" | "unfilled") {
    terminal = true;
    attempt?.abort();
    target.replaceChildren();
    onState(state);
  }

  function refresh() {
    if (disposed || terminal) return;
    const eligible = canMountLiveAd(runtime, origin, pathname, placement) &&
      runtime.consent.isAllowed() && options.getWidth() >= belowUtilityDisplay.width;
    if (!eligible) {
      if (attempt) retire("retired");
      return;
    }
    // One attempt per navigation. A resize or a changed consent choice never refreshes an ad.
    if (attempt) return;
    attempt = new AbortController();
    const { signal } = attempt;
    onState("requesting");
    void Promise.resolve().then(() => {
      if (signal.aborted) return;
      return runtime.provider.mount(target, signal, (state) => {
        if (signal.aborted || disposed || terminal || reported) return;
        if (state === "filled") {
          reported = true;
          onFill();
          onState(state);
        } else if (state === "unfilled" || state === "failed") {
          retire(state);
        }
      });
    }).catch(() => {
      if (!signal.aborted && !disposed) retire("failed");
    });
  }

  const unsubscribe = runtime.consent.subscribe(refresh);
  const stopWatching = options.watchWidth(refresh);
  refresh();
  return () => {
    disposed = true;
    unsubscribe();
    stopWatching();
    attempt?.abort();
    target.replaceChildren();
  };
}
