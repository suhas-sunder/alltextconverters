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
                  How the Text to Hex Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Hexadecimal is a compact way to display bytes. This page takes
                  your text, turns it into bytes using a simple encoding choice,
                  and formats those bytes as two-digit hex values you can copy
                  into logs, test fixtures, protocols, firmware tools, or debug
                  notes. Everything runs locally in your browser, so you can
                  safely convert sensitive snippets without sending them to a
                  server.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Byte accurate
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Local conversion
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "ASCII", v: "Strict 0 to 127" },
                { k: "UTF-8", v: "Unicode safe" },
                { k: "Latin-1", v: "0 to 255 bytes" },
                { k: "Format", v: "Delimiter, case" },
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
            <SectionCard title="Step 1: Choose how text becomes bytes" icon="type">
              <p>
                Hex is not a text format. It is a representation of raw bytes.
                The first decision this tool makes is how to convert the
                characters you typed into a byte sequence. That choice matters
                because different encodings produce different bytes for the
                same visible characters.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">ASCII (strict)</span>{" "}
                is the most predictable option when you are working with classic
                protocols, fixed-width test vectors, or systems that only accept
                English letters and a small symbol set. ASCII maps each
                character to a single byte in the range 0 to 127. This page
                enforces that rule. If your input includes characters outside
                ASCII, you get a clear error instead of silent corruption.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">UTF-8</span>{" "}
                is the safest option for modern text. UTF-8 can represent the
                full Unicode range, but it may produce multiple bytes for one
                character. For example, emoji and many non-Latin scripts are
                multi-byte. That is expected. If you are matching what a web
                application or JSON payload would send over the network, UTF-8
                is usually the right choice.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Latin-1</span>{" "}
                is useful when you need a simple one-character-to-one-byte
                mapping beyond ASCII. It supports bytes 0 to 255. This is common
                in legacy systems and certain file formats. It is not a
                universal solution, but it can be the most practical choice
                when you already know a downstream system treats bytes as
                ISO-8859-1.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Best-effort is not the goal here
                </div>
                <p className="mt-2">
                  Encoding errors are surfaced on purpose. When you are
                  converting to hex, you usually care about byte accuracy. A
                  silent replacement character can break checksums, signatures,
                  and protocol framing. If the tool blocks an input under ASCII
                  or Latin-1, switch to UTF-8 or remove the unsupported
                  characters.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Step 2: Format the hex output for your workflow" icon="list">
              <p>
                After the bytes are produced, the converter renders each byte
                as a two-digit hex value. From there, the formatting settings
                control how the values are separated and how they look when you
                paste them into another tool.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Uppercase vs lowercase",
                    "Uppercase hex (A-F) is common in documentation and many debuggers. Lowercase is common in code and some CLI tools. Pick the style that matches your destination so diffs stay clean.",
                  ],
                  [
                    "Delimiter",
                    "Choose no delimiter for compact strings, a space delimiter for readability, newline for one byte per line, or comma-space for quick lists. The delimiter does not change bytes, only presentation.",
                  ],
                  [
                    "0x prefix",
                    "Some languages and tools expect bytes written as 0xNN. This toggle prepends 0x to each byte without changing the actual byte values.",
                  ],
                  [
                    "Predictable output",
                    "The same input and settings always produce the same output. There is no language logic, no auto-correction, and no background normalization.",
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
                If you are preparing data for a code snippet, a common pattern
                is to use a comma-space delimiter and enable the 0x prefix so
                the output can be pasted into an array initializer. If you are
                pasting into a hex editor note or a support ticket, spaces
                without the prefix tend to be easiest to read. The key is to
                choose the format that reduces manual cleanup after you paste.
              </p>
            </SectionCard>

            <SectionCard title="File uploads and local processing" icon="list">
              <p>
                Upload is optional. If you prefer, paste your text directly.
                When you do upload, extraction happens in your browser. Text
                files are read as plain text. PDF and DOCX extraction requires
                optional libraries in your app build. When available, the tool
                pulls out raw text content and places it into the textarea so
                you can review it before converting.
              </p>

              <p className="mt-3">
                This route also accepts <span className="font-semibold text-slate-900">.bin</span>{" "}
                files. A binary upload is treated as raw bytes, and the tool
                renders those bytes as hex. That is helpful when you want to
                inspect a small binary blob without opening a dedicated hex
                editor. For large files, keep expectations realistic. Browsers
                can handle many cases, but extremely large inputs can be slow to
                render in a textarea.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    PDF and DOCX caveats
                  </div>
                  <p className="mt-2">
                    Document extraction is a best-effort step that can introduce
                    spacing artifacts. That is normal because layout and fonts
                    do not map perfectly to plain text. Always scan the
                    extracted text before converting to hex if you need exact
                    byte matches.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Why this is useful
                  </div>
                  <p className="mt-2">
                    Hex output is a common bridge between human-readable text
                    and byte-oriented tooling. It is used in packet dumps, hash
                    test vectors, embedded logs, key material inspection, and
                    debugging encoding problems across systems.
                  </p>
                </div>
              </div>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">
                  Privacy
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your input stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Conversions are computed from the textarea value in your
                  browser. This page does not upload your text or store it on a
                  server. Copy and download actions are explicit, and you can
                  clear the editor at any time.
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
