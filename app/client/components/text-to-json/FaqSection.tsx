import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does this Text to JSON tool do?",
    a: "It converts plain text into JSON using simple deterministic rules. You can turn one line per item into a JSON array, or parse basic key:value lines into a JSON object.",
  },
  {
    q: "Is this a strict parser or a best-effort converter?",
    a: "It is best-effort. The goal is to produce valid JSON quickly from common text patterns, not to infer a schema or perfectly interpret every format. Review the output before using it in a real system.",
  },
  {
    q: "How does key:value mode work?",
    a: "Each non-empty line is split on the first colon. The left side becomes the key and the right side becomes the value. Values remain strings and the tool does not infer types or create nested objects.",
  },
  {
    q: "What is the _unparsed field in the output?",
    a: "If a line does not look like key:value, it is placed under _unparsed instead of being dropped. That keeps the conversion transparent so you can fix the input or handle those leftovers separately.",
  },
  {
    q: "How are duplicate keys handled?",
    a: "By default, the last value wins because it is simple and predictable. If you enable the duplicate-keys option, repeated keys are collected into arrays so you can keep every value.",
  },
  {
    q: "Can I upload a file (TXT, PDF, DOCX)?",
    a: "Yes. Text-like files load locally in your browser. PDF and DOCX extraction can work too, but it requires optional libraries in the app build (pdfjs-dist for PDF and mammoth for DOCX).",
  },
  {
    q: "Is my text uploaded or stored on a server?",
    a: "No. Conversion runs locally in your browser. Uploading a file reads it on-device so the text can be converted without sending it to a server.",
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
      className="rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6 sm:p-10"
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              FAQ
            </h2>
            <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
              Common questions about converting text into JSON and how the output is produced.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-slate-500" />
            Local conversion
          </span>
        </div>

        <div className="mt-8 space-y-3">
          {faqs.map((item, idx) => {
            const open = openIndex === idx;
            return (
              <div
                key={item.q}
                className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  className="cursor-pointer w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50 transition"
                  onClick={() => setOpenIndex(open ? null : idx)}
                  aria-expanded={open}
                >
                  <div className="min-w-0">
                    <div className="text-base font-extrabold text-slate-900 tracking-tight">
                      {item.q}
                    </div>
                  </div>
                  <span
                    className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-slate-200 text-slate-700 bg-white shrink-0"
                    aria-hidden="true"
                  >
                    {open ? "−" : "+"}
                  </span>
                </button>

                {open && (
                  <div className="px-4 sm:px-5 pb-5 text-slate-700 leading-7">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
