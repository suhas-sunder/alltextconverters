import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does this text cleaner change?",
    a: "It applies a small, deterministic set of cleanup rules: remove common zero-width characters, normalize line endings to LF, collapse repeated spaces (optional toggle), and trim leading and trailing whitespace for the whole text block.",
  },
  {
    q: "Does it rewrite my text or fix grammar?",
    a: "No. This tool is not a rewrite assistant. It does not change word choice, sentence structure, punctuation style, or spelling. It only normalizes underlying characters and spacing so your text behaves predictably.",
  },
  {
    q: "Why does invisible text matter?",
    a: "Zero-width characters can make strings look identical while failing comparisons, breaking search matches, or causing unexpected cursor behavior. Removing them is a common cleanup step after copying from rich text sources.",
  },
  {
    q: "What does “normalize line endings” mean?",
    a: "Some files use CRLF (Windows) or CR (older systems) to represent newlines. Normalizing converts them into a consistent LF newline so diffs and pasted text behave the same across tools.",
  },
  {
    q: "Can I upload a file (TXT, PDF, DOCX)?",
    a: "Yes. Text-like files load locally in your browser. PDF and DOCX extraction can also work, but it requires optional libraries in your app build (pdfjs-dist for PDF and mammoth for DOCX).",
  },
  {
    q: "Can I download the cleaned result as a PDF?",
    a: "Yes. PDF export uses an optional library (jspdf). If it is not available, the page falls back to the browser print dialog so you can save as PDF.",
  },
  {
    q: "Is my text uploaded or stored on a server?",
    a: "No. Cleaning runs locally in your browser from the text in the editor. Uploading reads the file locally and extracts text on-device when supported.",
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
            Quick answers about cleanup rules, files, and exports.
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
                    <span className="mt-0.5 text-slate-400">
                      {open ? "−" : "+"}
                    </span>
                  </button>

                  {open && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-2">
                      <p className="text-slate-700 leading-7">{item.a}</p>
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
