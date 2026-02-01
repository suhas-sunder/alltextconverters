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
                  How the List to Table Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page turns a simple list into a predictable 1-column table output.
                  You paste items, choose how the tool should split them, then copy the result as an
                  HTML table, CSV, or TSV. It does not rewrite content or guess structure. It only
                  formats the list you provide, using deterministic rules you can verify at a glance.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  1-column outputs
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "HTML table", v: "Web editors, docs" },
                { k: "CSV", v: "Sheets, imports" },
                { k: "TSV", v: "Logs, quick paste" },
                { k: "Local", v: "No server step" },
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
            <SectionCard title="What the tool considers an item" icon="list">
              <p>
                A “list” can mean different things depending on where your text comes from.
                Sometimes each item is already on its own line. Other times you have a copy and
                paste from a paragraph or a menu where items are separated by spaces.
                This converter supports both patterns through the split mode.
              </p>

              <p className="mt-3">
                If you choose <span className="font-semibold text-slate-900">Split on whitespace</span>,
                the tool treats any run of spaces, tabs, or line breaks as a separator.
                That makes it good for short lists like <span className="font-semibold text-slate-900">apple banana orange</span>
                and for text copied from UI labels where you do not get clean line breaks.
                If you choose <span className="font-semibold text-slate-900">Split on lines</span>,
                only line breaks split items, so “New York” stays intact as a single entry.
              </p>

              <p className="mt-3">
                In both modes, trimming is applied to each piece and empty entries are ignored.
                That means extra spaces or accidental blank lines do not produce empty rows.
                The goal is to create a stable 1-item-per-row result, without trying to interpret meaning.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Quick guidance</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    Use <span className="font-semibold">Split on whitespace</span> for short, single-word items or when your source is messy.
                  </li>
                  <li>
                    Use <span className="font-semibold">Split on lines</span> when items can contain spaces, like names or addresses.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Copy formats explained: HTML, CSV, TSV" icon="type">
              <p>
                Once the tool has a clean list of items, it can emit three popular formats.
                All three are “one column” outputs, which keeps them portable.
                You pick the format based on where you plan to paste or import the data.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">HTML table</span> is ideal when your destination understands rich text.
                A simple table markup like <code>&lt;table&gt;</code> and <code>&lt;td&gt;</code> preserves the idea of rows
                when you paste into editors that support HTML, some email clients, and many documentation tools.
                This tool escapes special characters so an item like <span className="font-semibold text-slate-900">&lt;tag&gt;</span> stays text rather than being interpreted as markup.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">CSV</span> is the safest choice for spreadsheets and data imports.
                It is just text, but with a well-known quoting rule.
                If an item contains a comma, a quote, or a line break, it is wrapped in quotes and inner quotes are doubled.
                This tool uses a single-column CSV: one item per row.
                That structure works in Google Sheets, Excel, Airtable, and many “import from CSV” flows.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">TSV</span> is similar, but uses a tab separator instead of commas.
                In a one-column export there are no separators inside the data, which makes TSV convenient for quick copy and paste
                into systems that split on tabs, as well as logs and developer tools that prefer tabular text.
                Tabs inside items are normalized to spaces to keep the output stable.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "HTML table",
                    "Best for rich editors. Preserves rows visually. Special characters are escaped so values remain text.",
                  ],
                  [
                    "CSV",
                    "Best for spreadsheets and imports. Uses standard quoting for commas, quotes, and newlines.",
                  ],
                  [
                    "TSV",
                    "Best for quick paste into tools that accept tabular text. Tabs in items are normalized for safety.",
                  ],
                  [
                    "Single column",
                    "Keeps your data portable. If you later need multiple columns, you can split further in a sheet or script.",
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

            <SectionCard title="Practical workflows and common edge cases" icon="list">
              <p>
                The main reason people search for “list to table” is that the destination expects
                structured rows while the source is just plain text.
                This page is useful for quick cleanup tasks like turning bullet points into an importable column,
                building a small HTML table for a document, or converting labels from a UI into a sheet-friendly format.
              </p>

              <p className="mt-3">
                There are a few edge cases worth knowing up front.
                If you paste items with internal spaces, whitespace mode will split them into multiple pieces.
                That is not a bug; it is the definition of that mode.
                Switch to line mode when you want multi-word items to stay intact.
                If you have comma-separated values already, a dedicated comma-to-list tool can be a better first step,
                then use this page to move from list to table formats.
              </p>

              <p className="mt-3">
                If your destination applies its own rules on paste, always do a quick verification pass.
                Some editors strip HTML and keep only text. Some spreadsheet imports treat leading zeros or long numeric
                strings as numbers. This converter does not try to “protect” values by forcing quotes everywhere.
                It produces conservative outputs that most tools accept, then you decide if the destination needs additional handling.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Numbers and IDs</div>
                  <p className="mt-2">
                    If you are exporting product codes or IDs, spreadsheets may auto-format them.
                    CSV preserves text, but the importer may still interpret values. If formatting matters,
                    paste into a plain-text field first or set the column type in your destination.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Blank entries</div>
                  <p className="mt-2">
                    Extra whitespace and blank lines are ignored. If you need to keep intentional empty rows,
                    you should represent them explicitly (for example with a placeholder), because empty items
                    are indistinguishable from accidental separators.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Best-effort note</div>
                <p className="mt-2 text-slate-700">
                  This tool assumes you want a 1-item-per-row table. It does not parse nested lists, numbering,
                  or indentation into hierarchy. If you need multi-level tables, start by cleaning the list into
                  a consistent structure, then build the table in a spreadsheet or a dedicated formatter.
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
                  Your list stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  The parsing and formatting happen in your browser from the text in the editor.
                  Uploading a file reads it locally on-device. Nothing is sent to a server as part of the conversion,
                  and you control when to copy or download the outputs.
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
