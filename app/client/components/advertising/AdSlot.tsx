import { useLocation } from "react-router";
import { isIndexablePath, siteConfig } from "../../../site-config";

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

function isEligible(pathname: string, placement: AdPlacement) {
  if (blockedPaths.has(pathname) || !isIndexablePath(pathname)) return false;
  return true;
}

export function AdSlot({ placement, className = "" }: AdSlotProps) {
  const { pathname } = useLocation();

  if (
    !siteConfig.adPlaceholderEnabled ||
    siteConfig.adMode === "off" ||
    !isEligible(pathname, placement)
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
      data-ad-placement={placement}
      className={`flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-xs text-slate-500 ${placementStyles[placement]} ${className}`}
    >
      <div className="space-y-1">
        <p className="font-medium uppercase tracking-[0.14em] text-slate-500">
          Advertisement
        </p>
        {import.meta.env.DEV ? <p className="text-[11px]">{sizeLabel}</p> : null}
      </div>
    </aside>
  );
}
