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
                  How the Text Case Checker Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page labels the casing style of your text without changing it.
                  Paste content into the editor (or upload a file), and the checker
                  summarizes what it sees: uppercase, lowercase, mixed case, title-like,
                  or sentence-like. The goal is fast clarity when you inherit unknown
                  copy or you need to confirm formatting rules before you publish, export,
                  or normalize data elsewhere.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Local analysis
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  No conversion
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { k: "Uppercase", v: "ALL CAPS headings" },
                { k: "Lowercase", v: "emails, tags, slugs" },
                { k: "Mixed", v: "brands, code, names" },
                { k: "Title-like", v: "Headings and titles" },
                { k: "Sentence-like", v: "Readable paragraphs" },
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
            <SectionCard title="What the checker measures" icon="list">
              <p>
                “Case” sounds simple, but real text contains punctuation, whitespace,
                digits, emojis, and symbols. This checker focuses on a predictable subset:
                it looks at A–Z letters and evaluates how those letters are capitalized.
                Everything else is treated as context. That keeps the result stable across
                different kinds of content like product lists, CSV exports, filenames,
                headings, notes, and code snippets.
              </p>

              <p className="mt-3">
                The label is based on a few straightforward counts: how many letters are
                uppercase, how many are lowercase, and whether common patterns show up.
                For example, if every detected letter is uppercase, the label is Uppercase.
                If every detected letter is lowercase, the label is Lowercase. When both
                appear, the checker tries two additional “shape” tests before falling back
                to Mixed.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Title-like test",
                    "Splits text into word-like tokens and checks whether most tokens look like “Title” words: first letter uppercase and remaining letters lowercase. This is intentionally simple and does not apply style guides.",
                  ],
                  [
                    "Sentence-like test",
                    "Looks for sentence starts at the beginning of the text and after . ! ? and checks whether the first letter after those boundaries is usually uppercase, while the rest of the letters lean lowercase.",
                  ],
                  [
                    "Mixed fallback",
                    "If the text contains uppercase and lowercase letters but does not consistently match the title-like or sentence-like tests, the label is Mixed. This is common for brand names and technical text.",
                  ],
                  [
                    "No letters",
                    "If the text has no A–Z letters (numbers only, symbols only, or whitespace), the checker returns “No letters” so you do not get a misleading result.",
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
                  What this tool does not do
                </div>
                <p className="mt-2">
                  This page does not convert text, fix grammar, rewrite content, or enforce
                  a style guide. It also does not try to preserve special casing like
                  “iPhone”, “eBay”, or “LaTeX”. If your job depends on editorial rules or
                  brand naming, use the checker to understand what you currently have, then
                  decide how you want to normalize it with a separate tool or a manual pass.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Understanding the five labels" icon="type">
              <p>
                The labels are meant to be practical. They help you answer questions like:
                “Is this data already normalized?”, “Did a system shout-case all my headings?”,
                or “Are my titles inconsistent?”. Below is what each label typically means
                and when you should trust it.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Uppercase</span> means the
                letters in your text are all caps. This shows up in headings, labels, part
                numbers, and some legacy systems that store values in all caps. If you see
                Uppercase on longer paragraphs, it is often a sign that something upstream
                transformed text for emphasis.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Lowercase</span> is common
                in normalization workflows: emails, tags, search keywords, filenames, and
                URL pieces. It is also common when text comes from systems that force
                lowercase for consistency. If you plan to build slugs, Lowercase is usually
                a first step before replacing spaces or removing symbols in another tool.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Title-like</span> indicates
                that most words follow a simple title pattern: “Firstletter Restlower”.
                This is useful for quickly spotting whether headings were formatted in a
                consistent way. It does not apply nuanced rules about “small words” like
                “and” or “of”. It also cannot guess whether an acronym should remain “NASA”.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Sentence-like</span> suggests
                your text looks like sentences: likely sentence starts are capitalized, and
                the rest is mostly lowercase. This is a heuristic that works well for
                standard punctuation. If your content uses unusual punctuation, abbreviations,
                or ellipses, you may see Mixed even if the writing looks normal.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Mixed</span> is a broad bucket.
                It can be true mixed casing (like “eBay Store ID”), it can be technical text
                (like “getUserById”), or it can be a combination of sentences and headings in
                the same paste. Mixed is not “bad”. It just means the text does not match a
                uniform case style.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Why per-line labels help
                  </div>
                  <p className="mt-2">
                    A single overall label can hide structure. Many real inputs are lists:
                    one item per line. The optional per-line view lets you see whether some
                    lines are all caps while others are sentence-like, which is a common
                    symptom of copying from a spreadsheet or merging sources.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Invisible characters
                  </div>
                  <p className="mt-2">
                    Zero-width characters can sneak into text from copy-paste or rich editors.
                    For analysis, the checker ignores common zero-width characters so casing
                    counts stay meaningful. Your displayed text is not modified.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Workflow tip
                </div>
                <p className="mt-2 text-slate-700">
                  Use this page first when you are unsure what normalization you need. After
                  you identify the current style, switch to a dedicated converter (uppercase,
                  lowercase, title case, or sentence case) only if you actually need a change.
                  This avoids accidental conversions that break product names, acronyms, or code.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Upload, copy, and export" icon="list">
              <p>
                The editor supports pasted text and local file uploads. For text files, the
                browser reads the content directly. For PDFs and DOCX documents, extraction
                happens in your browser and depends on optional libraries. When a PDF is
                converted to raw text, the result may include layout artifacts like extra
                spaces or missing line breaks. That is normal for PDF extraction and does not
                affect the basic casing counts in most situations.
              </p>

              <p className="mt-3">
                The Copy button copies a plain-text report that includes the overall label,
                the reasoning line, and a small per-line sample. The PDF download exports the
                same report so you can attach it to a ticket, share it with a teammate, or
                keep it with a dataset audit. If PDF export is not available in your build,
                the fallback is the print dialog where you can save as PDF.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Good use cases
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Confirm whether headings in a document are consistently formatted.</li>
                  <li>Audit imported CSV columns for normalization (tags, codes, labels).</li>
                  <li>Spot accidental all-caps conversions caused by a CMS or editor.</li>
                  <li>Check if a list of items mixes title-like and sentence-like patterns.</li>
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
                  Detection runs in your browser from the current editor value. This page
                  does not upload your text or store it on the server. Upload is optional and
                  local: files are read by your browser so you can paste, check, copy a report,
                  and move on.
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
