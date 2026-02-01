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
                  How the Match Case Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Match-case copies the uppercase and lowercase a style sample from a
                  reference string and applies it to a target string. It does
                  not change words, punctuation, or meaning. It only changes
                  letter casing so new text can follow an existing style sample.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Deterministic
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Reference", v: "Defines a case pattern" },
                { k: "Target", v: "Receives the pattern" },
                { k: "Letters", v: "Only A–Z are cased" },
                { k: "Export", v: "Copy or PDF" },
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
            <SectionCard title="Step 1: derive a pattern from the reference" icon="list">
              <p>
                A case pattern is just a sequence of flags: uppercase or
                lowercase. The converter scans the reference text and records
                that sequence for letters. Non-letters like spaces, emojis, and
                punctuation do not carry case, so they are ignored when building
                the pattern. This keeps behavior predictable when your reference
                includes symbols or numbers.
              </p>

              <p className="mt-3">
                The tool intentionally uses a simple definition of a style sample:
                ASCII A–Z. That makes results consistent across devices and
                avoids surprising casing rules for special alphabets. If you
                paste text with accented characters, those characters will pass
                through unchanged, and the pattern will be applied to the A–Z
                letters around them.
              </p>
            </SectionCard>

            <SectionCard title="Step 2: apply the pattern to the target" icon="type">
              <p>
                After the pattern is built, the converter walks through the
                target text and changes the case of each A–Z letter to match the
                next flag in the pattern. Everything else is copied as-is. That
                means your spacing, punctuation, digits, and line breaks remain
                intact, which is important for lists, IDs, filenames, and
                multi-line content.
              </p>

              <p className="mt-3">
                If the target is longer than the reference pattern, the pattern
                repeats from the start. This is a practical choice: it makes the
                rule fully deterministic and avoids an arbitrary a style sample point.
                If you want a non-repeating transformation for a longer target,
                use a longer reference sample so the pattern has more unique
                positions.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Common use cases
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Make product variants match a stylized template name.</li>
                  <li>Apply a a style sample sample to a batch of labels.</li>
                  <li>Generate mock data that looks consistent across rows.</li>
                  <li>Keep codenames or headings visually aligned.</li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Edge cases and expected results" icon="list">
              <p>
                Match-case is intentionally not a grammar tool. It will not
                decide what should be capitalized based on language rules. It
                does not understand words, sentence boundaries, or acronyms. It
                only follows the reference pattern. This is exactly why it is
                useful: you can treat the reference as the a style sample and
                get repeatable output.
              </p>

              <p className="mt-3">
                If the reference contains no A–Z letters, there is no pattern to
                borrow. In that case the output stays the same as the target and
                the tool shows a note. If that happens, add at least one letter
                to the reference (even a short sample like a style sample) to define the
                pattern.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Punctuation stays put
                  </div>
                  <p className="mt-2">
                    Hyphens, underscores, slashes, and numbers are never removed
                    or rearranged. Only letter casing changes.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Multi-line is supported
                  </div>
                  <p className="mt-2">
                    Line breaks in the target are preserved. The pattern applies
                    across lines in a single continuous pass.
                  </p>
                </div>
              </div>
            </SectionCard>


            <SectionCard title="Quality checks you can do in seconds" icon="list">
              <p>
                Because match-case is pattern based, it helps to sanity-check the
                result before you paste it into a destination app. A quick way
                is to look at the first 10 to 20 letters of the output and
                compare them to the reference. If the reference alternates like an alternating pattern, you should see that rhythm immediately in the target.
                If the rhythm drifts, the most common cause is that your
                reference includes very few letters, so the pattern repeats too
                aggressively. Use a longer reference sample to create a longer
                pattern.
              </p>

              <p className="mt-3">
                Another practical check is to scan for places where case matters
                semantically, such as acronyms or product names. Since the tool does not detect words, it may change the casing of those tokens if the reference pattern demands it. When you need exact acronym
                casing, treat match-case as a starting point and manually fix
                those special tokens afterward.
              </p>

              <p className="mt-3">
                Finally, remember that some destination apps modify casing on
                paste, especially on mobile keyboards. If you are preparing text
                for a form field that enforces its own rules, paste the output
                into that field and confirm the final value before you submit.
              </p>
            </SectionCard>
            <SectionCard title="Files, exporting, and privacy" icon="type">
              <p>
                You can paste directly into the editor or upload a file. Text
                formats load immediately. PDF and DOCX uploads use optional
                libraries to extract text locally in your browser. Extraction is
                best-effort, so scanned PDFs or complex layouts may produce
                artifacts like extra spaces.
              </p>

              <p className="mt-3">
                When you are happy with the output, copy it with one click or
                export a PDF. If PDF exporting is not available in your build,
                the page falls back to the browser print dialog so you can still
                save as a PDF.
              </p>

              <div className="mt-4 rounded-3xl bg-slate-900 text-white p-6 sm:p-7 relative overflow-hidden">
                <div aria-hidden="true" className="absolute inset-0 opacity-30">
                  <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
                </div>
                <div className="relative">
                  <div className="text-sm font-semibold text-sky-200">Privacy</div>
                  <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                    Runs locally in your browser
                  </h3>
                  <p className="mt-2 text-slate-100 leading-7">
                    Casing is applied on your device. This tool does not require
                    sending your text to a server. You decide when to copy or
                    export the result.
                  </p>
                </div>
              </div>
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
