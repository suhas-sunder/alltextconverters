export function AboutHero() {
  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">About</p>
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          Focused browser-based tools for everyday text tasks
        </h1>
        <p className="max-w-4xl leading-relaxed text-slate-700">
          AllTextConverters provides focused utilities for text conversion, cleanup,
          formatting, encoding, and counting. The tools keep the task in view:
          enter text, review the result, and copy or download it when you are ready.
        </p>
        <p className="max-w-4xl leading-relaxed text-slate-700">
          Supported transformations are designed to run locally in the browser, and
          no account is required. The privacy policy explains site operations,
          consent choices, and any optional services.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Fact title="Focused" text="The utility appears before supporting information." />
        <Fact title="Local by design" text="Supported converters process text in the browser rather than sending it to an application server for conversion." />
        <Fact title="No account required" text="Use the available browser tools without creating an account." />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a href="/" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-800">
          Go to the homepage
        </a>
        <a href="/word-counter" className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-sky-700">
          Try Word Counter
        </a>
      </div>
    </section>
  );
}

function Fact({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-sm leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}
