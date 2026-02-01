import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What is URL decoding?",
    a: "URL decoding converts percent-encoded sequences back into readable text. For example, %20 becomes a space and %2F becomes a forward slash. This tool uses decodeURIComponent, which follows standard URL percent-encoding rules.",
  },
  {
    q: "When should I use a URL decoder?",
    a: "Use it when you copied an encoded value from a query string, form submission, redirect URL, analytics parameter, or API payload and you want to inspect the original text. It is also useful when debugging webhooks, OAuth redirects, or server logs that store encoded parameters.",
  },
  {
    q: "What happens if the input is invalid?",
    a: "If the text contains malformed escapes (for example, an incomplete % sequence), decodeURIComponent throws an error. This page catches that error and shows a friendly message instead of crashing. Your original text stays in the editor so you can fix it.",
  },
  {
    q: "Does this tool treat + as a space?",
    a: "No. In some contexts (especially application/x-www-form-urlencoded), a plus sign can represent a space. decodeURIComponent does not change + by default. If your source uses + for spaces, replace + with a space first, then decode.",
  },
  {
    q: "Is my text uploaded to a server?",
    a: "No. Decoding runs locally in your browser. Upload is optional and is used only to load text into the editor. PDF/DOCX extraction (if enabled in your build) also runs in-browser.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  const items = useMemo(() => faqs, []);

  return (
    <section
      id="faq"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                URL Decode FAQ
              </h2>
              <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                Common questions about decoding percent-encoded text and how this
                tool behaves on edge cases.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {items.map((item, idx) => {
              const isOpen = open === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm"
                >
                  <button
                    type="button"
                    className="cursor-pointer w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-slate-50 transition rounded-2xl"
                    onClick={() => setOpen(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-slate-900">{item.q}</span>
                    <span className="text-slate-500">{isOpen ? "–" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-slate-700 leading-7">
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
