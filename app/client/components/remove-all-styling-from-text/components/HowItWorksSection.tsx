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
                  How Removing Styling From Text Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page is intentionally direct: one editor, one cleanup
                  action. Paste or upload text, choose the options that match
                  your goal, click{" "}
                  <span className="font-semibold">Remove styling</span>, then
                  copy or export the result. It does not rewrite your message,
                  fix grammar, or change tone. It removes formatting and markup
                  so your content becomes plain text that behaves consistently
                  across apps, forms, docs, and ticketing systems.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Plain text output
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Single textarea
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "EMAIL", v: "Paste from Gmail or Outlook" },
                { k: "DOCS", v: "Clean up copied docs" },
                { k: "CMS", v: "Strip editor HTML" },
                { k: "NOTES", v: "Keep content only" },
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
            <SectionCard title="What the tool removes" icon="scissors">
              <p>
                When you copy text from a rich editor, the clipboard often
                includes HTML or other formatting metadata. That metadata can
                carry fonts, sizes, colors, spacing rules, and layout wrappers.
                In many destinations, that formatting “wins” over the local
                styles, so pasted text looks wrong and requires manual cleanup.
                This converter strips styling and markup so only readable text
                remains.
              </p>

              <p className="mt-3">
                Concretely, the cleanup process ignores container tags and
                removes styling attributes. Elements like{" "}
                <span className="font-semibold text-slate-900">
                  &lt;span&gt;
                </span>
                ,{" "}
                <span className="font-semibold text-slate-900">
                  &lt;div&gt;
                </span>
                , and{" "}
                <span className="font-semibold text-slate-900">
                  &lt;font&gt;
                </span>{" "}
                are treated as structure, not content. Attributes such as{" "}
                <span className="font-semibold text-slate-900">style</span>,{" "}
                <span className="font-semibold text-slate-900">class</span>, and{" "}
                <span className="font-semibold text-slate-900">id</span> are
                discarded because they exist to control appearance. Non content
                blocks like{" "}
                <span className="font-semibold text-slate-900">
                  &lt;script&gt;
                </span>{" "}
                and{" "}
                <span className="font-semibold text-slate-900">
                  &lt;style&gt;
                </span>{" "}
                are intentionally excluded, which prevents a pasted web page
                from turning into a mix of code and text.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Typical paste issues this fixes
                </div>
                <ul className="mt-3 list-disc pl-6 text-sm text-slate-700 space-y-2">
                  <li>Unexpected fonts, sizes, and colors applied on paste</li>
                  <li>
                    Extra blank space caused by margins and nested wrappers
                  </li>
                  <li>
                    Hidden text from UI elements copied along with content
                  </li>
                  <li>HTML fragments that break plain text fields and forms</li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard
              title="What gets preserved so it stays usable"
              icon="shield"
            >
              <p>
                Plain text should still be readable. That is why the tool
                preserves line breaks and basic structure rather than returning
                a single wall of words. Newlines remain newlines, and paragraph
                separation is kept so your content can be scanned quickly after
                conversion. If you paste multi line notes, a checklist, or a set
                of status updates, the result stays multi line.
              </p>

              <p className="mt-3">
                Lists are handled in a straightforward way: each list item
                becomes its own line. The point is not to recreate perfect
                typography. The point is to preserve the human structure that
                matters when you paste into tools that do not support rich text.
                This is especially useful for ticket descriptions, changelog
                entries, form submissions, and technical notes where formatting
                is either ignored or actively harmful.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Paragraph fidelity
                  </div>
                  <p className="mt-2 text-slate-700">
                    Paragraph breaks remain, so you do not lose the separation
                    between ideas when you paste into a plain editor.
                  </p>
                </div>
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Whitespace control
                  </div>
                  <p className="mt-2 text-slate-700">
                    You can optionally strip empty lines or extra spaces if the
                    destination is strict or you need compact output.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Options that change the cleanup behavior"
              icon="sliders"
            >
              <p>
                The checkbox options exist because “remove styling” can mean
                different things depending on your destination. If you are
                pasting into a normal note app, you may only want to strip HTML
                tags. If you are pasting into a system that collapses whitespace
                or rejects tabs, you may want to normalize spacing too. The tool
                lets you choose without forcing a single aggressive default.
              </p>

              <p className="mt-3">
                Options like{" "}
                <span className="font-semibold text-slate-900">Trim</span> and{" "}
                <span className="font-semibold text-slate-900">Trim Lines</span>{" "}
                remove leading and trailing whitespace that often comes from
                copy operations.{" "}
                <span className="font-semibold text-slate-900">
                  Strip Extra Spaces
                </span>
                ,{" "}
                <span className="font-semibold text-slate-900">
                  Remove Whitespace
                </span>
                , and{" "}
                <span className="font-semibold text-slate-900">Strip Tabs</span>{" "}
                help when you need predictable spacing across environments.
                Meanwhile, filters like{" "}
                <span className="font-semibold text-slate-900">
                  Remove Emojis
                </span>
                ,{" "}
                <span className="font-semibold text-slate-900">
                  Remove Punctuation
                </span>
                , and{" "}
                <span className="font-semibold text-slate-900">
                  Remove Non-Alphanumeric
                </span>{" "}
                are intentionally blunt. They are helpful for normalization and
                token cleanup, but they will also remove meaningful characters
                in natural writing. Use them when the output is meant for
                processing, not for presentation.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Recommended workflow
                </div>
                <p className="mt-2 text-slate-700">
                  Start with minimal options, run the cleanup, then only enable
                  stricter filters if you can clearly see the need. Removing
                  punctuation or whitespace is difficult to undo if you did not
                  keep a copy of the original.
                </p>
              </div>
            </SectionCard>

            <SectionCard
              title="One editor, with stats for fast feedback"
              icon="type"
            >
              <p>
                The tool uses one textarea for both input and output. After you
                click{" "}
                <span className="font-semibold text-slate-900">
                  Remove styling
                </span>
                , the cleaned result replaces the editor content so the next
                step is obvious: copy it, export it, or keep editing. Two
                separate boxes tend to create mistakes, especially when you copy
                the wrong version.
              </p>

              <p className="mt-3">
                Under the editor, you will see a quick stats line: character
                count, word count, sentence count, and line count. These are not
                “writing quality” metrics. They are a sanity check that shows
                how much the cleanup changed your content. If you strip empty
                lines, line count should go down. If you remove punctuation,
                sentence count may drop because the heuristic relies on end
                punctuation. The numbers give you immediate signal without
                making any claims about correctness.
              </p>
            </SectionCard>

            <SectionCard
              title="Uploads, extraction limits, and exports"
              icon="file"
            >
              <p>
                You can paste directly, or you can upload a file and extract
                text in browser. Plain text formats like TXT, CSV, JSON, HTML,
                and XML can be read locally and cleaned immediately. PDF and
                DOCX uploads are supported as convenience features, but they
                depend on optional libraries being available in your build. If
                those libraries are missing, the tool will show an error rather
                than pretending it succeeded.
              </p>

              <p className="mt-3">
                PDF extraction reads each page and pulls out text items. PDFs
                are layout first, so extracted text may include odd spacing,
                missing line breaks, or words that appear out of order,
                especially in multi column documents. Also, scanned PDFs often
                have no embedded text at all, which means there is nothing to
                extract without OCR. DOCX extraction typically produces cleaner
                raw text, but heavily formatted documents can still introduce
                unexpected spacing. After extraction, the same cleanup options
                are applied so you end up with consistent plain text output.
              </p>

              <p className="mt-3">
                Export follows the same rule as copy: it exports what you see in
                the textarea. The PDF download attempts to generate a simple
                paginated PDF from the plain text. If PDF generation is not
                available in your build, the page falls back to the browser
                print dialog so you can save as PDF using your browser.
              </p>
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
                  Local-by-default processing
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  The cleanup is designed to run in your browser from the
                  editor’s current value. That means the “remove styling” action
                  does not require sending your text to a server as part of the
                  conversion step. Uploading a file reads the file locally and,
                  when supported, extracts text on device before applying the
                  same cleanup rules. Copying is explicit: you choose when to
                  copy and where to paste. If you are working with sensitive
                  drafts, internal notes, or customer messages, this model keeps
                  the workflow predictable and reduces accidental sharing.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-sky-50 ring-1 ring-sky-200/70 p-6 sm:p-8">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Summary
              </h3>
              <p className="mt-2 text-slate-700 leading-7">
                Use this tool when you want content without decoration. Paste or
                upload, select the cleanup options that match your destination,
                and click{" "}
                <span className="font-semibold text-slate-900">
                  Remove styling
                </span>
                . The converter strips markup and formatting, preserves readable
                structure like line breaks and paragraphs, and gives you a plain
                text result you can copy or export. If PDF or DOCX extraction is
                enabled in your build, those files can be processed locally as
                well, with clear errors when extraction is not possible.
              </p>
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
  icon: "scissors" | "shield" | "sliders" | "type" | "file";
  children: React.ReactNode;
}) {
  const Icon = () => {
    const common = "h-5 w-5 text-sky-600";
    switch (icon) {
      case "scissors":
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
              d="M14.5 4.5l-10 10a3 3 0 104.24 4.24l10-10M14.5 4.5l2.3 2.3M14.5 4.5l-2.3 2.3"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 16.5l3-3"
            />
          </svg>
        );
      case "shield":
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
              d="M12 3l7 4v6c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-5"
            />
          </svg>
        );
      case "sliders":
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={common}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6h2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 12h10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 18h10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18h2" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 6a2 2 0 104 0 2 2 0 00-4 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12a2 2 0 104 0 2 2 0 00-4 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 18a2 2 0 104 0 2 2 0 00-4 0z"
            />
          </svg>
        );
      case "file":
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
              d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 13h8M8 17h6"
            />
          </svg>
        );
      case "type":
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6v12" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 6v12" />
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
