export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      {/* Background decoration (subtle, on-brand) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          {/* Hero header */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  How the Word Counter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Live counts based on exactly what’s in the editor right now.
                  Everything runs locally in your browser, with clear rules you
                  can rely on for essays, forms, captions, scripts, and anything
                  that has a limit.
                </p>
              </div>

              {/* Badge stack */}
              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Runs locally
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Live updates
                </span>
              </div>
            </div>

            {/* Quick glance stats tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Words", v: "Split by whitespace" },
                { k: "Characters", v: "Includes spaces + newlines" },
                { k: "Lines", v: "Split by line breaks" },
                { k: "Exports", v: "TXT + PDF (optional)" },
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

          {/* Sections */}
          <div className="mt-10 space-y-6 text-base text-slate-700 leading-7">
            <SectionCard title="What gets counted" icon="list">
              <p>
                This page counts exactly what you see in the editor. If you type,
                paste, delete, undo, redo, upload a file, or convert case, the
                totals update immediately so you always know what you are about
                to submit, copy, or export.
              </p>

              <p className="mt-3">
                Different word counters can disagree because they use different
                rules. Some try to “understand” punctuation or treat certain
                symbols as separators, while others count tokens more literally.
                This tool favors predictable results that stay consistent across
                devices. That consistency is usually what you want when you are
                trying to meet a limit, not argue with a counter.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Word count",
                    "Leading and trailing whitespace is ignored, then the text is split on whitespace (spaces, tabs, and line breaks). Multiple separators behave like one.",
                  ],
                  [
                    "Character count",
                    "Counts every character in the editor, including punctuation, spaces, and line breaks.",
                  ],
                  [
                    "Chars (no spaces)",
                    "Counts characters after removing all whitespace characters (spaces, tabs, and line breaks).",
                  ],
                  [
                    "Spaces",
                    "Counts literal space characters only (the regular spacebar character).",
                  ],
                  [
                    "Lines / sentences / paragraphs",
                    "Lines are split by line breaks. Sentences and paragraphs are practical estimates, not full grammar parsing.",
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
                  Why this matters
                </div>
                <p className="mt-2">
                  If a platform enforces a limit, the safest approach is to
                  measure the exact text you will paste or submit. This tool
                  counts the editor content directly, so what you see is what is
                  being measured. If you copy the editor text, you are copying
                  the same content that was counted.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Word counting rules" icon="type">
              <p>
                Words are counted by treating whitespace as separators. That
                includes spaces, tabs, and line breaks. The tool ignores leading
                and trailing whitespace so accidental blank space does not create
                fake words.
              </p>

              <p className="mt-3">
                This rule is intentionally simple because it stays consistent.
                Messy formatting still produces stable results, even when text
                is pasted from PDFs, emails, or chat apps that insert odd spacing
                and line breaks.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Hyphens and punctuation
                  </div>
                  <p className="mt-2">
                    Hyphenated terms like “real-time” usually count as one word
                    because there is no whitespace inside the token. Punctuation
                    attached to a word is counted as part of that token (for
                    example, “word,” and “word” count as one word each).
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Numbers, codes, emojis
                  </div>
                  <p className="mt-2">
                    Numbers and codes count as words when separated by whitespace
                    (for example, “A12 B34” counts as two words). Emojis and
                    symbols count as words only when they appear as standalone
                    tokens separated by whitespace.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Tip</div>
                <p className="mt-2 text-slate-700">
                  If you must match a specific standard (school rubric,
                  publishing guideline, or a platform that counts differently),
                  paste into the destination too. Some systems normalize
                  whitespace or line breaks during paste, which can change counts.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Character counts, spaces, and lines" icon="list">
              <p>
                Character count includes every character in the editor, including
                spaces and line breaks. This is the stat that matters for strict
                character limits on forms, job applications, social platforms,
                and fields that enforce a maximum length.
              </p>

              <p className="mt-3">
                “Chars (no spaces)” removes all whitespace before counting, which
                helps when you want the content size without formatting. “Spaces”
                counts only normal spaces, because tabs and line breaks are
                sometimes treated differently than a standard space.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Spaces", v: "Counts the standard space character only." },
                  {
                    k: "Tabs",
                    v: "Treated as whitespace for word separation and excluded from chars-no-spaces.",
                  },
                  {
                    k: "Line breaks",
                    v: "Count as characters and also separate lines.",
                  },
                ].map((x) => (
                  <div
                    key={x.k}
                    className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4"
                  >
                    <div className="text-sm font-bold text-slate-900">{x.k}</div>
                    <div className="mt-1 text-slate-700">{x.v}</div>
                  </div>
                ))}
              </div>

              <p className="mt-4">
                Lines are counted by splitting on line breaks. If the editor is
                empty, many editors still show one blank line, so line counts
                often start at 1 for an empty document. Paragraphs are counted as
                blocks of text separated by one or more blank lines. Sentences are
                estimated using sentence-ending punctuation like{" "}
                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-slate-200">
                  .
                </code>
                ,{" "}
                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-slate-200">
                  !
                </code>{" "}
                and{" "}
                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-slate-200">
                  ?
                </code>
                . If you write without punctuation, treat sentence counts as a rough
                estimate.
              </p>
            </SectionCard>

            <SectionCard title="Reading time and speaking time" icon="clock">
              <p>
                Reading time and speaking time are quick planning estimates based
                on word count. They help you sanity-check how long a caption,
                script, or speech might take without needing extra analysis.
              </p>

              <p className="mt-3">
                These numbers are estimates, not guarantees. People read and speak
                at different speeds, and formatting can affect pacing. Use the
                estimates as a starting point, then rehearse if timing matters.
              </p>

              <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                <div className="text-sm font-bold text-slate-900">
                  When it’s most useful
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Short scripts and narration where you need a fast estimate.</li>
                  <li>Presentations where you want to stay inside a time box.</li>
                  <li>Captions and descriptions where length affects readability.</li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Undo, redo, and history" icon="history">
              <p>
                Undo and redo let you step back through recent edits so you can
                experiment without losing work. If you undo and then type new
                text, redo steps are replaced, which matches how most editors work.
              </p>

              <p className="mt-3">
                History is kept for the current session only. If you refresh or
                leave the page, the history resets. This keeps performance and
                memory usage predictable.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Bounded", "History is capped so it stays fast."],
                  ["Branching", "Undo then type replaces redo steps."],
                  ["Session-only", "History resets on refresh or leaving the page."],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4"
                  >
                    <div className="text-sm font-bold text-slate-900">{k}</div>
                    <div className="mt-1 text-slate-700">{v}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Case tools and selection behavior" icon="type">
              <p>
                Case tools help you reformat text instantly. If you highlight a
                portion of the editor, the change applies only to the selected
                text. If nothing is selected, the change applies to the entire
                editor.
              </p>

              <p className="mt-3">
                This makes it easy to clean up headings, fix inconsistent
                capitalization, or format only one section of a longer document
                without touching everything else.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Common workflows
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Convert headings to Title Case or Capitalized Case.</li>
                  <li>Normalize pasted lists using lowercase or Sentence case.</li>
                  <li>Create stylized text for posts using alternating or inverse case.</li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Uploading files for counting" icon="upload">
              <p>
                You can load text from files instead of copying and pasting.
                Plain-text and text-like formats such as TXT, MD, CSV, JSON, HTML,
                and XML can be read directly in your browser and inserted into the
                editor for counting.
              </p>

              <p className="mt-3">
                PDF and DOCX extraction can also work fully in-browser, but results
                depend on how the document was created. Layout-heavy PDFs can
                produce odd spacing or line breaks after extraction. Scanned PDFs
                often contain images rather than real text unless the file already
                includes OCR text.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DependencyCard
                  label="PDF"
                  dep="pdfjs-dist"
                  body="Extracts page text locally. Layout-heavy PDFs can produce spacing artifacts. Scanned PDFs may not contain real text."
                />
                <DependencyCard
                  label="DOCX"
                  dep="mammoth"
                  body="Extracts raw text locally. Formatting is simplified so you can edit and recount easily."
                />
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Important</div>
                <p className="mt-1 text-slate-700">
                  PDF and DOCX support require optional dependencies in your app:{" "}
                  <code className="rounded-md bg-white px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-sky-200/70">
                    pdfjs-dist
                  </code>{" "}
                  and{" "}
                  <code className="rounded-md bg-white px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-sky-200/70">
                    mammoth
                  </code>
                  . For PDF export,{" "}
                  <code className="rounded-md bg-white px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-sky-200/70">
                    jspdf
                  </code>{" "}
                  is optional.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Downloading and exporting" icon="download">
              <p>
                TXT export downloads exactly what is currently in the editor. This
                is useful after cleaning formatting, converting case, or extracting
                text from a file, so you can save a clean version for later.
              </p>

              <p className="mt-3">
                PDF export can run in-browser if PDF export support is enabled. If
                it is not enabled, you can still use your browser’s print dialog,
                where most browsers allow “Save as PDF.” Either way, the exported
                result reflects the exact editor content at the moment you export.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Best practice
                </div>
                <p className="mt-2 text-slate-700">
                  If you extracted text from a PDF, skim the output before exporting.
                  Layout-heavy documents can insert extra spaces or newlines. A quick
                  cleanup pass can prevent surprises when you paste into another system.
                </p>
              </div>
            </SectionCard>

            {/* Privacy: stronger finish */}
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
                  Counts and conversions are computed directly from what’s in the
                  editor. File processing runs locally in your browser when supported.
                  Nothing is uploaded by this page, and session history stays in
                  memory only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------- tiny internal components (no extra deps) ------- */

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: "list" | "clock" | "history" | "type" | "upload" | "download";
  children: React.ReactNode;
}) {
  const Icon = () => {
    const common = "h-5 w-5 text-sky-600";
    switch (icon) {
      case "clock":
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
              d="M12 6v6l4 2"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "history":
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
              d="M3 12a9 9 0 101.8-5.4"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v6h6" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 7v5l3 2"
            />
          </svg>
        );
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
      case "upload":
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
              d="M12 16V4m0 0l-4 4m4-4l4 4"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
          </svg>
        );
      case "download":
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
              d="M12 4v10m0 0l-4-4m4 4l4-4"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
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

function DependencyCard({
  label,
  dep,
  body,
}: {
  label: string;
  dep: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-extrabold text-slate-900">{label}</div>
        <span className="inline-flex items-center rounded-full bg-slate-50 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
          {dep}
        </span>
      </div>
      <p className="mt-3 text-slate-700 leading-7">{body}</p>
    </div>
  );
}
