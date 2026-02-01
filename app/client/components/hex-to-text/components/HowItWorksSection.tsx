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
                  How the Hex to Text Decoder Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This tool is built for one job: decode hexadecimal bytes into readable text, without extra complexity.
                  You paste hex into the textarea, click <span className="font-semibold">Decode to text</span>, and the decoded result replaces the editor content.
                  It is space tolerant, it validates the input, and it keeps the workflow minimal.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Space tolerant
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Single textarea
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "DEBUG", v: "Inspect hex payloads" },
                { k: "LOGS", v: "Decode byte strings" },
                { k: "DATA", v: "Reverse simple encodings" },
                { k: "TOOLS", v: "Quick local conversions" },
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
            <SectionCard title="Hex input, cleaned safely" icon="list">
              <p>
                Hex is a compact way to represent raw bytes, using two characters per byte. For example, the ASCII word
                “Hello” is five bytes, and it is commonly written as <span className="font-semibold text-slate-900">48 65 6c 6c 6f</span>.
                In real-world sources you will also see variations like <span className="font-semibold text-slate-900">48656c6c6f</span> (no spaces),
                mixed case letters, line breaks, commas, or a <span className="font-semibold text-slate-900">0x</span> prefix on each byte.
              </p>

              <p className="mt-3">
                This page is designed to be space tolerant. Before decoding, it removes common separators and optional <span className="font-semibold text-slate-900">0x</span> prefixes,
                then keeps only hex digits. That means you can paste hex copied from logs, debugging tools, packet dumps, or spreadsheets
                without manually reformatting it first.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">What is accepted</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-semibold text-slate-900">Hex digits:</span> 0-9 and a-f (upper or lower case).
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Whitespace:</span> spaces, tabs, and new lines anywhere.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Common separators:</span> commas, semicolons, colons, underscores, and hyphens.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Optional prefixes:</span> 0x48 0x65 style byte notation.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Validation that catches mistakes early" icon="type">
              <p>
                When hex decoding fails, it is usually because the input is not actually hex. A common example is copying a debug line that
                contains addresses, labels, or a “0b” binary segment mixed into the bytes. Another frequent issue is an incomplete byte at the end,
                where the cleaned input has an odd number of hex characters.
              </p>

              <p className="mt-3">
                This decoder validates the input before converting it. If it detects characters outside the allowed set, it shows an error instead of silently
                skipping data. If the number of hex digits is odd, it tells you exactly what is wrong: hex bytes require two digits per byte. That single check
                prevents subtle output shifts where every byte after the mistake would decode incorrectly.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Even-length rule</div>
                  <p className="mt-2">
                    Two hex digits represent one byte. If you see an even-length error, your final byte is missing one digit.
                    Fix it by adding a leading 0 to that last nibble or removing the stray character.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Avoid silent truncation</div>
                  <p className="mt-2">
                    Some tools will decode only the pairs they can parse and ignore the rest. That can hide problems.
                    Here, invalid characters are treated as an error so you can correct the source data.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="ASCII-focused decoding" icon="list">
              <p>
                Hex can represent any bytes, including binary data. This page is intentionally tuned for the most common “hex to text” intent:
                you have bytes that were meant to be readable characters. That is typically ASCII. ASCII covers bytes 0 through 127,
                with printable characters in the 32 to 126 range.
              </p>

              <p className="mt-3">
                When decoding, the tool converts each byte to a character. Tab, newline, and carriage return are preserved so multi-line text stays multi-line.
                Other control bytes (like null, bell, or escape) and any byte greater than 127 are replaced with the replacement character <span className="font-semibold text-slate-900">�</span>.
                That behavior is intentional. It prevents invisible characters from sneaking into the output and it makes non-ASCII bytes obvious at a glance.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">If your output looks strange</div>
                <p className="mt-2 text-slate-700">
                  If you see many replacement characters, your input may not be ASCII text. It could be UTF-8 bytes, compressed data, or a binary blob.
                  In that case, this page still helps you spot where readable segments exist, but you may need a UTF-8 aware decoder for full fidelity.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Single textarea workflow" icon="type">
              <p>
                The UI follows a simple rule: the textarea is the source of truth. When you click decode, the decoded text replaces the editor contents.
                That matches the usual workflow when you are decoding something for immediate use. You want the decoded result to be the thing you copy,
                export, or keep editing.
              </p>

              <p className="mt-3">
                If you need to keep the original hex, copy it somewhere before decoding, or use your browser undo to step back. Keeping the page minimal
                avoids the common problem of having two boxes that drift out of sync, where you copy the wrong one or export a stale preview.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Copy and export</div>
                <p className="mt-2 text-slate-700">
                  The <span className="font-semibold text-slate-900">Copy</span> button copies exactly what is currently in the textarea.
                  <span className="font-semibold text-slate-900"> Download PDF</span> exports the same content. That means you always export the exact decoded
                  text you can see, including line breaks.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Uploads and PDF download" icon="list">
              <p>
                You can paste hex directly, or upload a file that contains hex. Text-like formats such as TXT, CSV, JSON, and HTML can be read locally in your browser.
                For PDFs and DOCX files, extraction is possible, but only if your app build includes the optional libraries needed for in-browser parsing.
              </p>

              <p className="mt-3">
                If PDF export is available in your build (via an optional PDF generation library), the page will generate a simple paginated PDF. If it is not available,
                the tool falls back to the browser print dialog, where you can choose “Save as PDF”. Either way, the export content comes from the textarea, not from an
                internal cache, so the result matches what you see on screen.
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
                  Decoding happens on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  This decoder runs in your browser using the textarea value. It does not upload your hex as part of the conversion process.
                  Uploading a file reads the file locally and decodes it on-device. Copying and downloading are explicit actions you choose.
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
              d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
            />
          </svg>
        );
    }
  };

  return (
    <div className="rounded-3xl bg-white ring-1 ring-slate-200/80 p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/60">
          <Icon />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
