import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does a table to list converter do?",
    a: "This tool extracts one column from a pasted table, CSV, or TSV and returns it as a clean one-item-per-line list. It does not rewrite or interpret your data, it just reads cells and outputs text.",
  },
  {
    q: "What input formats does it accept?",
    a: "You can paste an HTML table, TSV (tabs between columns), or CSV (commas between columns). Many spreadsheets copy as TSV by default, while exports are often CSV. The tool detects the most likely format and extracts rows accordingly.",
  },
  {
    q: "How does the column selector work?",
    a: "The column selector uses 1-based numbering (Column 1, Column 2, etc.). By default it extracts the first column. If your paste contains multiple columns, choose the column you want and click Extract Column again.",
  },
  {
    q: "Does it handle quoted CSV values?",
    a: "Yes, in a practical way. Quoted fields like \"New York, NY\" are treated as one cell. The parser is best-effort and designed for common exports, not every edge case of the CSV specification.",
  },
  {
    q: "Can I keep empty cells?",
    a: "By default the tool skips empty extracted values so your list stays compact. You can turn off the \"Ignore empty values\" option if you want to preserve blank items in the output.",
  },
  {
    q: "Can I upload files (TXT, PDF, DOCX)?",
    a: "Yes. Text-like files load in your browser. PDF and DOCX extraction can also work, but it requires optional libraries in your app build (pdfjs-dist for PDF and mammoth for DOCX).",
  },
  {
    q: "Is my data uploaded to a server?",
    a: "No. Parsing and extraction run locally in your browser. Upload reads files on-device and extracts text locally when supported.",
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
        acceptedAnswer: {
          "@type": "Answer",
          text: x.a,
        },
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            FAQ
          </h2>
          <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
            Quick answers about supported formats, column extraction, and files.
          </p>

          <div className="mt-8 divide-y divide-slate-200/70 rounded-2xl ring-1 ring-slate-200/70 bg-white overflow-hidden">
            {faqs.map((item, idx) => {
              const open = openIndex === idx;
              return (
                <div key={item.q} className="p-0">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : idx)}
                    className="cursor-pointer w-full text-left px-5 sm:px-6 py-4 sm:py-5 hover:bg-slate-50 transition flex items-start justify-between gap-4"
                    aria-expanded={open}
                  >
                    <span className="text-base font-bold text-slate-900">
                      {item.q}
                    </span>
                    <span
                      className={
                        open
                          ? "mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white text-sm font-bold"
                          : "mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-sm font-bold"
                      }
                      aria-hidden="true"
                    >
                      {open ? "−" : "+"}
                    </span>
                  </button>

                  {open ? (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-2 text-slate-700 leading-7">
                      {item.a}
                    </div>
                  ) : null}
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
