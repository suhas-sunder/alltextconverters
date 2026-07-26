const faqs = [
  {
    q: "Does AllTextConverters store my text?",
    a: "Supported converters are designed to run locally in your browser. See the privacy policy for details about site operations and consent.",
  },
  {
    q: "How can I report an issue?",
    a: "Use the contact page with a redacted, minimal example and your browser details.",
  },
  {
    q: "Who built AllTextConverters?",
    a: "AllTextConverters is built and maintained by Suhas Sunder.",
  },
];

export function AboutFaqSection() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-6">
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
