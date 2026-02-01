import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does a hex to text converter do?",
    a: "It decodes hexadecimal bytes (two hex digits per byte) into ASCII text. It is a decoding tool, not a rewrite or translation tool.",
  },
  {
    q: "What input formats are supported?",
    a: "The converter is space tolerant and accepts common separators such as spaces, newlines, commas, colons, dashes, and underscores. It also accepts 0x and \\x prefixes that appear in logs and code snippets.",
  },
  {
    q: "Does it support Unicode or UTF-8?",
    a: "This page intentionally outputs ASCII only (bytes 0–127). If your hex contains bytes above 127, you will see a clear non-ASCII error. Use a UTF-8 aware decoder for multi-byte text.",
  },
  {
    q: "What happens with tabs and line breaks?",
    a: "Control bytes are shown as visible escapes like \\n, \\r, and \\t to keep the output copy-safe. Other control bytes are shown as \\xNN.",
  },
  {
    q: "Can I upload a file like TXT, PDF, DOCX, or BIN?",
    a: "Yes. Text-like files load locally in your browser. PDF and DOCX extraction may require optional libraries in the app build (pdfjs-dist for PDF and mammoth for DOCX). .bin files are read as raw bytes and loaded as hex.",
  },
  {
    q: "Is my data uploaded to a server?",
    a: "No. Decoding runs locally in your browser. Uploading reads the file on-device (when supported).",
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
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                FAQ
              </h2>
              <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                Quick answers about hex validation, ASCII scope, file uploads, and what to expect from the decoded output.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Local conversion
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                Clear errors
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {faqs.map((f, idx) => {
              const open = openIndex === idx;
              return (
                <div
                  key={f.q}
                  className="rounded-2xl bg-white ring-1 ring-slate-200/80 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : idx)}
                    className="cursor-pointer w-full text-left px-4 sm:px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="font-bold text-slate-900">{f.q}</div>
                    <span className="shrink-0 text-slate-500 font-bold">
                      {open ? "–" : "+"}
                    </span>
                  </button>
                  {open && (
                    <div className="px-4 sm:px-5 pb-4 text-slate-700 leading-7">
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
