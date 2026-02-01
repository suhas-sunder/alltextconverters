import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "Does AllTextConverters store or upload my text?",
    a: "Core tools are designed to run locally in your browser whenever possible. The site does not require accounts and does not store pasted text.",
  },
  {
    q: "What types of tools are on the site?",
    a: "Text conversion and cleanup tools: case converters, whitespace cleaners, list and table helpers, encoding/decoding tools (Base64, URL), and counters.",
  },
  {
    q: "Is this a course or tutorial site?",
    a: "No. This site is built as utilities first: direct tools, fast results, and minimal friction.",
  },
  {
    q: "Who built the site?",
    a: "AllTextConverters is built and maintained by Suhas Sunder (suhassunder.com).",
  },
  {
    q: "How can I reach you?",
    a: "Use the contact page to reach the developer.",
  },
];

export function AboutFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Poppins] text-center">
          FAQ
        </h2>
        <p className="text-slate-700 text-center max-w-3xl mx-auto">
          Quick answers about AllTextConverters, privacy, and the scope of the tools.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((f, i) => {
          const open = openIndex === i;
          return (
            <div
              key={f.q}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-4"
                aria-expanded={open}
              >
                <span className="font-semibold text-slate-900">{f.q}</span>
                <span className="text-slate-600">{open ? "−" : "+"}</span>
              </button>
              {open ? (
                <div className="px-4 py-3 bg-white text-slate-700 leading-relaxed">
                  {f.a.includes("suhassunder.com") ? (
                    <>
                      AllTextConverters is built and maintained by Suhas Sunder. See{" "}
                      <a
                        href="https://www.suhassunder.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline cursor-pointer"
                      >
                        suhassunder.com
                      </a>
                      .
                    </>
                  ) : f.a.includes("contact page") ? (
                    <>
                      Use the{" "}
                      <a
                        href="/contact"
                        className="text-blue-600 underline cursor-pointer"
                      >
                        contact page
                      </a>{" "}
                      to reach the developer.
                    </>
                  ) : (
                    f.a
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
