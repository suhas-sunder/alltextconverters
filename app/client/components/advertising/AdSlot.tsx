import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { isIndexablePath, normalizePathname, siteConfig } from "../../../site-config";

import { useAdRuntime } from "./AdRuntimeBoundary";
import { canMountLiveAd, observeAdSlot, type AdState } from "./ad-runtime";

export type AdPlacement =
  | "top-banner"
  | "left-sidebar"
  | "right-sidebar"
  | "below-utility"
  | "info-square"
  | "bottom-banner";

type AdSlotProps = {
  placement: AdPlacement;
  className?: string;
};

const blockedPaths = new Set([
  "/privacy-policy",
  "/terms-of-service",
  "/cookies-policy",
  "/not-found",
  "/about",
  "/contact",
]);

const placementStyles: Record<AdPlacement, string> = {
  "top-banner": "min-h-[64px] sm:min-h-[90px]",
  "left-sidebar": "min-h-[600px] w-[160px]",
  "right-sidebar": "min-h-[600px] w-[160px]",
  "below-utility": "min-h-[64px] sm:min-h-[90px]",
  "info-square": "min-h-[250px] w-full max-w-[300px]",
  "bottom-banner": "min-h-[64px] sm:min-h-[90px]",
};

function isEligible(pathname: string) {
  if (blockedPaths.has(normalizePathname(pathname)) || !isIndexablePath(pathname)) return false;
  return true;
}

export function AdSlot({ placement, className = "" }: AdSlotProps) {
  const { pathname, key } = useLocation();
  const { runtime, latch, suppressed } = useAdRuntime();
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<AdState>("idle");
  const path = normalizePathname(pathname);
  const hasLiveTarget = Boolean(
    runtime && siteConfig.advertisingEnabled &&
    canMountLiveAd(runtime, siteConfig.origin, path, placement)
  );
  const sizeStyle = hasLiveTarget && path !== "/" ? "py-4 min-h-[90px]" : placementStyles[placement];

  useEffect(() => {
    setState("idle");
    const target = host.current;
    if (!runtime || !latch || !target || !siteConfig.advertisingEnabled) return;
    return observeAdSlot({
      target, runtime, origin: window.location.origin, pathname: path, placement,
      getWidth: () => target.clientWidth,
      watchWidth(refresh) {
        if (typeof ResizeObserver === "undefined") return () => {};
        const observer = new ResizeObserver(refresh);
        observer.observe(target);
        return () => observer.disconnect();
      },
      onState: setState, onFill: latch.confirmFill,
    });
  }, [runtime, latch, key, path, placement]);

  if (
    (!siteConfig.adPlaceholderEnabled && !hasLiveTarget) ||
    siteConfig.adMode === "off" ||
    !isEligible(path)
  ) {
    return null;
  }

  const sizeLabel =
    placement === "info-square"
      ? "300 × 250"
      : placement.includes("sidebar")
        ? "160 × 600"
        : "responsive banner";

  return (
    <aside
      aria-label="Advertisement"
      aria-hidden={suppressed && state !== "filled" && state !== "requesting" ? true : undefined}
      data-ad-placement={placement}
      className={`flex flex-col items-center justify-center overflow-hidden rounded-xl border ${suppressed ? "border-transparent" : "border-slate-200 bg-slate-50"} px-4 text-center text-xs text-slate-500 ${sizeStyle} ${className}`}
    >
      {hasLiveTarget && (
        <div ref={host} data-ad-state={state} className="w-full min-w-0" />
      )}
      {siteConfig.adPlaceholderEnabled && !suppressed && state === "idle" && (
        <div className="space-y-1">
          <p className="font-medium uppercase tracking-[0.14em] text-slate-500">
            Advertisement
          </p>
          {import.meta.env.DEV ? <p className="text-[11px]">{sizeLabel}</p> : null}
        </div>
      )}
    </aside>
  );
}
