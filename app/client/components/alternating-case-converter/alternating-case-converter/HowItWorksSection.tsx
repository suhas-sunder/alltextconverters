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
                  How the Alternating Case Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page applies a simple pattern to your text: letters switch between
                  uppercase and lowercase as the tool walks left to right. It is intentionally
                  deterministic and mechanical. There is no dictionary lookup, no language
                  detection, and no attempt to “fix” spelling or punctuation. You paste or
                  upload text, click <span className="font-semibold">Convert to Alternating Case</span>,
                  then copy or download the result.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Deterministic rules
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Optional: count spaces
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "STYLE", v: "Playful emphasis and memes" },
                { k: "VISUAL", v: "Quick contrast in labels" },
                { k: "A/B", v: "Test formatting variants" },
                { k: "FUN", v: "Lightweight text effects" },
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
            <SectionCard title="What “alternating case” means on this page" icon="list">
              <p>
                Alternating case is a character-by-character formatting pattern. The converter
                scans your text from the first character to the last. Each time it encounters
                a letter, it flips the letter’s casing: one letter becomes uppercase, the next
                letter becomes lowercase, then uppercase again, and so on. Characters that are
                not letters (numbers, punctuation, symbols, line breaks) are preserved.
              </p>

              <p className="mt-3">
                The goal is predictability. You should be able to look at a result and understand
                why any given character is uppercased or lowercased. The converter does not treat
                words as units, and it does not try to keep acronyms intact. If your input includes
                mixed case already, the tool does not “respect” it. It applies the alternating
                pattern across the full sequence.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">What changes vs. what stays stable</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-semibold text-slate-900">Changes:</span> letter casing only.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Preserves:</span> spacing, line breaks, punctuation, emojis, and digits.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">No language logic:</span> no grammar correction, no “title rules”, no spellchecking.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="The “Ignore spaces” toggle" icon="type">
              <p>
                Alternating patterns can be interpreted in two common ways. Some tools treat spaces
                as separators that should not affect the pattern, while others treat spaces as
                ordinary characters that do affect which letters end up uppercase vs. lowercase.
                This page supports both behaviors so you can get the look you want.
              </p>

              <p className="mt-3">
                When <span className="font-semibold text-slate-900">Ignore spaces</span> is enabled,
                spaces do not advance the pattern. That means the alternation continues “through” the
                gap. Example: if the last letter of a word is uppercase, the first letter of the next
                word will become lowercase, even though a space sits between them. This setting tends
                to produce a more uniform, consistent wave across multi-word text.
              </p>

              <p className="mt-3">
                When <span className="font-semibold text-slate-900">Ignore spaces</span> is disabled,
                regular spaces count as steps in the sequence. The space itself is still a space, but it
                advances the pattern so the next letter flips compared to the ignore-spaces behavior.
                This can be useful if you want each word to “restart” visually in a slightly different
                place, or if you are matching a specific alternating-case style seen in a template or
                in existing content.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Punctuation and digits</div>
                  <p className="mt-2">
                    Punctuation and digits never change and they do not advance the letter pattern on this page.
                    A hyphen, comma, emoji, or number will stay exactly as-is, and alternation continues across letters
                    surrounding it. This keeps results predictable and avoids surprising shifts.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Why only spaces are optional</div>
                  <p className="mt-2">
                    The toggle targets the most common formatting decision people care about: whether word breaks
                    should affect the pattern. Treating all whitespace or all punctuation as “countable” tends to
                    create results that feel arbitrary, so the tool keeps those rules fixed.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Good uses and practical limits" icon="list">
              <p>
                Alternating case is mostly a visual effect. It is popular in informal contexts: playful captions,
                stylized social posts, quick emphasis in a chat, or a deliberate “mocking” tone that relies on mixed
                casing. Some people also use it as a quick way to make text stand out in a UI mock or a slide without
                changing fonts or adding bold styling.
              </p>

              <p className="mt-3">
                That said, alternating case is usually not appropriate for professional copy, accessibility-focused UI,
                or long paragraphs. Screen readers can still read mixed-case text, but the visual noise can make scanning
                harder. If you are formatting labels or headings for a product, treat this as a special-purpose option
                rather than a default.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Tip for consistency</div>
                <p className="mt-2 text-slate-700">
                  If you need a stable output for the same input every time, keep the toggle setting the same.
                  The conversion is deterministic: the same text plus the same “Ignore spaces” choice always yields
                  the same result.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Uploads and exports" icon="type">
              <p>
                You can paste directly into the editor or upload a file. Text-like formats (TXT, CSV, JSON, HTML, and
                similar) are read locally in your browser and converted immediately. PDF and DOCX extraction can also
                work in-browser, but those formats require optional libraries in your app build.
              </p>

              <p className="mt-3">
                PDFs are layout-first documents. Text extraction can introduce artifacts: strange spacing, missing line
                breaks, repeated headers, or word order that differs from what you see visually on the page. If you upload
                a PDF, use the extracted text as a starting point and do a quick review before you copy or export.
              </p>

              <p className="mt-3">
                The export buttons save exactly what is in the textarea. <span className="font-semibold text-slate-900">Download PDF</span>{" "}
                attempts to generate a simple paginated PDF. If PDF export is not available in your build, the page falls
                back to the browser print dialog so you can “Save as PDF”. Copy uses your clipboard, so you can paste the
                output into any destination app immediately.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">Optional libraries</div>
                <p className="mt-2 text-slate-700">
                  PDF export requires <span className="font-semibold text-slate-900">jspdf</span>. PDF text extraction requires{" "}
                  <span className="font-semibold text-slate-900">pdfjs-dist</span>, and DOCX extraction requires{" "}
                  <span className="font-semibold text-slate-900">mammoth</span>. If those packages are not installed, uploads may still
                  work for plain text files, and PDF export will fall back to printing.
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
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">Your text stays on your device</h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Conversion is performed in your browser from the editor value. This page does not send your text to a server
                  as part of the conversion process. Uploading a file reads it locally, extracts text on-device (when supported),
                  and then applies the alternating-case pattern locally. Copying is explicit, and you control where the text goes next.
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
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
