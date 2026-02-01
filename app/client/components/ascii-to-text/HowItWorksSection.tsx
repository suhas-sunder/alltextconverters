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
                  How the ASCII to Text Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste decimal ASCII codes like{" "}
                  <span className="font-semibold text-slate-900">
                    72 101 108 108 111
                  </span>{" "}
                  and decode them into readable text. This page is designed for
                  the explicit query people search for, like “ASCII decoder” or
                  “ASCII to text,” without requiring you to build a mental
                  pipeline through hex, binary, or multiple tools.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Space and comma tolerant
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Input format", v: "Decimal ASCII codes" },
                { k: "Separators", v: "Spaces, commas, newlines" },
                { k: "Scope", v: "Printable ASCII 32–126" },
                { k: "Output", v: "Text you can copy" },
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
            <SectionCard title="What counts as “ASCII to text” here" icon="list">
              <p>
                ASCII is a mapping from numbers to characters. When people say
                “ASCII codes,” they usually mean decimal values like 65 for “A”
                and 97 for “a”. This page focuses on that exact use case:
                converting a list of decimal codes into a string you can paste
                into another app.
              </p>

              <p className="mt-3">
                To keep the result predictable, the converter is limited to the
                <span className="font-semibold text-slate-900">
                  {" "}
                  printable ASCII range (32–126)
                </span>
                . That range covers letters, digits, punctuation, and common
                symbols. It avoids control characters like BEL, ESC, and other
                non-printable codes that can create invisible changes, terminal
                control sequences, or confusing output when you paste into a
                form.
              </p>

              <p className="mt-3">
                If your input contains codes outside 32–126, they are skipped
                and reported. The goal is clarity: you always know what was
                converted, what was ignored, and why. If you need control codes
                like newline (10) or tab (9), use a dedicated tool that is
                explicit about inserting those characters.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Decimal codes only",
                    "This tool reads decimal digits and ignores other separators. If you paste 72,101,108 it works the same as 72 101 108.",
                  ],
                  [
                    "Order is preserved",
                    "Codes are decoded left to right exactly as they appear. No sorting, grouping, or normalization.",
                  ],
                  [
                    "Printable scope",
                    "Only 32–126 are converted. Everything else is skipped and shown in the summary.",
                  ],
                  [
                    "Local processing",
                    "Decoding happens in your browser. Uploads are read client-side when supported libraries are installed.",
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
                  Quick sanity check
                </div>
                <p className="mt-2">
                  A common test input is{" "}
                  <span className="font-semibold text-slate-900">
                    72 101 108 108 111
                  </span>
                  . That should decode to “Hello”. If you paste a known phrase
                  and the output is empty, it usually means your input is not
                  decimal ASCII or your codes are outside the printable range.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="How parsing works (space and comma tolerant)" icon="type">
              <p>
                Real-world ASCII code lists rarely arrive in a perfect format.
                You might copy from a spreadsheet, a debug log, or a classroom
                exercise sheet. Some lists are comma-separated. Others use
                multiple spaces, tabs, or line breaks. This converter is built
                to be forgiving about separators so you do not have to clean the
                input first.
              </p>

              <p className="mt-3">
                The parser scans your input for decimal numbers. Any non-digit
                character acts like a separator. That means the following inputs
                all decode the same way:
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Spaces</div>
                  <p className="mt-2 text-sm">
                    72 101 108 108 111
                  </p>
                </div>
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Commas</div>
                  <p className="mt-2 text-sm">
                    72,101,108,108,111
                  </p>
                </div>
              </div>

              <p className="mt-3">
                This “numbers only” approach is intentionally simple. It is not
                trying to interpret hex prefixes, binary strings, or escape
                sequences. If you paste mixed content like “A=65”, the parser
                still finds 65 and converts it. The summary shows how many codes
                were parsed, how many were converted, and which ones were
                skipped, so you can verify the result quickly.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Tip</div>
                <p className="mt-2 text-slate-700">
                  If you are decoding large lists, convert once and then copy
                  the output into your destination. Some apps will reformat
                  pasted whitespace, but the decoded characters themselves will
                  remain correct.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Common edge cases and what to expect" icon="list">
              <p>
                ASCII decoding looks straightforward until you hit the edge
                cases. The two most common surprises are non-printable codes and
                non-ASCII input. This tool chooses safety and transparency over
                trying to guess what you meant.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Non-printable codes
                </span>{" "}
                (below 32) are skipped. If you expected newlines, tabs, or other
                spacing, you will see those numbers listed as skipped. That is
                intentional so the output you copy does not contain hidden
                characters.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Extended encodings
                </span>{" "}
                like “Windows-1252” or “Latin-1” use values 128–255. Those are
                not part of the core ASCII standard. This converter does not
                map those values because different systems disagree on what they
                mean. If your data includes values above 126, treat it as a
                sign that you are not dealing with plain ASCII.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Why the printable-only rule helps
                </div>
                <p className="mt-2">
                  Many users paste decoded text into forms, CMS editors, code
                  comments, or spreadsheet cells. Hidden control characters can
                  make those destinations behave strangely. Keeping decoding
                  within 32–126 makes the result safer to paste and easier to
                  review at a glance.
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
                  Decoding runs in your browser from the content in the editor.
                  This page does not send your text to a server. If you upload a
                  file, it is read client-side, and conversion happens locally.
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
