import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does XML to text mean?",
    a: "It means extracting the human readable words that appear inside XML elements and removing the markup. Tags and attributes are ignored, and only text node content is returned as plain text.",
  },
  {
    q: "Does this tool convert attributes or tag names into text?",
    a: "No. Attributes like id=\"123\" are data but they are not text nodes. This tool extracts text node values only. If you need attributes, you would need a custom extractor that maps attributes into an output format.",
  },
  {
    q: "Why does it say my XML is invalid?",
    a: "XML parsing is strict. Every opening tag must close, entities must be valid, and the document must be well formed. If the browser parser reports an error, the tool shows an error instead of guessing.",
  },
  {
    q: "What do the whitespace toggles do?",
    a: "Collapse whitespace compresses runs of spaces, tabs, and line breaks into a single space, which is usually best for readability. Keep line breaks keeps newline characters from text nodes and joins extracted parts using newlines for more line oriented output.",
  },
  {
    q: "Can I upload a file (TXT, XML, PDF, DOCX)?",
    a: "Yes. Text-like files load locally in your browser. PDF and DOCX extraction can work too, but it requires optional libraries in the app build (pdfjs-dist for PDF and mammoth for DOCX).",
  },
  {
    q: "Does my XML get uploaded to a server?",
    a: "No. Extraction runs locally in your browser from the text currently in the editor. Copying and downloading are explicit actions you trigger.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = useMemo(() => faqs, []);

  return (
    <section
      id="faq"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                FAQ
              </h2>
              <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                Quick answers about extracting text from XML and what to expect
                from the output.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {items.map((item, idx) => {
              const open = openIndex === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    className="cursor-pointer w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition"
                    onClick={() => setOpenIndex((cur) => (cur === idx ? null : idx))}
                    aria-expanded={open}
                  >
                    <span className="font-bold text-slate-900">{item.q}</span>
                    <span className="text-slate-400 font-bold select-none">
                      {open ? "-" : "+"}
                    </span>
                  </button>

                  {open && (
                    <div className="px-5 pb-5 text-slate-700 leading-7">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
