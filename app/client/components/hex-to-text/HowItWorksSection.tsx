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
                  How the Hex to Text Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Hex (hexadecimal) is a compact way to represent bytes. This tool turns hex bytes back into readable
                  ASCII text using predictable, validation-first rules. You paste hex, press convert, and the editor
                  is replaced with the decoded text so copying and downloading always match what you see.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Strict validation
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  ASCII only
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "LOGS", v: "Payloads and debug output" },
                { k: "BYTES", v: "0x.. and \\x.. strings" },
                { k: "TOKENS", v: "Hex-encoded fields" },
                { k: "EXPORTS", v: "Device dumps & snippets" },
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
            <SectionCard title="What counts as valid hex input" icon="list">
              <p>
                Hex input is treated as a sequence of bytes. A byte is exactly two hex characters, where each character is
                in the set 0–9 or A–F. Because real input often comes from terminals, logs, or debugger displays, this page
                accepts common “noise” around the bytes. Spaces, newlines, commas, colons, dashes, and underscores are
                treated as separators. Prefixes like <span className="font-semibold text-slate-900">0x</span> and
                <span className="font-semibold text-slate-900">\x</span> are also allowed.
              </p>

              <p className="mt-3">
                After separators and prefixes are removed, the remaining characters must be pure hex and the total length
                must be even. If you provide an odd number of hex characters, the tool cannot know how to group the final
                nibble into a full byte, so it returns a clear validation error instead of guessing. This “fail fast”
                behavior is intentional because guessing can silently corrupt data.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Example inputs that work
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li><span className="font-mono text-sm">48 65 6c 6c 6f</span> (space-separated bytes)</li>
                  <li><span className="font-mono text-sm">0x48,0x65,0x6C</span> (0x prefixes)</li>
                  <li><span className="font-mono text-sm">\x48\x65\x6c\x6c\x6f</span> (escape-style bytes)</li>
                  <li><span className="font-mono text-sm">48:65:6c:6c:6f</span> (colon-separated)</li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="How decoding is performed" icon="type">
              <p>
                Once the input is validated, the converter reads each pair of hex characters as a byte value from 0 to 255.
                This page intentionally targets ASCII text, so it accepts only bytes in the range 0 to 127. If a byte is
                greater than 127, the converter stops and reports the first non-ASCII byte it encountered, including the
                exact byte value. This keeps the output honest. If you actually need extended encodings (Latin-1, Windows-1252,
                UTF-8), a different decoder should be used because those encodings have different rules and can produce very
                different characters for the same bytes.
              </p>

              <p className="mt-3">
                Printable ASCII characters (decimal 32 through 126) are emitted directly as characters. For control characters
                (decimal 0 through 31) the behavior is more careful. Tabs and line breaks are common in real payloads, but
                pasting them into a single editor can make the result look “empty” or shift formatting unexpectedly. To keep
                the result copy-safe and visually explicit, this tool represents common whitespace controls as visible escapes:
                <span className="font-semibold text-slate-900">\n</span> for line feed,
                <span className="font-semibold text-slate-900">\r</span> for carriage return, and
                <span className="font-semibold text-slate-900">\t</span> for tab.
              </p>

              <p className="mt-3">
                Other control characters are shown as <span className="font-semibold text-slate-900">\xNN</span> escapes.
                That gives you a readable, lossless representation: you can see exactly which bytes were present, and you
                can copy the output into a bug report without hidden characters changing the meaning. If you want those
                control bytes to be applied as real newlines or tabs, you can replace the escapes afterward in a controlled way.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Validation first",
                    "The converter checks characters and byte length before decoding so you get an error early instead of partial output.",
                  ],
                  [
                    "ASCII scope",
                    "Only bytes 0–127 are accepted. Anything outside that range is flagged as non-ASCII to avoid misleading text.",
                  ],
                  [
                    "Copy-safe output",
                    "Tabs and line breaks are shown as \t, \n, and \r so the output stays stable when copied between apps.",
                  ],
                  [
                    "Preserves byte meaning",
                    "Control bytes are represented as \\xNN escapes rather than dropped, which prevents silent data loss.",
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

            <SectionCard title="Common pitfalls and how to avoid them" icon="type">
              <p>
                The most common issue is mixing formats. Sometimes a field is described as “hex” but actually contains decimal
                bytes, Base64, or a binary string. If your input includes characters outside 0–9 and A–F (after removing separators),
                it is not valid hex. Another common issue is a missing leading zero on a byte. For example, byte value 0x05 must be
                written as <span className="font-mono text-sm">05</span>, not <span className="font-mono text-sm">5</span>, because
                bytes are always two hex digits in this tool.
              </p>

              <p className="mt-3">
                If you see a non-ASCII error, that does not necessarily mean your data is “bad.” It often means the original bytes
                were intended for a different encoding, such as UTF-8. UTF-8 uses multi-byte sequences for many characters, so bytes
                above 127 are normal. This page stays strict because the request is hex to ASCII, but you can still use the result of
                validation to confirm that your hex parsing is correct before switching to a UTF-8-aware decoder elsewhere.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Quick checks</div>
                <ul className="mt-2 list-disc pl-5 space-y-2 text-slate-700">
                  <li>Remove prefixes like 0x and separators, then confirm you only have 0–9 and A–F.</li>
                  <li>Confirm the remaining hex has an even length (two characters per byte).</li>
                  <li>If you expected text but see many control escapes, your payload might be structured data, not prose.</li>
                  <li>If you hit non-ASCII bytes, the original text may have been UTF-8 or Windows-1252, not pure ASCII.</li>
                </ul>
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
                  Decoding happens on-device from the text in the editor. Uploading a file reads it locally so you can
                  decode without sending your input to a server. Copy and download are explicit actions you control.
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
