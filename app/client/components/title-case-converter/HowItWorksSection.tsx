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
                  How the Title Case Converter Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page converts text to a predictable Title Case format using
                  simple, deterministic rules. Paste text into the editor or upload
                  a file, click <span className="font-semibold">Convert to Title Case</span>,
                  then copy the result or export it as a PDF. There is no language model
                  behavior here and no style guide logic. It is a fast formatting tool.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Deterministic rules
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  One textarea
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Headings", v: "Clean section titles" },
                { k: "Lists", v: "Consistent bullets" },
                { k: "Catalogs", v: "Product names" },
                { k: "Docs", v: "Readable labels" },
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
            <SectionCard title="Simple Title Case, not editorial Title Case" icon="type">
              <p>
                Many people say “title case” but mean different things. Some style
                guides apply special rules for “small words” like “and”, “or”, and “the”.
                Others preserve acronyms, handle brand casing, or treat hyphenated phrases
                in specific ways. This converter does not attempt any of that. It follows a
                straightforward algorithm so the output is predictable and repeatable.
              </p>

              <p className="mt-3">
                The core behavior is: each word gets its first letter uppercased, and the
                remaining letters in that word are lowercased. Word boundaries are based
                on whitespace and common punctuation. Apostrophes and hyphens are treated
                as part of a word so “don’t” becomes “Don’t” and “re-entry” becomes “Re-entry”.
                Everything that is not a letter stays as it is, including numbers, symbols,
                emojis, and punctuation marks.
              </p>

              <p className="mt-3">
                This focus on deterministic formatting is useful when you want a uniform look
                across headings, labels, and lists, but you do not want the tool to guess at
                meaning. If a system has strict casing requirements, a predictable baseline is
                often more valuable than an intelligent guess that changes between runs.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "What changes",
                    "Letters are normalized into Title Case by word, while the rest of the text stays structurally the same.",
                  ],
                  [
                    "What stays the same",
                    "Whitespace, line breaks, punctuation, and symbols are preserved so your formatting remains recognizable.",
                  ],
                  [
                    "What you control",
                    "You decide when to convert, when to copy, and whether to export. Nothing is auto-submitted.",
                  ],
                  [
                    "What it avoids",
                    "No language rules, no grammar, no “small word” exceptions, and no brand name inference.",
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

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  What this tool does not do
                </div>
                <p className="mt-2">
                  It does not rewrite your text. It will not “fix” grammar, expand abbreviations,
                  remove punctuation, or choose a style guide. If your content requires a specific
                  editorial standard, use this tool to get close quickly, then make a final manual pass.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="How word boundaries are handled" icon="list">
              <p>
                In real text, “word” is not always obvious. URLs, file paths, part numbers, and mixed
                punctuation all show up in the same editor. To keep the behavior stable, this converter
                uses a small set of rules that are easy to reason about and easy to test.
              </p>

              <p className="mt-3">
                Whitespace (spaces, tabs, and newlines) clearly separates words. Common punctuation like
                commas, periods, colons, and parentheses are treated as separators too. Apostrophes and
                hyphens are handled as internal punctuation because they often appear inside a word-like
                token. The goal is not linguistic correctness. The goal is consistent output that feels
                intuitive for most copy-and-paste workflows.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Acronyms and brand casing
                  </div>
                  <p className="mt-2">
                    Title Case can change “NASA” into “Nasa” and “iPhone” into “Iphone”.
                    If preserving exact casing matters, convert first, then restore the few tokens
                    that must remain exact. For brand-heavy documents, a quick search-replace pass
                    after conversion is usually faster than manual title casing from scratch.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Filenames and identifiers
                  </div>
                  <p className="mt-2">
                    Identifiers like “order_id”, “sku-123”, and “api_key” are not typical prose.
                    Converting them to Title Case may reduce readability or break expected formatting.
                    If the destination system is case-sensitive, consider leaving identifiers as-is.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Practical tip
                </div>
                <p className="mt-2 text-slate-700">
                  If you are working on mobile, many apps auto-capitalize on paste. Convert here, paste into
                  the destination, and verify the destination did not reformat the text. This tool gives you a
                  stable baseline, but the destination still has the final say.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Uploads and exports, done in your browser" icon="type">
              <p>
                You can paste text directly, or you can upload a file to avoid copy-and-paste for longer documents.
                Text-like formats (TXT and similar) load immediately. PDF and DOCX uploads attempt local extraction
                in the browser when optional libraries are installed. Because PDF layouts can store text in columns
                or positioned blocks, extracted text may include odd spacing or line breaks. That is normal for PDF
                extraction and is easy to review before you copy.
              </p>

              <p className="mt-3">
                Export is intentionally simple. The PDF export creates a plain text PDF with line wrapping, preserving
                your newlines as paragraph breaks. If the PDF library is not available, the page falls back to the
                print dialog so you can still save the result as a PDF using your browser’s “Save as PDF” option.
              </p>

              <p className="mt-3">
                Privacy is straightforward: conversion happens in your browser from the current textarea value.
                The page does not need to send your text to a server to apply casing. You decide when to upload a file,
                and uploads are processed locally for extraction. If your workflow involves sensitive content, you can
                still verify by disconnecting your network and using the page offline after it loads.
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
                  Your text stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Title Case conversion is computed locally from the editor value. The page does not send your text
                  to a server to change casing. Copy is explicit, and export is initiated by you.
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
