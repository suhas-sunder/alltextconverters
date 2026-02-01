import React from "react";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  How the Sentence Case Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste text or upload a file, then apply a simple sentence-case
                  pass. This tool lowercases the text and capitalizes the first
                  letter at the start and after common sentence endings:{" "}
                  <span className="font-semibold text-slate-800">.</span>{" "}
                  <span className="font-semibold text-slate-800">!</span>{" "}
                  <span className="font-semibold text-slate-800">?</span> It is
                  intentionally deterministic and does not attempt grammar or
                  language correction.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Deterministic rules
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  No grammar logic
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Paragraph cleanup", v: "Make blocks readable fast" },
                { k: "Captions", v: "Normalize pasted descriptions" },
                { k: "Form text", v: "Consistent sentences and notes" },
                { k: "Imports", v: "Tidy mixed-case data" },
              ].map((t) => (
                <div
                  key={t.k}
                  className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t.k}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {t.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 space-y-6 text-base text-slate-700 leading-7">
            <SectionCard title="The conversion rules" icon="list">
              <p>
                Sentence case usually means a simple promise: sentences start
                with a capital letter, and the rest reads like normal body text.
                To stay predictable, this page follows a small set of steps that
                do not depend on language models, dictionaries, or style guides.
                It is meant for quick formatting, not editorial correctness.
              </p>

              <p className="mt-3">
                First, the converter lowercases the entire input. That removes
                distracting ALL CAPS and random mid-word capitalization that
                often comes from copying text out of PDFs, spreadsheets, chat
                logs, or older systems that store text in uppercase. Lowercasing
                is the baseline that makes the next step consistent.
              </p>

                            <p className="mt-3">
                The converter also preserves line breaks. That means multi-line
                content like checklists, bullet-style notes, or copied form
                fields keeps its shape. It does not merge lines, remove blank
                lines, or re-wrap your text in the editor. If your workflow
                requires additional cleanup such as trimming extra spaces,
                removing duplicate blank lines, or converting tabs to spaces,
                do that in a dedicated cleanup step after sentence casing.
              </p>

              <p className="mt-3">
                Next, the converter capitalizes exactly one letter at the start
                of the text and after each sentence-ending punctuation mark:
                period, exclamation point, or question mark. Importantly, the
                tool does not try to detect abbreviations, initials, or special
                cases. If your input includes “e.g.” or “U.S.”, those periods
                still count as periods in this simple rule system. That is
                intentional, because any attempt to guess abbreviation intent
                becomes language-specific and unpredictable.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "What changes",
                    "Letters are lowercased, then the first letter of each sentence is uppercased based on . ! ? boundaries.",
                  ],
                  [
                    "What stays the same",
                    "Whitespace, line breaks, punctuation, numbers, and symbols are preserved so formatting remains recognizable.",
                  ],
                  [
                    "What it does not do",
                    "No spelling fixes, no punctuation repair, no rewriting, and no sentence segmentation beyond the three punctuation marks.",
                  ],
                  [
                    "When to double-check",
                    "If your text contains abbreviations or filenames with dots, you may want a quick manual pass after converting.",
                  ],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    className="group rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500/90 group-hover:bg-sky-500" />
                      <div>
                        <div className="font-bold text-slate-900">{k}</div>
                        <div className="text-slate-700">{v}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

                            <p className="mt-3">
                Because the rule is simple, it behaves the same for English,
                Spanish, code comments, or mixed-language text. It does not try
                to detect where a “real” sentence begins based on quotes,
                parentheses, or abbreviations. Instead, it waits until it sees
                a letter after a sentence-ending mark and then capitalizes that
                one letter. If there is whitespace or a quote character in
                between, it leaves those characters untouched.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Example behavior
                </div>
                <p className="mt-2">
                  Input: “THIS IS A TEST. why is THIS Weird? ok!DONE” becomes
                  “This is a test. Why is this weird? Ok!Done”. Notice how the
                  tool keeps punctuation and spacing, and how “Ok!Done” stays
                  compact if there is no space after the exclamation mark. If
                  you need consistent spacing, add spaces where you want them.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Files, downloads, and practical workflows" icon="type">
              <p>
                The editor is the source of truth. When you click convert, the
                textarea is replaced with the sentence-case result. That keeps
                the flow simple: what you see is exactly what you copy and what
                you export.
              </p>

              <p className="mt-3">
                Upload is optional. Text-like files such as TXT, CSV, JSON, HTML,
                and Markdown can be read directly in your browser and converted
                immediately. For PDF and DOCX, the page can attempt local text
                extraction if your site build includes optional libraries.
                Extraction is never perfect because those formats store layout
                as positioned fragments, but it is often good enough for
                getting your text into a clean state before you paste it into
                another tool.
              </p>

              <p className="mt-3">
                Download is for handoff. Use Download PDF when you want a
                printable or shareable copy of the converted text. The PDF
                exporter keeps line breaks and wraps long lines for readability.
                If PDF export is not available in your build, the page falls
                back to the browser print dialog so you can save as PDF from the
                system print UI.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Common uses
                  </div>
                  <p className="mt-2">
                    Normalize pasted notes, convert product descriptions from
                    all caps, clean up help-center snippets, or format multi-line
                    instructions into readable sentences before publishing.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Edge cases to expect
                  </div>
                  <p className="mt-2">
                    Abbreviations with dots (like “Dr.”) and version numbers
                    (like “v2.1”) may trigger capitalization in places you do not
                    want. That is the tradeoff for predictable, language-agnostic
                    rules.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Quick tip</div>
                <p className="mt-2 text-slate-700">
                  If your destination app auto-capitalizes (especially on
                  mobile), paste the final output into the destination field and
                  confirm the destination did not apply its own rules on paste.
                  This tool gives you a consistent baseline, but the destination
                  still has the final say.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Why this converter avoids “smart” fixes" icon="list">
              <p>
                Many sentence-case tools try to be clever: detecting proper
                nouns, preserving acronyms, or applying language rules about
                spacing and quotes. That can be helpful in some contexts, but it
                also makes results inconsistent. A “smart” converter can change
                outputs depending on the text, the language, or a hidden
                heuristic.
              </p>

              <p className="mt-3">
                This page deliberately stays on the other side of that line. It
                performs a deterministic transform that you can predict: it
                lowercases, then capitalizes at sentence boundaries defined by
                three characters. If you need publication-grade copy editing,
                you should still run a manual read-through. The goal here is to
                remove the most obvious casing problems fast, not to replace
                editing.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Good rule of thumb
                </div>
                <p className="mt-2">
                  Use this tool when you want consistent formatting quickly.
                  Avoid it when exact brand casing, acronyms, or style-guide
                  rules must be enforced automatically.
                </p>
              </div>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">Privacy</div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your text stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Conversions are computed from the editor value in your browser.
                  This page does not upload your text or store it on the server.
                  Uploading reads files locally and extracts text on-device when
                  supported. Copy and download actions are explicit: you choose
                  when to export the result.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: "list" | "type";
  children: React.ReactNode;
}) {
  const Icon = () => {
    const common = "h-5 w-5 text-sky-600";
    switch (icon) {
      case "type":
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={common}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M9 6v12m6-12v12"
            />
          </svg>
        );
      case "list":
      default:
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={common}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 7h16M4 12h12M4 17h14"
            />
          </svg>
        );
    }
  };

  return (
    <div className="group relative rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
      />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/60">
            <Icon />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
