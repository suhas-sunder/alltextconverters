import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does AllTextConverters do?",
    a: "AllTextConverters lets you modify, clean, and count text instantly. You can change case, encode or decode Base64, remove spaces, and count words, all in your browser.",
  },
  {
    q: "Is it free and private?",
    a: "Yes. Everything runs locally on your device. Nothing is uploaded or saved, ensuring complete privacy and free access.",
  },
  {
    q: "What types of conversions can I do?",
    a: "You can convert between uppercase, lowercase, title case, alternating case, inverse case, Base64 encoding or decoding, and more.",
  },
  {
    q: "How do I count words and characters?",
    a: "The counter updates automatically while you type or paste. It shows total words, characters, and lines in real time.",
  },
  {
    q: "What does Trim & Clean do?",
    a: "Trim & Clean removes extra spaces, tabs, and line breaks, perfect for cleaning messy text copied from websites or PDFs.",
  },
  {
    q: "Can I use this on mobile?",
    a: "Yes, the site is fully responsive and works on phones, tablets, and desktops.",
  },
  {
    q: "Will more tools be added?",
    a: "Yes. JSON formatter, Markdown cleaner, URL encoder, ROT13, and text diff tools are coming soon.",
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
    <section
      id="faq"
      className="mt-20 bg-white border border-gray-200 rounded-2xl shadow-md p-8 space-y-6"
    >
      <h2 className="text-3xl font-bold text-slate-900 font-[Poppins] text-center">
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
              <div className="font-semibold text-lg text-slate-800 flex justify-between items-center">
                <span>{item.q}</span>
                <span className="text-slate-500 text-sm">{isOpen ? "-" : "+"}</span>
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
