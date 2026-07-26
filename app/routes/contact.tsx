import { Link } from "react-router";
import type { Route } from "./+types/contact";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () =>
  createPageMeta({
    title: "Contact | AllTextConverters",
    description:
      "Contact AllTextConverters to report an issue, suggest a correction, or ask a privacy question.",
    pathname: "/contact",
  });

export default function Contact() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <BreadcrumbRow label="Contact" />
        <header className="mt-5">
          <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
          <p className="mt-2 text-slate-600">Report an issue, suggest a correction, or ask a privacy question.</p>
        </header>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="mt-3 leading-relaxed text-slate-700">For feedback or a correction, contact:</p>
          <a href="mailto:support@alltextconverters.com" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 focus-visible:ring-offset-2">support@alltextconverters.com</a>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-relaxed text-slate-700">
          <h2 className="text-lg font-semibold text-slate-900">Include a safe, minimal reproduction</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>The tool name and page URL.</li>
            <li>A redacted, minimal input that demonstrates the issue.</li>
            <li>The output received and the expected result.</li>
            <li>Your browser and device if the issue appears browser-specific.</li>
          </ul>
          <p className="mt-4">Do not email passwords, private documents, or unredacted sensitive source text.</p>
        </div>

        <p className="mt-8 text-sm text-slate-600">
          Review the <Link to="/privacy-policy" className="font-medium text-slate-900 underline underline-offset-4">Privacy Policy</Link> before sharing information.
        </p>
      </section>
      <BreadcrumbListJsonLd label="Contact" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/contact" />
    </main>
  );
}
