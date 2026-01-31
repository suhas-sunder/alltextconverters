import React from "react";

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
                  How the Character Counter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page is optimized for character-limit workflows. You get two character totals (with spaces and with no whitespace) plus an optional UTF-8 byte size for systems that measure text in bytes.
                </p>
              </div>

              {/* Badge stack */}
              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Instant updates
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Browser-only
                </span>
              </div>
            </div>

            {/* Quick glance tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "With spaces", v: "Matches most form limits" },
                { k: "No whitespace", v: "Removes spaces, tabs, new lines" },
                { k: "UTF-8 bytes", v: "Useful for APIs + DB fields" },
                { k: "Unicode", v: "Emoji can be multi-unit" },
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
            <SectionCard title="Pick the count that matches your limit" icon="list">
              <p>
                This page shows multiple totals because “character limit” can mean different things depending on where you are posting or submitting.
                The safest approach is to choose the metric that matches the rule you are trying to satisfy, then copy-paste into the destination
                as a final check.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Characters (with spaces)",
                    "Counts every character in the textarea, including punctuation, spaces, tabs, and line breaks. This usually matches max-length inputs and form fields.",
                  ],
                  [
                    "Characters (no whitespace)",
                    "Removes all whitespace first (spaces, tabs, and line breaks), then counts what remains. Useful when you want the length of the content itself without formatting.",
                  ],
                  [
                    "Bytes (UTF-8) (optional)",
                    "Encodes your text as UTF-8 and counts the bytes. This is the right metric when a system documents a storage limit in bytes rather than characters.",
                  ],
                  [
                    "Copy and validate",
                    "Counts are computed from exactly what is in the editor. After editing, copy and paste into the destination to confirm the destination does not apply its own normalization.",
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
                <div className="text-sm font-bold text-slate-900">Practical default</div>
                <p className="mt-2">
                  If you are unsure, start with <span className="font-semibold">Characters (with spaces)</span>. Most character limits on the web
                  are enforced at the field level, which includes whitespace and line breaks.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Whitespace rules you can rely on" icon="type">
              <p>
                “Whitespace” is not just the spacebar character. When you paste text from documents, code blocks, or messaging apps, you often get a mix
                of spaces, tabs, and line breaks. This tool treats whitespace consistently so your numbers do not change unexpectedly when formatting changes.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Spaces", "The normal space character you type with the spacebar. Counted in “with spaces.” Removed in “no whitespace.”"],
                  ["Tabs", "Common in copied tables and code. Counted as characters, and treated as whitespace for the “no whitespace” total."],
                  ["Line breaks", "New lines count as characters too. They also split lines visually, which is why pasted text can jump in size."],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                    <div className="text-sm font-bold text-slate-900">{k}</div>
                    <p className="mt-2">{v}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4">
                If you are trying to fit inside a strict limit, whitespace is often the easiest thing to trim without changing meaning.
                Common quick wins include collapsing multiple spaces, removing trailing line breaks, and deleting indentation from pasted blocks.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Tip</div>
                <p className="mt-2 text-slate-700">
                  When a destination system re-wraps text, it may turn multiple spaces into a single space or drop some line breaks. If that system is strict,
                  paste there early and often while you edit so you do not chase the wrong number.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Bytes (UTF-8) explained" icon="upload">
              <p>
                Some systems enforce a storage limit instead of a character limit, and that storage limit is commonly measured in bytes.
                When you enable <span className="font-semibold">Bytes (UTF-8)</span>, the tool encodes your text as UTF-8 and reports the result.
                This is especially useful for API fields, database columns, and integrations that say things like “max N bytes.”
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Why bytes can be bigger than characters</div>
                  <p className="mt-2">
                    ASCII letters usually use 1 byte. Many accented characters use 2 bytes. Emoji often use 4 bytes (or more when combined into a sequence).
                    So two strings that look similar can have very different byte sizes.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">When bytes matter most</div>
                  <p className="mt-2">
                    If a limit is documented in bytes, bytes are the source of truth. If the limit is documented in characters, use the character totals instead.
                    The toggle keeps this explicit so you never confuse “bytes” with “characters.”
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Quick checklist</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>Use bytes for API payload limits, storage limits, and database constraints that specify bytes.</li>
                  <li>Use “with spaces” for most max-length text fields.</li>
                  <li>Use “no whitespace” when formatting should not count against you (for example, IDs copied with spaces/newlines).</li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Unicode and what you see on screen" icon="history">
              <p>
                Modern text is more complex than “one symbol equals one character.” Some visible symbols are represented by multiple underlying units.
                JavaScript string length is based on UTF-16 code units, which matches many web implementations, but it may not perfectly match what you perceive
                as a single visual character.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Emoji", "A single emoji can be multiple code units and multiple UTF-8 bytes. Emoji sequences can be longer than they look."],
                  ["Accents", "Some letters can be composed as one character or written as a base letter plus a combining mark. They can render identically but count differently."],
                  ["Joiners", "Some emoji use zero-width joiners to combine multiple symbols into one glyph, which can increase counts underneath."],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                    <div className="text-sm font-bold text-slate-900">{k}</div>
                    <div className="mt-1 text-slate-700">{v}</div>
                  </div>
                ))}
              </div>

              <p className="mt-4">
                If a destination system applies its own rules (for example, counting graphemes, normalizing accents, or transforming line breaks),
                your best move is to treat this page as a fast, consistent baseline, then confirm in the destination before final submission.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">If your numbers “don’t match”</div>
                <p className="mt-2 text-slate-700">
                  Mismatches usually come from hidden characters (tabs, extra line breaks), emoji sequences, or a platform that normalizes text on paste.
                  Try removing fancy quotes, reducing emoji, and re-pasting as plain text to see whether the destination changes the content.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Fast workflow to fit a strict limit" icon="download">
              <p>
                When you are over a character limit, you want predictable steps that reduce length without breaking meaning.
                These steps are quick and tend to work across essays, captions, forms, scripts, and code snippets.
              </p>

              <ol className="mt-4 space-y-3 list-decimal pl-5">
                <li>
                  <span className="font-semibold text-slate-900">Trim whitespace first:</span> remove extra blank lines, indentation, and repeated spaces.
                  Watch how “with spaces” changes, then compare “no whitespace” to see how much of your length is formatting.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Shorten high-cost parts:</span> long URLs, repeated hashtags, and emoji can add length quickly,
                  especially in bytes. Replace or remove the parts that contribute the most.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Rewrite for density:</span> remove filler words, combine sentences, and replace phrases with shorter equivalents.
                  If you have to cut meaning, cut duplicates first.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Paste into the destination:</span> confirm the destination shows the same content and does not reformat it.
                  If it does, adjust here and repeat.
                </li>
              </ol>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Why the Copy button exists</div>
                <p className="mt-2 text-slate-700">
                  Many people accidentally copy a different version than what they counted, especially after quick edits. The Copy button copies the exact textarea value
                  so what you paste is what you measured.
                </p>
              </div>
            </SectionCard>
          </div>

	          {/* Privacy finish */}
	          <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">Privacy</div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">Your text never leaves your device</h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Counts are computed from the textarea value in your browser. There is no upload step and no server-side processing on this page.
                </p>
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
  icon: "list" | "history" | "type" | "upload" | "download";
  children: React.ReactNode;
}) {
  const Icon = () => {
    const common = "h-5 w-5 text-sky-600";
    switch (icon) {
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 101.8-5.4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v6h6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M9 6v12m6-12v12" />
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4" />
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v10m0 0l-4-4m4 4l4-4" />
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
