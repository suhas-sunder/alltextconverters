import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What is a text case checker?",
    a: "A text case checker labels the casing pattern of your text (uppercase, lowercase, mixed, title-like, or sentence-like). It does not convert or rewrite anything. It is a quick diagnostic tool for formatting consistency.",
  },
  {
    q: "Does this tool change my text?",
    a: "No. The editor stays exactly as you type or upload it. The page only analyzes what it sees and produces a report you can copy or export.",
  },
  {
    q: "How does it decide between title-like and sentence-like?",
    a: "It uses simple deterministic heuristics. Title-like checks whether most word-like tokens look like “Title” words (first letter uppercase, remaining letters lowercase). Sentence-like checks whether the first letter at likely sentence starts (beginning or after . ! ?) is usually uppercase and the rest trends lowercase. There is no grammar engine or language model involved.",
  },
  {
    q: "What counts as a letter for the analysis?",
    a: "The checker focuses on A–Z letters. Numbers, punctuation, emojis, and symbols are kept as context but do not count as letters. If your text contains no A–Z letters, the label will be “No letters”.",
  },
  {
    q: "Can I upload PDF or DOCX files?",
    a: "Yes, if your build includes optional libraries. PDF extraction requires pdfjs-dist and DOCX extraction requires mammoth. Extraction happens locally in your browser, and PDFs can include layout artifacts when converted to raw text.",
  },
  {
    q: "Is my text sent to a server?",
    a: "No. The detection runs in your browser from the current textarea value. Upload is local to your device (your browser reads the file) and the page does not upload your text as part of the checker.",
  },
  {
    q: "Why can the label be “Mixed” even when the text looks normal?",
    a: "Mixed is a safe fallback when casing is not consistent enough to match the simple title-like or sentence-like tests. Common reasons include acronyms, brand names, lists that combine headings and sentences, or unusual punctuation that makes sentence boundaries harder to detect deterministically.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpen((prev) => (prev === i ? null : i));
  };

  const items = useMemo(() => faqs, []);

  return (
    <section
      id="faq"
      className="rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6 sm:p-10"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          FAQ
        </h2>
        <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
          Quick answers about what the Text Case Checker detects, what it ignores,
          and how to interpret the results.
        </p>

        <div className="mt-8 space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="cursor-pointer w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-900">{item.q}</span>
                  <span className="text-slate-500 font-bold">
                    {isOpen ? "–" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-slate-700 leading-7">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
