import type { ReactNode } from "react";
import { BreadcrumbRow } from "./Breadcrumbs";

export function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <BreadcrumbRow label={title} />
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">Last updated {updated}</p>
        </header>
        <article className="mt-6 space-y-8 rounded-2xl border border-slate-200 bg-white p-6 leading-relaxed text-slate-700 shadow-sm sm:p-8">
          {children}
        </article>
      </div>
    </main>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
