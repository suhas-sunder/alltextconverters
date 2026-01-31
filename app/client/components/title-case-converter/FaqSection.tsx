import React from "react";

const faqs = [
  {
    q: "What does this Title Case converter do?",
    a: "It formats text so each word starts with an uppercase letter and the remaining letters in that word are lowercased. The rules are deterministic and do not rely on language or grammar analysis.",
  },
  {
    q: "Does it follow a specific style guide?",
    a: "No. It does not apply “small word” exceptions or editorial rules. If you need Chicago, APA, or custom title casing rules, you can use this converter as a baseline and then adjust a few words manually.",
  },
  {
    q: "Will it preserve punctuation and line breaks?",
    a: "Yes. The converter changes letter casing while preserving whitespace, newlines, punctuation, and symbols so your structure stays recognizable after conversion.",
  },
  {
    q: "How are hyphens and apostrophes handled?",
    a: "Hyphens and apostrophes are treated as internal punctuation within a word-like token. That means common cases like “don’t” and “re-entry” remain a single token instead of being split into multiple words.",
  },
  {
    q: "Why did an acronym change casing?",
    a: "Because the rules are intentionally simple, an all-caps acronym like “NASA” can become “Nasa”. If exact casing is required for certain terms, restore those terms after conversion.",
  },
  {
    q: "Can I upload PDF or DOCX files?",
    a: "Yes. PDF and DOCX extraction runs locally in your browser when optional libraries are installed. PDF text may include extra spacing because of how PDFs store layout. TXT and similar formats load directly.",
  },
  {
    q: "Can I export the result as a PDF?",
    a: "Yes. The page can generate a simple text PDF when jspdf is available. If it is not installed, the page falls back to your browser’s print dialog so you can save as PDF.",
  },
  {
    q: "Is my text sent to a server?",
    a: "No. Conversion is computed in your browser from the editor value. Upload extraction is also handled locally when supported by the installed libraries.",
  },
];

export function FaqSection() {
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                Quick answers about deterministic Title Case conversion, uploads, and exporting.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                  <span className="text-base font-bold text-slate-900">
                    {item.q}
                  </span>
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200 text-slate-700 group-open:bg-sky-50 group-open:ring-sky-200/70">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 5v14m-7-7h14"
                        className="group-open:hidden"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14"
                        className="hidden group-open:block"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="mt-3 text-slate-700 leading-7">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
