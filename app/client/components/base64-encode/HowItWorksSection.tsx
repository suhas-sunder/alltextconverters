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
                  How the Base64 Encoder Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste text, encode it to Base64, and copy the result. This
                  tool is designed for practical workflows like preparing data
                  for APIs, configuration files, and test fixtures. The
                  conversion runs locally in your browser so your input never
                  needs to leave your device.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Runs locally
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Unicode-safe
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "APIs", v: "Payloads, tokens, fixtures" },
                { k: "Data URLs", v: "Embed small content blocks" },
                { k: "Config", v: "Environment values, secrets" },
                { k: "Testing", v: "Golden strings, snapshots" },
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
            <SectionCard title="Base64 is an encoding, not encryption" icon="list">
              <p>
                Base64 is a way to represent bytes using a limited alphabet
                (letters, numbers, +, and /, with optional = padding). It is
                often used when you need to move data through systems that are
                not friendly to raw bytes or special characters. That includes
                JSON fields that must be ASCII-safe, HTTP headers, URL
                parameters in controlled settings, and legacy protocols.
              </p>

              <p className="mt-3">
                The key point is that Base64 does not hide content. Anyone can
                decode it. If you are working with sensitive material, protect
                it with real security controls (transport encryption, access
                control, and proper secret management). Base64 is best thought
                of as a compatibility layer that makes data easier to transmit,
                store, and compare across environments.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Common reasons Base64 appears in real projects
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    Embedding small binary blobs (or binary-like content) inside
                    JSON or YAML without breaking parsers.
                  </li>
                  <li>
                    Producing deterministic test fixtures that are stable across
                    platforms and line ending differences.
                  </li>
                  <li>
                    Moving text through systems that strip non-ASCII characters
                    or normalize whitespace in unexpected ways.
                  </li>
                  <li>
                    Creating payloads for APIs that explicitly require Base64
                    (many do for attachments and file content).
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Unicode-safe encoding, step by step" icon="type">
              <p>
                Browser APIs like <span className="font-semibold text-slate-900">btoa</span>{" "}
                were originally designed around Latin-1 strings, which becomes a
                problem the moment your text includes emoji, accents, or
                non-Latin scripts. This page avoids that trap by converting your
                input into UTF-8 bytes first, then Base64 encoding those bytes.
                That is the “Unicode-safe” part.
              </p>

              <p className="mt-3">
                Under the hood, the conversion follows a simple, deterministic
                pipeline:
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "1) UTF-8 bytes",
                    "The browser's TextEncoder converts your JavaScript string into a UTF-8 byte array. This preserves every character reliably.",
                  ],
                  [
                    "2) Byte stream → Base64",
                    "Those bytes are converted to a binary string and passed to btoa to produce standard Base64.",
                  ],
                  [
                    "3) No network calls",
                    "The input and output stay in memory in your browser tab. There is no server round-trip and no background upload.",
                  ],
                  [
                    "4) Predictable output",
                    "Given the same input text, you get the same Base64 output. This is useful for diffing, snapshots, and reproducible tests.",
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
                Because the algorithm is byte-based, it behaves well with mixed
                text like “Résumé ✅”, Arabic, Japanese, or multi-line notes. You
                do not need to pre-normalize your text just to encode it. If you
                upload a file, extraction happens in your browser as well (PDF
                and DOCX extraction require optional libraries in your app).
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Practical limitation
                </div>
                <p className="mt-2 text-slate-700">
                  Very large inputs can exceed browser memory limits or hit
                  Base64 API constraints. If encoding fails, try a smaller chunk
                  of text, or split the job into multiple runs and combine the
                  results where appropriate for your system.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Copy, download, and typical edge cases" icon="list">
              <p>
                After encoding, you can copy the Base64 output directly or
                download it as a PDF. Copy is explicit: you click Copy, then
                paste wherever you need the string. That helps avoid the “did
                the app reformat my content on paste?” problem in strict fields
                like JSON editors, form inputs, and configuration panels.
              </p>

              <p className="mt-3">
                Base64 output is often long. Many systems wrap it across lines
                for readability, but some systems require a single unbroken
                line. This page keeps your output exactly as produced, without
                inserting line breaks. If your destination expects wrapped
                Base64 (for example, MIME-style line lengths), do that wrapping
                explicitly with a tool designed for that specific format.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Whitespace and newlines
                  </div>
                  <p className="mt-2">
                    Newlines are treated as real characters. If you copy text
                    from an editor that adds trailing newlines, your Base64 will
                    include them. If you want a “single line” input, remove
                    extra line breaks before encoding.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Padding characters
                  </div>
                  <p className="mt-2">
                    Standard Base64 may end with one or two = characters. That
                    padding is normal and helps decoders recover the original
                    byte length. Do not strip padding unless your destination
                    explicitly uses a padding-free variant.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  What this tool does not do
                </div>
                <p className="mt-2">
                  This page encodes text to Base64. It does not encrypt, compress,
                  or “sanitize” content. It also does not guess your target
                  format (URL-safe Base64, MIME wrapping, or custom alphabets).
                  If you need a specialized variant, use a dedicated encoder for
                  that standard.
                </p>
              </div>
            </SectionCard>


            <SectionCard title="URL-safe variants and common gotchas" icon="type">
              <p>
                You will sometimes see “URL-safe Base64” mentioned in API docs.
                Standard Base64 uses <span className="font-semibold text-slate-900">+</span>{" "}
                and <span className="font-semibold text-slate-900">/</span>{" "}
                characters, which can be inconvenient inside URLs or filenames.
                URL-safe variants swap those characters (usually to <span className="font-semibold text-slate-900">-</span>{" "}
                and <span className="font-semibold text-slate-900">_</span>) and
                may remove padding. This page outputs standard Base64 because it
                is the most widely accepted and the safest default for
                copy-and-paste workflows.
              </p>

              <p className="mt-3">
                If your destination explicitly requires the URL-safe alphabet,
                you can convert the output with a simple deterministic change:
                replace <span className="font-semibold text-slate-900">+</span>{" "}
                with <span className="font-semibold text-slate-900">-</span>{" "}
                and <span className="font-semibold text-slate-900">/</span>{" "}
                with <span className="font-semibold text-slate-900">_</span>.
                Some systems also expect padding to be removed. Only do that if
                your target spec says so, because many decoders still rely on
                padding for strict validation.
              </p>

              <p className="mt-3">
                Another common surprise is that Base64 makes strings longer.
                The encoded output is typically about one third larger than the
                original byte length. That is normal: the encoding trades
                compactness for compatibility. If you are hitting field limits,
                consider whether your system supports binary uploads, gzip
                compression before encoding, or passing a reference instead of
                embedding the full content.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  When you should not use Base64
                </div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    When you need confidentiality. Base64 is reversible and
                    offers no protection.
                  </li>
                  <li>
                    When size is critical. Encoded strings grow and can exceed
                    limits in cookies or headers.
                  </li>
                  <li>
                    When you actually need a hash. Checksums and signatures are
                    different tools with different goals.
                  </li>
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
                  Your text stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Encoding is computed from the editor value in your browser. This
                  page does not upload your text or store it on the server. If you
                  choose to upload a file, it is read locally in your browser tab,
                  and the extracted text is encoded locally as well.
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
