import { json } from "@remix-run/node";
import type { Route } from "./+types/contact";
import { Link } from "react-router";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

export function meta({}: Route.MetaArgs) {
  const title = "Contact | AllTextConverters";
  const description =
    "Contact AllTextConverters for feedback, bug reports, or corrections related to our free text converters and word tools.";

  const canonicalUrl = "https://www.alltextconverters.com/contact";

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonicalUrl },

    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonicalUrl },

    { name: "robots", content: "index,follow" },
    { name: "theme-color", content: "#0B1B2B" },
  ];
}

export function loader() {
  return json({});
}

export default function Contact({}: Route.ComponentProps) {
  return (
    <main className="bg-white text-[#0B1B2B] min-h-screen">
      {/* Breadcrumb navigation (visible, minimal) */}
      <nav
        className="text-xs text-slate-600 px-4 pt-6 max-w-[900px] mx-auto"
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
            Contact
          </li>
        </ol>
      </nav>

      <section className="mx-auto max-w-[900px] px-4 py-10">
        <div className="pb-1">
          <BreadcrumbRow label="Contact" />
        </div>
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
          <p className="mt-2 text-slate-600">
            Send feedback, report an issue, or request a correction.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Email</h2>

          <p className="mt-3 text-slate-700">
            For feedback, bug reports, or corrections to any converter output,
            email us:
          </p>

          <div className="mt-5">
            <a
              href="mailto:support@alltextconverters.com"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 font-medium text-white cursor-pointer hover:bg-teal-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 focus-visible:ring-offset-2"
            >
              support@alltextconverters.com
            </a>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium">To help us respond faster, include:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>The tool or page name (and URL if possible)</li>
              <li>Your input text (remove anything sensitive)</li>
              <li>The output you received</li>
              <li>What you expected instead</li>
              <li>Your device/browser if it looks like a bug</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Privacy note</h2>
            <p className="mt-2 text-slate-700">
              Avoid emailing passwords, private documents, or sensitive personal
              data. If you need help with a conversion issue, share a shortened
              sample that reproduces the problem.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Response time</h2>
            <p className="mt-2 text-slate-700">
              We typically respond within 1–3 business days. During busy periods
              it may take longer.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-semibold text-[#0B1B2B] hover:bg-teal-50 hover:shadow-sm transition cursor-pointer"
          >
            Back to Home →
          </Link>
        </div>
      </section>

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
                name: "Contact",
                item: "https://www.alltextconverters.com/contact",
              },
            ],
          }),
        }}
      />
          <BreadcrumbListJsonLd label="Contact" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/contact" />
</main>
  );
}