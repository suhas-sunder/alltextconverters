import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does a text to HTML converter do?",
    a: "A text to HTML converter takes plain text and turns it into a simple HTML snippet using predictable rules. It escapes special characters so the output is safe to paste into an HTML editor, then adds basic structure such as paragraphs, <br> tags, or a <pre> wrapper depending on the mode you choose.",
  },
  {
    q: "Does this tool generate styled HTML or templates?",
    a: "No. It produces minimal, readable markup. There is no CSS, no layout system, and no template logic. The goal is to give you clean HTML text nodes and basic structure that you can paste into a CMS, an email editor, documentation, or a static page.",
  },
  {
    q: "Will it keep my spacing and line breaks?",
    a: "Yes, in a controlled way. Paragraph mode splits on blank lines and uses <p> blocks while preserving single line breaks as <br>. Line-break mode converts every newline to <br>. Preformatted mode wraps the text in <pre> so whitespace is preserved exactly.",
  },
  {
    q: "Can I upload a file (TXT, PDF, DOCX)?",
    a: "Yes. Text-like files load locally in your browser. PDF and DOCX extraction can work too, but it requires optional libraries in the app build (pdfjs-dist for PDF and mammoth for DOCX).",
  },
  {
    q: "Does it run locally in my browser?",
    a: "Yes. Conversion happens on-device from the text in the editor. Uploading reads the file locally and extracts text in-browser when supported. Nothing is sent to a server by this page.",
  },
  {
    q: "Can I download the result?",
    a: "Yes. Download as HTML for easy reuse, or download a simple PDF. PDF export uses an optional library (jspdf). If PDF export is not available, the page falls back to your browser print dialog so you can save as PDF.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: { "@type": "Answer", text: x.a },
      })),
    }),
    [],
  );

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          FAQ
        </h2>
        <p className="mt-2 text-slate-600 leading-7">
          Quick answers about converting plain text into HTML safely.
        </p>

        <div className="mt-6 divide-y divide-slate-200">
          {faqs.map((item, idx) => {
            const open = openIndex === idx;
            return (
              <div key={item.q} className="py-4">
                <button
                  type="button"
                  className="cursor-pointer w-full text-left flex items-start justify-between gap-4"
                  onClick={() => setOpenIndex(open ? null : idx)}
                  aria-expanded={open}
                >
                  <span className="font-semibold text-slate-900">{item.q}</span>
                  <span className="text-slate-500 text-sm">
                    {open ? "–" : "+"}
                  </span>
                </button>
                {open && (
                  <div className="mt-2 text-slate-700 leading-7">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
