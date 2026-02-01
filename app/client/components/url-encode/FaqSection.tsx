import { useMemo } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does a URL encoder do?",
    a: "A URL encoder percent-encodes text so it can be placed safely inside a URL component like a query parameter value or a path segment. It converts unsafe characters into %XX sequences while keeping safe characters readable.",
  },
  {
    q: "What encoding method does this page use?",
    a: "This tool uses encodeURIComponent. It is designed for encoding individual URL components, not entire URLs. It keeps URL separators readable when you use it on a component value.",
  },
  {
    q: "Does it upload my text?",
    a: "No. Encoding runs locally in your browser. Upload is optional and is only used to read a file into the editor on your device.",
  },
  {
    q: "Why do spaces become %20 instead of +?",
    a: "encodeURIComponent encodes spaces as %20. The plus sign convention is used by application/x-www-form-urlencoded forms, which is a different encoding format. For standard URL component encoding, %20 is expected.",
  },
  {
    q: "What if I paste an entire URL and it becomes unreadable?",
    a: "encodeURIComponent will encode characters like : / ? and & if you run it on a full URL, which makes the output unsuitable as a clickable URL. Encode only the part you are inserting, like a query value.",
  },
  {
    q: "Why did I get an error?",
    a: "Most errors happen when the input contains an invalid Unicode sequence (rare) or when optional file extraction libraries are missing for PDF or DOCX uploads. If a file fails, try plain text, or install pdfjs-dist for PDF and mammoth for DOCX.",
  },
];

export function FaqSection() {
  const schema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    }),
    [],
  );

  return (
    <section
      id="faq"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            FAQ
          </h2>
          <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
            Quick answers about URL encoding, what this tool does, and what to expect from the output.
          </p>

          <div className="mt-8 grid gap-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 open:ring-sky-200/80 transition"
              >
                <summary className="cursor-pointer list-none font-bold text-slate-900 flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-slate-400 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="mt-3 text-slate-700 leading-7">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
