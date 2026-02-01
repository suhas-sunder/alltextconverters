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
                  How the Binary to Text Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page decodes binary (a stream of 0s and 1s) into human-readable output. It is designed for real inputs:
                  spaced groups, line breaks, copied logs, and even raw <span className="font-semibold">.bin</span> files.
                  Everything runs locally in your browser, so you can paste sensitive data and still keep the workflow simple.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Auto 7/8-bit
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Runs locally
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Text", v: "Readable output" },
                { k: "Decimal", v: "Byte values" },
                { k: "Hex", v: "0–FF bytes" },
                { k: "Octal", v: "Legacy formats" },
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
            <SectionCard title="Step 1: Clean the input into a bit stream" icon="list">
              <p>
                Binary shows up in many shapes. Sometimes it is perfectly grouped into bytes like{" "}
                <span className="font-mono">01001000 01101001</span>. Other times it is copied from a console, wrapped across lines,
                or sprinkled with commas and tabs. This tool starts by extracting only the characters that matter:{" "}
                <span className="font-semibold">0</span> and <span className="font-semibold">1</span>.
              </p>

              <p className="mt-3">
                Everything else is treated as a separator and is ignored. That means you can paste input with spaces, commas,
                or line breaks and still decode it correctly. If the input includes stray characters (for example,{" "}
                <span className="font-mono">0b</span> prefixes or timestamps), they are safely dropped and the summary shows
                how many characters were ignored. This is deliberate: in “decoder” workflows you usually want predictable extraction,
                not strict validation that blocks your progress.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Practical note</div>
                <p className="mt-2">
                  If your binary is meant to represent bytes, ensure the cleaned bit count is a multiple of 8. If it is not, this
                  tool will ignore the trailing remainder and report it so you can correct the source if needed.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Step 2: Auto-detect 7-bit vs 8-bit" icon="type">
              <p>
                ASCII is historically a <span className="font-semibold">7-bit</span> character set, but most real data is stored as{" "}
                <span className="font-semibold">8-bit</span> bytes. In practice, you will encounter both. A classic “Hello”
                example is often shown as 8-bit groups, while some older systems and teletypes used 7-bit packing.
              </p>

              <p className="mt-3">
                Auto mode tries both interpretations and scores the results for readability. The scoring is intentionally simple:
                printable ASCII characters are rewarded, while control characters are penalized. When both modes look equally plausible,
                the converter prefers 8-bit because it matches how files and network data are typically represented today.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Use 8-bit when",
                    "Your input comes from bytes (files, hex/binary dumps, .bin uploads, network captures, or tools that show 8-bit groups).",
                  ],
                  [
                    "Use 7-bit when",
                    "You know the source is packed ASCII, or the output looks shifted/wrong in 8-bit but becomes readable in 7-bit.",
                  ],
                  [
                    "Why output can look “garbled”",
                    "If you decode the wrong width, every group boundary moves and the resulting byte values change completely.",
                  ],
                  [
                    "Trailing remainder",
                    "If your bit count is not divisible by the chosen width, the leftover bits are ignored to keep the decode deterministic.",
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

            <SectionCard title="Step 3: Choose text decoding and numeric formats" icon="list">
              <p>
                After the converter forms 7-bit or 8-bit groups, you can decide how you want to view the result. If you choose{" "}
                <span className="font-semibold">Text</span>, the groups are treated as bytes and decoded into characters.
                For modern content, <span className="font-semibold">UTF-8</span> is the right default. If the bytes are from older sources,
                switching to a single-byte encoding like ISO-8859-1 or Windows-1252 can make the output more readable.
              </p>

              <p className="mt-3">
                If you choose a numeric output, the converter formats each group value as Decimal, Hex, or Octal. This is useful when you
                are debugging protocols, comparing against documentation, or verifying that a binary payload matches expected byte sequences.
                The delimiter field controls how values are separated. A single space is the most readable default, but commas, newlines, or tabs
                can be useful depending on where you paste the result.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Delimiter tips</div>
                  <p className="mt-2">
                    For numeric outputs, set the delimiter to <span className="font-mono">, </span> to create a copy-paste list,
                    or to <span className="font-mono">\n</span> if you want one value per line. For Text output, only enable
                    “insert delimiter between characters” if you are intentionally producing spaced characters for readability.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Encoding expectations</div>
                  <p className="mt-2">
                    UTF-8 can represent multi-byte characters, so a byte stream that is not valid UTF-8 may show replacement characters.
                    In that case, try a single-byte encoding. If your browser does not support a selected encoding, the tool safely falls back
                    to direct byte-to-character mapping rather than failing.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Uploading .bin files and other inputs" icon="type">
              <p>
                The Upload button supports the same text-like formats as the rest of the site, plus <span className="font-semibold">.bin</span>.
                When you upload a .bin file, the tool reads raw bytes locally and converts them into 8-bit binary groups so you can immediately
                inspect or decode them. This is helpful when you have a small binary blob and you want to see whether it contains recognizable text.
              </p>

              <p className="mt-3">
                Uploading PDFs and DOCX files is supported for consistency, but those formats are not inherently “binary strings” in the way this
                tool expects. For those files, the page extracts text (if optional libraries are installed) and places it in the editor so you can
                decode any binary digits that were present in the extracted content. If your goal is to decode raw file bytes, use .bin.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Best-effort by design</div>
                <p className="mt-2 text-slate-700">
                  This converter prioritizes practical decoding over strict validation. It will never crash your tab on malformed input.
                  Instead, it reports what was ignored and what was decoded so you can iterate quickly.
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
                  Your decoding happens on-device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Conversions are computed from the editor value in your browser. This page does not send your binary, decoded text, or uploaded files
                  to a server. Copying and downloading are explicit actions you control.
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M9 6v12m6-12v12" />
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
