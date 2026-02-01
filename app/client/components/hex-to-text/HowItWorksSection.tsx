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
                  This tool decodes hexadecimal bytes into plain ASCII text. It is designed for the common case: you have
                  hex like <span className="font-semibold">48 65 6c 6c 6f</span> and you want the readable string it represents.
                  Input is space tolerant, validation is strict, and decoding runs locally in your browser.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Space tolerant
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  ASCII focused
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "DEBUG", v: "Inspect payloads and logs" },
                { k: "DATA", v: "Decode hex dumps" },
                { k: "DEV", v: "Reverse small encodings" },
                { k: "TOOLS", v: "Quick conversions" },
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
            <SectionCard title="What “hex to text” really means" icon="type">
              <p>
                Hexadecimal (usually shortened to “hex”) is a way to write bytes using the digits 0–9 and the letters A–F.
                Two hex characters represent one byte. For example, the byte value 72 in decimal is 48 in hex.
                When you see a sequence like <span className="font-semibold text-slate-900">48 65 6C 6C 6F</span>, you are
                looking at five bytes. If those bytes are ASCII codes, they map directly to characters: 0x48 is “H”, 0x65 is “e”,
                0x6C is “l”, and so on.
              </p>

              <p className="mt-3">
                This page targets that exact workflow. It treats your input as a list of bytes, converts each pair of hex characters
                into a number from 0 to 255, and then decodes that number into a character. Because you asked for ASCII output,
                the decoder keeps values 0–127 as real ASCII characters. If it encounters a byte above 127, it replaces it with a
                placeholder so the output stays ASCII-safe and you still get a usable result.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Quick mental model</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-semibold text-slate-900">2 hex characters</span> = 1 byte.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Bytes 0–127</span> can map to ASCII characters.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Whitespace</span> is ignored, so you can paste dumps with spaces or newlines.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Space-tolerant input, strict validation" icon="list">
              <p>
                Hex often shows up formatted in different ways: spaced pairs (<span className="font-semibold text-slate-900">48 65</span>),
                wrapped lines, or copied from tools that insert tabs and line breaks. This decoder ignores whitespace completely, so
                you can paste hex from logs, Wireshark, database exports, or terminal output without manually reformatting.
              </p>

              <p className="mt-3">
                The one thing it does not tolerate is “almost hex”. After whitespace is removed, every character must be a valid hex digit
                (0–9, A–F). If anything else appears, the page shows a clear error. It also checks for an even number of hex characters,
                because odd-length input means a byte is missing half its digits.
              </p>

              <p className="mt-3">
                The goal of strict validation is to prevent silent corruption. If a decoder tries to guess what you meant, you can end up with
                output that looks readable but is wrong. Here, errors are explicit: fix the input, and the output becomes trustworthy.
              </p>
            </SectionCard>

            <SectionCard title="ASCII output and what happens to non-ASCII bytes" icon="shield">
              <p>
                ASCII is the simplest byte-to-text mapping. It covers basic English letters, digits, punctuation, and a small set of control
                characters. In practice, many hex strings are ASCII because they encode identifiers, short messages, headers, or debugging
                payloads.
              </p>

              <p className="mt-3">
                Sometimes, hex represents UTF-8 text or binary formats. UTF-8 often includes bytes above 127, especially for emojis or non-English
                characters. Because this page is ASCII-focused, bytes above 127 are replaced with a placeholder character. That makes it obvious that
                the input contains data outside ASCII, and it prevents the tool from producing misleading characters.
              </p>

              <p className="mt-3">
                Control bytes (like 0x00 or 0x1B) are also worth calling out. They are valid ASCII values, but they may not render visibly in a browser.
                The decoder preserves them in the output string. If you copy the output into a code editor, you will get the exact bytes as characters,
                even if the on-page preview looks empty in spots.
              </p>
            </SectionCard>

            <SectionCard title="Copy, uploads, and downloads" icon="download">
              <p>
                The workflow is kept lean: one textarea for the hex input, then a decoded output panel underneath. The “Copy output” button copies the
                decoded ASCII string to your clipboard. This is what you usually want when decoding hex: you are trying to get a readable identifier,
                message, or header value into another tool.
              </p>

              <p className="mt-3">
                Uploading works locally in the browser. If you upload a text-like file, the page reads it and drops the contents into the textarea.
                That is useful for hex dumps stored as .txt, .csv, or .log files. For PDF and DOCX, the page attempts in-browser extraction if your app
                includes optional libraries. If those libraries are not installed, you get a clear message explaining the limitation.
              </p>

              <p className="mt-3">
                Downloads are provided for the decoded output. A plain text download gives you a quick artifact you can save or attach. PDF download creates
                a simple PDF from the decoded text (and if PDF generation is not available, the tool falls back to your browser’s print dialog so you can
                save as PDF).
              </p>

              <p className="mt-3">
                Privacy is straightforward: decoding happens on-device. The page does not need to send your hex to a server to produce results. That is
                especially important when hex contains tokens, IDs, or internal payload fragments.
              </p>
            </SectionCard>

            <SectionCard title="Common examples and troubleshooting" icon="help">
              <p>
                If you paste <span className="font-semibold text-slate-900">48656c6c6f</span>, you will get “Hello”. If you paste
                <span className="font-semibold text-slate-900">48 65 6c 6c 6f 0a</span>, the 0A at the end is a newline, so the output will include a
                line break.
              </p>

              <p className="mt-3">
                If you see an “odd number of hex characters” error, it usually means a nibble was dropped during copy/paste or the string was cut off.
                If you see “invalid hex input”, look for separators like commas, colons, or a stray “g” character. Remove those and keep only hex digits
                and whitespace.
              </p>

              <p className="mt-3">
                If the output contains many placeholders, the data is probably not ASCII. In that case, the hex may represent UTF-8 text, compressed data,
                or a binary structure. This page is intentionally limited to ASCII decoding for clarity. If you need UTF-8 decoding, use a dedicated UTF-8
                bytes-to-string tool so you do not lose information.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>
    </section>
  );
}

type SectionCardProps = {
  title: string;
  icon: "list" | "type" | "download" | "help" | "shield";
  children: React.ReactNode;
};

function SectionCard({ title, icon, children }: SectionCardProps) {
  const iconNode =
    icon === "list" ? (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 font-bold">
        ≡
      </span>
    ) : icon === "type" ? (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-200 font-bold">
        Aa
      </span>
    ) : icon === "download" ? (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 font-bold">
        ↓
      </span>
    ) : icon === "shield" ? (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-200 font-bold">
        ✓
      </span>
    ) : (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-200 font-bold">
        ?
      </span>
    );

  return (
    <div className="rounded-3xl bg-white ring-1 ring-slate-200/70 p-6 sm:p-7">
      <div className="flex items-start gap-4">
        {iconNode}
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
