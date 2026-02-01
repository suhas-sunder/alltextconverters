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
                  How the Table to List Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste a table, CSV, or TSV, choose a column, and extract a
                  clean one-item-per-line list. This page is designed for
                  practical copy-paste jobs where you want to pull out a single
                  field like emails, IDs, URLs, names, or product SKUs without
                  editing rows by hand.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Column extractor
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "TSV", v: "Spreadsheets, tables" },
                { k: "CSV", v: "Exports, reports" },
                { k: "HTML", v: "Copied web tables" },
                { k: "List", v: "Copy-ready output" },
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
            <SectionCard title='What counts as a "table" input' icon="list">
              <p>
                The input box accepts several common formats that people paste
                when moving data between tools. If you copy cells from a
                spreadsheet, most apps paste them as tab-separated values (TSV).
                If you export from a system like a CRM, analytics tool, or
                scraper, you will often get comma-separated values (CSV). And if
                you copy a rendered table from a web page, your clipboard might
                contain an HTML table.
              </p>

              <p className="mt-3">
                This converter tries to detect which format you pasted and then
                parses it into rows and columns. Once the data is in a simple
                row structure, the tool extracts one column and outputs it as a
                list. The goal is not to be a perfect data import engine. The
                goal is a fast, predictable way to pull out the one field you
                actually need.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Detection rules (practical, not fancy)
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    If the pasted text contains an HTML{" "}
                    <code>&lt;table&gt;</code> with rows, the tool reads cell
                    text.
                  </li>
                  <li>
                    Otherwise, if the text contains tab characters, it is
                    treated as TSV.
                  </li>
                  <li>
                    Otherwise, if the text contains commas, it is treated as
                    CSV.
                  </li>
                  <li>
                    If none of those signals exist, the tool treats the input as
                    plain text with one value per line.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Column selection and output rules" icon="type">
              <p>
                After parsing, the converter computes how many columns exist in
                the pasted data and exposes a column selector. By default it
                extracts the first column because that matches common workflows:
                pulling the left-most field like IDs, domains, or primary keys
                from an export.
              </p>

              <p className="mt-3">
                The output is produced by reading each row, taking the selected
                column, optionally trimming whitespace, and then joining the
                results with newline characters. When the "Ignore empty" option
                is on, blank values are skipped. That is helpful when your table
                has empty cells, trailing delimiters, or header/footer rows that
                do not include the selected field.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Trim cells",
                    "Removes leading and trailing whitespace around each extracted value. Good for pasted data that includes padding or odd spacing.",
                  ],
                  [
                    "Ignore empty values",
                    "Skips empty or whitespace-only cells in the chosen column so you do not get blank lines in the final list.",
                  ],
                  [
                    "Keeps row order",
                    "The output list keeps the original row order. If you need sorting or de-duplication, do that with a dedicated tool.",
                  ],
                  [
                    "No rewriting",
                    "The converter only extracts values. It does not normalize casing, remove punctuation, or clean content beyond trimming.",
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
                  Why the output is newline-based
                </div>
                <p className="mt-2 text-slate-700">
                  A newline list is the easiest interchange format for follow-up
                  tasks. You can paste it into email tools, bulk operations,
                  spreadsheet columns, command-line scripts, or other converters
                  that expect one item per line. If you need a comma-separated
                  output, you can feed this list into a list-to-comma tool.
                </p>
              </div>
            </SectionCard>

            <SectionCard
              title="Handling messy CSV and copied web tables"
              icon="list"
            >
              <p>
                Real-world exports are rarely perfect. CSV files can contain
                quoted fields, commas inside quotes, or inconsistent row
                lengths. Copied web tables can include hidden whitespace,
                multiple spaces, or header cells mixed with data cells. This
                tool uses a best-effort parser that covers common cases without
                trying to implement a full spreadsheet engine.
              </p>

              <p className="mt-3">
                For CSV, it supports basic quoting rules: text inside double
                quotes is treated as a single field, and a doubled quote inside
                a quoted field becomes a literal quote. For TSV, parsing is
                straightforward because tabs are unambiguous. For HTML tables,
                the converter reads the visible text content of each cell and
                collapses repeated whitespace.
              </p>

              <p className="mt-3">
                If you run into a file with advanced CSV edge cases (multi-line
                quoted fields, unusual delimiters, or embedded newlines inside
                cells), the safest approach is to open it in a spreadsheet, copy
                the column you need, and paste the resulting single-column
                selection. That reduces parsing ambiguity and makes the
                extraction step deterministic.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Headers and totals
                  </div>
                  <p className="mt-2">
                    If your table has a header row, you can either leave it in
                    (and manually delete the first line later) or choose a
                    column that has an empty header cell so it gets skipped when
                    "Ignore empty" is enabled.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Uneven rows
                  </div>
                  <p className="mt-2">
                    When some rows have fewer columns, missing cells are treated
                    as empty values. That means they can be skipped rather than
                    turning into the word "undefined" or breaking the
                    conversion.
                  </p>
                </div>
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
                  Your data stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Parsing and extraction happen in your browser. This page does
                  not upload your pasted table to a server. Use Copy or Download
                  only when you are ready to move the extracted list into
                  another system.
                </p>
              </div>
            </div>

            <SectionCard title="Common use cases" icon="type">
              <p>
                Table-to-list extraction is a small step that unlocks a lot of
                workflows. It is useful when you are cleaning up exports,
                preparing bulk actions, or creating a list of values to feed
                into another tool.
              </p>

              <ul className="mt-4 list-disc pl-5 space-y-2">
                <li>
                  Pull email addresses from a CRM export to build a contact
                  list.
                </li>
                <li>
                  Extract URL paths from a log table so you can run a quick
                  normalization or decode step.
                </li>
                <li>
                  Copy a spreadsheet column of SKUs into a vendor portal that
                  requires one per line.
                </li>
                <li>
                  Take scraped product names from a table and convert them into
                  a clean list for de-duplication.
                </li>
                <li>
                  Extract IDs from an analytics report to use in a filter or a
                  follow-up query.
                </li>
              </ul>

              <p className="mt-3">
                If your job is more complex than a single column, do the
                transformation in a spreadsheet first. This tool is optimized
                for speed and clarity when the goal is one field, one line,
                ready to copy.
              </p>
            </SectionCard>
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
