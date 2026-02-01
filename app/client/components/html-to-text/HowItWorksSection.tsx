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
                  How the HTML to Text Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste HTML, click Extract, and get a plain-text version that is
                  easier to read, search, and paste into tools that do not want
                  markup. This page focuses on predictable extraction and
                  lightweight cleanup, not language rewriting or “smart”
                  summarization.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Local conversion
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  No scripts executed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Readable output", v: "Text nodes only" },
                { k: "Useful cleanup", v: "Whitespace controls" },
                { k: "Safe parsing", v: "Detached document" },
                { k: "Practical uses", v: "Logs, exports" },
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
            <SectionCard title="What “HTML to text” means in practice" icon="list">
              <p>
                HTML is a layout language. It mixes content (the words you care
                about) with structure (tags), metadata (attributes), and
                resources (scripts, styles, and embeds). When people search for
                “HTML to text” they usually want one of two outcomes: a clean
                copy-paste version of what a page says, or a simplified text
                stream that they can feed into another workflow such as logging,
                diffing, search indexing, or exporting to a spreadsheet.
              </p>

              <p className="mt-3">
                This converter extracts <span className="font-semibold text-slate-900">values</span> from
                the HTML, not formatting instructions. It removes elements that
                are never useful in plain-text output (like <code>&lt;script&gt;</code>{" "}
                and <code>&lt;style&gt;</code>), then reads the remaining text
                nodes and turns them into a readable block of text. The goal is
                predictable output you can trust, not a perfect recreation of
                how the page looks.
              </p>

              <p className="mt-3">
                The extraction step happens in a detached document created by a
                browser parser. That keeps the conversion safe: your HTML is not
                inserted into the live page, and scripts are stripped before
                text is collected. You should still avoid pasting sensitive data
                into random tools, but this page is designed to run locally and
                not to execute the content you paste.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Best-effort extraction
                </div>
                <p className="mt-2">
                  Real-world HTML can be messy. Some pages rely on client-side
                  rendering where the text is created by JavaScript after load.
                  If your HTML does not contain the words you expect, this tool
                  cannot invent them. In that case, capture the final HTML (or
                  the rendered text) and then extract again.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Cleanup options and what they change" icon="type">
              <p>
                Text extraction is only half the job. The other half is making
                the output practical for your next step. The options on this
                page are intentionally simple and deterministic so you can
                predict the result before you copy it into a destination system.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Preserve line breaks</span>{" "}
                tries to keep paragraph-like spacing using the browser’s text
                rendering rules (similar to what you would see if you selected
                and copied a page). Turn it off when you need a single-line
                output for a database field, a CSV column, or a “one record per
                line” logging format.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Collapse repeated spaces</span>{" "}
                keeps the text readable by collapsing tabs and long runs of
                spaces. This is useful when HTML indentation or table-ish
                layouts leak into the extracted text. If you are extracting
                aligned code blocks and want to keep spacing, you can disable
                this option.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Collapse blank lines</span>{" "}
                reduces very tall vertical spacing. Many pages contain extra
                separators, hidden content, or repeated elements that produce
                stacks of blank lines when converted. Collapsing blank lines
                keeps the output easier to scroll and makes diffing more stable.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Remove zero-width characters</span>{" "}
                strips invisible Unicode such as zero-width spaces and BOM
                markers. These characters are often introduced by copy-paste
                from rich sources and can cause problems in search, matching,
                and tokenization. The tool shows how many were removed so you
                can verify that the cleanup is doing something meaningful.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Extract for logs",
                    "Use preserve line breaks + collapse repeated spaces. You get readable multi-line output that is stable for debugging and tickets.",
                  ],
                  [
                    "Extract for spreadsheets",
                    "Disable preserve line breaks to produce a single-line text field. This avoids multi-row cells and makes exports cleaner.",
                  ],
                  [
                    "Extract for deduping",
                    "Remove zero-width characters and collapse spaces to make comparisons consistent across sources.",
                  ],
                  [
                    "Extract for copy-paste",
                    "Keep line breaks on. The result behaves like the text you would copy from a web page, minus markup.",
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
            </SectionCard>

            <SectionCard title="Common edge cases and limitations" icon="list">
              <p>
                HTML to text is straightforward when your input contains the
                content directly. It gets trickier when markup is generated
                dynamically or when the “text” is actually embedded as an image,
                a canvas, or a PDF viewer. Knowing these limitations up front
                prevents confusing results.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Client-rendered pages</span>{" "}
                sometimes ship an almost-empty HTML shell and populate content
                with JavaScript at runtime. If you copy “View Source” HTML from
                those pages, you may extract very little. Instead, copy the
                rendered HTML from your browser devtools or copy the visible
                text and use a text cleaner tool after.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Navigation and repeated UI</span>{" "}
                can dominate output on modern sites. Headers, footers, and menu
                items may appear before the main content. If you only want the
                article body, a dedicated “readability” parser is a different
                type of tool. This page is intentionally generic: it extracts
                all readable text.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Tables and columns</span>{" "}
                can flatten into confusing sequences because plain text has no
                column layout. Collapsing spaces helps, but if you need to keep
                table structure, you may want an HTML-to-CSV style tool instead.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Quick tip</div>
                <p className="mt-2 text-slate-700">
                  If you are extracting for automation, test with a few real
                  samples. HTML from emails, CMS pages, and scraped exports can
                  differ wildly. Once you pick settings that work for your
                  input, keep them consistent so your downstream formatting is
                  predictable.
                </p>
              </div>
            </SectionCard>


            <SectionCard title="Practical workflows: scrape, export, paste" icon="type">
              <p>
                Most people use an HTML-to-text tool as a cleanup step between two
                systems. For example, you might scrape a page, copy an email
                template, or export HTML from a CMS, then you need a readable
                version for a ticket, a note, a diff, or a quick search.
                Converting to plain text removes tag noise and makes the content
                portable.
              </p>

              <p className="mt-3">
                If you are preparing content for a data pipeline, treat this
                output as a <span className="font-semibold text-slate-900">normalized baseline</span>. Run the
                same settings every time, then do additional processing (like
                trimming headers/footers, splitting fields, or removing tracking
                fragments) in a dedicated step where you can test and version
                the rules. Keeping the extraction stage stable makes debugging
                much easier later.
              </p>

              <p className="mt-3">
                For manual copy-paste, the fastest loop is: paste HTML, extract,
                scan the output for any obvious navigation clutter, then copy.
                If the destination app auto-formats on paste, use the single-line
                option (disable preserve line breaks) and paste into the
                destination first to confirm it keeps your spacing.
              </p>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">Privacy</div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your HTML stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Extraction runs in your browser from the text you paste or the
                  file you load. This page does not need to upload your content
                  to a server to work. Copy is explicit: you choose when to copy
                  the extracted text and paste it somewhere else.
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
