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
                  How the Text to Bulleted List Tool Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page turns a messy set of items into a clean bulleted
                  list you can paste into notes, docs, tickets, or markdown
                  editors. You choose how your input should be split (lines or
                  commas), choose a bullet character, then convert. The result
                  appears in the same textarea so the text you see is exactly
                  what you copy or export.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  One-click formatting
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Lines", v: "Paste one item per line" },
                { k: "Commas", v: "Paste a, b, c style lists" },
                { k: "Bullets", v: "Choose -, *, •, or custom" },
                { k: "Copy", v: "Paste into any editor" },
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
            <SectionCard title="What gets converted and what stays the same" icon="list">
              <p>
                The converter is deliberately simple. It does not rewrite your
                content, change the order of words, or “fix” punctuation. It
                only does two things: it splits your text into items, then it
                prefixes each item with a bullet and a single space. That makes
                the output predictable and safe to use for task lists, shopping
                lists, checklist items, release notes, and quick copy-paste
                workflows.
              </p>

              <p className="mt-3">
                When you click Convert, the textarea is replaced with the
                bulleted version. This is intentional. With one editor, there
                is no confusion about which box is the “real” output. If you
                want to keep the original, copy it somewhere first, or paste it
                again after you export the result.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Runs locally in your browser
                </div>
                <p className="mt-2">
                  Splitting and bullet formatting are performed on your device.
                  The page does not send your text to a server. If you upload a
                  file, the extraction step is also performed locally when the
                  optional PDF/DOCX libraries are available in your build.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Split modes: choose the one that matches your paste" icon="type">
              <p>
                People paste lists in different shapes, so this tool gives you a
                clear choice instead of trying to guess. The split mode decides
                where one item ends and the next begins. Once the items are
                identified, the bullet formatting step is the same.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Lines (one item per line)",
                    "Use this when your input is already a vertical list, such as items copied from a spreadsheet column, a checklist, or a text file where each entry is on its own line.",
                  ],
                  [
                    "Commas (comma-separated values)",
                    "Use this when your input looks like “a, b, c”. Comma mode also treats line breaks as separators to handle pasted blocks that wrap or include multiple lines.",
                  ],
                  [
                    "Trim items",
                    "Trimming removes extra spaces around each item. For example, “  apple ” becomes “apple”. This keeps bullets aligned and prevents accidental leading/trailing whitespace.",
                  ],
                  [
                    "Ignore empty values",
                    "When enabled, repeated separators do not create blank bullets. This is helpful when the pasted text contains “a,,b” or has extra blank lines.",
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

              <p className="mt-4">
                If your items contain commas inside them (for example, “Toronto,
                ON”), line mode is safer because it only splits on line breaks.
                If your items are short and separated by commas, comma mode is
                faster and avoids manual reformatting.
              </p>
            </SectionCard>

            <SectionCard title="Bullet choices and how to keep output consistent" icon="list">
              <p>
                Different destinations expect different bullets. Markdown uses
                hyphens or asterisks, some chat apps look best with “•”, and
                simple “-” is widely accepted in plain text. This page lets you
                pick a bullet, and it will prepend exactly that bullet plus one
                space for every item.
              </p>

              <p className="mt-3">
                The Custom bullet option is intentionally constrained. It is
                meant for short markers like “→” or “·”, not long prefixes. If
                you enter a longer string, it is truncated to keep the list
                readable and avoid accidental formatting mistakes in the target
                application.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Copy and paste tips
                  </div>
                  <p className="mt-2">
                    Some editors auto-convert bullets into their own list
                    widgets. If you want plain text bullets, paste as plain text
                    (often Shift+Ctrl/Cmd+V). If you want a real list, paste
                    normally and let the editor upgrade the formatting.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Preserve your original
                  </div>
                  <p className="mt-2">
                    Convert replaces the textarea content. If you are iterating
                    on different bullet styles, copy your original paste into a
                    separate note first so you can revert quickly.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Uploads and exports" icon="type">
              <p>
                The fastest workflow is usually paste and convert, but uploads
                are useful when your list lives in a file. Text-like files are
                loaded directly. For PDF and DOCX, the page attempts to extract
                text locally using optional libraries. Extracted text can
                include spacing artifacts because PDF layout is visual rather
                than semantic, so it is normal to do a quick scan after upload.
              </p>

              <p className="mt-3">
                You can export as TXT for simple sharing, or as PDF when you
                need a portable document. PDF export uses jsPDF when installed,
                and falls back to the browser print dialog when it is not. In
                both cases, the exported text is exactly what is currently in
                the textarea.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Best-effort extraction reminder
                </div>
                <p className="mt-2 text-slate-700">
                  If a PDF contains scanned images, there may be no extractable
                  text. This tool does not perform OCR. In that case, you will
                  need an OCR step elsewhere before you can generate a bulleted
                  list.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Common workflows and practical examples" icon="list">
              <p>
                Bulleted lists show up everywhere: meeting notes, support tickets,
                lesson plans, onboarding checklists, shopping lists, feature
                backlogs, and quick “things to remember” notes. The problem is
                that your source format often does not match the destination.
                A spreadsheet column becomes a pasted block with irregular line
                breaks. A CSV field becomes a single comma-heavy line. A scraped
                dataset includes empty entries, extra separators, or trailing
                spaces. This tool exists to make the last step quick.
              </p>

              <p className="mt-3">
                If you paste one item per line and choose Lines, the converter
                keeps that structure and just adds bullets. If you paste
                comma-separated values like <span className="font-semibold text-slate-900">red, green, blue</span>,
                choose Commas and the tool splits on commas (and also on line
                breaks) so wrapped text still converts cleanly. From there, you
                can copy the result into a markdown editor, a Google Doc, an
                email, or a chat message.
              </p>

              <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                <div className="text-sm font-bold text-slate-900">One short example</div>
                <p className="mt-2 text-slate-700">
                  Input: <span className="font-semibold">apples, bananas, oranges</span>
                  <br />
                  Output:
                  <br />
                  <span className="font-mono text-sm">- apples{"\n"}- bananas{"\n"}- oranges</span>
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Edge cases, limitations, and how to avoid surprises" icon="type">
              <p>
                Real text is messy, so it helps to know what this converter does
                not attempt. It does not parse quoted CSV, it does not detect
                nested lists, and it does not understand language structure. It
                also does not try to “repair” items that contain separators. If
                an item contains an internal comma, comma mode cannot reliably
                know whether that comma is part of the item or a separator.
              </p>

              <p className="mt-3">
                In those cases, use Lines mode. If your data is currently comma
                separated but includes commas inside items, do a quick replace
                step first (for example, replace <span className="font-semibold">,</span> with a temporary
                token inside those items), or paste the content as one item per
                line. The goal of this page is speed and clarity, not full CSV
                semantics.
              </p>

              <p className="mt-3">
                Another common surprise is destination behavior. Many editors
                automatically convert plain text bullets into a rich list
                widget. That is usually helpful, but it can also change spacing
                or indentation. If you want literal bullets, use the destination’s
                “paste as plain text” option. If you want a real list, paste
                normally and let the destination upgrade it.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Good defaults</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Use Lines mode when accuracy matters.</li>
                  <li>Keep Trim items and Ignore empty enabled for clean output.</li>
                  <li>Choose “-” or “*” for markdown, and “•” for general notes.</li>
                </ul>
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
