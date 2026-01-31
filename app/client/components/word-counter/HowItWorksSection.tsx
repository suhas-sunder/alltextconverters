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
                  Real-time counts from the exact editor text. Local-only
                  processing. Predictable rules you can rely on for essays,
                  forms, captions, scripts, and any workflow with limits.
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
                { k: "Words", v: "Whitespace tokens" },
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
                The totals on this page come from the text you can see inside
                the editor. The stats are computed by calling{" "}
                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-slate-200">
                  getWordCounterStats(input)
                </code>{" "}
                and then rendering the returned values. If you paste new text,
                upload a file, undo, redo, or apply a case conversion, the input
                changes and the stats update immediately.
              </p>

              <p className="mt-3">
                Word counters can disagree across tools because they use
                different tokenization rules. This tool focuses on predictable,
                consistent rules that behave the same way on every device. That
                makes it suitable for word limits, character limits, and quick
                validation before submitting a form or a writing assignment.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Word count",
                    "Trim + split on whitespace (spaces, tabs, and line breaks). Multiple spaces behave like a single separator.",
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
                    "Counts literal space characters only (the normal spacebar character).",
                  ],
                  [
                    "Lines / sentences / paragraphs",
                    "Derived counts and practical estimates. Sentences and paragraphs are heuristics, not grammar parsing.",
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
                  If a platform enforces limits, you usually need the count that
                  matches what you will paste into the platform. This tool
                  measures exactly what is in the editor, so you can copy the
                  text and expect the same content to be used for the final
                  submission.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Word counting rules" icon="type">
              <p>
                Words are counted by treating whitespace as separators.
                Whitespace includes spaces, tabs, and line breaks. Before
                counting, the tool trims leading and trailing whitespace so
                accidental blank space does not create fake words.
              </p>

              <p className="mt-3">
                This approach matches how many text inputs behave and it avoids
                “guessing intent.” It also means that unusual formatting still
                produces consistent results, even when there are multiple
                spaces, mixed tabs, or pasted text with messy line breaks.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Hyphens and punctuation
                  </div>
                  <p className="mt-2">
                    Hyphenated terms like “real-time” usually count as one word
                    because there is no whitespace inside the token. Punctuation
                    attached to a word is still part of the same token (for
                    example, “word,” and “word” will count as one word each).
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Numbers, codes, emojis
                  </div>
                  <p className="mt-2">
                    Numbers and codes count as words when separated by
                    whitespace (for example, “A12 B34” counts as two words).
                    Emojis and symbols count as words only when they appear as
                    standalone tokens separated by whitespace.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Tip</div>
                <p className="mt-2 text-slate-700">
                  If you need to match a specific standard (like a school rubric
                  or a publishing guideline), paste the text into the
                  destination system too. Different systems may treat special
                  characters or punctuation differently, especially around line
                  breaks and copy-paste normalization.
                </p>
              </div>
            </SectionCard>

            <SectionCard
              title="Character counts, spaces, and lines"
              icon="list"
            >
              <p>
                Character count includes every character in the editor,
                including spaces and line breaks. This is the number that
                matters for strict character limits on forms, social platforms,
                job applications, and fields that enforce a maximum length.
              </p>

              <p className="mt-3">
                The “Chars (no spaces)” stat removes all whitespace before
                counting, which is useful when you want the size of the content
                itself without formatting. The “Spaces” stat counts literal
                spaces only, because some systems treat tabs and line breaks
                differently from normal spaces.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    k: "Spaces",
                    v: "Counts the standard space character only.",
                  },
                  {
                    k: "Tabs",
                    v: "Tabs are treated as whitespace separators for words, and as whitespace for chars-no-spaces.",
                  },
                  {
                    k: "Line breaks",
                    v: "Line breaks count as characters and also separate lines.",
                  },
                ].map((x) => (
                  <div
                    key={x.k}
                    className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4"
                  >
                    <div className="text-sm font-bold text-slate-900">
                      {x.k}
                    </div>
                    <div className="mt-1 text-slate-700">{x.v}</div>
                  </div>
                ))}
              </div>

              <p className="mt-4">
                Lines are counted by splitting on line breaks. If the editor is
                empty, many editors still show one blank line, so line counts
                often start at 1 for an empty document. Paragraphs are counted
                as blocks of text separated by one or more blank lines.
                Sentences are estimated using sentence-ending punctuation like{" "}
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
                . If you write without punctuation, sentence counts are best
                treated as a rough estimate.
              </p>
            </SectionCard>

            <SectionCard title="Reading time and speaking time" icon="clock">
              <p>
                Reading time and speaking time are quick planning estimates
                derived from word count. They help you predict how long a
                caption, script, or speech might take without doing heavy
                analysis.
              </p>

              <p className="mt-3">
                The UI rounds up with{" "}
                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-slate-200">
                  Math.ceil
                </code>
                , so partial minutes display as the next whole minute once you
                have any words. If you need a more precise timing (for example,
                a recorded voiceover), treat this as a starting point and
                rehearse with your actual pacing.
              </p>

              <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                <div className="text-sm font-bold text-slate-900">
                  When it’s most useful
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    Short scripts and narration where you need a fast time
                    estimate.
                  </li>
                  <li>
                    Presentations where you want to stay inside a time box.
                  </li>
                  <li>
                    Captions and descriptions where length can affect
                    readability.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Undo, redo, and history" icon="history">
              <p>
                Undo and redo use an in-memory history of recent editor states.
                Changes are captured on a short delay (about 250ms) so the
                history stays useful instead of recording every single
                keystroke.
              </p>

              <p className="mt-3">
                History is capped at 200 entries to keep memory predictable. If
                you undo and then type new text, redo states are dropped, which
                matches common editor behavior. History exists only for the
                current session and resets when you refresh or leave the page.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Bounded", "History is capped at 200 states."],
                  ["Branching", "Undo then type drops redo states."],
                  [
                    "Session-only",
                    "History resets on refresh or leaving the page.",
                  ],
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
                Case tools let you convert text instantly. If you highlight a
                portion of the editor, the conversion applies only to the
                selected text. If nothing is selected, the conversion applies to
                the full editor content.
              </p>

              <p className="mt-3">
                The tool preserves your selection even when you interact with
                controls, so your highlight survives dropdown clicks. This makes
                it practical for cleaning headings, fixing inconsistent
                capitalization, or formatting only one section of a longer
                document.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Common workflows
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Convert headings to Title Case or Capitalized Case.</li>
                  <li>
                    Normalize pasted lists using lowercase or Sentence case.
                  </li>
                  <li>
                    Create stylized text for social posts using alternating or
                    inverse case.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Uploading files for counting" icon="upload">
              <p>
                You can load text from files instead of copying and pasting.
                Text-like files such as TXT, MD, CSV, JSON, HTML, and XML are
                read directly in the browser using{" "}
                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-slate-200">
                  FileReader
                </code>
                .
              </p>

              <p className="mt-3">
                PDF and DOCX extraction can also work fully in-browser, but it
                requires optional dependencies in your app. Extraction quality
                depends on how the document was created. Some PDFs store text as
                positioned fragments, so spacing may look odd after extraction.
                Scanned PDFs often contain images rather than real text unless
                the file includes OCR.
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
                <div className="text-sm font-bold text-slate-900">
                  Important
                </div>
                <p className="mt-1 text-slate-700">
                  PDF and DOCX support require optional dependencies in your
                  app:{" "}
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
                TXT export downloads exactly what is currently in the editor.
                This is useful if you cleaned formatting, changed case, or
                extracted text from a file and want to save the cleaned version
                for later.
              </p>

              <p className="mt-3">
                PDF export is attempted in-browser if{" "}
                <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.95em] text-slate-800 ring-1 ring-slate-200">
                  jspdf
                </code>{" "}
                is available. If not, the tool falls back to your browser’s
                print dialog, where most browsers allow “Save as PDF.” Either
                way, the exported result reflects the exact editor content at
                the moment you export.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Best practice
                </div>
                <p className="mt-2 text-slate-700">
                  If you extracted text from a PDF, skim the output before
                  exporting. Layout-heavy PDFs can insert extra spaces or
                  newlines, and you may want to run Trim &amp; Clean before
                  saving.
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
                <div className="text-sm font-semibold text-sky-200">
                  Privacy
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your text stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Counts and conversions are computed from the editor value.
                  File processing runs locally in your browser when supported.
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
