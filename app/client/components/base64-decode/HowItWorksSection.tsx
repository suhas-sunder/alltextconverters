import type React from "react";

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
                  How the Base64 Decoder Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste a Base64 string, decode it into readable text, and copy or
                  download the result. This tool is built for predictable behavior:
                  it decodes what you provide using straightforward rules, and it
                  shows clear feedback when the input is incomplete or invalid.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Unicode-safe
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Decode", v: "Base64 → text" },
                { k: "Tolerant", v: "Ignores whitespace" },
                { k: "Safe", v: "Handles invalid input" },
                { k: "Private", v: "Browser-only" },
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
            <SectionCard title="What Base64 decoding actually does" icon="list">
              <p>
                Base64 is an encoding format, not an encryption method. It turns
                arbitrary bytes into a restricted set of characters that travel
                well through systems that dislike raw binary data. When you
                decode Base64, you are simply converting those characters back
                into the original byte sequence.
              </p>

              <p className="mt-3">
                That detail matters because the decoded bytes are not always
                human-readable text. Sometimes the Base64 represents a file (an
                image, a PDF, a ZIP), or text in a specific encoding. This page
                focuses on the common case where the Base64 represents UTF-8
                text. If your input was originally plain text, the output should
                look readable. If it was binary data, the output may contain
                unusual symbols or look garbled, and that is expected.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Practical takeaway
                </div>
                <p className="mt-2">
                  Decode Base64 when you need to inspect or recover the original
                  content. If the output is not readable, it may still be correct,
                  but it might represent binary data instead of text.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Deterministic rules used by this page" icon="type">
              <p>
                This decoder keeps the rules simple and predictable. It does not
                guess meaning or apply language rules. Instead, it follows a short
                pipeline so you know what to expect on every run.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Whitespace is ignored",
                    "Spaces, tabs, and line breaks are removed before decoding so you can paste Base64 that is wrapped across multiple lines.",
                  ],
                  [
                    "Data URLs are supported",
                    "If you paste something like data:text/plain;base64,... the tool automatically decodes the part after the comma.",
                  ],
                  [
                    "URL-safe Base64 is normalized",
                    "Inputs that use '-' and '_' are converted to standard Base64 ('+' and '/'), and missing padding is added when possible.",
                  ],
                  [
                    "UTF-8 decoding is used",
                    "Decoded bytes are interpreted as UTF-8 text using the browser's TextDecoder. This is the most common format for modern text payloads.",
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
                If the input is invalid, the tool does not crash or produce a
                confusing partial result. It shows a clear error message and leaves
                your text untouched so you can fix the input safely. This matters
                when you are working with long tokens, copy-pasted API responses,
                or data that may have been truncated by a chat app or email client.
              </p>
            </SectionCard>

            <SectionCard title="How to handle common Base64 problems" icon="list">
              <p>
                Most decoding failures come from a small set of issues: missing
                characters, extra symbols, or mixing “pretty-printed” Base64 with
                non-Base64 content. The suggestions below describe what to check,
                without trying to be overly clever.
              </p>

              <p className="mt-3">
                First, ensure the input is complete. Base64 strings are often long,
                and truncation is easy to miss. If you copied from logs or a UI that
                collapses long strings, try copying the raw value instead. If your
                Base64 came from a JSON object, confirm you copied the entire field.
              </p>

              <p className="mt-3">
                Next, look for extra characters. This page will ignore whitespace,
                but it will not silently ignore arbitrary punctuation. If your string
                includes quotes, commas, or surrounding markup, remove those parts.
                If the payload is a data URL, keep it as-is and the tool will decode
                the section after the comma.
              </p>

              <p className="mt-3">
                If your Base64 uses URL-safe formatting, the tool converts it to the
                standard alphabet. It also adds missing padding when the length is
                close to valid. However, if the length mod 4 is 1, that almost always
                indicates a broken or incomplete input. In that case, the best fix is
                to re-copy the original payload rather than trying to repair it.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Binary payloads
                  </div>
                  <p className="mt-2">
                    If the decoded output looks like random characters, the Base64 may
                    represent a file. This tool decodes to text for inspection. For a
                    true “Base64 to file” workflow, you would typically decode into a
                    byte array and then save it with the correct file type.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Encoding mismatch
                  </div>
                  <p className="mt-2">
                    UTF-8 is common, but not guaranteed. If you see many replacement
                    characters, the bytes may not be UTF-8 text. The Base64 may still be
                    valid, but the original content might be binary or a different text
                    encoding.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Privacy and indexing behavior" icon="type">
              <p>
                Decoding runs entirely in your browser. When you paste text into the
                editor, the conversion happens on your device using built-in browser
                APIs. The page does not send your text to a server as part of decoding.
                Upload is optional and exists only to help you load content from local
                files like .txt, .pdf, or .docx.
              </p>

              <p className="mt-3">
                The page itself is indexable, which helps people find it, but error
                states should not be indexed. When the decoder detects invalid input
                and shows an error message, it temporarily marks the page as noindex
                in the browser so search engines do not record a “broken” variant of
                the page. When you clear the error or fix the input, the page returns
                to normal indexable status.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Tip</div>
                <p className="mt-2 text-slate-700">
                  If you are decoding sensitive strings (tokens, keys, session payloads),
                  treat the decoded output as sensitive too. Copy only what you need,
                  and clear the editor when you are done.
                </p>
              </div>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">
                  Runs locally
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your text stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Decoding is computed from the editor value inside your browser.
                  This page does not upload your pasted text. You decide when to copy
                  the output or download it as a PDF.
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
