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
                  How the Comma Separated to List Tool Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page turns a simple comma-separated string into a clean list you can paste into
                  spreadsheets, forms, bullet lists, and import tools. The rules are intentionally
                  deterministic: it splits on commas, trims whitespace around each value, and ignores empty
                  entries. Nothing else is rewritten.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Trim + filter
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  One textarea workflow
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "PASTE", v: "Drop in CSV-style values" },
                { k: "CLEAN", v: "Trim and remove empties" },
                { k: "LIST", v: "Newline-separated output" },
                { k: "COPY", v: "Paste anywhere quickly" },
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
            <SectionCard title="What gets changed (and what does not)" icon="list">
              <p>
                People search for “comma separated to list” when they have values that are almost usable,
                but not quite. You might have copied tags from a dashboard, product options from an email,
                names from a CRM export, or categories from a CMS field that expects one item per line.
                The core job is not complicated: turn <span className="font-semibold text-slate-900">a, b, c</span>{" "}
                into three separate lines.
              </p>

              <p className="mt-3">
                The conversion rules here are deliberately small and predictable. The tool splits the editor
                content on commas. Each token is trimmed, meaning leading and trailing spaces are removed.
                After trimming, empty tokens are discarded. That last part matters because real-world input
                often contains stray separators, like trailing commas, double commas, or “a, b, , c”.
              </p>

              <p className="mt-3">
                Everything else stays stable. The tool does not change letter case, punctuation inside items,
                or the order of your values. If you paste “NY, CA, TX”, you get three lines in that same order.
                If you paste “hello-world, v2.1, 100%”, those characters stay as-is inside each item. The goal is
                to be a formatting step, not a rewrite step.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Example</div>
                <p className="mt-2 text-slate-700">
                  Input: <span className="font-mono">apple, banana,  cherry,</span>
                </p>
                <p className="mt-2 text-slate-700">
                  Output:
                  <span className="ml-2 font-mono whitespace-pre-wrap">apple{"\n"}banana{"\n"}cherry</span>
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Why newline lists are useful" icon="type">
              <p>
                Newline-separated lists show up everywhere because they are easy to validate and easy to edit.
                Many apps accept one item per line for tags, allowed emails, blocklists, routes, SKUs, or feature
                flags. A newline list also makes duplicates and missing values obvious at a glance, which is harder
                when everything is compressed into one long comma chain.
              </p>

              <p className="mt-3">
                Another reason people prefer newline output is that it plays well with spreadsheets and table
                editors. If you copy a newline list and paste into a single-column selection, each line becomes
                its own row. That is often the fastest way to move data from a message or PDF into a structured tool.
                If your destination expects a different delimiter, you can still use this page as a cleanup step
                before converting again.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Tags and categories",
                    "Turn a comma field into one tag per line for CMS imports, SEO tooling, or product catalogs.",
                  ],
                  [
                    "Access lists",
                    "Prepare allowlists and blocklists where each entry must be on its own line for auditing.",
                  ],
                  [
                    "Form options",
                    "Convert a quick brainstorm like “red, green, blue” into options you can paste into a UI builder.",
                  ],
                  [
                    "Quick dedupe check",
                    "Once values are on separate lines, it is easier to spot repeated items or blank entries.",
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

            <SectionCard title="Edge cases the tool handles intentionally" icon="list">
              <p>
                The most common “gotchas” with comma-separated data are not complicated, but they are annoying.
                Trailing commas create empty entries. Multiple commas in a row create empty entries. Mixed spaces
                create uneven looking lists. This tool handles those issues in a consistent way so you do not need
                to clean by hand.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Whitespace trimming</span>{" "}
                removes spaces and tabs around each token after splitting. That means “a,   b” becomes “a” and “b”.
                It does not remove spaces inside a value. If you have “New York, Los Angeles”, you keep the space
                inside “New York” and “Los Angeles” because those are part of the value.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Ignoring empty values</span>{" "}
                happens after trimming. So “a, , b,,” becomes two lines: “a” and “b”. This is useful when you are
                copying from sources that include empty placeholders or when you accidentally double-tap the comma key.
                If your destination tool treats empty lines as errors, filtering them out prevents frustrating validation issues.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Preserving order</span>{" "}
                is a deliberate choice. The output list mirrors the order of your input tokens. For many workflows,
                order is meaning. A menu, a priority list, or a set of steps often needs to stay in sequence. If you
                want sorting or uniqueness rules, use a dedicated sorting or dedupe page after you have a clean list.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Runs locally</div>
                <p className="mt-2 text-slate-700">
                  The conversion is computed from the text in the editor on your device. When you upload a file,
                  the browser reads it locally and places the extracted text in the editor. Nothing needs to be sent
                  to a server for the split-and-trim step to work.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Uploading files and exporting results" icon="type">
              <p>
                This tool supports quick copy and download flows. Copy is instant: it places the current editor value
                on your clipboard. Download PDF is available when the optional PDF library is installed; otherwise,
                the page falls back to the browser print dialog so you can still save as a PDF. Both options exist because
                “shareable output” is part of the typical workflow: you paste into a ticket, an email, or an import tool.
              </p>

              <p className="mt-3">
                For uploads, plain text formats (like TXT, CSV, JSON, HTML, or XML) can be read directly by the browser.
                PDF and DOCX extraction can work too, but those formats require additional libraries in the app build.
                If you plan to enable PDF upload extraction, you will need <span className="font-semibold text-slate-900">pdfjs-dist</span>.
                For DOCX extraction, you will need <span className="font-semibold text-slate-900">mammoth</span>. If those libraries
                are not present, the page will show a polite error rather than crashing.
              </p>

              <p className="mt-3">
                Keep expectations realistic for PDF and DOCX. Extraction pulls readable text, not visual layout. Tables may become
                space-separated text and line breaks may shift. The best practice is to upload, scan the extracted text quickly,
                and then run the comma-to-list conversion once your values are visible in a predictable form.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Tip</div>
                <p className="mt-2">
                  If your input uses semicolons or newlines instead of commas, convert that format first. This page is intentionally
                  strict about splitting on commas so the result is predictable.
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
                  This page performs split, trim, and filtering directly in your browser. You control when you copy or download the output.
                  If you are working with sensitive lists (emails, customer IDs, internal labels), you can still use the tool without sending
                  the content anywhere.
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
