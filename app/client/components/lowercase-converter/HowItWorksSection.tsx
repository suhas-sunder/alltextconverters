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
                  How the Lowercase Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste text into the editor or upload a file, then convert everything to lowercase with a single click.
                  Lowercasing is a simple operation, but it solves a lot of day-to-day problems: keeping tags consistent,
                  normalizing emails and usernames, cleaning exported data, and reducing mistakes when you are comparing
                  or matching text across tools.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  One-click convert
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs in your browser
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Emails", v: "Normalize addresses" },
                { k: "Tags", v: "Consistent keywords" },
                { k: "Filenames", v: "Avoid mixed casing" },
                { k: "Datasets", v: "Reliable matching" },
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
            <SectionCard title="Lowercase conversion with predictable behavior" icon="list">
              <p>
                This page performs a focused job: it turns letters into their lowercase form while keeping everything
                else as stable as possible. That means punctuation, spacing, line breaks, and symbols remain in the
                same positions. If you paste a multi-line list, a block of notes, or a chunk of JSON, the structure
                stays recognizable and you can copy the result without reformatting.
              </p>

              <p className="mt-3">
                The core workflow is intentionally simple. Add your text to the textarea, click{" "}
                <span className="font-semibold text-slate-900">Convert to lowercase</span>, and the editor updates.
                From there, you can copy the text with the copy button or export it. There is no “project” state and
                no background processing. The tool is designed for quick, repeatable cleanup steps you can trust.
              </p>

              <p className="mt-3">
                Lowercasing is commonly used before other transformations. For example, you might lowercase first,
                then replace spaces with hyphens in a slug tool, or trim whitespace in a cleaner tool. By keeping this
                page single-purpose, the output is easy to reason about: only letter casing changes, and nothing else
                is silently rewritten.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Best for normalization",
                    "Lowercase is a standard baseline for emails, usernames, tags, and search terms where you want consistent comparisons.",
                  ],
                  [
                    "Preserves formatting",
                    "Line breaks and punctuation stay intact, which is important for lists, code-like text, and multi-line content.",
                  ],
                  [
                    "Fast to verify",
                    "Because the change is mechanical, you can scan the result quickly before copying it into a destination app.",
                  ],
                  [
                    "Good for bulk cleanup",
                    "Paste large blocks or upload files, then export a cleaned version for other tools or workflows.",
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
                <div className="text-sm font-bold text-slate-900">What this tool does not do</div>
                <p className="mt-2">
                  This is not a rewriting or “smart formatting” tool. It does not change word order, remove symbols,
                  fix spelling, or apply style-guide rules. If you need slug creation, punctuation cleanup, or
                  whitespace normalization, do those steps separately so you can control each transformation.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Uploads and exports" icon="type">
              <p>
                You can use this tool without uploading anything by simply pasting text into the editor. If your text
                lives in a file, the upload button helps you bring that content into the page quickly. Text formats
                like TXT, CSV, JSON, HTML, XML, and Markdown can be read directly by the browser.
              </p>

              <p className="mt-3">
                PDF and DOCX are a little different because they are not plain text containers. This route supports
                them, but extraction happens locally and relies on optional packages. If those packages are not
                installed in your project build, the page will fall back to a clear message and you can still paste
                text manually. (Optional packages for uploads and exports include:{" "}
                <span className="font-semibold text-slate-900">pdfjs-dist</span> for PDF text extraction,{" "}
                <span className="font-semibold text-slate-900">mammoth</span> for DOCX extraction, and{" "}
                <span className="font-semibold text-slate-900">jspdf</span> for generating PDFs.)
              </p>

              <p className="mt-3">
                Export options are meant to be practical. If you need a lightweight artifact, download as TXT and you
                will get exactly what you see in the editor. If you need a shareable document, download as PDF. PDF
                export is useful for sending cleaned copy to someone else, attaching content to a ticket, or saving a
                version you can reference later without worrying about a destination app changing casing on paste.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">When to upload</div>
                  <p className="mt-2">
                    Upload is best when the text is already in a file and you want to avoid copy-paste steps. For
                    anything sensitive, you can skip upload entirely and paste only what you want to convert.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">When to export</div>
                  <p className="mt-2">
                    Export is best when you want a durable output you can reuse. TXT is ideal for pipelines and tools.
                    PDF is ideal for sharing, archiving, or printing.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Practical warning</div>
                <p className="mt-2 text-slate-700">
                  Some destinations auto-capitalize on paste (especially on mobile) or transform quotes and spacing.
                  Use this converter to create a clean baseline, then paste into the destination and verify the final
                  value before you publish or submit.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Locale edge cases and when not to lowercase" icon="type">
              <p>
                Lowercasing is usually straightforward, but a few languages have special casing rules. The classic
                example is Turkish dotted and dotless “I”, where a naive lowercase can produce unexpected characters.
                If you are working with names, titles, or content that must follow a specific locale, you should use
                locale-aware casing (or keep the original casing) and verify the result in context.
              </p>

              <p className="mt-3">
                There are also situations where lowercasing is the wrong choice. If a string is case-sensitive, the
                case is part of its meaning. Examples include passwords, some API keys, and certain identifiers where
                uppercase and lowercase represent different values. In those cases, do not normalize unless you are
                certain the destination is case-insensitive.
              </p>

              <p className="mt-3">
                Brand names are another common pitfall. Lowercasing “iPhone” or “YouTube” might be acceptable for
                internal tags, but not for customer-facing copy. A good rule: lowercase for internal consistency and
                searching; preserve casing for display text where the original styling matters.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Common safe uses</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Normalize emails, usernames, tags, and keywords for consistent matching.</li>
                  <li>Prepare file paths or slugs (lowercase first, then apply hyphens in a dedicated tool).</li>
                  <li>Clean exported data where inconsistent casing causes duplicate-looking values.</li>
                  <li>Standardize internal labels, categories, and search filters.</li>
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
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">Your text stays on your device</h3>
                <p className="mt-2 text-slate-100 leading-7">
                  The conversion is computed from the editor value in your browser. This page is designed to work
                  without sending your text to a server. You decide when to copy or export, and you can clear the
                  editor at any time when you are done.
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
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
