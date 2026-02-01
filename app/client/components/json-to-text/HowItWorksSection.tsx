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
                  How the JSON to Text Tool Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page extracts human-readable text from JSON by flattening
                  values into a simple output you can copy, download, or paste
                  into another system. It is designed for real workflows like
                  log review, scraping exports, API responses, analytics payloads,
                  and any time you need the words inside JSON without the braces,
                  commas, or nesting.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Values only
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Flatten", v: "Nested to linear" },
                { k: "Values", v: "Strings and primitives" },
                { k: "Join", v: "Newlines or spaces" },
                { k: "Keys", v: "Optional context" },
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
            <SectionCard title="What “JSON to text” means here" icon="list">
              <p>
                JSON is excellent for machines because it preserves structure.
                Humans, on the other hand, often just want the content inside the
                structure. Think of an API response that contains messages,
                error descriptions, titles, comments, or scraped page text. The
                braces and nesting are useful for code, but they get in the way
                when you are trying to read, search, or paste the content into a
                document.
              </p>

              <p className="mt-3">
                This tool takes a JSON object or array and traverses it
                recursively. Whenever it reaches a primitive value, it extracts
                it. Primitive values include strings, numbers, booleans, and
                null. Objects and arrays are treated as containers. The output
                is simply the extracted values joined together using either
                newlines or spaces, depending on your toggle.
              </p>

              <p className="mt-3">
                The rules are deterministic and intentionally boring. There is
                no attempt to guess which fields are “important” or to reorder
                things based on semantics. If you need a filtered view, you can
                use the optional key-path mode to keep context, then do a quick
                find or a follow-up cleanup step in another tool.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  What gets extracted
                </div>
                <p className="mt-2">
                  Strings, numbers, booleans, and null are extracted. Empty
                  strings are skipped to keep output readable. Nested arrays and
                  objects are walked until primitives are found. This makes the
                  output useful for logs and exports where the same shape
                  repeats many times.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Flatten values only, with optional keys" icon="type">
              <p>
                By default, the output contains only values. That aligns with the
                most common “give me the text” intent: you want the messages, the
                titles, the lines, and the snippets, without field names like
                <span className="font-semibold text-slate-900"> userId </span>
                or
                <span className="font-semibold text-slate-900"> createdAt </span>.
                If you are cleaning scraped JSON, removing keys usually makes
                the result dramatically easier to scan.
              </p>

              <p className="mt-3">
                When you need context, enable the keys option. The tool will
                prepend a dotted path (and array indexes) so each extracted value
                looks like <span className="font-semibold text-slate-900">path.to.value: text</span>.
                That format is practical because it keeps the original order and
                still allows you to copy the result into tickets, debugging notes,
                or a spreadsheet. It also makes it obvious which parts of the
                payload are noisy, such as IDs or repeated timestamps.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Newlines output",
                    "Best for readability, line-based tooling, and quick scanning. Each extracted value is separated by a line break.",
                  ],
                  [
                    "Spaces output",
                    "Best for compact exports where you want a single paragraph. Each extracted value is normalized and joined with single spaces.",
                  ],
                  [
                    "Keys off",
                    "Simplest output. Ideal when you are collecting the actual words and do not need field names.",
                  ],
                  [
                    "Keys on",
                    "Adds context using dotted paths and array indices. Ideal for logs and debugging where you need to know where a value came from.",
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
                  Practical tip for messy JSON
                </div>
                <p className="mt-2 text-slate-700">
                  Many “JSON” snippets from logs are almost JSON, but not quite
                  (single quotes, trailing commas, comments). This tool expects
                  valid JSON. If parsing fails, fix the snippet first or export
                  a proper JSON file. Once it parses, extraction is immediate and
                  predictable.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Why this is useful for logs, scraping, and exports" icon="list">
              <p>
                Flattening JSON values is a small operation that saves a lot of
                time. In logs, the same event schema can repeat thousands of
                times. If you are trying to understand what is happening, you
                often care about the messages, error strings, endpoint names, and
                user-facing text. Extracting values gives you a readable stream
                of content you can search or share.
              </p>

              <p className="mt-3">
                In scraping workflows, you might capture a blob of JSON that
                contains product titles, descriptions, categories, and reviews.
                Before you run a deeper analysis, it is helpful to pull out the
                text so you can sanity-check that you collected what you expected.
                Newlines output is especially useful here because it quickly shows
                duplicates and patterns.
              </p>

              <p className="mt-3">
                For exports, JSON is common but not always friendly for human
                review. If you need to paste values into a form, a CMS, a note,
                or an email, flattening values avoids accidental punctuation and
                structural characters. Since this tool runs locally in your
                browser, you can do quick cleanup steps without sending your data
                to a server.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Preserves order
                  </div>
                  <p className="mt-2">
                    Extraction follows the natural traversal order of the JSON.
                    That usually matches how the payload is structured and keeps
                    related values close together.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Predictable output
                  </div>
                  <p className="mt-2">
                    The tool does not try to “understand” your schema. It just
                    walks containers and collects primitives, which makes results
                    consistent across different payloads.
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
                  Your JSON stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Extraction is computed from the current editor value in your
                  browser. This page does not upload your JSON or store it on a
                  server. Copy and downloads happen only when you choose them.
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
