import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does a whitespace cleaner do?",
    a: "A whitespace cleaner removes or normalizes hard-to-see characters that can cause mismatches or parsing errors. This page targets tabs, non-breaking spaces (NBSP), zero-width characters, and a small set of other invisible Unicode characters. It does not rewrite your text.",
  },
  {
    q: "What counts as a zero-width character?",
    a: "Zero-width characters are Unicode code points that take up no visible space but still exist in the string. Common examples include zero-width space and joiners. They can slip into tokens, usernames, or IDs during copy-paste and then cause a value to fail validation or compare unequal.",
  },
  {
    q: "Does this tool collapse repeated spaces or trim lines?",
    a: "No. This tool is intentionally narrow. It focuses on hidden whitespace and invisible characters. If you need trimming, line ending normalization, or collapsing repeated spaces, use a dedicated text cleaner tool instead.",
  },
  {
    q: "Why are tabs replaced with spaces instead of removed?",
    a: "Tabs often act like separators. If you delete them entirely, words or columns can merge and create new problems. Replacing one or more tabs with a single space preserves boundaries while removing tab-specific behavior.",
  },
  {
    q: "How accurate are the removal counts?",
    a: "Counts are computed by scanning your current text for specific character categories and reporting how many characters were replaced or removed. If your destination still rejects the result, the issue may be unrelated to hidden whitespace (for example, length limits or forbidden symbols).",
  },
  {
    q: "Do you upload my text to a server?",
    a: "No. Cleaning runs in your browser. Upload is only used to read a local file and extract its text into the editor. PDF extraction requires pdfjs-dist and DOCX extraction requires mammoth. Download PDF uses jspdf, with a print fallback if it is not installed.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const schema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            FAQ
          </h2>

          <div className="mt-6 space-y-3">
            {faqs.map((f, i) => {
              const open = openIndex === i;
              return (
                <div
                  key={f.q}
                  className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm"
                >
                  <button
                    type="button"
                    className="cursor-pointer w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition rounded-2xl"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className="font-bold text-slate-900">{f.q}</span>
                    <span className="shrink-0 text-slate-500">
                      {open ? "−" : "+"}
                    </span>
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
