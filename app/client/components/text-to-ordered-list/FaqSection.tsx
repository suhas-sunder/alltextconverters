import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does this converter produce?",
    a: "It produces plain text lines with a prefix per item, like “1. item”, “A. item”, or “III. item”. It does not generate HTML and it does not rewrite your content.",
  },
  {
    q: "Why is conversion not live?",
    a: "List formatting often involves changing settings. A Convert button makes the action explicit and avoids confusion between input and output. You choose settings, convert once, then copy or download the final text.",
  },
  {
    q: "How should I format the input?",
    a: "Pick a split method: Lines means one item per line. Commas means items separated by commas (a, b, c). Trimming and ignoring empty items are optional so you can keep the parsing strict or lenient.",
  },
  {
    q: "What numbering styles are supported?",
    a: "Numbers, roman numerals (upper and lower), and letters (upper and lower). Letter numbering continues past Z using an Excel-style sequence (AA, AB, etc.). Roman numerals are generated up to 3999.",
  },
  {
    q: "What does Start at do?",
    a: "It sets the first index used for prefixes. Start at 3 gives “3.” for numbers, “C.” for letters, and “III.” for roman numerals.",
  },
  {
    q: "Can I upload PDF or DOCX?",
    a: "Yes, but PDF and DOCX extraction requires optional libraries in your app build (pdfjs-dist for PDF and mammoth for DOCX). If those libraries are not installed, upload will still work for text-like files such as TXT, CSV, JSON, or HTML.",
  },
  {
    q: "Can I download the result as PDF?",
    a: "Yes. PDF export uses an optional library (jspdf). If it is not available, the page falls back to your browser print dialog so you can save as PDF.",
  },
  {
    q: "Is my text sent to a server?",
    a: "No. Conversion runs locally in your browser. Upload reads the file locally to fill the editor, and copy/download are explicit actions you trigger.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
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
        <p className="mt-2 text-slate-600 leading-7">
          Answers about splitting, numbering styles, and exports.
        </p>

        <div className="mt-8 space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="rounded-2xl bg-white ring-1 ring-slate-200/80 overflow-hidden"
              >
                <button
                  type="button"
                  className="cursor-pointer w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-slate-900">{item.q}</span>
                  <span className="text-slate-500 font-bold">
                    {isOpen ? "-" : "+"}
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
