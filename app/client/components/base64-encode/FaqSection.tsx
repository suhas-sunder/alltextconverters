import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does a Base64 encoder do?",
    a: "A Base64 encoder converts your text into a Base64 string. Base64 is an encoding format that represents bytes using a limited ASCII character set so data can move through systems that are not byte-friendly.",
  },
  {
    q: "Is Base64 encryption?",
    a: "No. Base64 is reversible encoding, not encryption. It does not protect content. If you need confidentiality, use proper security controls (encryption, access control, secret storage).",
  },
  {
    q: "How is this Unicode-safe?",
    a: "Some browser APIs only handle Latin-1 strings directly. This page converts your text to UTF-8 bytes first using TextEncoder, then Base64 encodes those bytes. That preserves emoji, accents, and non-Latin scripts reliably.",
  },
  {
    q: "Why is there only one textarea?",
    a: "This page uses a single editor for both input and output. After you encode, the editor contains the Base64 result, which is what you copy or download. It keeps the workflow simple and avoids mismatched input vs. output boxes.",
  },
  {
    q: "Can I upload a file (TXT, PDF, DOCX)?",
    a: "Yes. Text-like files (TXT, CSV, JSON, HTML, etc.) load in your browser and are encoded immediately. PDF and DOCX extraction can work too, but it requires optional libraries in the app build (pdfjs-dist for PDF and mammoth for DOCX).",
  },
  {
    q: "Does this page send my text to a server?",
    a: "No. Encoding happens locally in your browser from the text in the editor. Uploading reads the file locally and extracts text on-device (when supported).",
  },
  {
    q: "Can I download the result?",
    a: "Yes. You can download a simple PDF of the Base64 output. PDF export uses an optional library (jspdf). If PDF export is not available, the page falls back to your browser print dialog so you can save as PDF.",
  },
  {
    q: "Does this tool decode Base64 too?",
    a: "No. This page focuses on encoding text to Base64. Decoding is a separate workflow because it typically needs stricter validation and sometimes a choice of variants (standard vs URL-safe).",
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
            Quick answers about Base64 encoding, Unicode, files, and downloads.
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
