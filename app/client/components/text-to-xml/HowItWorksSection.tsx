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
                  How the Text to XML Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste plain text, pick a simple wrapping format, and generate
                  XML that is safe to copy into configs, exports, tests, and
                  quick data pipelines. The rules are deterministic on purpose.
                  This is a formatter, not a schema designer.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Deterministic output
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Escape XML", v: "Safer copy and paste" },
                { k: "Line to node", v: "One line, one element" },
                { k: "Custom tags", v: "Root and item names" },
                { k: "Index option", v: "Stable line markers" },
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
            <SectionCard title="What this tool generates" icon="list">
              <p>
                XML is strict about certain characters. If you paste text that
                contains an ampersand or a less-than sign, the result is not
                valid XML unless those characters are escaped. This tool always
                escapes the five common XML special characters:{" "}
                <span className="font-mono">&amp;</span>,{" "}
                <span className="font-mono">&lt;</span>,{" "}
                <span className="font-mono">&gt;</span>,{" "}
                <span className="font-mono">&quot;</span>, and{" "}
                <span className="font-mono">&apos;</span>. Everything else is
                kept as-is, including punctuation and Unicode characters.
              </p>

              <p className="mt-3">
                The output uses a root element and an item element. By default,
                each line becomes one item. That is the most useful shape for
                logs, lists, exports, and scraping outputs where you already
                think in lines. If you disable line splitting, the tool wraps
                the entire input in a single item element instead. Both modes
                are deliberately simple so you can predict the output without
                reading a rule book.
              </p>

              <p className="mt-3">
                You can set the root and item element names, but the validation
                is intentionally conservative. It allows simple tag names like{" "}
                <span className="font-mono">root</span>,{" "}
                <span className="font-mono">items</span>,{" "}
                <span className="font-mono">line</span>, and{" "}
                <span className="font-mono">entry</span>. If you type something
                that looks invalid for a basic tag name, the tool falls back to
                safe defaults and shows a warning. This prevents accidental
                output like tags with spaces that would break XML parsers.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Split by lines",
                    "Turns each line into one XML element. This is ideal for lists, row-like exports, and log processing.",
                  ],
                  [
                    "Include empty lines",
                    "Optionally emits an empty element for blank lines. Useful when line positions are meaningful.",
                  ],
                  [
                    "Index attribute",
                    "Adds an index=\"N\" attribute so you can reference the original line number later.",
                  ],
                  [
                    "No schema guessing",
                    "The tool does not infer nested structures. It just wraps text predictably.",
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
                  Best-effort, not a full XML editor
                </div>
                <p className="mt-2">
                  This converter is designed for turning raw text into valid
                  XML that is easy to paste into another tool. It does not
                  pretty-print existing XML, validate against a DTD or XSD, or
                  rewrite your data into complex nested elements. If you need
                  schema-level structure, generate a simple wrapper here, then
                  refine it in your editor of choice.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Common workflows and edge cases" icon="type">
              <p>
                Most people land on a text to XML page because they have data
                that is not in a structured format yet. The typical input is a
                list of lines, a pasted column from a spreadsheet, scraped
                results, or log lines that you want to store as XML for a legacy
                system. In those cases, line splitting is the right default
                because it preserves the meaning you already have.
              </p>

              <p className="mt-3">
                If you are exporting to a system that expects one element per
                entry, choose an item tag like{" "}
                <span className="font-mono">entry</span> or{" "}
                <span className="font-mono">item</span>. If you want to keep
                track of where a line came from, enable the index attribute and
                you will get stable numbering that matches the input line
                positions. When you also enable empty lines, the index values
                line up even if the input contains blank separators.
              </p>

              <p className="mt-3">
                Special characters are where XML conversion usually breaks.
                Copying raw text that includes{" "}
                <span className="font-mono">&amp;</span> into XML without
                escaping it can corrupt downstream parsing. The escape step
                prevents that. It also means that your output is safe to paste
                into an XML parser or validator. Keep in mind that escaping does
                not change your content meaningfully. It only encodes the few
                characters that have structural meaning in XML.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Tabs and spacing
                  </div>
                  <p className="mt-2">
                    This tool does not normalize whitespace. Tabs and repeated
                    spaces remain in the text content. If you need to clean
                    whitespace first, run your data through a whitespace or
                    text cleaner tool, then convert to XML.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Newlines inside a single node
                  </div>
                  <p className="mt-2">
                    If you disable line splitting, the full input is wrapped in
                    one element. Newlines are preserved inside that node, which
                    is useful when you are embedding a paragraph or a block of
                    text in XML.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Quick tip</div>
                <p className="mt-2 text-slate-700">
                  Use a simple root like <span className="font-mono">root</span>{" "}
                  and an item like <span className="font-mono">line</span> when
                  you are unsure. You can always rename tags later, but starting
                  with valid XML saves time when you paste into another system.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Uploads, downloads, and privacy" icon="list">
              <p>
                This page can load text from common file types so you do not
                need to copy and paste large blocks manually. Text-like files
                such as TXT, CSV, JSON, and XML are read directly in your
                browser. For PDF and DOCX, the page can attempt local extraction
                if optional libraries are installed in the app build. When those
                libraries are not present, the file upload may fail gracefully
                and the page will tell you what is missing.
              </p>

              <p className="mt-3">
                For output, you can copy the generated XML, download it as a
                file, or export a simple PDF. PDF export uses an optional
                library and falls back to your browser print dialog if needed.
                This is the same pattern used by other converters on the site so
                users always have a way to save the result.
              </p>

              <p className="mt-3">
                Privacy-wise, the conversion is computed from what is in the
                editor on your device. The page does not need to upload your
                text to generate XML. Uploading a file reads it locally and
                extracts its text on-device when supported. If your data is
                sensitive, you can still use the tool safely because the
                conversion happens in your browser session.
              </p>
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
                  XML generation is computed in your browser from the text you
                  provide. This page does not send your content to a server for
                  conversion, and copying is always explicit. You decide what to
                  copy and where to paste it.
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
