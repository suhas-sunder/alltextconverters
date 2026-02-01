import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does “remove extra spaces” do?",
    a: "It collapses repeated spaces so that two or more spaces become a single space. It is a formatting cleanup tool and does not rewrite your text.",
  },
  {
    q: "What is the Preserve line breaks toggle?",
    a: "When Preserve line breaks is on, the tool cleans spacing within each line but keeps your existing line breaks. When it is off, the tool collapses whitespace across the whole text, including new lines, into a single-flow paragraph.",
  },
  {
    q: "Does it change punctuation or words?",
    a: "No. It does not change wording, punctuation, or numbers. It focuses on whitespace: repeated spaces, tabs, and common zero-width characters.",
  },
  {
    q: "Can I upload a file (TXT, PDF, DOCX)?",
    a: "Yes. Text-like files load in your browser and are cleaned immediately. PDF and DOCX extraction can work too, but it requires optional libraries in the app build (pdfjs-dist for PDF and mammoth for DOCX).",
  },
  {
    q: "Will it remove intentional spacing used for alignment?",
    a: "Yes. If your content relies on multiple spaces for alignment (like fixed-width columns), collapsing spaces will remove that alignment. For aligned data, consider using tables or a formatter that understands columns.",
  },
  {
    q: "Is my text uploaded to a server?",
    a: "No. Cleaning happens in your browser. The page does not send your text to a server. Copying and exporting are actions you trigger locally.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const schema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
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
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                FAQ
              </h2>
              <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                Quick answers about how the cleaner behaves and what the toggle changes.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {faqs.map((f, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={f.q}
                  className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="cursor-pointer w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition"
                    aria-expanded={isOpen}
                  >
                    <div className="font-bold text-slate-900">{f.q}</div>
                    <span className="text-slate-500 select-none">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
