import { belowUtilityDisplay, type AdProvider } from "./ad-runtime";

type AdsWindow = Window & { adsbygoogle?: { push(value: Record<string, never>): unknown } };

export function adSenseState(status: string | null) {
  if (status === "filled") return "filled";
  if (status === "unfilled" || status === "unfill-optimized") return "unfilled";
  return undefined;
}

export function createAdSenseDisplayProvider(publisher: string, units: ReadonlyMap<string, string>): AdProvider {
  if (!/^ca-pub-\d{16}$/.test(publisher) || units.size === 0 || [...units.values()].some((unit) => !/^\d{10}$/.test(unit))) {
    throw new Error("Valid approved AdSense publisher and display-unit identifiers are required.");
  }
  let loaded: Promise<void> | undefined;

  function loadScript(doc: Document) {
    loaded ??= new Promise<void>((resolve, reject) => {
      const script = doc.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      const url = new URL("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
      url.searchParams.set("client", publisher);
      script.src = url.href;
      const fail = () => {
        window.clearTimeout(timer);
        script.remove();
        reject(new Error("AdSense script did not load."));
      };
      const timer = window.setTimeout(fail, 8000);
      script.addEventListener("error", fail, { once: true });
      script.addEventListener("load", () => {
        window.clearTimeout(timer);
        resolve();
      }, { once: true });
      doc.head.append(script);
    });
    return loaded;
  }

  return {
    async mount(target, signal, report, pathname) {
      const slot = units.get(pathname);
      if (!slot || signal.aborted || !target.isConnected || target.clientWidth < belowUtilityDisplay.width) return;
      const doc = target.ownerDocument;
      await loadScript(doc);
      if (signal.aborted || !target.isConnected) return;
      if (target.clientWidth < belowUtilityDisplay.width) {
        report("failed");
        return;
      }

      const unit = doc.createElement("ins");
      unit.className = "adsbygoogle";
      unit.style.cssText = "display:block;margin-inline:auto";
      unit.style.width = belowUtilityDisplay.width + "px";
      unit.style.height = belowUtilityDisplay.height + "px";
      unit.dataset.adClient = publisher;
      unit.dataset.adSlot = slot;
      const failTimer = window.setTimeout(() => report("failed"), 12_000);
      const observer = new MutationObserver(() => {
        const state = adSenseState(unit.getAttribute("data-ad-status"));
        if (state) {
          window.clearTimeout(failTimer);
          observer.disconnect();
          report(state);
        }
      });
      observer.observe(unit, { attributes: true, attributeFilter: ["data-ad-status"] });
      signal.addEventListener("abort", () => {
        window.clearTimeout(failTimer);
        observer.disconnect();
        unit.remove();
      }, { once: true });
      target.append(unit);
      const ads = doc.defaultView as AdsWindow;
      if (!ads.adsbygoogle) ads.adsbygoogle = [];
      ads.adsbygoogle.push({});
    },
  };
}
