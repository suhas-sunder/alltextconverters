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
                  How the Text to ASCII Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste text, click Encode, and get decimal ASCII codes you can
                  copy into a form, a script, or a debugging note. This tool is
                  intentionally simple: it encodes characters using the classic
                  printable ASCII range (32–126) and reports anything that does
                  not fit that scope so you are never surprised by invisible
                  characters or non-ASCII symbols.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Printable ASCII (32–126)
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Decimal output", v: "Classic 65 66 67" },
                { k: "Delimiter", v: "Space or comma" },
                { k: "Scope", v: "Printable ASCII only" },
                { k: "Uploads", v: "TXT, PDF, DOCX" },
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
            <SectionCard title="What you get: predictable, readable ASCII codes" icon="list">
              <p>
                “Text to ASCII” sounds like a pipeline step, but most people are
                searching for a single-purpose page. They have a small piece of
                text and they want the numeric codes that represent it, usually
                to feed another tool, to write a test case, to debug hidden
                whitespace, or to match a specification that was written in
                numeric form.
              </p>

              <p className="mt-3">
                This page outputs <span className="font-semibold text-slate-900">decimal</span> ASCII values. For
                example, <span className="font-semibold text-slate-900">ABC</span> becomes{" "}
                <span className="font-semibold text-slate-900">65 66 67</span>. You can choose a space delimiter or a
                comma delimiter depending on where you plan to paste the result.
                Some systems expect space-separated numbers, while others prefer
                comma-separated lists.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Printable ASCII scope (32–126)
                </div>
                <p className="mt-2">
                  To keep output consistent and human-readable, this tool focuses
                  on printable ASCII: the characters you can see and type
                  directly, like letters, digits, punctuation, and common symbols.
                  That range starts at 32 (space) and ends at 126 (~). Control
                  codes like tab and newline are outside that range, and so are
                  emoji and non-Latin scripts.
                </p>
              </div>

              <p className="mt-3">
                If you enable “Printable ASCII only” (the default), any character
                outside 32–126 is skipped and counted. That includes invisible
                characters like zero-width spaces and the byte order mark (BOM),
                which can silently break comparisons, cause surprising search
                results, or make a “looks identical” string fail validation.
                Skipping and reporting is a deliberate choice: it forces clarity
                about what is actually in the input.
              </p>
            </SectionCard>

            <SectionCard title="How encoding is done (no grammar, no guessing)" icon="type">
              <p>
                The encoding rules here are deterministic and intentionally small.
                Each character is examined in order, and if it is within the
                selected scope it is converted to a decimal code. There is no
                language logic, no transformation of the text, and no “smart”
                normalization that might hide problems. The goal is to show you
                what your input is made of.
              </p>

              <p className="mt-3">
                When printable-only mode is enabled, the converter includes
                characters in the ASCII printable band (32–126) and skips
                everything else. That means a normal sentence will encode cleanly,
                but a paragraph that includes curly quotes, em dashes, or
                non-breaking spaces may show skipped counts. This is useful in
                practice because those characters can enter text via copy/paste
                from word processors or messaging apps.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Delimiter choice",
                    "Pick space when you want compact output, or comma when you want a list format for spreadsheets, JSON snippets, or debugging logs.",
                  ],
                  [
                    "Visible vs invisible characters",
                    "The tool calls out tabs, line breaks, non-breaking spaces, and zero-width characters so you can understand why two strings do not compare equal.",
                  ],
                  [
                    "Non-ASCII input",
                    "If your text includes emoji or non-Latin scripts, those characters are outside ASCII. The tool reports them as skipped in printable-only mode.",
                  ],
                  [
                    "Order preserved",
                    "Codes are generated in the same sequence as the original text. If you paste multiple lines, the output corresponds to the character order you provided.",
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
                  A practical warning about “ASCII”
                </div>
                <p className="mt-2 text-slate-700">
                  People often say “ASCII” when they mean “text encoding”. ASCII
                  is a 7-bit standard with 128 possible codes. Modern text is
                  usually Unicode, which can represent far more characters.
                  This page is intentionally scoped to printable ASCII so the
                  output is unambiguous for classic tooling and quick debugging.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Uploads, downloads, and safe local processing" icon="list">
              <p>
                You can paste text directly, or you can upload a file to load
                content into the editor. TXT and other text-like formats load
                as-is. PDF and DOCX extraction happens in your browser if the
                optional libraries are installed in your app build. When
                extraction succeeds, the page places the extracted text into
                the input box so you can encode it the same way as pasted text.
              </p>

              <p className="mt-3">
                Output can be copied with one click, or exported as TXT or PDF.
                PDF export is useful when you need to attach a record of the
                encoded output (for example, in a ticket or a review). TXT export
                is the simplest “source of truth” format for storing the code
                list and reusing it later.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Common use cases
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Convert a short label into decimal codes for a firmware or legacy parser.</li>
                  <li>Spot invisible characters before you compare, hash, or validate a string.</li>
                  <li>Produce clean numeric examples for documentation or classroom notes.</li>
                  <li>Prepare a list of codes to feed an “ASCII to text” decoder.</li>
                </ul>
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
                  Encoding is computed from the editor value in your browser. This
                  page does not upload your text or store it on the server. If you
                  use file upload for PDFs or DOCX files, extraction still happens
                  locally, and you remain in control of what you copy or download.
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
