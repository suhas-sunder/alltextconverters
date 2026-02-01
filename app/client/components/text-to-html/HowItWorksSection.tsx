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
                  How the Text to HTML Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This tool takes plain text and turns it into simple HTML using
                  predictable rules. It is built for practical workflows like
                  pasting notes into a CMS, turning exported logs into readable
                  markup, or generating a quick snippet for documentation. It
                  does not try to “understand” language or fix writing. It
                  focuses on structure, escaping, and repeatability, and it runs
                  locally in your browser.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Deterministic output
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Escape HTML", v: "Safe text nodes" },
                { k: "Paragraphs", v: "Split on blank lines" },
                { k: "<br> mode", v: "Preserve newlines" },
                { k: "<pre> mode", v: "Keep whitespace" },
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
            <SectionCard title="What “text to HTML” really means" icon="list">
              <p>
                Plain text is just characters: letters, numbers, punctuation,
                spaces, and newlines. HTML is a markup language where some
                characters have special meaning. The less obvious part of this
                conversion is not adding tags; it is ensuring that your original
                content stays content, not code. If your input contains
                characters like <span className="font-mono">&lt;</span> or{" "}
                <span className="font-mono">&amp;</span>, pasting it directly
                into an HTML editor can change how it renders. In the worst
                case, it can produce broken markup.
              </p>

              <p className="mt-3">
                This converter prevents those problems by escaping HTML special
                characters first. Escaping converts characters such as{" "}
                <span className="font-mono">&lt;</span> into{" "}
                <span className="font-mono">&amp;lt;</span> so the browser treats
                them as visible text instead of a tag boundary. That single step
                is why the output is “safe to paste” for most everyday uses like
                CMS editors, issue trackers, wikis, and internal tools.
              </p>

              <p className="mt-3">
                After escaping, the tool adds minimal structure based on the
                mode you choose. The goal is readability, not design. The output
                is intentionally small so you can style it in your destination
                system, or keep it unstyled when you just need a clean snippet.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Best-effort rule
                </div>
                <p className="mt-2">
                  This is a deterministic formatter, not a template engine. It
                  will not detect headings, lists, or links. If you need rich
                  markup, generate the basic HTML here, then enhance it manually
                  or with a purpose-built formatter.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Mode behavior you can rely on" icon="type">
              <p>
                The same input should always produce the same output. That is
                the entire point of using deterministic modes. Each mode maps
                a specific set of characters (newlines and whitespace) into a
                specific HTML structure, without guessing.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Paragraphs</span>{" "}
                mode is designed for text that already has blank lines separating
                ideas: notes, exported emails, copied chat messages, and long
                descriptions. The converter splits your text on blank lines and
                wraps each chunk in a <span className="font-mono">&lt;p&gt;</span>{" "}
                block. Single newlines inside a paragraph are preserved as{" "}
                <span className="font-mono">&lt;br&gt;</span> tags, which keeps
                short line breaks readable without forcing you to maintain a
                single long line.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Line breaks to &lt;br&gt;
                </span>{" "}
                mode is simpler: every newline becomes a{" "}
                <span className="font-mono">&lt;br&gt;</span>. This is useful for
                small snippets where you do not want paragraph separation, such
                as address blocks, multi-line labels, or short blocks of text
                that should render as a single flow with explicit breaks.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">
                  Wrap in &lt;pre&gt;
                </span>{" "}
                mode preserves whitespace and indentation by placing your escaped
                text inside a <span className="font-mono">&lt;pre&gt;</span>{" "}
                element. If you are pasting logs, code-adjacent text, or
                alignment-sensitive output, preformatted mode avoids the normal
                HTML behavior where sequences of spaces collapse into one.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Escaping always happens first",
                    "Special characters are converted to HTML entities so the browser displays them as text, not markup.",
                  ],
                  [
                    "No content rewriting",
                    "Words, punctuation, and numbers are never changed. The tool only escapes and wraps.",
                  ],
                  [
                    "Newlines are preserved intentionally",
                    "Depending on the mode, newlines become <br>, paragraphs, or remain as-is inside <pre>.",
                  ],
                  [
                    "Output stays minimal",
                    "No inline styles, no CSS, and no template assumptions. You can paste anywhere and style later.",
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

            <SectionCard title="Common workflows and edge cases" icon="list">
              <p>
                People reach for a text to HTML converter when they are moving
                content between systems. That usually means the input is not
                perfectly clean. The converter is designed to be forgiving: it
                accepts any text you can paste, and it makes the smallest safe
                change needed to produce valid HTML.
              </p>

              <p className="mt-3">
                If your input already contains HTML tags and you paste it here,
                the tool will escape those tags. That is intentional. This page
                is for turning plain text into HTML, not for cleaning or
                rewriting existing HTML. If you need to strip tags and extract
                content, use an HTML-to-text tool instead. Keeping those tasks
                separate prevents surprising results.
              </p>

              <p className="mt-3">
                Another common edge case is “smart punctuation” from word
                processors. Curly quotes and long dashes do not break HTML, but
                they can look different across destinations. This converter does
                not normalize typography. It preserves your characters exactly
                as typed, then escapes only what is required for safety.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    CMS pasting
                  </div>
                  <p className="mt-2">
                    Many CMS editors accept HTML in a “source” view but apply
                    their own formatting in the visual editor. Convert here,
                    paste into source mode, then preview. If the CMS rewrites
                    markup, your minimal output is easier to debug.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Logs and exports
                  </div>
                  <p className="mt-2">
                    If you are converting logs, choose <span className="font-mono">&lt;pre&gt;</span>{" "}
                    mode to preserve indentation. If you are converting
                    multi-line descriptions, choose Paragraphs mode for a more
                    readable result.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Quick tip
                </div>
                <p className="mt-2 text-slate-700">
                  If your destination tool collapses spacing, pick{" "}
                  <span className="font-semibold">Preformatted</span>. If your
                  destination tool strips <span className="font-mono">&lt;br&gt;</span>{" "}
                  tags, pick <span className="font-semibold">Paragraphs</span>.
                  The converter gives you different minimal structures so you
                  can choose what survives best in the system you are pasting
                  into.
                </p>
              </div>
            </SectionCard>

            
            <SectionCard title="Safety limits and what to double-check" icon="type">
              <p>
                The converter is designed to be safe for plain text, but it is not a full HTML security or sanitization system.
                It does not try to detect and remove scripts because it never treats your input as markup in the first place.
                Instead, it escapes special characters so any angle brackets you typed remain visible text.
                That is the key safety guarantee: your input becomes text nodes, not executable HTML.
              </p>

              <p className="mt-3">
                Still, you should preview the result in your destination if you are publishing publicly.
                Some platforms post-process HTML and may change how whitespace or line breaks render.
                If exact formatting matters, prefer <span className="font-semibold">Preformatted</span> mode and verify the preview.
                If you want the destination to wrap and reflow text naturally, use <span className="font-semibold">Paragraphs</span>.
              </p>

              <p className="mt-3">
                Finally, remember that HTML entities are normal in safe output. Seeing sequences like
                <span className="font-mono"> &amp;amp; </span> or <span className="font-mono">&amp;lt;</span>
                does not mean the tool corrupted your text. It means the output will display the original characters exactly when rendered.
                When you paste the HTML into an editor, switch to a preview view to confirm the final appearance.
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
                  Your text stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Conversion and file reading are performed in your browser.
                  This page does not send your text to a server to generate the
                  HTML. You choose when to copy the output or download a file.
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
