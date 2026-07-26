import { Link } from "react-router";
import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = () => [
  { title: "Page Not Found | AllTextConverters" },
  { name: "description", content: "This page could not be found." },
  { name: "robots", content: "noindex,nofollow" },
];

export default function NotFound() {
  return <NotFoundPage />;
}

function NotFoundPage() {
  return (
    <main className="min-h-[70vh] bg-[#F9FBFD] px-4 py-12 text-slate-900 sm:px-6">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-700">
          The address may be misspelled, or the page may have moved. Use one of
          the links below to continue.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">Homepage</Link>
          <a href="#tools" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold hover:bg-slate-50">Browse all tools</a>
        </div>
        <nav aria-label="Popular tools" className="mt-10 grid gap-3 text-left sm:grid-cols-3">
          <Link to="/word-counter" className="rounded-xl border border-slate-200 p-4 font-semibold hover:bg-slate-50">Word Counter</Link>
          <Link to="/case-converter" className="rounded-xl border border-slate-200 p-4 font-semibold hover:bg-slate-50">Case Converter</Link>
          <Link to="/text-cleaner" className="rounded-xl border border-slate-200 p-4 font-semibold hover:bg-slate-50">Text Cleaner</Link>
        </nav>
      </section>
    </main>
  );
}
