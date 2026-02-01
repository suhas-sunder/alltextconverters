import { useMemo } from "react";

const faqs = [
  {
    q: "Does AllTextConverters store my text?",
    a: "No. Most tools run locally in your browser. The site does not require accounts and does not store pasted text.",
  },
  {
    q: "Is this a paid service?",
    a: "No. The tools are free to use without subscriptions or signups.",
  },
  {
    q: "Who built AllTextConverters?",
    a: "AllTextConverters is built and maintained by Suhas Sunder, a professional software developer.",
  },
];

export function AboutFaqSection() {
  const schema = useMemo(
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Poppins]">
        FAQ
      </h2>
      <ul className="space-y-3 text-slate-700">
        {faqs.map((f) => (
          <li key={f.q}>
            <p className="font-semibold text-slate-900">{f.q}</p>
            <p>{f.a}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
