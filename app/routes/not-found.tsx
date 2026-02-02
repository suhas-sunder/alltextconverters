import { json } from "@remix-run/node";
import type { Route } from "./+types/not-found";
import { Link } from "react-router";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

export function meta({}: Route.MetaArgs) {
  const title = "Page Not Found | AllTextConverters";
  const description =
    "Sorry, this page doesn’t exist. Try one of our text converters, formatting tools, or word utilities.";

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
  ];
}

export function loader() {
  return json({ nowISO: new Date().toISOString() });
}

export default function NotFound({}: Route.ComponentProps) {
  return (
    <main className="min-h-[80vh] bg-[#F9FBFD] px-6 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
        <BreadcrumbRow label="404 Not Found" />
      </div>
      {/* Breadcrumb navigation (visible, minimal) */}
      <nav
        className="text-xs text-slate-600 max-w-6xl mx-auto mb-6"
        aria-label="Breadcrumb"
      >
        <ol className="list-none p-0 inline-flex items-center gap-2">
          <li>
            <a
              href="/"
              className="text-teal-700 hover:underline font-medium cursor-pointer"
            >
              Home
            </a>
          </li>
          <li className="text-slate-400" aria-hidden="true">
            ›
          </li>
          <li aria-current="page" className="text-slate-700 font-semibold">
            404 Not Found
          </li>
        </ol>
      </nav>

      <div className="max-w-3xl mx-auto text-center flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold text-[#0B1B2B] mb-4">
          404 - Page Not Found
        </h1>

        <p className="text-lg text-slate-700 max-w-xl mx-auto mb-10 leading-relaxed">
          That page isn’t here. Use the tools below to keep going, or head back
          to the homepage.
        </p>

        {/* Primary actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 w-full sm:w-auto">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-[#0B1B2B] hover:bg-teal-50 hover:shadow-sm transition cursor-pointer"
          >
            Go to Home →
          </Link>
          <Link
            to="/word-counter"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-[#0B1B2B] hover:bg-teal-50 hover:shadow-sm transition cursor-pointer"
          >
            Word Counter →
          </Link>
        </div>

        {/* Popular tool links */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 w-full mb-12">
          <Link
            to="/text-case-converter"
            className="block rounded-xl border border-slate-200 bg-white p-5 text-[#0B1B2B] font-semibold hover:bg-teal-50 hover:shadow-sm transition cursor-pointer"
          >
            🔤 Text Case Converter →
          </Link>
          <Link
            to="/lowercase-to-uppercase"
            className="block rounded-xl border border-slate-200 bg-white p-5 text-[#0B1B2B] font-semibold hover:bg-teal-50 hover:shadow-sm transition cursor-pointer"
          >
            ⬆️ Uppercase Converter →
          </Link>
          <Link
            to="/uppercase-to-lowercase"
            className="block rounded-xl border border-slate-200 bg-white p-5 text-[#0B1B2B] font-semibold hover:bg-teal-50 hover:shadow-sm transition cursor-pointer"
          >
            ⬇️ Lowercase Converter →
          </Link>
          <Link
            to="/remove-line-breaks"
            className="block rounded-xl border border-slate-200 bg-white p-5 text-[#0B1B2B] font-semibold hover:bg-teal-50 hover:shadow-sm transition cursor-pointer"
          >
            🧹 Remove Line Breaks →
          </Link>
          <Link
            to="/remove-extra-spaces"
            className="block rounded-xl border border-slate-200 bg-white p-5 text-[#0B1B2B] font-semibold hover:bg-teal-50 hover:shadow-sm transition cursor-pointer"
          >
            ✨ Remove Extra Spaces →
          </Link>
          <Link
            to="/text-reverser"
            className="block rounded-xl border border-slate-200 bg-white p-5 text-[#0B1B2B] font-semibold hover:bg-teal-50 hover:shadow-sm transition cursor-pointer"
          >
            🔁 Text Reverser →
          </Link>
        </div>

        {/* Helpful note */}
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-left">
          <h2 className="text-xl font-bold text-[#0B1B2B] mb-2">
            Why you’re seeing this
          </h2>
          <ul className="list-disc pl-5 text-slate-700 space-y-1">
            <li>The URL may be misspelled.</li>
            <li>The tool may have been moved or renamed.</li>
            <li>The page might not be published yet.</li>
          </ul>
        </div>
      </div>

      {/* BreadcrumbList (structured data) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.alltextconverters.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "404 Not Found",
                item: "https://www.alltextconverters.com/not-found",
              },
            ],
          }),
        }}
      />
          <BreadcrumbListJsonLd label="Not Found" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/not-found" />
</main>
  );
}