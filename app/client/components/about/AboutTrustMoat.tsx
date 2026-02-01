export function AboutTrustMoat() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-5">
      <h2 className="text-2xl sm:text-3xl font-bold font-[Poppins] text-slate-900">
        How this site earns trust
      </h2>

      <p className="text-slate-700 leading-relaxed">
        A “trust moat” is not a badge or a promise. It is behavior: how a product is built, how it treats users,
        and whether it stays consistent over time. This site is intentionally narrow and engineered to feel boring
        in the best way.
      </p>

      <div className="space-y-4 text-slate-700 leading-relaxed">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-slate-900">Utility-first pages</p>
          <p>
            You should be able to use the tool immediately. No “content gate” where you must scroll through an article.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-slate-900">Privacy-first defaults</p>
          <p>
            Core text processing is designed to run locally in your browser whenever possible, reducing unnecessary data exposure.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-slate-900">No dark patterns</p>
          <p>
            No forced accounts, no bait-and-switch limits, and no “free until you paste real text” traps.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-slate-900">Narrow scope, consistent behavior</p>
          <p>
            The site focuses on text conversion, formatting, cleanup, encoding/decoding, and counting. That focus keeps tools consistent.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <a
          href="/privacy-policy"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold cursor-pointer transition-colors"
        >
          Privacy Policy
        </a>
        <a
          href="/terms-of-service"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold cursor-pointer transition-colors"
        >
          Terms of Service
        </a>
      </div>
    </section>
  );
}
