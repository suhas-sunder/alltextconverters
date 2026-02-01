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
                  How the Remove Extra Spaces Tool Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page is built for one job: turn messy spacing into clean, consistent spacing without changing your wording.
                  Paste text or upload a file, choose whether to preserve line breaks, then click{" "}
                  <span className="font-semibold">Remove extra spaces</span>. The editor updates in place so the cleaned text is
                  immediately ready to copy or export.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  One-click cleanup
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Deterministic rules
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "PASTED NOTES", v: "Emails, chats, docs" },
                { k: "FORMS", v: "Names, addresses, fields" },
                { k: "DATA", v: "CSV rows, exports" },
                { k: "WEB", v: "Text before publishing" },
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
            <SectionCard title="What “remove extra spaces” means here" icon="list">
              <p>
                Extra spaces usually come from copy and paste. You copy text from a PDF, a spreadsheet, a web page, or a chat app,
                and suddenly you have double spaces, accidental tabs, or odd invisible characters that make alignment look wrong.
                This tool focuses on the simplest, most reliable fix: collapse repeated spaces so that runs like{" "}
                <span className="font-semibold text-slate-900">two or more spaces</span> become{" "}
                <span className="font-semibold text-slate-900">one space</span>.
              </p>

              <p className="mt-3">
                The cleanup is deterministic and intentionally not “smart”. It does not rewrite sentences, change punctuation,
                or try to interpret language. It only touches whitespace characters that commonly cause formatting problems.
                That makes it safe to use on headings, lists, multi-line notes, snippets of code-like text, and any content where
                you want the words to stay exactly the same.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Operations this page applies</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-semibold text-slate-900">Collapses repeated spaces</span> so sequences of spaces become a
                    single space.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Replaces tabs with spaces</span> so copied text behaves more
                    predictably across apps.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Removes common zero-width characters</span> that can sneak in
                    from rich text and cause confusing cursor jumps or broken searches.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Preserve line breaks toggle" icon="type">
              <p>
                The toggle changes one thing: whether line breaks are treated as structure or treated as whitespace. If{" "}
                <span className="font-semibold text-slate-900">Preserve line breaks</span> is on, the tool cleans each line
                independently. That is ideal for lists, addresses, multi-line form entries, or notes where the line layout matters.
                The result keeps your existing lines, but removes double spaces within each line.
              </p>

              <p className="mt-3">
                If you turn the toggle off, the tool collapses all whitespace, including new lines, into a single-flow paragraph.
                That is useful when you copied text that was wrapped oddly and you want it to read as one continuous sentence or
                one continuous block. This mode trims the final result to avoid leading or trailing spaces after collapse.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">When to keep line breaks</div>
                  <p className="mt-2">
                    Use this for bullet lists, line-based data, poetry, addresses, or anything you plan to paste into a field that
                    respects new lines. You get cleaner spacing without flattening the layout.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">When to collapse line breaks</div>
                  <p className="mt-2">
                    Use this when your source wrapped text at awkward widths, or when you want a single paragraph for publishing.
                    It is also handy before you run a separate tool like a slug generator or a word counter.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Upload, copy, and export workflow" icon="list">
              <p>
                The editor is the source of truth. After you paste or upload a file, you can clean spacing and keep editing in the
                same box. That mirrors real work: you rarely know the final version until you have fixed spacing, removed stray
                tabs, and checked the final look in your destination system.
              </p>

              <p className="mt-3">
                Uploads happen in your browser. Text files load directly. PDF and DOCX extraction can also work, but they rely on
                optional libraries in your app build. PDF extraction uses{" "}
                <span className="font-semibold text-slate-900">pdfjs-dist</span> and DOCX extraction uses{" "}
                <span className="font-semibold text-slate-900">mammoth</span>. After extraction, the tool runs the same spacing
                cleanup so you do not have to do a second click.
              </p>

              <p className="mt-3">
                When you click{" "}
                <span className="font-semibold text-slate-900">Copy</span>, the current editor value is copied to your clipboard.
                Download PDF uses{" "}
                <span className="font-semibold text-slate-900">jspdf</span> when available. If that library is not installed, the
                page falls back to the browser print dialog, where you can choose “Save as PDF”. Either way, what you export is
                exactly what you see in the editor.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Practical tip</div>
                <p className="mt-2 text-slate-700">
                  If you are cleaning text for a strict destination (a form field, a CMS, or a ticketing system), paste the cleaned
                  result into the destination and verify. Some apps apply their own normalization on paste, like collapsing spaces
                  again or trimming lines. This tool gives you a consistent baseline so those destination rules are easier to spot.
                </p>
              </div>
            </SectionCard>


            <SectionCard title="Common edge cases and what to expect" icon="type">
              <p>
                Space cleanup can be subtle in real content. For example, many people want to keep intentional double spacing after a
                period in legacy documents. This tool does not keep that pattern. It treats any run of two or more spaces as an
                accident and collapses it to one. That is usually the correct choice for modern writing, UI labels, and form fields,
                but it is worth knowing if you are cleaning older manuscripts.
              </p>

              <p className="mt-3">
                The converter also avoids language logic. It does not look for abbreviations, initials, or punctuation rules. If you
                have text like “U.S.  Government” with two spaces between tokens, you will get “U.S. Government”. If you have aligned
                columns that rely on multiple spaces, the alignment will be removed because the extra spaces are the thing being
                targeted. In those cases, consider preserving the spacing in the original system (like a table) rather than using a
                plain-text cleaner.
              </p>

              <p className="mt-3">
                Invisible characters are another common trap. Some sources insert zero-width spaces to help line wrapping in a
                browser. They are hard to see, but they can break searching and copying. This page removes the most common
                zero-width characters so the cleaned output behaves consistently across editors.
              </p>

              <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                <div className="text-sm font-bold text-slate-900">Best practice</div>
                <p className="mt-2">
                  If you are cleaning text that will be used for code, configuration, or fixed-width formatting, inspect the result
                  after cleanup. Plain-text spacing rules are different from code indentation rules. This tool is designed for
                  human-readable text, labels, and general content, not strict indentation-sensitive formats.
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
                  Cleaning happens in your browser. This page does not upload your text to a server. The only time data leaves your
                  device is when you choose to copy it to your clipboard or export it to a file.
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
