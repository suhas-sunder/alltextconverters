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
                  How the Line Break Remover Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste or upload text, choose whether line breaks should turn
                  into a single space or be removed entirely, then copy or
                  download the result. This tool focuses on a simple job:
                  flattening multi-line content into one continuous line without
                  trying to rewrite or “fix” your wording.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Two output modes
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Deterministic rules
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Replace with space", v: "Keep words separated" },
                { k: "Remove entirely", v: "Join lines tightly" },
                { k: "Uploads", v: "TXT, PDF, DOCX" },
                { k: "Export", v: "Copy or PDF download" },
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
            <SectionCard title="What counts as a line break" icon="list">
              <p>
                “Line break” sounds straightforward, but text files can represent
                it in a few different ways. Some systems use a single line-feed
                character (LF, written as <span className="font-mono">\n</span>
                ), others use a carriage return (CR,{" "}
                <span className="font-mono">\r</span>), and many use a two-byte
                sequence (CRLF, <span className="font-mono">\r\n</span>). If you
                copy text out of a PDF, a word processor, or a terminal log, you
                can end up with mixed line ending styles in the same block.
              </p>

              <p className="mt-3">
                This page treats all of those patterns as line breaks and removes
                them using simple, predictable matching. It does not attempt to
                infer paragraphs, headings, or formatting intent. Instead, it
                applies one clear rule: whenever one or more line break
                characters appear in a row, the tool replaces that entire run
                with either a single space or nothing, depending on the option
                you select.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Why runs are handled as a group
                </div>
                <p className="mt-2">
                  Collapsing a run of breaks as one unit prevents the “multiple
                  empty lines” case from producing multiple spaces in the output.
                  If you paste text that has blank lines between paragraphs, a
                  replace-with-space operation should not create large gaps. This
                  tool keeps the output compact and predictable.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Choose the right output mode" icon="type">
              <p>
                The two modes are intentionally minimal because different tasks
                want different separators. Neither mode is “more correct.” The
                right choice depends on what you plan to paste the result into.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Replace with space
                </span>{" "}
                is the safer default when you are flattening normal writing. It
                keeps words separated, which helps when the original line breaks
                were just visual wrapping. This is common when you copy from a
                narrow column (like a PDF page) or a chat transcript where each
                message line ends with a break.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Remove entirely
                </span>{" "}
                joins lines without adding anything. This is useful when line
                breaks are already accompanied by spaces you do not want, or when
                you are cleaning identifiers. Examples include license keys that
                were wrapped for readability, a base64 blob that should be one
                uninterrupted string, or a piece of code where you want to
                temporarily remove newlines for a single-field paste.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Form fields and CRMs",
                    "Many single-line fields reject newlines. Replace-with-space preserves readability when you paste notes into a single input.",
                  ],
                  [
                    "CSV and spreadsheet cells",
                    "Spreadsheets often treat newlines inside cells differently across apps. Flattening avoids odd row wrapping or broken imports.",
                  ],
                  [
                    "Logs and stack traces",
                    "If you need a stack trace in a one-line alert, remove line breaks and then reformat later inside the destination tool.",
                  ],
                  [
                    "Wrapped tokens",
                    "If a long token was visually wrapped, remove entirely to restore the original uninterrupted string.",
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

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Practical tip
                </div>
                <p className="mt-2 text-slate-700">
                  If you are not sure which mode you need, start with “Replace
                  with space.” If the output contains unwanted spaces, undo and
                  try “Remove entirely.” The goal is a clean paste into the next
                  system, not a perfect reconstruction of document formatting.
                </p>
              </div>
            </SectionCard>


            <SectionCard title="Common edge cases to expect" icon="type">
              <p>
                Real-world text often carries structure that was represented by
                newlines. When you flatten it, that structure may become less
                obvious, which is exactly why this tool is useful for
                single-line fields. Still, it helps to know what can happen so
                you do not mistake a predictable result for a bug.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Hyphenated line endings
                </span>{" "}
                are a classic example. Some PDFs insert a hyphen at the end of a
                line when a word wraps, so you might see “conver-\nsion”.
                Removing the line break will produce “conver-sion”. That hyphen
                was not created by this page, it was already in the text. If you
                need to repair those cases, it requires additional heuristics
                that can sometimes remove legitimate hyphens. This tool stays
                conservative and does not guess.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Bullets and numbered lists
                </span>{" "}
                may become a single run of items. If you replace breaks with a
                space, each bullet line becomes one sentence-like chunk on the
                same line. If you remove breaks entirely, you may want to add a
                delimiter afterward (such as a semicolon) before you paste into
                the destination. Flatten first, then decide the separator that
                fits your workflow.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Code blocks and logs
                </span>{" "}
                can lose readability when flattened, but that is sometimes the
                point. Many ticketing tools, search fields, and alert systems
                cannot accept multi-line input. Use “Replace with space” when
                you want to keep tokens visible, and “Remove entirely” when you
                are restoring a wrapped token or a copied value.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Verify in the destination
                  </div>
                  <p className="mt-2">
                    Some destinations collapse spaces automatically or add their
                    own line wrapping on paste. After cleaning, paste once and
                    confirm the destination did not introduce new formatting.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Keep a copy of the original
                  </div>
                  <p className="mt-2">
                    If the original structure matters, duplicate the text before
                    flattening. This tool is designed for quick transformations,
                    so keeping an original version can save time when you need
                    to refer back to line-by-line context.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Uploads, copy, and PDF export" icon="list">
              <p>
                You can work directly in the textarea, or you can load content
                from a file. Text-like files (such as TXT, CSV, JSON, HTML, or
                Markdown) are read locally in your browser. For PDFs and DOCX
                documents, the page can also extract text locally if optional
                libraries are installed in the app build. Extraction focuses on
                raw text, so you should expect some layout artifacts like missing
                line wrapping or extra spaces when the original document used
                columns, tables, or complex formatting.
              </p>

              <p className="mt-3">
                After you remove line breaks, you have two ways to take the
                result with you. Copy places the current textarea value on your
                clipboard. Download PDF creates a simple text PDF that preserves
                the visible content, including any remaining line breaks (if you
                chose to keep some outside this tool). If PDF generation is not
                available in the build, the page falls back to the browser’s
                print dialog so you can “Save as PDF.”
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  What this tool does not do
                </div>
                <p className="mt-2">
                  This is not a rewrite tool and it is not a formatter. It will
                  not correct punctuation, fix capitalization, merge hyphenated
                  line-break words, or convert bullet lists into paragraphs. It
                  only removes line break characters using deterministic rules.
                  If you need additional cleaning, use a dedicated tool after you
                  have flattened the text.
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
                  Cleaning happens in your browser. This page does not send your
                  text to a server for processing. Uploads are read locally, and
                  conversion is computed from the editor value on the device you
                  are using. You control when to copy or download the output.
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
