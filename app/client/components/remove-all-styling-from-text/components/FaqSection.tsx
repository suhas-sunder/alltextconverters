import React, { useMemo, useState } from "react";

const FAQS = [
  {
    q: "What does “remove all styling” mean?",
    a: "It means the output contains only plain text. HTML tags, inline styles, CSS classes, and formatting markup are removed. You keep the readable content and the line structure.",
  },
  {
    q: "Will this preserve line breaks and paragraphs?",
    a: "Yes. Line breaks (like <br>) become newlines, and paragraphs are separated so the result stays readable. You can optionally collapse extra blank lines if your source has lots of spacing.",
  },
  {
    q: "Does it remove <font> tags and old HTML formatting?",
    a: "Yes. Deprecated tags like <font> are treated as markup and removed. Only their text content is kept.",
  },
  {
    q: "Can I paste raw HTML source code?",
    a: "Yes. The tool parses HTML in your browser and extracts the text. Script and style blocks are ignored, since they are not human-readable content.",
  },
  {
    q: "Does it keep hyperlinks?",
    a: "It keeps the visible link text, but it does not keep clickable links or URLs as markup. If you need URLs preserved, paste content that includes them as plain text.",
  },
  {
    q: "Is my text uploaded to a server?",
    a: "No. The stripping runs in your browser. File uploads are also processed locally. PDF and DOCX extraction may require optional libraries in your app build.",
  },
  {
    q: "Why does the textarea change after I click remove styling?",
    a: "This page uses one editor for input and output, like the other converters on this site. After conversion, the cleaned text becomes the value you copy or download.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  const items = useMemo(() => FAQS, []);

  return (
    <section className="rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            FAQ
          </h2>
          <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
            Common questions about stripping HTML and formatting to plain text.
          </p>

          <div className="mt-8 divide-y divide-slate-200">
            {items.map((item, idx) => {
              const isOpen = open === idx;
              return (
                <div key={item.q} className="py-4">
                  <button
                    type="button"
                    className="cursor-pointer w-full flex items-start justify-between gap-4 text-left"
                    onClick={() => setOpen((v) => (v === idx ? null : idx))}
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-semibold text-slate-900">
                      {item.q}
                    </span>
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200 text-slate-700 text-sm">
                      {isOpen ? "–" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-3 text-slate-700 leading-7">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-3xl bg-slate-50 ring-1 ring-slate-200 p-6">
            <div className="text-sm font-semibold text-slate-900">
              Tip: cleaner input means cleaner output
            </div>
            <p className="mt-2 text-sm text-slate-700 leading-7">
              If you copy from a page with navigation or sidebars, you may get
              extra lines that are not part of the main content. Try copying a
              smaller selection or enable “Collapse extra blank lines” for a
              tighter result.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
