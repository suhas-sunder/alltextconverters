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
                  How the Whitespace Cleaner Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Hidden whitespace and invisible Unicode characters can break
                  passwords, form submissions, JSON payloads, spreadsheets, and
                  copy-paste workflows. This page removes the most common
                  offenders in one click and shows exactly what was changed,
                  so you can paste confidently into your destination system.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Counts and transparency
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Deterministic rules
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Tabs", v: "Replace with spaces" },
                { k: "NBSP", v: "Normalize to space" },
                { k: "Zero-width", v: "Remove entirely" },
                { k: "Invisible", v: "Strip common troublemakers" },
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
            <SectionCard title="What this cleaner changes" icon="list">
              <p>
                The goal of a whitespace cleaner is not to rewrite your text.
                It is to remove characters that are difficult to see and hard to
                diagnose. Many apps display these characters as ordinary spaces,
                or do not display them at all. When that happens, you can end up
                with a value that looks correct but fails validation, compares
                unequal, or produces unexpected parsing results.
              </p>

              <p className="mt-3">
                This tool focuses on a practical set of common problems:
                tabs, non-breaking spaces, and a small group of invisible Unicode
                characters that frequently appear when content is copied from
                PDFs, web pages, chat apps, and rich-text editors. The rules are
                intentionally simple. There is no attempt to infer language,
                fix grammar, or guess the formatting you intended.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Tabs",
                    "Tabs can be interpreted differently across systems. This tool replaces one or more tab characters with a single space so words do not merge.",
                  ],
                  [
                    "Non-breaking spaces (NBSP)",
                    "NBSP looks like a normal space but behaves differently in HTML and some processors. This tool converts it to a regular space.",
                  ],
                  [
                    "Zero-width characters",
                    "Zero-width space, joiners, and BOM markers are removed because they often cause false mismatches in usernames, tokens, and copied strings.",
                  ],
                  [
                    "Other invisible characters",
                    "Soft hyphen and certain separators can be invisible in some renderers while still affecting search and parsing. This tool removes a practical subset.",
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
                  This cleaner does not collapse repeated spaces, trim lines, or
                  reflow paragraphs. If you need formatting normalization, use a
                  dedicated text cleaner that targets spacing and line endings.
                  This page is about removing hidden characters that behave like
                  landmines in strict fields and automated pipelines.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="How the detection works" icon="type">
              <p>
                The cleaner scans your current textarea value and applies a
                deterministic set of replacements and removals. It does not
                upload your text, and it does not use any AI logic. Everything
                is computed directly from the characters currently in the editor.
              </p>

              <p className="mt-3">
                After you click Clean whitespace, the page reports counts for
                each category. Those counts are important because they make the
                cleanup auditable. If a destination field is still rejecting your
                value, you can confirm whether the cleaner actually changed
                anything, and you can decide whether the remaining issue is
                spacing, punctuation, or a destination-specific rule.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Why tabs are replaced, not deleted
                  </div>
                  <p className="mt-2">
                    Tabs often act as separators. Deleting them can merge words,
                    IDs, or columns in a way that is hard to notice. Replacing
                    consecutive tabs with one space keeps token boundaries
                    visible while removing tab-specific behavior.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Why NBSP is risky
                  </div>
                  <p className="mt-2">
                    NBSP is common when copying from websites. Some validators
                    treat it as a distinct character. That means two strings that
                    look identical on screen can compare unequal. Converting it
                    to a regular space restores predictable behavior.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Common situations where this helps
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    Password resets, API keys, or tokens that fail because a
                    zero-width character slipped in during copy-paste.
                  </li>
                  <li>
                    CSV or spreadsheet imports where tab characters create
                    unexpected columns or misaligned data.
                  </li>
                  <li>
                    HTML or CMS fields where NBSP prevents normal wrapping or
                    causes unexpected spacing.
                  </li>
                  <li>
                    JSON or configuration values that parse incorrectly due to
                    invisible separators.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Edge cases and practical tips" icon="list">
              <p>
                Invisible characters are notorious because they are subtle and
                inconsistent across platforms. A value copied from a PDF might
                contain hidden markers that do not appear when you paste into a
                basic editor. A chat app might insert a zero-width joiner around
                emojis. A website might use NBSP to keep two words from splitting.
                Cleaning these characters is usually safe, but it can change
                meaning in a few niche cases.
              </p>

              

              <p className="mt-3">
                The removed-character counts can also help you spot patterns.
                If you repeatedly see non-breaking spaces in copied headings,
                the source is likely a web page or a rich-text editor. If you
                see zero-width characters often, the source may be a messaging
                app or a PDF copy layer. Knowing the source helps you prevent
                the problem earlier in your workflow.
              </p>
<p className="mt-3">
                If you are cleaning source code, be aware that tabs can be used
                intentionally for indentation. Replacing tabs with spaces can
                be desirable, but it can also change the visual alignment in some
                editors. For code formatting, you may prefer to run a language
                formatter after cleaning. For human-readable documents, the
                space replacement is typically what you want.
              </p>

              <p className="mt-3">
                If you are preparing content for URLs or slugs, whitespace
                cleaning is only the first step. You will usually follow it with
                lowercasing and symbol normalization in separate tools. The key
                idea is to remove invisible characters first, because they can
                break later steps in ways that are hard to debug.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Quick checklist
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Click Clean whitespace and confirm the counts changed.</li>
                  <li>Copy the cleaned result and paste into the destination field.</li>
                  <li>
                    If the destination still rejects the value, look for rules
                    unrelated to hidden whitespace (length limits, allowed
                    symbols, required prefixes).
                  </li>
                  <li>
                    When uploading a PDF or DOCX, expect minor layout artifacts
                    in extracted text. Cleaning removes hidden characters, not
                    content-level formatting.
                  </li>
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
                  Cleaning is performed in your browser from the current editor
                  value. This page does not send your text to a server. Upload
                  is only used to read a file locally, extract text, and place
                  it into the editor. You choose when to copy the result or
                  download a PDF.
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
