import { Link } from "react-router";
import { siteConfig } from "../../../site-config";

type MaintainerTrustBlockProps = {
  compact?: boolean;
};

export function MaintainerTrustBlock({ compact = false }: MaintainerTrustBlockProps) {
  return (
    <section className={compact ? "text-xs text-slate-400" : "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"}>
      <p className={compact ? "" : "text-sm font-semibold text-slate-900"}>
        Built and maintained by {siteConfig.maintainerName}.
      </p>
      {!compact ? (
        <>
          {siteConfig.profileImageUrl ? (
            <img
              src={siteConfig.profileImageUrl}
              width={96}
              height={96}
              alt="Suhas Sunder"
              className="mt-4 aspect-square h-24 w-24 rounded-full object-cover"
            />
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Suhas maintains the site and its browser-based utilities. He holds a
            bachelor&apos;s degree in Engineering and Management and a master&apos;s
            degree in Electrical and Computer Engineering.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
            <Link to="/about" className="text-slate-900 underline underline-offset-4">About the site</Link>
            <a href={siteConfig.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline underline-offset-4">Portfolio</a>
            <a href={siteConfig.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline underline-offset-4">LinkedIn</a>
          </div>
          {!siteConfig.profileImageUrl ? (
            <p className="mt-4 text-xs text-slate-500">
              Maintainer photo will appear here when the approved profile image is added.
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
