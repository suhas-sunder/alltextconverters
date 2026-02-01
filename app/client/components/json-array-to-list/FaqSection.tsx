const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What input does this tool accept?",
    a: "It accepts a top-level JSON array, for example [\"a\", \"b\", \"c\"]. If you paste a JSON object, the tool will warn you because it cannot guess which nested array you meant to extract.",
  },
  {
    q: "Does it keep keys or paths?",
    a: "No. This page is values-first. Each array item becomes one output line. If you need key paths, use a JSON flattener or a JSON-to-text tool designed for objects.",
  },
  {
    q: "What happens with objects or nested arrays inside the array?",
    a: "If the “Stringify objects and arrays” toggle is on, complex values are converted with JSON.stringify and placed on their own line. If it is off, complex values are skipped to avoid messy output.",
  },
  {
    q: "Why do I see an error even though the JSON looks close?",
    a: "JSON is strict. Common problems include trailing commas, single quotes, or missing double quotes around strings. Fix the JSON so it parses successfully, then convert.",
  },
  {
    q: "Does this upload my JSON to a server?",
    a: "No. Conversion runs locally in your browser. Upload is only used to read file contents into the editor so you can convert them on-device.",
  },
  {
    q: "Can I download the result as a PDF?",
    a: "Yes. The page exports the current editor value. If the optional PDF library is not available, the tool falls back to the browser print dialog so you can still save as PDF.",
  },
];

export function FaqSection() {
  return (
    <section className="rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          FAQ
        </h2>

        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 open:ring-sky-200/80 transition"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                <span className="text-base font-bold text-slate-900">
                  {f.q}
                </span>
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200 text-slate-700 group-open:bg-sky-50 group-open:ring-sky-200/70 group-open:text-sky-700">
                  +
                </span>
              </summary>
              <p className="mt-3 text-slate-700 leading-7">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
