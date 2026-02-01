import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does comma separated to list mean?",
    a: "It means taking values separated by commas (like “a, b, c”) and turning them into one value per line. This is useful for pasting into tools that expect a newline list.",
  },
  {
    q: "What rules does this tool use?",
    a: "It splits on commas, trims whitespace around each value, and ignores empty values created by extra commas. It preserves the original order and does not rewrite the text inside an item.",
  },
  {
    q: "Does it remove spaces inside values?",
    a: "No. It only trims leading and trailing whitespace around each comma-separated token. Spaces inside a value (like “New York”) remain intact.",
  },
  {
    q: "Why is there only one textarea?",
    a: "This page uses a single editor for both input and output. After you convert, the editor contains the newline list you can copy or download. It keeps the workflow simple and avoids mismatched boxes.",
  },
  {
    q: "Can I upload a file (TXT, PDF, DOCX)?",
    a: "Yes. Text-like files load locally in your browser. PDF and DOCX extraction can work too, but it requires optional libraries in the app build (pdfjs-dist for PDF and mammoth for DOCX).",
  },
  {
    q: "Is my text uploaded to a server?",
    a: "No. The split, trim, and filtering steps run locally in your browser. Uploading reads the file on-device and extracts text locally when supported.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: { "@type": "Answer", text: x.a },
      })),
    }),
    [],
  );

  return (
    <section
      id="faq"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                FAQ
              </h2>
              <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                Quick answers about converting comma-separated values into a newline list.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Local processing
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                Deterministic rules
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {faqs.map((f, idx) => {
              const open = openIndex === idx;
              return (
                <div
                  key={f.q}
                  className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : idx)}
                    className="cursor-pointer w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition"
                    aria-expanded={open}
                  >
                    <span className="font-bold text-slate-900">{f.q}</span>
                    <span className="text-slate-500">{open ? "–" : "+"}</span>
                  </button>
                  {open && (
                    <div className="px-5 pb-5 text-slate-700 leading-7">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
