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
                  How the Text to JSON Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste plain text, pick a simple parsing mode, and generate JSON that you can
                  copy or download. This is a deterministic, best-effort converter designed for
                  quick cleanup of notes, exports, logs, and scraping results. It runs locally in
                  your browser.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Best-effort parsing
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Lines → Array", v: "Lists, bullet exports" },
                { k: "Key:value", v: "Simple objects" },
                { k: "Pretty JSON", v: "Readable output" },
                { k: "_unparsed", v: "Keeps leftovers" },
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
            <SectionCard title="Two modes, predictable output" icon="list">
              <p>
                This page intentionally supports only two common patterns because they cover a lot
                of real workflows and they stay easy to reason about. When you convert text to JSON,
                the goal is usually to make the data machine-readable without spending time writing
                a custom script. The converter gives you a quick starting point that you can paste
                into a debugger, an API client, a database import, or a small utility script.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Lines → Array</span> treats each
                newline-separated line as a single item. This is the mode to use for lists such as
                names, IDs, URLs, search queries, or any export that is already one value per line.
                You can also use it for scraped text where you just want the visible strings in a
                structured form.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Key:value → Object</span> looks for
                the first colon in each non-empty line and splits it into a key and a value. It does
                not do language parsing, schema inference, type guessing, or nested structure
                detection. The converter keeps the rules simple so you can reliably predict what
                will happen before you click Convert.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Ignore empty lines",
                    "Skip blank lines so the output is compact. Turn it off if empty lines carry meaning in your source, such as intentional spacing in a report.",
                  ],
                  [
                    "Pretty print",
                    "Formats JSON with indentation for readability. Turn it off if you need a compact payload for copying into a URL, a query, or a limited character field.",
                  ],
                  [
                    "Trim values",
                    "Removes leading and trailing whitespace from values in key:value mode. Useful for log exports where alignment adds extra spaces.",
                  ],
                  [
                    "Keep duplicate keys",
                    "If the same key appears multiple times, you can keep all values as an array. If disabled, the last value wins, which is often the simplest behavior.",
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
                  Best-effort means review the output
                </div>
                <p className="mt-2">
                  The converter is designed to be helpful even when the input is messy, but it is
                  not a validation engine. If your source data has inconsistent separators, missing
                  values, or mixed formats, the output can still be valid JSON while not matching
                  what you intended. Use the summary counters on the page to spot skipped lines or
                  leftovers, then adjust your input or switch modes.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Key:value parsing details and edge cases" icon="type">
              <p>
                Key:value parsing is intentionally straightforward. The first colon in a line splits
                the key from the value. Everything after that colon is treated as the value, even if
                it contains additional colons. This helps with timestamps, URLs, and log prefixes
                where extra colons are common.
              </p>

              <p className="mt-3">
                Lines that do not contain a colon, or that have an empty key, are not thrown away.
                Instead, the tool collects them under a special field named{" "}
                <span className="font-semibold text-slate-900">_unparsed</span>. That keeps the
                conversion safe and transparent. You can scan those leftovers, fix the input, and
                re-run the conversion, or you can keep the _unparsed list as a record of what could
                not be cleanly represented as a key:value pair.
              </p>

              <p className="mt-3">
                Duplicate keys are another common problem in scraped data and log exports. By
                default, the converter uses a predictable rule: the last value wins. This is easy to
                understand and matches how many config systems behave. If you enable the duplicate
                keys option, repeated keys are collected into arrays so you keep every value without
                losing information.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Types are not inferred
                  </div>
                  <p className="mt-2">
                    Values are treated as strings. The tool will not convert “22” into a number or
                    “true” into a boolean because that quickly becomes ambiguous. If you need typed
                    JSON, convert first, then adjust types in a code editor or a small script.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Nested objects are not guessed
                  </div>
                  <p className="mt-2">
                    Keys are not interpreted as paths. A line like “user.name: Alice” stays a single
                    key, not a nested object. This avoids surprising output and keeps the tool aligned
                    with quick, deterministic conversions.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Practical workflow tip
                </div>
                <p className="mt-2 text-slate-700">
                  If your input uses “=” instead of “:”, do a quick find-and-replace in your editor,
                  then use key:value mode. Keeping the converter rules small makes outcomes more
                  predictable, and it usually takes only a small pre-clean step to fit your data
                  into one of the supported shapes.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="What this tool is for" icon="list">
              <p>
                This converter is most useful when you have text that is almost structured but not
                quite. A few examples: exported logs you want to paste into an issue, a list of URLs
                you want to feed into a crawler, scraped label:value pairs you want to store, or
                plaintext notes you want to convert into a small JSON fixture for tests.
              </p>

              <p className="mt-3">
                The output is designed to be immediately copyable. When the JSON looks correct,
                you can copy it into a destination system or download it as a .json file. If you
                need a PDF, the page can export the output for sharing or for attaching to a ticket.
                Keep in mind that PDF export is formatting-oriented, while JSON export is for
                machine use.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Local processing and privacy
                </div>
                <p className="mt-2">
                  Conversions are computed in your browser. This page does not upload your text to a
                  server. Uploading a file here simply loads it into your browser so it can be
                  converted on-device. That is useful for quick work with logs and exports that may
                  contain sensitive values.
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
                  Best-effort, not magic
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Use it to get 80% there fast
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  If your input is inconsistent, the converter will still aim to produce valid JSON
                  and show what it could not parse. That is the intended workflow: convert, review,
                  adjust the text if needed, and convert again. For complex transforms, a script is
                  still the right tool, but this page can save you time when you just need a clean
                  starting point.
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
