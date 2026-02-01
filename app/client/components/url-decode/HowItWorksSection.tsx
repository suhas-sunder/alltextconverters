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
                  How the URL Decoder Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste URL-encoded text, click Decode, and copy the readable
                  result. This page uses predictable browser behavior and
                  focuses on safe decoding rather than “guessing” what you meant.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Try/catch safety
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "%20", v: "Space" },
                { k: "%2F", v: "Slash /" },
                { k: "%3F", v: "Question ?" },
                { k: "%26", v: "Ampersand &" },
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
            <SectionCard title="What URL encoding is and why it exists" icon="list">
              <p>
                URLs have a strict character set. When text includes characters
                that are meaningful to URL syntax (like <span className="font-semibold text-slate-900">?</span>,
                <span className="font-semibold text-slate-900"> &amp; </span>,
                <span className="font-semibold text-slate-900">#</span>, or
                spaces), those characters can break parsing or change the meaning
                of a link. URL encoding solves that by turning characters into
                percent escapes, where a percent sign is followed by two hex
                digits. For example, a space becomes <span className="font-semibold text-slate-900">%20</span>.
              </p>

              <p className="mt-3">
                When you copy a query parameter from a redirect URL, a tracking
                link, a server log, or an API request, you often see the encoded
                form because it is safe to transport. Decoding is the reverse
                operation. It makes the value readable again so you can inspect
                it, edit it, or compare it to what you expected.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Practical examples
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    Debug a URL parameter like <span className="font-semibold">utm_content</span>{" "}
                    that contains spaces or punctuation.
                  </li>
                  <li>
                    Inspect a redirect value returned from OAuth or SSO flows.
                  </li>
                  <li>
                    Read webhook payloads that store encoded fragments.
                  </li>
                  <li>
                    Decode a file path or a search query copied from logs.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Deterministic decoding with decodeURIComponent" icon="type">
              <p>
                This page uses the browser&apos;s <span className="font-semibold text-slate-900">decodeURIComponent</span>{" "}
                function. That matters because it is consistent and widely
                implemented. The decoder interprets percent escapes (like
                <span className="font-semibold text-slate-900"> %2F </span> or
                <span className="font-semibold text-slate-900"> %3D </span>)
                and converts them back into the original characters. It also
                handles multi-byte UTF-8 sequences, which is why it can decode
                non-ASCII characters when they are encoded correctly.
              </p>

              <p className="mt-3">
                The important constraint is that <span className="font-semibold text-slate-900">decodeURIComponent</span>{" "}
                is strict. If it sees malformed input, it throws a{" "}
                <span className="font-semibold text-slate-900">URIError</span>.
                Malformed input usually means you have an incomplete percent
                escape (for example, a trailing <span className="font-semibold">%2</span>{" "}
                at the end of the text) or non-hex digits after the percent sign
                (for example, <span className="font-semibold">%ZZ</span>).
              </p>

              <p className="mt-3">
                This tool wraps decoding in a try/catch so the UI never crashes.
                If an error happens, the page shows a clear message and keeps
                the original editor value unchanged. That makes it safe to paste
                arbitrary strings from logs or unknown sources and iterate until
                the value decodes cleanly.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Strict validation",
                    "Invalid percent escapes are reported instead of silently modified, so you can trust the output when it succeeds.",
                  ],
                  [
                    "No smart guessing",
                    "There is no language correction or normalization beyond URL decoding. The goal is a faithful reversal, not rewriting.",
                  ],
                  [
                    "UTF-8 aware",
                    "Correctly encoded Unicode characters decode to readable text using standard browser behavior.",
                  ],
                  [
                    "One editor, fast workflow",
                    "Paste, decode, copy, done. No separate output field keeps the layout simple and consistent with the other tools.",
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

            <SectionCard title="Common edge cases you should expect" icon="list">
              <p>
                Real-world URLs are messy. The most common surprise is the plus
                character. In HTML form submissions and some older systems,
                spaces are represented as <span className="font-semibold text-slate-900">+</span>{" "}
                instead of <span className="font-semibold text-slate-900">%20</span>.
                The standard URL decoder does not automatically convert plus to
                a space because plus is a valid literal character in many URL
                contexts. If your input comes from a query string generated by a
                form encoder, replace <span className="font-semibold">+</span>{" "}
                with a space first, then run decode.
              </p>

              <p className="mt-3">
                Another edge case is partial encoding. Sometimes only part of a
                string is encoded, especially when systems concatenate values
                incorrectly. That can look like a mix of plain text and escapes.
                This tool can still decode it, as long as every percent escape
                is valid. If the decode fails, scan for stray percent signs or
                truncated sequences.
              </p>

              <p className="mt-3">
                Finally, be careful with encoded delimiters. Decoding turns
                <span className="font-semibold text-slate-900"> %26 </span> back
                into <span className="font-semibold text-slate-900">&amp;</span>,
                which can change how a URL is parsed if you paste it back into a
                query string without re-encoding. The safe workflow is: decode
                only when you are inspecting or editing the value, then re-encode
                before inserting it back into a URL parameter.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Quick tip for debugging
                </div>
                <p className="mt-2 text-slate-700">
                  If you are unsure whether something is encoded, look for the{" "}
                  <span className="font-semibold text-slate-900">%</span> sign.
                  If you see many percent escapes, decoding usually helps. If
                  you see a single percent with no two hex digits after it, fix
                  that first or delete the stray character.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Privacy and file uploads" icon="type">
              <p>
                This page runs in your browser. Decoding is computed from the
                current textarea value and does not require a server round trip.
                If you use the upload button, the file is read locally and the
                extracted text is placed into the editor. Nothing is transmitted
                by default.
              </p>

              <p className="mt-3">
                PDF and DOCX extraction are optional features. If your site build
                includes the extra dependencies, the tool can extract text from
                those formats locally as well. Extraction is inherently best-effort:
                PDFs in particular may produce spacing artifacts because PDFs
                store positioned glyphs rather than paragraphs. The decoded output
                is still useful for inspection and copy/paste, but you should
                expect occasional layout oddities.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  What this tool does not do
                </div>
                <p className="mt-2">
                  It does not validate full URLs, rewrite query strings, or
                  interpret HTML entities. It decodes percent-encoded text using
                  the browser&apos;s standard rules. If you need to parse an
                  entire URL into components, use a dedicated URL parser or dev
                  tools.
                </p>
              </div>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">Local</div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Decode without sending your text anywhere
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  The conversion logic runs on-device. You choose when to copy
                  the decoded result and where to paste it. This keeps the tool
                  fast, predictable, and privacy-friendly for common debugging
                  and cleanup tasks.
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
