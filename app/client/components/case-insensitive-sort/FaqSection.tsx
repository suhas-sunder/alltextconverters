import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does case-insensitive sorting do?",
    a: "It sorts text line by line while ignoring letter casing for the ordering step. That means “Apple” and “apple” will sort together. The output preserves your original characters, so the tool does not force everything to lowercase or uppercase.",
  },
  {
    q: "Why is this tool line-based?",
    a: "Sorting only makes sense when each line is an item. This page treats every line break as a separator, which is ideal for lists like tags, filenames, categories, or copied spreadsheet columns.",
  },
  {
    q: "How do A–Z and Z–A work?",
    a: "A–Z sorts ascending and Z–A sorts descending. Both modes use the same case-insensitive comparison, so only the direction changes.",
  },
  {
    q: "What does the Unique option remove?",
    a: "Unique removes repeated lines using a case-insensitive match. If you have “Tag” and “tag”, only one will remain when Unique is enabled. If duplicates are meaningful, keep Unique off.",
  },
  {
    q: "Does the tool change spaces or punctuation inside lines?",
    a: "No. The sorter compares lines but does not rewrite them. Spacing, punctuation, numbers, and symbols inside each line remain as you typed them.",
  },
  {
    q: "Can I upload files like TXT, PDF, and DOCX?",
    a: "Yes. Text-like files load directly in your browser. PDF and DOCX extraction can work too, but they require optional libraries in the app build (pdfjs-dist for PDF and mammoth for DOCX).",
  },
  {
    q: "Can I download the sorted output as a PDF?",
    a: "Yes. PDF export uses an optional library (jspdf). If PDF export is not available, the page falls back to your browser print dialog so you can save as PDF.",
  },
  {
    q: "Is my text stored on a server?",
    a: "No. Sorting runs locally in your browser from the text in the editor. Uploading reads the file locally and extracts text on-device when supported.",
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
            Quick answers about line sorting, uniqueness, and file handling.
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
