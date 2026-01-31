import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What is a word counter?",
    a: "A word counter counts the number of words in your text, usually by splitting on whitespace. This page also counts characters and lines.",
  },
  {
    q: "How are words counted?",
    a: "Words are counted by trimming your text and splitting on whitespace (spaces, tabs, and line breaks).",
  },
  {
    q: "What counts as a character?",
    a: "Characters include everything you type, including spaces and newlines. The \"Chars (no spaces)\" number removes all whitespace.",
  },
  {
    q: "Is it private?",
    a: "Yes. Everything runs locally in your browser. Your text is not uploaded or stored.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. The tool is mobile-friendly and works on phones, tablets, and desktops.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
    []
  );

  return (
    <section id="faq" className="mt-12 bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Poppins] text-center">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <button
              key={i}
              type="button"
              className="w-full text-left border-b border-slate-200 pb-3 cursor-pointer transition-all"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <div className="font-semibold text-lg text-slate-800 flex justify-between items-center gap-4">
                <span className="min-w-0">{item.q}</span>
                <span className="text-slate-500 text-sm shrink-0">{isOpen ? "-" : "+"}</span>
              </div>

              {isOpen && <p className="mt-2 text-slate-700 leading-relaxed">{item.a}</p>}
            </button>
          );
        })}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
}
