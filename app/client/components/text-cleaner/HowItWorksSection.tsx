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
                  How the Text Cleaner Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Text looks simple until it breaks a form submission, a search
                  query, a diff, or a paste into a CMS. This page is a small
                  “normalizer” that applies a short, deterministic set of cleanup
                  rules and then tells you exactly what changed.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  One-click cleanup
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Shows applied steps
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Trim", v: "Remove outer whitespace" },
                { k: "Line endings", v: "Normalize to LF" },
                { k: "Spaces", v: "Collapse repeated runs" },
                { k: "Zero-width", v: "Remove invisible chars" },
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
            <SectionCard title="What “clean text” means here" icon="list">
              <p>
                A lot of tools promise to “clean” text but actually rewrite it.
                This one is intentionally boring. It does not paraphrase. It does
                not correct grammar. It does not change punctuation style. It
                simply makes the underlying characters more predictable so your
                text behaves the same across browsers, editors, and platforms.
              </p>

              <p className="mt-3">
                The clean action runs four operations in a fixed order. First it
                removes common invisible characters that can sneak in during
                copy and paste. Next it normalizes line endings so the text uses
                a consistent newline representation. Then it collapses repeated
                spaces and tabs into single spaces (newlines are preserved). Last
                it trims leading and trailing whitespace for the whole block.
                If an operation does not change anything, it is omitted from the
                “Applied operations” list so you can see what actually mattered.
              </p>

              <p className="mt-3">
                The goal is practical: if you paste content into a form field,
                a spreadsheet, a slug generator, a search bar, or a git commit
                message, you want it to look the same and compare cleanly.
                Normalization reduces surprises, especially when text is copied
                from PDFs, chat apps, word processors, and sites that insert
                hidden formatting markers.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  When this tool is useful
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Preparing text for web forms that reject stray whitespace.</li>
                  <li>Cleaning pasted notes that contain odd spacing or invisible characters.</li>
                  <li>Normalizing multiline content before comparing versions or diffs.</li>
                  <li>Making imported text consistent before running other converters.</li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="The four operations and their edge cases" icon="type">
              <p>
                Each rule is deterministic. That means the same input always
                produces the same output, with no language logic and no “smart”
                guesses. This is important if you are cleaning text as part of a
                repeatable workflow.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Remove zero-width characters</span>{" "}
                targets a small set of invisible Unicode characters that often
                appear after copying from rich text sources. They can make a
                string look identical on screen while still failing equality
                checks, breaking search matches, or producing odd cursor behavior
                in editors. Removing them is typically safe for general-purpose
                text. If you work with specialized scripts or deliberate
                zero-width formatting, you may want to skip this step, but most
                everyday workflows benefit from stripping these artifacts.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Normalize line endings</span>{" "}
                converts Windows-style CRLF and old Mac-style CR into a single
                LF format. Many tools treat different line endings as different
                characters, which can create messy diffs and inconsistent
                wrapping. Normalizing makes multiline text easier to handle and
                more portable. The cleaner preserves the number of lines and
                does not reflow paragraphs, it only unifies how line breaks are
                encoded.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Collapse repeated spaces</span>{" "}
                turns runs of two or more spaces (or tabs) into a single space.
                This helps when content is aligned visually using spaces, but you
                need the data to behave consistently in a field, a CSV, or a
                search query. If you have content where spacing is meaningful,
                such as ASCII art or carefully aligned tables, use the toggle
                to keep repeated spaces so the cleaner only performs the other
                operations.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Trim leading and trailing whitespace</span>{" "}
                removes extra whitespace at the start and end of the entire text
                block. This is the small fix that prevents many “why does my
                input not match” issues. Trimming does not remove intentional
                indentation inside the text. It only removes whitespace outside
                the content boundary.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    What the cleaner will not do
                  </div>
                  <p className="mt-2">
                    It does not fix spelling, change capitalization, replace
                    punctuation, or “beautify” writing. If you need formatting
                    like Title Case, Sentence case, or trimming blank lines,
                    use a dedicated tool for that job.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Why the steps are listed
                  </div>
                  <p className="mt-2">
                    When you clean text, trust matters. The “Applied operations”
                    panel shows what changed and includes counts when possible,
                    so you can confirm the cleaner did what you expected.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Uploads, downloads, and privacy" icon="list">
              <p>
                You can paste text directly, or you can load a file. Text-like
                formats such as TXT and CSV are read in your browser using the
                FileReader API. PDF and DOCX extraction can also work, but they
                rely on optional libraries in your app build. If those libraries
                are not present, you can still use the tool by copying text out
                of the document and pasting it into the editor.
              </p>

              <p className="mt-3">
                After cleaning, you can copy the result or download it as a
                simple PDF. PDF export uses an optional library, and if it is not
                available the page falls back to the browser print dialog so you
                can save to PDF. This keeps the route lightweight while still
                giving users a reliable way to export.
              </p>

              <p className="mt-3">
                Privacy is straightforward. The cleaning logic runs on the text
                currently in the editor, inside your browser. This page is not a
                rewrite service and it does not need a server-side pipeline to
                work. You decide what to copy and where to paste it next.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Practical tip</div>
                <p className="mt-2 text-slate-700">
                  If a destination app applies its own formatting on paste, clean
                  your text first, then paste and verify. Some apps collapse
                  whitespace, auto-replace quotes, or trim trailing newlines.
                  Cleaning gives you a predictable baseline before the destination
                  adds its own rules.
                </p>
              </div>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">Local processing</div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Cleaned text stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  The cleanup runs in your browser from the characters in the
                  editor. Uploading reads the file locally, and extraction (when
                  available) happens on-device. This tool is designed for quick,
                  predictable normalization rather than content rewriting.
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
