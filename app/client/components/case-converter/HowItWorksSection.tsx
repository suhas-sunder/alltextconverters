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
                  How the Case Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste text, choose a case style, and copy the result. The
                  output updates immediately as you type and as you switch
                  modes, so you can iterate quickly on headings, captions,
                  forms, filenames, slugs, labels, and any workflow where
                  consistent casing matters.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Instant preview
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  No upload step
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Uppercase", v: "Shouting, labels, codes" },
                { k: "Lowercase", v: "Normalization, emails" },
                { k: "Title Case", v: "Headings, titles" },
                { k: "Sentence case", v: "Readable paragraphs" },
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
              title="Immediate output, predictable rules"
              icon="list"
            >
              <p>
                The output is derived directly from the current textarea value
                and the selected case mode. There is no separate “convert” step,
                no waiting, and no background processing. If you paste new text,
                edit one word, or switch from Uppercase to Title Case, the
                result updates immediately. That makes this page useful for
                quick cleanup jobs where you want to see the final formatting
                before you copy it into a destination system.
              </p>

              <p className="mt-3">
                The converter changes letter casing while keeping everything
                else stable. Whitespace, line breaks, punctuation, and symbols
                are preserved so your formatting stays recognizable. This
                matters for lists, multi-line captions, code snippets,
                addresses, and anything where line breaks and spacing are part
                of the content you intend to paste.
              </p>

              <p className="mt-3">
                If you are converting text for a strict form field, the safest
                approach is still to copy the output and paste it into the
                destination field to confirm that the destination does not apply
                its own rules on paste (such as auto-capitalization, smart
                quotes, or whitespace collapsing). This tool gives you a
                consistent baseline, but the destination always has the final
                say.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Uppercase / Lowercase",
                    "Turns letters into all caps or all lowercase without changing spacing or punctuation. Useful for labels, product codes, or normalization steps.",
                  ],
                  [
                    "Title Case",
                    "Capitalizes the first letter of each word-like token. Designed for headings and titles where you want consistent capitalization quickly.",
                  ],
                  [
                    "Sentence case",
                    "Lowercases the text, then capitalizes the first letter at the start and after common sentence endings like . ! ? This aims for readability, not grammar parsing.",
                  ],
                  [
                    "Alternating case",
                    "Alternates casing across letters and numbers while leaving punctuation and whitespace unchanged. Handy for stylized text or quick visual emphasis.",
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
                  This is a case converter, not a rewrite tool. It does not
                  change word order, remove punctuation, “fix” spelling, or
                  apply writing style rules. It focuses on fast, predictable
                  casing so you can paste clean text into wherever you are
                  working.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Mode details and common edge cases" icon="type">
              <p>
                Case conversion looks simple until you run into real-world text:
                acronyms, product names, mixed punctuation, and all-caps
                phrases. The goal here is practical consistency, not perfect
                language rules. These guidelines explain what you should expect
                so you can choose the mode that fits your job.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Uppercase</span>{" "}
                is best for short labels, headings that need strong emphasis,
                and identifiers like “SKU”, “ID”, or “API”. It is also useful
                when a destination system is case-sensitive and you want to
                normalize input before submission.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Lowercase</span>{" "}
                is helpful for normalization, especially for emails, tags,
                search terms, and filenames where you want consistency. If you
                are preparing a slug or a URL path, lowercase is usually the
                first step before you replace spaces with hyphens or remove
                symbols in a separate tool.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Title Case</span>{" "}
                is intended for headings and titles. It capitalizes each
                word-like token so “project update notes” becomes “Project
                Update Notes”. For strict editorial standards (like specialized
                “small words” rules), you may still need a final manual pass.
                This converter optimizes for speed and consistency rather than
                style-guide nuance.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Sentence case
                </span>{" "}
                makes blocks of text more readable by lowercasing and then
                capitalizing at likely sentence starts. It works well for
                captions, descriptions, and multi-sentence paragraphs. It is
                heuristic-based, so abbreviations and unusual punctuation can
                produce results that you might want to adjust manually.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Alternating case
                </span>{" "}
                is stylistic. It alternates across letters and numbers while
                leaving whitespace and punctuation untouched. If you paste text
                that already contains mixed case, alternating mode creates a
                consistent pattern across the entire content.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Acronyms and brand names
                  </div>
                  <p className="mt-2">
                    Title Case and Sentence case can change acronyms (for
                    example, “NASA”) or stylized brands (for example, “iPhone”).
                    If preserving exact brand casing is required, convert first,
                    then manually restore the parts that must remain exact.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Punctuation and spacing
                  </div>
                  <p className="mt-2">
                    This converter preserves punctuation and whitespace. That
                    means your lists, hyphenation, and line breaks remain in
                    place. If you need additional cleanup like trimming extra
                    spaces or removing blank lines, do that in a dedicated
                    cleaner tool after case conversion.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Quick tip
                </div>
                <p className="mt-2 text-slate-700">
                  If a destination app auto-capitalizes (especially on mobile),
                  paste your final output into the destination and verify before
                  you submit. Use this tool to get close fast, then let the
                  destination validation be the final check.
                </p>
              </div>
            </SectionCard>

            <SectionCard
              title="Use the hub links for a focused single-purpose page"
              icon="type"
            >
              <p>
                This page is the hub: you paste once, try multiple modes, and
                copy what you want. Under the editor, you can jump to a
                dedicated page for a single conversion mode (Uppercase,
                Lowercase, Title Case, Sentence case, or Alternating case).
                Those focused pages are useful when you want a bookmarkable tool
                with fewer controls and fewer decisions.
              </p>

              <p className="mt-3">
                In practice, hub plus focused pages covers most workflows. Use
                the hub when you are deciding which case style looks best. Use a
                dedicated page when you already know what you need and want a
                repeatable one-click pattern for daily tasks.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Common utility workflows
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    Convert product titles to Title Case, then quickly copy into
                    a catalog system.
                  </li>
                  <li>
                    Normalize tags or keywords to lowercase for consistency.
                  </li>
                  <li>
                    Turn a heading into uppercase for a label or section
                    divider.
                  </li>
                  <li>
                    Convert pasted notes into sentence case for cleaner
                    readability.
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
                <div className="text-sm font-semibold text-sky-200">
                  Privacy
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your text stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Conversions are computed from the editor value in your
                  browser. This page does not upload your text or store it on
                  the server. Copy is explicit: you choose when to copy the
                  output and paste it elsewhere.
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
