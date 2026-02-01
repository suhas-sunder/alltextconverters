import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What is a match-case converter?",
    a: "A match-case converter copies the uppercase/lowercase pattern from a reference text and applies that pattern to a separate target text. It changes casing only. It does not rewrite words or apply language rules.",
  },
  {
    q: "Does it preserve punctuation and spacing?",
    a: "Yes. The tool only changes the case of A–Z letters in the target. Numbers, symbols, whitespace, and line breaks are passed through as-is so the structure of your target stays intact.",
  },
  {
    q: "What happens if my reference is shorter than my target?",
    a: "The pattern repeats. If the reference contains 10 letters worth of casing, those 10 casing flags are applied to the first 10 letters in the target, then the pattern starts again from the beginning.",
  },
  {
    q: "Why does the tool ignore some characters when building the pattern?",
    a: "Only letters have case. The converter builds the pattern from A–Z letters so punctuation and digits do not shift the pattern unexpectedly. This keeps results predictable for IDs, filenames, and mixed content.",
  },
  {
    q: "Can it handle PDFs and DOCX files?",
    a: "It can, if optional libraries are installed in your app build. PDF extraction uses pdfjs-dist and DOCX extraction uses mammoth. If those are not installed, the tool will still work for plain text files and pasted text.",
  },
  {
    q: "Is my text uploaded anywhere?",
    a: "No. Conversion and copying run locally in your browser. If you upload a file, your browser reads it locally to extract text before conversion.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  const items = useMemo(() => faqs, []);

  return (
    <section
      id="faq"
      className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 py-8 space-y-5"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          FAQ
        </h2>
        <p className="text-sm text-slate-600 leading-6 max-w-2xl mx-auto">
          Answers to common questions about applying a reference casing pattern.
        </p>
      </div>

      <div className="mx-auto max-w-3xl divide-y divide-slate-200/70">
        {items.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <div key={item.q} className="py-3">
              <button
                type="button"
                className="cursor-pointer w-full flex items-start justify-between gap-4 text-left"
                onClick={() => setOpen(isOpen ? null : idx)}
              >
                <span className="text-base font-bold text-slate-900">
                  {item.q}
                </span>
                <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200 text-slate-700 shrink-0">
                  {isOpen ? "–" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="mt-2 text-sm text-slate-700 leading-7">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
