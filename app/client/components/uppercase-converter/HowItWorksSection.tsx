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
                  How the Uppercase Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page is intentionally simple: one editor, one conversion.
                  Paste or upload text, hit <span className="font-semibold">Convert to ALL CAPS</span>, then copy or download.
                  It does not rewrite your words and it does not make grammar claims. It only changes letter casing.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  One-click conversion
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Single textarea
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "HEADINGS", v: "Section titles and banners" },
                { k: "LABELS", v: "Forms, UI chips, tags" },
                { k: "CODES", v: "IDs, SKUs, short fields" },
                { k: "EMPHASIS", v: "Warnings and highlights" },
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
            <SectionCard title="One editor, predictable output" icon="list">
              <p>
                The tool uses a single textarea for both input and output. That matches real workflows: you paste text,
                convert it, and then you want the converted version to be the thing you copy, download, or keep editing.
                There is no second box to manage and no “preview” that can drift out of sync with what you export.
              </p>

              <p className="mt-3">
                When you click <span className="font-semibold text-slate-900">Convert to ALL CAPS</span>, the converter applies
                uppercase casing to the current content and replaces the textarea value. Everything that is not a letter is
                preserved. That includes punctuation, numbers, emojis, symbols, whitespace, and line breaks. If your text is
                multi-line (for example a list or a block of notes), it stays multi-line.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">What gets changed vs. what stays the same</div>
                <ul className="mt-2 list-disc pl-5 space-y-2">
                  <li>
                    <span className="font-semibold text-slate-900">Changes:</span> letter casing (a → A, b → B, ñ → Ñ, etc.).
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Preserves:</span> spacing, line breaks, punctuation, and numbers.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">Does not do:</span> rewriting, spellchecking, tone changes, or grammar fixes.
                  </li>
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="When uppercase is useful (and when it is not)" icon="type">
              <p>
                Uppercase is best when you need clarity and consistency in short text. It stands out visually, and many systems
                treat uppercase as a “safe default” for labels, identifiers, and UI chips. Common examples include:
                navigation headings, notice banners, short product labels, box titles, and quick status markers.
              </p>

              <p className="mt-3">
                It is also practical when you are normalizing content before it goes into a case-sensitive workflow. Some
                internal tools, spreadsheets, or vendor portals store text exactly as entered. If your team expects fields like
                an ID prefix or a location code to be uppercase, converting before you paste helps avoid one-off mismatches.
              </p>

              <p className="mt-3">
                Uppercase is not always the right choice for long paragraphs. All-caps blocks are harder to scan quickly,
                and they can look aggressive in customer-facing text. If you are working with multi-sentence copy, consider using
                a different casing style elsewhere, and reserve uppercase for the pieces that must stand out: headings, labels,
                and short calls to action.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">Acronyms and mixed-case brands</div>
                  <p className="mt-2">
                    Uppercase will flatten mixed-case styling. For example, “iPhone” becomes “IPHONE” and “eBay” becomes “EBAY”.
                    That is expected. If you need brand-exact casing, uppercase is usually the wrong mode for those strings,
                    or you should plan to restore the brand spelling manually after conversion.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">International characters</div>
                  <p className="mt-2">
                    The conversion uses Unicode-aware uppercasing in your browser, so accented letters generally convert correctly.
                    Some languages have locale-specific quirks (the classic example is Turkish dotted/dotless i). If you are working
                    with locale-sensitive text, do a quick visual check after conversion to confirm the result matches your needs.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Uploads and exports" icon="list">
              <p>
                You can paste text directly or load it from a file. Text-like formats such as TXT, CSV, JSON, and HTML can be read
                in the browser and converted immediately. For PDFs and DOCX files, in-browser extraction is possible, but it depends on
                optional libraries being installed in the app build.
              </p>

              <p className="mt-3">
                If you upload a PDF, the tool attempts to extract text from the document and then converts it to uppercase. This is a
                convenience feature. PDFs are layout-first formats, so extracted text may contain unusual spacing, missing line breaks,
                or words that appear out of order. If layout fidelity matters, you should treat the extracted text as a starting point
                and review it before copying it into a final destination.
              </p>

              <p className="mt-3">
                The download buttons export exactly what you see in the textarea. <span className="font-semibold text-slate-900">Download .txt</span> creates
                a plain text file, which is the most compatible option across devices. <span className="font-semibold text-slate-900">Download PDF</span> tries
                to generate a simple paginated PDF. If PDF export is not available in your build, the page falls back to the browser print
                dialog so you can “Save as PDF”.
              </p>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Practical workflow tip</div>
                <p className="mt-2 text-slate-700">
                  If you are converting content for a strict form field, paste the final uppercase output into the destination and verify
                  it before submitting. Some apps apply their own formatting rules on paste or enforce maximum lengths.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Common formatting gotchas" icon="type">
              <p>
                Uppercasing is straightforward, but a few practical details are worth knowing so your result matches what you intend.
                First, uppercase does not “fix” spacing. If your source text has double spaces, odd line wrapping, or tabs, those will
                still be there after conversion. If the destination you are pasting into collapses whitespace (for example some web forms),
                the pasted appearance may differ from what you see here even though the characters are identical.
              </p>

              <p className="mt-3">
                Second, many systems have length limits. All caps is often used in short fields (labels, headers, codes), and those fields
                may cut off or reject long strings. If you are preparing a value for a strict input, it can help to convert first, then
                trim or shorten the text to fit the destination limit so you do not lose important characters at the end.
              </p>

              <p className="mt-3">
                Finally, if you are pasting into a design tool or a rich-text editor, the destination may apply its own typography rules,
                such as changing quotes, replacing hyphens, or applying a different font where certain characters are missing. This page
                exports plain text. If you need styled output, copy the uppercase text and then apply styling in the destination app.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">If you need reversible changes</div>
                <p className="mt-2 text-slate-700">
                  Converting to uppercase replaces the content in the editor. If you might need the original casing later, copy your
                  original text somewhere safe before converting, or paste it into a temporary note so you can revert quickly.
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
                  Conversion is performed in your browser from the editor value. This page does not upload your text as part of the
                  conversion process. Uploading a file reads the file locally, extracts text (when supported), and then converts it on-device.
                  Copying is explicit: you choose when to copy and where to paste.
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
