import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What is a character counter?",
    a: "A character counter tells you how many characters are in your text. This page shows counts with spaces, without spaces, and an optional UTF-8 byte count.",
  },
  {
    q: "What does 'characters with spaces' mean?",
    a: "It counts every character in the text area, including spaces, punctuation, and line breaks.",
  },
  {
    q: "What does 'characters without spaces' mean?",
    a: "It removes all whitespace characters first (spaces, tabs, and line breaks), then counts what remains.",
  },
  {
    q: "Why is there a byte count?",
    a: "Some limits are measured in bytes, not characters. UTF-8 bytes matter for emojis and non-Latin scripts because they can use multiple bytes per character.",
  },
  {
    q: "Is it private?",
    a: "Yes. Everything runs locally in your browser. Your text is not uploaded or stored.",
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
    [],
  );

  return (
    <section
      id="faq"
      className="mt-12 bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-6"
    >
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
                <span className="text-slate-500 text-sm shrink-0">
                  {isOpen ? "-" : "+"}
                </span>
              </div>

              {isOpen && (
                <p className="mt-2 text-slate-700 leading-relaxed">{item.a}</p>
              )}
            </button>
          );
        })}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
