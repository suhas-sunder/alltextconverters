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
                  How the JSON Array to List Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This tool turns a JSON array into a clean, line-by-line list by
                  extracting values from the array and formatting them for easy
                  reading, copying, and exporting. It is designed for quick
                  cleanup tasks like logs, scraping output, exports, and API
                  responses where you want the data as plain text.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Local processing
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Values-first output
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Strings", v: "Names, labels, tags" },
                { k: "Numbers", v: "IDs, counts, metrics" },
                { k: "Booleans", v: "Flags and toggles" },
                { k: "Objects", v: "Stringified JSON" },
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
            <SectionCard title="What this tool extracts and what it ignores" icon="list">
              <p>
                JSON is a structured format. A JSON array is a top-level list
                written with square brackets, for example
                <span className="font-semibold text-slate-900">
                  {" "}
                  ["apple", "banana", "orange"]
                </span>
                . This converter expects that exact shape: a single array at the
                top level. If you paste a JSON object like{" "}
                <span className="font-semibold text-slate-900">
                  {" "}
                  {`{ "items": [...] }`}
                </span>
                , the tool will warn you because it cannot guess which property
                you intended to extract.
              </p>

              <p className="mt-3">
                Once the input is parsed, the converter walks through each array
                item and produces one output line per item. Primitive values
                (strings, numbers, booleans, and null) are converted directly to
                text. Non-primitive values (objects and nested arrays) are
                treated as optional. If you leave the “Stringify objects and
                arrays” toggle on, those complex values are converted using
                JSON.stringify so you still get a stable, copyable line. If you
                turn that toggle off, complex values are skipped rather than
                creating confusing output like “[object Object]”.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Why values-only is useful
                </div>
                <p className="mt-2">
                  When users search “JSON array to list”, they usually want a
                  human-friendly list, not a transformation that preserves full
                  structure. Extracting values into plain lines is ideal for
                  pasting into a spreadsheet column, a ticket, a note, or a
                  command-line script.
                </p>
              </div>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Trim values",
                    "Removes leading and trailing whitespace from each extracted value. This is helpful when strings contain accidental spaces or when values come from scraped HTML.",
                  ],
                  [
                    "Ignore empty values",
                    "Skips blank strings after trimming, so extra commas or empty values do not become empty lines in the final list.",
                  ],
                  [
                    "Stringify objects and arrays",
                    "Converts objects and nested arrays to a single-line JSON string. Keeps the output deterministic, even for complex items.",
                  ],
                  [
                    "Stable line output",
                    "Always outputs one item per line to keep the result easy to scan, diff, and paste into tools that accept newline-separated values.",
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

            <SectionCard title="Practical examples and edge cases" icon="type">
              <p>
                Real JSON is rarely as neat as a short tutorial snippet. You may
                be working with API responses, exported logs, or scraped data
                that contains extra fields and mixed types. The goal here is not
                to enforce a strict schema, but to make it easy to extract what
                you need without guessing. These examples explain what the tool
                will do so you can predict the output.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Example 1: Simple string array
                </span>
                . Input:{" "}
                <span className="font-semibold text-slate-900">
                  {" "}
                  ["alpha", "beta", "gamma"]
                </span>
                . Output becomes three lines: alpha, beta, gamma. This is the
                common case for tags, categories, and label lists.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Example 2: IDs as numbers
                </span>
                . Input:{" "}
                <span className="font-semibold text-slate-900">
                  {" "}
                  [101, 102, 103]
                </span>
                . Output becomes the same IDs on separate lines. This is useful
                when you need to paste a set of identifiers into a search UI or
                a support ticket.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Example 3: Mixed array
                </span>
                . Input could include strings, numbers, and objects in the same
                array. If stringifying is enabled, objects become JSON strings
                on their own line. That makes the output suitable for quick
                review or for downstream tools that accept JSON-per-line.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Invalid JSON
                  </div>
                  <p className="mt-2">
                    If the input cannot be parsed, the tool shows a clear error
                    and does not modify your text. Common issues include missing
                    quotes, trailing commas, and copying a JavaScript array that
                    uses single quotes. Fix the JSON first, then convert.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Arrays inside objects
                  </div>
                  <p className="mt-2">
                    If your JSON is an object with an array nested under a key,
                    extract that array before pasting here. This page focuses on
                    one job: top-level array to list, without guessing which
                    property you meant.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Tip for large arrays
                </div>
                <p className="mt-2 text-slate-700">
                  For very large JSON arrays, browsers can slow down during
                  parsing and rendering. If the page feels sluggish, split the
                  input into smaller chunks or extract only the part you need
                  before converting.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Privacy and downloads" icon="list">
              <p>
                This converter runs locally in your browser. The text you paste
                and the files you upload are processed on-device. Upload exists
                only to read the file contents into the editor so you can
                convert them. There is no server-side storage step in this
                workflow.
              </p>

              <p className="mt-3">
                The Download PDF button exports the current editor value using a
                client-side PDF library when available. If the optional PDF
                exporter is not installed, the page falls back to the browser
                print dialog so you can still save the output as a PDF.
                Formatting is intentionally simple: it is meant for sharing and
                archiving, not for recreating the original JSON structure.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  When to use this tool
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Extract a list of strings from an API response.</li>
                  <li>Turn exported IDs into one-per-line text for search tools.</li>
                  <li>Review mixed JSON quickly by stringifying complex items.</li>
                  <li>Prepare newline-separated values for scripts and forms.</li>
                </ul>
              </div>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">
                  Local-first
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your JSON stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Conversions happen in your browser. You control when you copy
                  or download the output, which is useful when working with
                  private logs, internal exports, or data that should not be
                  pasted into online services.
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
