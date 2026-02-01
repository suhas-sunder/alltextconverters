import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does a text to binary converter do?",
    a: "It encodes each ASCII character in your text into a fixed-width binary group. The groups are space-separated so you can read, copy, and paste the result easily.",
  },
  {
    q: "What is the difference between 7-bit and 8-bit output?",
    a: "7-bit output matches classic ASCII width (0–127) and uses 7 digits per character. 8-bit output pads the same ASCII value with a leading zero so each character looks like a full byte (8 digits). The character mapping is the same; only the padding changes.",
  },
  {
    q: "Is this Unicode or UTF-8 binary?",
    a: "No. This tool is ASCII-only by design. If your input contains non-ASCII characters (like emoji or accented letters), it shows an error instead of guessing an encoding. For Unicode text, you would typically encode to UTF-8 bytes first, then convert those bytes to binary.",
  },
  {
    q: "Why is there only one textarea?",
    a: "This page uses a single editor for both input and output. When you click Convert, the textarea becomes the binary result, which is the same content you copy or download. If you need the original text again, use Undo (Ctrl/⌘+Z).",
  },
  {
    q: "Can I upload a file (TXT, PDF, DOCX, BIN)?",
    a: "Yes. Text-like files load locally in your browser. PDF and DOCX extraction can work too, but it requires optional libraries in the app build (pdfjs-dist for PDF and mammoth for DOCX). A .bin file loads as raw bytes and is shown as 8-bit binary groups.",
  },
  {
    q: "Can I download the result?",
    a: "Yes. You can download a .txt file, or download a simple PDF. PDF export uses an optional library (jspdf). If PDF export is not available, the page falls back to your browser print dialog so you can save as PDF.",
  },
  {
    q: "Is my text uploaded or stored on a server?",
    a: "No. Conversion happens locally in your browser from the text in the editor. Uploading reads the file locally and extracts text on-device (when supported).",
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
            Quick answers about ASCII encoding, 7-bit vs 8-bit output, and files.
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
