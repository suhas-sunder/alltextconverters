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
                  How the Remove Duplicate Lines Tool Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page removes repeated lines from your text using simple, deterministic rules.
                  Paste a list, upload a file, choose how matching should behave, then click once to
                  keep only the first occurrence of each line. No grammar logic, no rewriting, just
                  practical deduplication that is easy to predict and easy to verify.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  One-click dedupe
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Line-based rules
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Lists", v: "Remove repeats fast" },
                { k: "Logs", v: "Unique entries" },
                { k: "Imports", v: "Clean CSV columns" },
                { k: "Notes", v: "De-duplicate lines" },
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
            <SectionCard title="What counts as a line (and what does not)" icon="list">
              <p>
                The tool works on <span className="font-semibold text-slate-900">lines</span>.
                A line is whatever sits between line breaks in your text. When you paste content,
                the editor may contain Windows style line endings (CRLF) or Unix style line endings (LF).
                Either way, the tool splits the text into lines, checks which lines repeat, and keeps
                only the first time each unique line appears.
              </p>

              <p className="mt-3">
                Nothing else is interpreted. The tool does not try to understand sentences, words,
                or commas. If two lines look different, they are treated as different, even if they
                differ by a single character. That is intentional. Deduplication is most useful when
                it is predictable: you can glance at the result and know why a line stayed or disappeared.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Examples</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    If you have a list of emails, one per line, duplicates are removed by comparing each full email line.
                  </li>
                  <li>
                    If you have a pasted log, repeated log lines are removed exactly as they appear.
                  </li>
                  <li>
                    If your text has extra spaces at the end of some lines, those lines may not match other versions of the same text.
                    In that case, run a whitespace cleaner first, then remove duplicates.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Matching rules: case-sensitive vs case-insensitive" icon="type">
              <p>
                Real lists often mix capitalization. For example, one source might export “Canada” while another exports “CANADA”.
                The <span className="font-semibold text-slate-900">Case-insensitive</span> toggle controls how matching works.
                When it is enabled, the tool compares lines using a lowercase match key, so “Apple” and “apple” are considered the same.
                When it is disabled, the tool compares the raw lines exactly, so “Apple” and “apple” are treated as different lines.
              </p>

              <p className="mt-3">
                A key detail: even when case-insensitive matching is enabled, the tool keeps the original spelling of the first occurrence.
                That means if your first appearance is “API”, the kept line remains “API” even if later lines show “api”.
                This approach avoids surprising “normalization” changes. The tool’s job is to remove repeats, not to rewrite your data.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">When to enable it</div>
                  <p className="mt-2">
                    Use case-insensitive matching for emails, tags, simple identifiers, and lists where different capitalization is noise.
                    It is also useful when you are merging lists from multiple sources and you want one canonical entry per line.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">When to disable it</div>
                  <p className="mt-2">
                    Turn it off when capitalization is meaningful, like product codes, case-sensitive file paths, or any workflow where
                    “ABC” and “abc” are intentionally different values.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Output order: keep original order or sort the unique set" icon="list">
              <p>
                Deduplicating is only half the job. The other half is keeping the result in a form that is easy to use.
                The <span className="font-semibold text-slate-900">Preserve original order</span> option controls this.
                When it is on, the first time a line appears becomes the kept line, and the output remains in the same order
                you pasted. This is typically what you want for logs, checklists, and anything that reflects a sequence.
              </p>

              <p className="mt-3">
                When Preserve original order is off, the tool sorts the unique set by the same matching key used for deduplication.
                Sorting is useful when you want a clean “unique list” for review, when you are comparing two lists, or when you need
                stable output that is easy to diff. It is intentionally simple sorting, not a locale-aware “smart” collator and not a
                numeric sorter. The goal is consistency, not cleverness.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Original order",
                    "Keeps the first occurrence of each line and keeps the sequence. Best for chronological logs, checklists, and pasted notes.",
                  ],
                  [
                    "Sorted",
                    "Creates a unique set and sorts it for quick scanning. Best for tag lists, keyword lists, and inputs you want to alphabetize.",
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
            </SectionCard>

            <SectionCard title="Uploads, copying, and downloading" icon="type">
              <p>
                If your text already lives in a file, you can upload it and edit it in the same editor.
                Text-like files are loaded directly. PDF and DOCX uploads can also work, but they require
                optional libraries in the app build (<span className="font-semibold text-slate-900">pdfjs-dist</span> for PDF and
                <span className="font-semibold text-slate-900"> mammoth</span> for DOCX). When extraction is available, the text is
                pulled locally in your browser. Because PDFs are layout-focused, extracted text can include odd spacing or line breaks,
                so it is normal to do a quick scan before you deduplicate.
              </p>

              <p className="mt-3">
                After you remove duplicates, you can copy the result with one click or download it as a PDF.
                Downloading is useful when you are building a “clean list” for a report, sharing a unique list with a teammate,
                or archiving a snapshot of a dataset. If PDF export is not available in your build, the page falls back to the
                print dialog so you can still save to PDF using your browser.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Practical workflow tip</div>
                <p className="mt-2 text-slate-700">
                  If duplicates are not being removed the way you expect, look for invisible differences. A trailing space, a tab,
                  or a different punctuation mark makes two lines “different”. Clean whitespace first, then deduplicate.
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
                  Deduplication runs on the text in the editor inside your browser. This tool is designed
                  for fast cleanup, not server-side processing. You decide when to upload a file, when to
                  run the removal step, and when to copy or download the result.
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
