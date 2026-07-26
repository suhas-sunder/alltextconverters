import type { ReactNode } from "react";

export function AboutTrustMoat() {
  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How tools are tested and improved</h2>
      <p className="leading-relaxed text-slate-700">
        Each tool is reviewed with representative examples and relevant edge cases.
        Deterministic converters should produce the same output for the same input
        and settings.
      </p>
      <div className="space-y-4 text-slate-700">
        <Method title="Representative examples and edge cases">
          Checks cover normal inputs, malformed values, line endings, and encoding
          differences where those behaviors matter.
        </Method>
        <Method title="Clear limitations">
          Browser and encoding differences can affect some operations. Tool pages
          should explain supported formats and validation errors rather than promise
          universal results.
        </Method>
        <Method title="Report a correction">
          If an output appears incorrect, use the contact page with a redacted,
          minimal example. Avoid sending private source text.
        </Method>
        <Method title="Use care with sensitive text">
          Local conversion reduces unnecessary transmission, but you should still
          consider the security of your device and browser before pasting highly
          sensitive information.
        </Method>
      </div>
      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <a href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-800">Report an issue</a>
        <a href="/privacy-policy" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 transition-colors hover:bg-slate-50">Privacy Policy</a>
      </div>
    </section>
  );
}

function Method({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 leading-relaxed">
      <p className="font-semibold text-slate-900">{title}</p>
      <p>{children}</p>
    </div>
  );
}
