import { Link } from "react-router";
import { canonicalUrl } from "../../site-config";

type BreadcrumbRowProps = {
  label: string;
  className?: string;
};

export function BreadcrumbRow({ label, className }: BreadcrumbRowProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={
        className ??
        "text-xs sm:text-sm text-slate-600 flex items-center gap-2 leading-none"
      }
    >
      <Link
        to="/"
        className="hover:text-slate-900 hover:underline underline-offset-4 cursor-pointer"
      >
        Home
      </Link>
      <span aria-hidden className="opacity-60">
        /
      </span>
      <span aria-current="page" className="text-slate-600">
        {label}
      </span>
    </nav>
  );
}

type BreadcrumbListJsonLdProps = {
  label: string;
  pathname: string;
};

export function BreadcrumbListJsonLd({
  label,
  pathname,
}: BreadcrumbListJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: canonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: canonicalUrl(pathname),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
