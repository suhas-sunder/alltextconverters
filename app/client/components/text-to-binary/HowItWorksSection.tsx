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
                  How the Text to Binary Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste ASCII text, choose 7-bit or 8-bit output, and convert it
                  into space-separated binary groups. This is a deterministic
                  encoder with predictable padding rules. It is designed for
                  quick education, debugging, and data-prep tasks, not for
                  language-aware text processing.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Runs locally
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  ASCII-only
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "7-bit", v: "Classic ASCII width" },
                { k: "8-bit", v: "ASCII with byte padding" },
                { k: "Spaces", v: "Readable group separator" },
                { k: "No guesswork", v: "Deterministic output" },
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
            <SectionCard title="What this tool outputs" icon="list">
              <p>
                The converter turns each character into a fixed-width binary
                group. If you choose 7-bit mode, each character becomes a
                7-character sequence like <span className="font-mono">1000001</span>.
                If you choose 8-bit mode, each character becomes an 8-character
                sequence like <span className="font-mono">01000001</span>.
                The groups are joined together with a single space so the result
                is readable and easy to copy into another tool.
              </p>

              <p className="mt-3">
                “Fixed width” is the key idea. The converter does not emit a raw
                bitstream without boundaries. Instead, it pads each group with
                leading zeros so every token is the same length. That makes it
                straightforward to count characters, scan for mistakes, and
                round-trip the data using a binary decoder.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Example
                </div>
                <p className="mt-2">
                  Input: <span className="font-mono">Hi!</span>
                  <br />
                  7-bit output: <span className="font-mono">1001000 1101001 0100001</span>
                  <br />
                  8-bit output: <span className="font-mono">01001000 01101001 00100001</span>
                </p>
              </div>
            </SectionCard>

            <SectionCard title="ASCII-only, explicitly" icon="type">
              <p>
                This page is intentionally limited to ASCII. ASCII is a small
                character set where each character maps to a number from 0 to
                127. That includes letters, digits, punctuation, and control
                codes like tab and newline. In ASCII, the mapping is stable and
                unambiguous, which makes it ideal for learning and for simple
                conversion jobs where you want predictable output.
              </p>

              <p className="mt-3">
                If your input contains characters beyond ASCII, such as emoji,
                accented letters (for example “é”), or many non-Latin scripts,
                this converter stops and shows a clear error. That is on
                purpose. There are multiple reasonable ways to represent
                non-ASCII text as bits (UTF-8 bytes, UTF-16 code units, and
                other encodings). Without you choosing an encoding, “text to
                binary” becomes guesswork, and the output becomes hard to
                interpret.
              </p>

              <p className="mt-3">
                If you need Unicode support, the right approach is to convert
                your text into a byte encoding (commonly UTF-8), then represent
                those bytes in binary. This tool does not do that. It focuses on
                ASCII so you can trust that one character equals one fixed-width
                binary token.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Why 7-bit exists",
                    "Original ASCII fits in 7 bits. Many diagrams, tutorials, and classroom exercises use 7-bit groups because it matches the historical spec.",
                  ],
                  [
                    "Why 8-bit is common",
                    "Modern systems store data in bytes. 8-bit output is 7-bit ASCII padded to a full byte so it aligns with how files and memory are organized.",
                  ],
                  [
                    "Newlines and tabs",
                    "Control characters are still ASCII. They are encoded too, which is useful for debugging, but can make the output longer than you expect.",
                  ],
                  [
                    "Spaces in output",
                    "Spaces are separators between tokens. They are not part of the encoded data, and they make copying and inspection easier.",
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

            <SectionCard title="7-bit vs 8-bit: what changes" icon="list">
              <p>
                The only difference between 7-bit and 8-bit mode is padding.
                The underlying numeric value for each ASCII character is the
                same. For example, the letter <span className="font-mono">A</span>{" "}
                is decimal 65 in ASCII. In binary, 65 is{" "}
                <span className="font-mono">1000001</span>. That is the 7-bit
                representation. In 8-bit mode, the converter adds one leading
                zero to form <span className="font-mono">01000001</span>.
              </p>

              <p className="mt-3">
                If you are preparing data for a worksheet, a lesson, or a quick
                conversion back to text, either mode can work. Use 7-bit when
                the audience expects classic ASCII groups. Use 8-bit when you
                want “byte looking” output that matches how most tools display
                binary for files.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Practical tip
                </div>
                <p className="mt-2 text-slate-700">
                  If you plan to paste your binary into another tool that expects
                  bytes, pick 8-bit mode. If you are working from a tutorial
                  that shows 7-bit ASCII, pick 7-bit mode so your results match
                  the examples exactly.
                </p>
              </div>
            </SectionCard>

            
            <SectionCard title="Common workflows and edge cases" icon="list">
              <p>
                People use “text to binary” for a few recurring jobs. In
                classrooms, it helps you verify that you understand the mapping
                from characters to numeric codes. In engineering work, it is
                useful when you are inspecting a protocol, a fixed-width field,
                or an embedded system log that expects a specific bit width. It
                is also handy for sanity-checking sample data when you are
                writing a decoder and want a quick known-good input.
              </p>

              <p className="mt-3">
                The most common surprise is whitespace. Spaces, tabs, and line
                breaks are characters too. If your input has a trailing newline,
                it will produce an extra token at the end. That is not wrong, it
                is just easy to overlook. If you are preparing a binary string
                for a website form or a homework submission that expects a
                specific number of tokens, remove extra blank lines before you
                convert, or count characters carefully.
              </p>

              <p className="mt-3">
                Another common issue is “smart” punctuation from mobile or word
                processors. Curly quotes, long dashes, and certain symbols are
                not ASCII. When this tool rejects your input, it usually means
                one of those characters snuck in. A quick fix is to replace
                curly quotes with straight quotes, replace em/en dashes with a
                normal hyphen, and remove emoji. After that, conversion is
                stable and predictable.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Logs and exports
                  </div>
                  <p className="mt-2">
                    If you are exporting identifiers, short labels, or
                    fixed-format fields, 8-bit mode keeps everything byte-aligned
                    and is usually the safest choice for copy/paste into other
                    utilities.
                  </p>
                </div>
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Learning exercises
                  </div>
                  <p className="mt-2">
                    If you are following an ASCII chart or a tutorial that shows
                    7-bit groups, use 7-bit mode so the padding and token widths
                    match what you are studying.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Uploads, downloads, and privacy" icon="type">
              <p>
                You can upload a text file (like TXT), or extract text from PDF
                and DOCX in the browser if the optional libraries are installed
                in your project. Uploading does not send your content to a
                server. The file is read locally, the extracted text is placed
                into the textarea, and you decide when to convert.
              </p>

              <p className="mt-3">
                After conversion, you can copy the binary result or download it
                as a TXT file. PDF export is provided for convenience when you
                need a printable handout or a saved artifact. PDF export relies
                on an optional PDF library. If the library is not available, the
                page falls back to your browser’s print dialog, where you can
                “Save as PDF”.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Best-effort reminder
                </div>
                <p className="mt-2">
                  This converter is designed for ASCII text. If you need
                  byte-level control for arbitrary files, use a binary-to-hex or
                  byte viewer and treat the data as bytes, not as text. “Text”
                  always implies an encoding choice, and this tool keeps that
                  choice explicit by staying in ASCII.
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
                  Conversion happens in your browser from the current textarea
                  value. This page does not upload your text for processing.
                  Copying and downloading are explicit actions you trigger.
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
