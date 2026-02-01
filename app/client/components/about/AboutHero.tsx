export function AboutHero() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          About
        </p>
        <h1 className="text-2xl sm:text-4xl font-bold font-[Poppins] text-slate-900 leading-tight tracking-tight break-words hyphens-auto">
          AllTextConverters is a privacy-first toolbox for working with text
        </h1>
        <p className="text-slate-700 leading-relaxed max-w-4xl">
          This site exists for one reason: you regularly run into small text problems that
          waste time. Converting case, cleaning formatting, removing line breaks, decoding
          strings, sorting lists, or getting accurate word and character counts should be
          quick, predictable, and safe.
        </p>
        <p className="text-slate-700 leading-relaxed max-w-4xl">
          AllTextConverters is built as a utility site. Not a blog. Not a course platform.
          Not a “tool” that makes you scroll through paragraphs of fluff before you can use it.
          The goal is simple: paste text, get the result, move on.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-slate-900">Fast</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            Low-friction tools that load quickly and behave consistently.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-slate-900">Private</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            Processing is designed to run locally in your browser whenever possible.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-slate-900">Utility-first</p>
          <p className="text-sm text-slate-700 leading-relaxed">
            No accounts, no “article first” layout, and no bait-and-switch limits.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer transition-colors"
        >
          Go to the homepage
        </a>
        <a
          href="/word-counter"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold cursor-pointer transition-colors"
        >
          Try Word Counter
        </a>
      </div>
    </section>
  );
}
