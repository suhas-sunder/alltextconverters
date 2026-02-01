import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does “Text to Bulleted List” do?",
    a: "It turns a set of items into a clean bulleted list. You can paste items on separate lines or paste comma-separated values, choose a bullet style (like -, *, or •), then convert and copy the result.",
  },
  {
    q: "Why is there only one textarea?",
    a: "This page uses a single editor for both input and output. After you convert, the editor contains the bulleted list, which is the same text you copy or download. It avoids confusion between “input” and “output” boxes.",
  },
  {
    q: "Does it rewrite or change the words?",
    a: "No. It does not translate, rewrite, or correct grammar. It only splits your text into items and prefixes each item with a bullet.",
  },
  {
    q: "How does comma mode work?",
    a: "Comma mode splits on commas (and newlines). It is meant for quick pasted lists like “apple, banana, orange”. If your items themselves contain commas, use line mode instead.",
  },
  {
    q: "What happens with extra commas or blank lines?",
    a: "When “Ignore empty” is enabled (recommended), empty items created by extra commas or blank lines are removed so you do not get blank bullets. If you turn it off, empty items remain and can produce empty bullet lines.",
  },
  {
    q: "Does this run locally?",
    a: "Yes. Conversion happens in your browser. If you use Upload for PDF or DOCX, extraction is also attempted locally using optional libraries (pdfjs-dist and mammoth).",
  },
  {
    q: "Can I export as PDF?",
    a: "Yes. The page can export using jsPDF if it is installed in your project. If it is not available, the button falls back to the browser print dialog so you can “Save as PDF”.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
  }, []);

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

          <div className="mt-6 space-y-3">
            {faqs.map((f, idx) => {
              const open = openIndex === idx;
              return (
                <div
                  key={f.q}
                  className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm"
                >
                  <button
                    type="button"
                    className="cursor-pointer w-full text-left px-5 py-4 flex items-start justify-between gap-4"
                    onClick={() => toggle(idx)}
                    aria-expanded={open}
                  >
                    <span className="text-base sm:text-lg font-bold text-slate-900">
                      {f.q}
                    </span>
                    <span className="text-slate-500 font-bold">
                      {open ? "–" : "+"}
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
