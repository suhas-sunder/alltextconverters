const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "What does a lowercase converter do?",
    a: "It transforms letters in your text to lowercase while leaving everything else (numbers, punctuation, spacing, and line breaks) unchanged. The goal is simple normalization so you can paste consistent text into another app.",
  },
  {
    q: "Does this tool change my formatting?",
    a: "No. The conversion only changes letter casing. Paragraph breaks, tabs, punctuation, emojis, and symbols are preserved so the output still looks like the original content, just with lowercase letters.",
  },
  {
    q: "Is lowercasing safe for emails and usernames?",
    a: "Usually, yes. Many systems treat emails and usernames as case-insensitive, and storing a lowercase version helps prevent duplicates. If your system is case-sensitive, keep the original too and confirm the rules before relying on normalization.",
  },
  {
    q: "Why does the page include a locale-aware option?",
    a: "Some languages have locale-specific casing rules (for example, Turkish I/i). Locale-aware lowercasing asks your browser to apply its locale mapping, which can produce more correct results for those languages. For critical workflows, verify a few samples in your destination system.",
  },
  {
    q: "Can I upload PDF or DOCX files?",
    a: "Yes, if your site build includes the optional extraction libraries. TXT and other text-like formats load directly in the browser. PDF extraction typically relies on pdfjs-dist, and DOCX extraction relies on mammoth. If those libraries are not installed, the tool will show an error.",
  },
  {
    q: "How does Download PDF work?",
    a: "When available, the page uses an in-browser PDF generator to write your lowercase output into a simple document. If PDF generation is not available, the tool falls back to the browser print dialog so you can save as PDF from there.",
  },
  {
    q: "Does the converter send my text to a server?",
    a: "No. Conversion and file reading happen in your browser. That keeps the tool fast and avoids uploading sensitive content. (Your browser and extensions can still affect privacy, so use common sense for highly confidential text.)",
  },
  {
    q: "What are common mistakes when using lowercase conversion?",
    a: "The biggest one is using lowercase for presentation text where capitalization conveys meaning (brand names, acronyms, proper nouns). Lowercase is best for matching and normalization. If you need readable titles, use a different case style instead.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
      <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
        <span className="text-base font-bold text-slate-900">{q}</span>
        <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200 group-open:bg-sky-50 group-open:text-sky-700 group-open:ring-sky-200 transition">
          +
        </span>
      </summary>
      <div className="mt-3 text-sm text-slate-700 leading-6">{a}</div>
    </details>
  );
}

export function FaqSection() {
  return (
    <section className="rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">FAQ</h2>
        <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
          Quick answers to common questions about lowercasing text, file uploads, and exports.
        </p>

        <div className="mt-8 grid gap-3">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
