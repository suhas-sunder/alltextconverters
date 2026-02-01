import type React from "react";

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
                  How the List to Comma Separated Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste a vertical list, clean it up, and export a comma separated version you can paste into forms, spreadsheets, queries, and tools that expect a single line. This converter is deterministic and fast: it trims each line, ignores blank entries, then joins the remaining values with a comma. You can choose whether a space appears after each comma.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Trims and deblanks
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Local processing
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Comma separated", v: "Forms, tags, filters" },
                { k: "Comma + space", v: "Readable output" },
                { k: "Ignore blanks", v: "No empty values" },
                { k: "CSV export", v: "Single column list" },
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
            <SectionCard title="What gets changed and what stays the same" icon="list">
              <p>
                A lot of list cleanup is not about rewriting text. It is about turning the same values into a shape that a destination system accepts. Many UIs accept one line that looks like <span className="font-semibold text-slate-900">a, b, c</span>, while your source data is often pasted as one item per line. This tool bridges that gap by applying a small set of predictable steps.
              </p>

              <p className="mt-3">
                First, the input is split into lines using common line endings. Each line is trimmed, so leading and trailing whitespace is removed. Then empty lines are ignored. Finally, the remaining values are joined with a delimiter. The delimiter is either a comma followed by a single space, or a comma with no space, depending on your toggle.
              </p>

              <p className="mt-3">
                Importantly, this tool does not attempt to interpret meaning. It does not remove punctuation inside a value, it does not guess quoted CSV rules, and it does not try to correct spelling. If a line contains commas already, the tool treats that line as a single value because your intent is ambiguous. In those cases, consider cleaning the values first, or exporting as CSV and letting spreadsheet software handle structured fields.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Trim whitespace",
                    "Each line is trimmed before joining, which avoids accidental spaces at the start or end of a value.",
                  ],
                  [
                    "Ignore empty values",
                    "Blank lines and lines that become empty after trimming are skipped, so you do not get ",
                  ],
                  [
                    "Deterministic delimiter",
                    "Choose comma only or comma plus space. The same input always produces the same output.",
                  ],
                  [
                    "Local conversion",
                    "Everything runs in your browser. Upload is optional and does not send text to a server.",
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

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  When to use comma only vs comma + space
                </div>
                <p className="mt-2">
                  Comma plus space is more readable and is the common default for manual input fields. Comma only can be useful when you are building compact machine input, for example a query parameter list, a config value, or a system that treats spaces as significant. If you are not sure, start with comma plus space.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="CSV export and why it is useful" icon="type">
              <p>
                Some workflows do not want a comma separated string at all. They want a real CSV file that can be imported into a spreadsheet, uploaded into a database tool, or attached to a ticket. The CSV export here is intentionally simple: it produces a single column with a header called <span className="font-semibold text-slate-900">value</span>, and one row per trimmed line.
              </p>

              <p className="mt-3">
                This matters for logs, scraping outputs, and exports where values may contain commas. If you join those values into one string, commas become ambiguous separators. In CSV, values that contain commas are automatically quoted, and quotes inside values are escaped. That makes the file safer to move between tools without breaking rows.
              </p>

              <p className="mt-3">
                A practical pattern is to use the converter for quick paste into a form, then use CSV export when you want a file artifact. For example, you can paste a list of SKUs or email addresses into a vendor portal, and you can export the same list as CSV for a spreadsheet audit. The output is not meant to replace a full CSV builder, it is meant to cover the common case with minimal friction.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Safe quoting</div>
                  <p className="mt-2">
                    Values that contain commas, quotes, or line breaks are quoted following common CSV rules. This reduces import failures in spreadsheet tools.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">One column by design</div>
                  <p className="mt-2">
                    The goal is portability. A single column CSV is easy to append, filter, sort, and deduplicate later in a spreadsheet or script.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Best effort disclaimer</div>
                <p className="mt-2 text-slate-700">
                  CSV export is best effort. It is designed for common text lists. If your input contains multi-line cells, embedded tabs, or complex quoting already, you should validate the exported file in your destination tool before relying on it for production imports.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Common use cases and edge cases" icon="list">
              <p>
                This converter is intentionally narrow, which is why it is fast. It focuses on turning one item per line into a single comma separated string. Typical uses include converting tags, creating filter lists for analytics tools, generating quick IN lists for query editors, and cleaning pasted values from emails or PDFs.
              </p>

              <p className="mt-3">
                If you paste content from a PDF, you may see unexpected line breaks or multiple spaces. In that situation, it can help to first run a whitespace cleaner or line break remover, then convert the cleaned list into comma separated form. Tools work best when you apply them in the order that matches how the noise was introduced.
              </p>

              <p className="mt-3">
                Be aware that trimming can change the meaning of some values. For example, indentation in code blocks or leading spaces that are intentionally part of a value will be removed. If your data contains meaningful leading spaces, you should avoid using a list-to-comma conversion and instead use a format that preserves exact characters.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Quick checklist</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Confirm that each line is one intended value.</li>
                  <li>Turn on the space toggle if readability matters.</li>
                  <li>Use CSV export if values can contain commas.</li>
                  <li>Paste into the destination and verify the destination does not auto-format your input.</li>
                </ul>
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
                  Runs locally in your browser
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  The conversion happens on your device. Uploading a file is just a convenience to populate the textarea. You stay in control of when you copy or download the output. If you are handling sensitive data, you can also paste directly and clear the page when you are done. If you are handling sensitive data, you can also paste directly and clear the page when you are done. If you are handling sensitive data, you can also paste directly and clear the page when you are done. If you are handling sensitive data, you can also paste directly and clear the page when you are done.
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
