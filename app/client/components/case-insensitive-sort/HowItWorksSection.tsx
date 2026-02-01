
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
                  How the Case-Insensitive Sort Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste or upload text, then sort it by line while ignoring
                  letter case. Choose A–Z or Z–A, optionally keep only unique
                  lines, and copy or download the result. This page focuses on
                  predictable line sorting, not grammar or language rules.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Local sorting
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Line-based output
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "A–Z", v: "Ascending order" },
                { k: "Z–A", v: "Descending order" },
                { k: "Ignore case", v: "Apple = apple" },
                { k: "Unique", v: "Optional dedupe" },
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
            <SectionCard title="What “case-insensitive” means for sorting" icon="list">
              <p>
                When you sort a list of lines, you typically want “Apple” and
                “apple” to appear next to each other. A case-insensitive sort
                compares lines using a lowercased version of each line as the
                primary key. That key is used only for ordering. Your original
                characters are preserved in the output, so the tool does not
                rewrite the text into lowercase or uppercase.
              </p>

              <p className="mt-3">
                This matters when you are working with names, tags, filenames,
                and pasted lists from different sources. One app might export
                “Banana” while another exports “banana”. If you do a normal
                case-sensitive sort, capitalized entries often bunch together,
                which can look wrong and makes it harder to scan. Case-insensitive
                sorting reduces that friction by treating capitalization as a
                display detail rather than a sorting signal.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Deterministic tie-breaking
                </div>
                <p className="mt-2">
                  If two lines become identical after lowercasing (for example,
                  “USA” and “usa”), the sort still needs a stable way to decide
                  which one comes first. This tool uses a deterministic tie-break:
                  it compares the original strings and then falls back to the
                  original input order. That keeps results predictable across
                  repeated runs.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="How lines are detected and preserved" icon="type">
              <p>
                The converter works on lines. A line is any text between line
                breaks. The tool accepts both Windows (CRLF) and Unix (LF) line
                endings, and it outputs lines separated by LF. Within each line,
                characters are left as-is. That means punctuation, spacing, tabs,
                and symbols inside a line are preserved, unless you already removed
                or changed them before sorting.
              </p>

              <p className="mt-3">
                Sorting is most useful when each line represents a single item:
                a keyword, a label, a SKU, a filename, or a row copied from a
                spreadsheet column. If your text is a paragraph, a line-based sort
                will scramble the meaning. In that case, use a different tool such
                as a text cleaner, or split your content into list items first.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Empty lines",
                    "Empty lines are treated as real lines. Sorting can move them to the top or bottom depending on direction. If you do not want them, remove them before sorting.",
                  ],
                  [
                    "Leading spaces",
                    "Leading spaces affect the line’s sort key because they are part of the line. If you want a whitespace-normalized sort, run a cleaner first.",
                  ],
                  [
                    "Numbers and mixed text",
                    "The tool compares characters, not numeric values. “10” will typically sort before “2” because it starts with 1. For numeric sorting, use a spreadsheet or dedicated numeric sorter.",
                  ],
                  [
                    "Unicode characters",
                    "Sorting uses your browser’s locale comparison rules. Accents and non-Latin scripts can sort differently depending on environment settings.",
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

            <SectionCard title="Direction and Unique options" icon="list">
              <p>
                The A–Z option sorts in ascending order. The Z–A option sorts in
                descending order. Both modes use the same case-insensitive
                comparison, so the only difference is whether the final list is
                flipped.
              </p>

              <p className="mt-3">
                The Unique option removes repeated lines after sorting. Since the
                core sort is case-insensitive, uniqueness is also case-insensitive.
                That means “Tag” and “tag” are treated as duplicates. When Unique
                is enabled, the output keeps the first occurrence in the sorted
                sequence and drops the rest. This is helpful when you want a clean,
                de-duplicated list for tags, blocked terms, or quick imports.
              
              <p className="mt-3">
                For imported lists, it can help to keep a header line separate.
                If your first line is a label like “Items” or “Keywords”, move it
                out of the list, sort the remaining lines, then paste the header
                back on top. The sorter treats every line the same and does not
                try to detect headers or column names. That simplicity is the point:
                you get an exact, transparent transformation that you can repeat.
              </p>
</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    When to keep duplicates
                  </div>
                  <p className="mt-2">
                    Keep Unique off if duplicates are meaningful. For example,
                    you might be sorting log lines, survey answers, or a list where
                    repetition indicates frequency. In those cases, sorting helps
                    grouping, and you can still see how many times an item appears.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    When to enable Unique
                  </div>
                  <p className="mt-2">
                    Enable Unique when you need a set. Examples include removing
                    repeated keywords, normalizing a list of categories, or preparing
                    a deduplicated allowlist or blocklist for another system.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Quick tip</div>
                <p className="mt-2 text-slate-700">
                  If your destination system is case-sensitive, keep Unique off and
                  handle deduplication there. This tool is optimized for readability
                  and scanning, not for enforcing application-specific casing rules.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Uploads, downloads, and privacy" icon="type">
              <p>
                You can paste text directly into the editor, or you can upload a
                supported file format. Text formats such as TXT, CSV, JSON, HTML,
                and XML load directly in your browser. PDF and DOCX extraction is
                also done locally, but those formats require optional libraries in
                the app bundle. If those libraries are not installed, the tool will
                show a clear message and you can still paste the text manually.
              </p>

              <p className="mt-3">
                Download PDF creates a simple paginated document from your current
                text. It preserves line breaks and wraps long lines so the PDF is
                readable. If PDF export is not available in your build, your browser
                print dialog opens as a fallback so you can still save as PDF.
              </p>

              <p className="mt-3">
                Privacy is straightforward: sorting happens in the browser from the
                text currently in the textarea. There is no server-side processing
                step required for the sort itself. That makes this tool suitable for
                quick cleanup of small lists and day-to-day formatting tasks.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  What this tool does not do
                </div>
                <p className="mt-2">
                  This is not a spreadsheet engine. It does not parse columns,
                  detect numeric types, or apply advanced language collation rules.
                  It sorts lines using a simple, deterministic comparison so you can
                  copy a clean list into your next step.
                </p>
              </div>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">
                  Local processing
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your list stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Sorting and deduplication run in your browser from the text you
                  provided. Copy is explicit: you choose when to copy or download
                  the output and paste it elsewhere.
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
