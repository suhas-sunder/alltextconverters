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
                  How the Comma to JSON Array Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste a comma-separated list, clean it up automatically, and
                  export a valid JSON array of strings. This tool is built for
                  quick transformations in apps, scripts, configuration files,
                  and APIs where the destination expects JSON, not a plain list.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Trims values
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Drops empties
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Input", v: "a, b, c" },
                { k: "Cleanup", v: "trim + filter" },
                { k: "Output", v: '["a","b","c"]' },
                { k: "Copy", v: "paste anywhere" },
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
            <SectionCard
              title="What gets converted and what gets ignored"
              icon="list"
            >
              <p>
                The goal of this page is simple: turn a messy, human-written
                comma list into a clean, machine-friendly JSON array. People
                tend to write lists with extra spaces, trailing commas, mixed
                separators, and accidental blanks. JSON does not allow any of
                that. It has to be a well-formed array with quotes around each
                string and proper escaping for characters like quotation marks
                and backslashes.
              </p>

              <p className="mt-3">
                This tool uses deterministic rules so you always know what you
                will get. It splits your input on commas and line breaks. Each
                token is trimmed. Empty tokens are removed. This means an input
                like{" "}
                <span className="font-semibold text-slate-900">a, b, , c,</span>{" "}
                becomes{" "}
                <span className="font-semibold text-slate-900">
                  ["a","b","c"]
                </span>
                . The editor stays editable so you can paste, convert, then
                quickly adjust any edge case.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Explicit scope
                </div>
                <p className="mt-2">
                  This converter outputs a JSON array of strings only. It does
                  not try to detect numbers, booleans, objects, or nested
                  arrays. If you need typed JSON, convert here for cleanliness,
                  then adjust types in your destination system.
                </p>
              </div>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Trim whitespace",
                    "Leading and trailing spaces are removed from each value so copy-paste artifacts do not leak into JSON.",
                  ],
                  [
                    "Ignore empty values",
                    "Blank entries created by consecutive commas or a trailing comma are dropped, and the tool reports how many were ignored.",
                  ],
                  [
                    "Preserve characters",
                    "Characters inside a value are kept as-is. JSON escaping is handled by the encoder so quotes and backslashes remain valid.",
                  ],
                  [
                    "No CSV quoting rules",
                    "If your list contains commas inside quotes, this tool will still split on commas. For true CSV parsing, use a CSV-specific converter.",
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

            <SectionCard
              title="Why JSON arrays matter in real workflows"
              icon="type"
            >
              <p>
                Many tools and APIs accept a JSON array but not a plain
                comma-separated list. A classic example is passing a list of
                tags, IDs, or allowed values into an API request body, a
                configuration file, or a deployment template. If the destination
                expects JSON and you paste raw text, it either fails validation
                or silently interprets your string as one value.
              </p>

              <p className="mt-3">
                Converting a list to{" "}
                <p className="mt-3">
                  A good mental model is that you are preparing data for code,
                  not for people. In JavaScript, you can paste the output
                  directly into a constant, pass it as part of a request
                  payload, or store it in local configuration. In many no-code
                  tools, a field that says “array” still expects JSON syntax. A
                  valid JSON array keeps you out of the gray area where a
                  platform tries to guess what you meant.
                </p>
                <span className="font-semibold text-slate-900">["..."]</span>{" "}
                format also reduces ambiguity. Commas, spaces, and line breaks
                can be interpreted differently by different systems. JSON arrays
                are explicit. Each element is clearly separated, and the format
                is widely supported across JavaScript, TypeScript, Python, Go,
                and most modern stacks.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Logs and exports
                  </div>
                  <p className="mt-2">
                    When you scrape or export values from a system, you often
                    get a quick comma list. Turning it into JSON makes it ready
                    for tooling, test fixtures, and reproducible inputs.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Front-end config
                  </div>
                  <p className="mt-2">
                    Feature flags, allowlists, and UI option sets are commonly
                    stored as arrays. JSON arrays are easy to drop directly into
                    code or a config file without additional parsing.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Practical tip
                </div>
                <p className="mt-2 text-slate-700">
                  If you need one value per line in your destination, keep the
                  JSON array anyway. Most editors can format JSON to multiple
                  lines automatically, and the structure stays unambiguous.
                </p>
              </div>
            </SectionCard>

            <SectionCard
              title="Edge cases, limits, and best-effort behavior"
              icon="list"
            >
              <p>
                This page intentionally avoids hidden heuristics. That keeps
                results predictable, but it also means certain inputs need a
                quick manual check. The most common edge case is a value that
                itself contains a comma, like a city name formatted as{" "}
                <span className="font-semibold text-slate-900">
                  Toronto, ON
                </span>
                . In CSV, that would be quoted. Here, it will be split into two
                values. If you have comma-containing data, you should use a
                proper CSV tool or replace those commas before conversion.
              </p>

              <p className="mt-3">
                Another edge case is mixed separators. People paste lists
                separated by newlines, then add commas on some lines. This tool
                accepts both because it splits on commas and line breaks. The
                tradeoff is that it does not understand more complex formats
                like semicolon-delimited records or nested data. If you can
                normalize your list first, you will get cleaner output.
              </p>

              <p className="mt-3">
                One more practical edge case is hidden whitespace. Values copied
                from spreadsheets or PDFs can contain non-breaking spaces or
                invisible separators. Trimming removes the obvious padding, but
                it cannot reveal every hidden character by sight. If your
                destination rejects the array even though it looks fine, paste
                the original list into a whitespace-cleaning tool first, then
                convert again.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  What you should verify
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    Whether any value contains a comma that should stay inside
                    the value.
                  </li>
                  <li>
                    Whether you want empty values dropped or preserved for
                    alignment.
                  </li>
                  <li>
                    Whether the destination expects strings or typed values like
                    numbers.
                  </li>
                </ul>
              </div>

              <p className="mt-3">
                The output is generated using the browser&apos;s JSON
                serializer, which safely escapes quotes, backslashes, and
                control characters. That is the main reason to use a converter
                instead of manual quoting. Even if your list includes characters
                like <span className="font-semibold text-slate-900">"</span> or
                newline sequences, the resulting JSON stays valid.
              </p>
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
                  Conversions happen in your browser. This page does not upload
                  your pasted text or extracted file contents to a server. You
                  decide when to copy the JSON output or download it.
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
