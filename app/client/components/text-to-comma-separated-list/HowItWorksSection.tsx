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
                  How the Text to Comma Separated List Tool Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Turn a pasted list into comma-separated text for a form,
                  message, or script. Lines mode removes common bullets and
                  numbering, and keeps multiword items together.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Local conversion
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Deterministic output
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Trim items", v: "Remove edge spaces" },
                { k: "Ignore blanks", v: "Drop empty values" },
                { k: "Stable join", v: "Comma or comma+space" },
                { k: "Optional parsing", v: "Split on commas" },
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
            <SectionCard title="What gets converted and what stays the same" icon="list">
              <p>
                A comma-separated list is basically a sequence of items joined
                by commas: <span className="font-semibold text-slate-900">a, b, c</span>.
                The tricky part is that real input rarely arrives in that form.
                People paste from emails, spreadsheets, web pages, PDFs, or logs,
                and the separators vary. You might have one item per line, extra
                spaces, blank lines, or mixed separators like commas plus line
                breaks.
              </p>

              <p className="mt-3">
                This tool takes a practical stance: it treats your text as a
                list of items and applies predictable cleanup rules. By default,
                it splits items on line breaks, trims leading and trailing
                whitespace from each item, then drops values that become empty.
                Choose <strong>Commas</strong> to split at each comma or
                <strong> Auto</strong> to split at commas, semicolons, and
                whitespace. Use Lines when a phrase should stay together.
              </p>

              <p className="mt-3">
                With the default settings, a line starting with
                <code> 1. Green tea</code> followed by <code>2. Black coffee</code>
                on the next line becomes <code>Green tea, Black coffee</code>.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Why the output is deterministic
                </div>
                <p className="mt-2">
                  The same input and the same settings always produce the same
                  output. That matters when you are preparing data for scripts
                  or repeatable workflows. You can paste, convert, copy, and
                  trust that the only changes were the ones you selected.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Separator choices and common workflows" icon="type">
              <p>
                The joiner is simple but important. Many destinations expect a
                specific format. A web form might accept <span className="font-semibold text-slate-900">a,b,c</span>
                with no spaces. A human-facing field, like an email template,
                usually reads better as <span className="font-semibold text-slate-900">a, b, c</span>
                with a space after the comma. This tool supports both via the
                Space after comma toggle.
              </p>

              <p className="mt-3">
                The tool is especially useful for three common patterns:
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Tags and keywords",
                    "Turn one tag per line into a single comma-separated field for CMS inputs, product listings, or SEO tools.",
                  ],
                  [
                    "Spreadsheet cleanup",
                    "Copy a column, paste it here, and export a clean comma-separated list without blank rows or odd spacing.",
                  ],
                  [
                    "Config and scripts",
                    "Prepare lists for environment variables or simple config values where whitespace differences can cause bugs.",
                  ],
                  [
                    "Data exports",
                    "Normalize values from scraped pages, logs, or emails before you store them or pass them into another converter.",
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

              <p className="mt-4">
                If you are building a list for a strict machine parser, test the
                target system’s exact expectations. Some systems treat spaces as
                part of the value, while others trim automatically. When in
                doubt, disable the space-after-comma option and only add spaces
                later for display.
              </p>
            </SectionCard>

            <SectionCard title="Why trimming and blank removal matter" icon="list">
              <p>
                Most list bugs are not “wrong values”. They are invisible
                whitespace problems. An item like <span className="font-semibold text-slate-900">"apple "</span>
                looks the same as <span className="font-semibold text-slate-900">"apple"</span>
                on screen, but it behaves differently in filtering, matching,
                and deduping. Trimming leading and trailing whitespace gives you
                a cleaner baseline and reduces surprises downstream.
              </p>

              <p className="mt-3">
                Blank removal is equally important. Extra commas and blank lines
                show up when you paste from spreadsheets or when a list ends
                with a trailing separator. Many systems interpret an empty value
                as a real item, which can cause validation errors or create
                empty tags. This tool ignores empty values after trimming so
                the output stays meaningful.
              </p>

              <p className="mt-3">
                Quote items wraps each value in double quotes and doubles any
                embedded double quote. For a one-column spreadsheet file, use
                <strong> List to CSV</strong>.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    When to split on commas
                  </div>
                  <p className="mt-2">
                    Choose Commas for a flat list with uneven spaces or
                    trailing commas. Choose Lines for one item per line when
                    a comma belongs inside a value such as “Ottawa, ON”.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    One tool, many destinations
                  </div>
                  <p className="mt-2">
                    The output is plain text, so you can paste into a form,
                    spreadsheet cell, code editor, or another converter tool.
                    This is intentional. The goal is to generate a clean list,
                    not to lock you into a specific app.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Quick tip
                </div>
                <p className="mt-2 text-slate-700">
                  If you are preparing a comma-separated list for a script,
                  consider also producing a newline list as a sanity check. If
                  the values look right one per line, the comma-joined version
                  will usually be correct too.
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
                  Privacy
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your text stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Conversions are computed in your browser from the current
                  editor value. This page does not send your text to a server.
                  Upload is optional and is used only to read files locally so
                  you can convert their contents.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
              <div className="text-sm font-bold text-slate-900">
                Optional file features
              </div>
              <p className="mt-2 text-slate-700">
                Load a text file or extract text from a PDF or DOCX. Review
                the extracted line breaks before converting.
              </p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M9 6v12m6-12v12" />
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h12M4 17h14" />
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
