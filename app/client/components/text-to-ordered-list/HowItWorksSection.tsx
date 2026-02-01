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
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                How the Text to Ordered List Converter Works
              </h2>
              <p className="mt-2 text-slate-600 leading-7">
                Paste items, choose how to split them, choose a numbering style,
                then click Convert. The textarea is replaced with the ordered
                list so you can copy or download it. Everything runs locally in
                your browser.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Deterministic
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                Local
              </span>
            </div>
          </div>

          <div className="mt-10 space-y-6 text-base text-slate-700 leading-7">
            <SectionCard title="Why one textarea and a Convert button" icon="list">
              <p>
                This page uses one textarea to reduce copy mistakes. With
                separate input and output boxes, it is easy to edit the input
                after converting and then accidentally copy the older output.
                Here the text on screen is always the text you export.
              </p>
              <p className="mt-3">
                Conversion is click-based instead of live so you can adjust
                settings without the text changing under your cursor. Convert is
                an explicit action: set options, convert once, then copy or
                download. If you change options, convert again.
              </p>
              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Output format
                </div>
                <p className="mt-2">
                  Each item becomes one line prefixed with a marker plus a dot
                  and a space, for example <span className="font-semibold">1. </span>
                  item or <span className="font-semibold">A. </span> item. The
                  converter does not rewrite words and does not generate HTML. It
                  is a plain text formatter.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Splitting input into items" icon="type">
              <p>
                The split method controls how items are extracted. The tool does
                not guess automatically. You choose the rule that matches your
                paste.
              </p>
              <p className="mt-3">
                <span className="font-semibold text-slate-900">Lines</span> mode
                treats each line as one item. It is best for notes and
                checklists.
              </p>
              <p className="mt-3">
                <span className="font-semibold text-slate-900">Commas</span> mode
                splits only on commas for simple values like{" "}
                <span className="font-mono text-sm">a, b, c</span>. It is not a
                full CSV parser, so quoted commas are not handled.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Trim items",
                    "Removes extra spaces around each item so prefixes align cleanly.",
                  ],
                  [
                    "Ignore empty items",
                    "Skips blanks caused by trailing commas or extra blank lines.",
                  ],
                  [
                    "Preview",
                    "Shows a short sample so you can confirm settings before converting.",
                  ],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition"
                  >
                    <div className="font-bold text-slate-900">{k}</div>
                    <div className="mt-1 text-slate-700">{v}</div>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Numbering styles and Start at" icon="list">
              <p>
                Numbering style controls the prefix. Choose numeric markers,
                letters, or roman numerals, each available in upper or lower
                case.
              </p>
              <p className="mt-3">
                Start at controls the first index. Start at 3 gives 3 for
                numbers, C for letters, and III for roman numerals. Letters
                continue past Z using AA, AB, and so on. Roman numerals are
                generated up to 3999.
              </p>
              <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Destination formatting
                </div>
                <p className="mt-2">
                  Some editors auto-format lists. After pasting, verify the
                  destination did not rewrite numbering. This tool outputs plain
                  text prefixes, but the destination may still apply its own
                  rules.
                </p>
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
                  Runs locally in your browser
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Conversion happens in your browser from the text in the
                  textarea. Upload reads files locally to populate the editor.
                  Copy and download are explicit actions you trigger.
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
