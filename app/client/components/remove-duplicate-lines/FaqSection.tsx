import { useMemo, useState } from "react";

type FaqItem = { q: string; a: string };

const faqs: FaqItem[] = [
  {
    q: "What does “remove duplicate lines” mean?",
    a: "It means the tool scans your text line by line and keeps only the first occurrence of each unique line. If the exact same line appears again later, that later copy is removed from the output.",
  },
  {
    q: "Does it rewrite or “fix” my text?",
    a: "No. This is not a rewrite tool and it does not change wording. It only removes repeated lines. The line that is kept stays exactly as it was originally written (including punctuation and spacing).",
  },
  {
    q: "What is the case-insensitive option?",
    a: "When enabled, matching ignores capitalization. For example, “Apple” and “apple” are treated as duplicates. When disabled, lines must match exactly, so “Apple” and “apple” are considered different.",
  },
  {
    q: "What does “preserve original order” do?",
    a: "When enabled, the output keeps the same order you pasted and keeps the first time each line appears. When disabled, the tool outputs the unique set sorted alphabetically by the match key.",
  },
  {
    q: "Why didn’t it remove some duplicates I expected?",
    a: "Usually it is because the lines are not identical. A trailing space, a tab, different punctuation, or an invisible character makes two lines different. If your data is messy, clean whitespace first and then remove duplicates.",
  },
  {
    q: "Can I upload PDF or DOCX files?",
    a: "Yes, but in-browser extraction requires optional libraries in the app build: pdfjs-dist for PDF and mammoth for DOCX. Extracted text may include layout artifacts, so review the lines before you deduplicate.",
  },
  {
    q: "Is my text sent to a server?",
    a: "No. The tool is designed to run in your browser using the editor content. Uploads (when used) are read locally for extraction, then you choose when to copy or download the result.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                FAQ
              </h2>
              <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                Quick answers about how line deduplication behaves and how to get predictable results.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                Deterministic
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            {faqs.map((f) => (
              <FaqItemRow key={f.q} item={f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqItemRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  const buttonCls =
    "cursor-pointer w-full text-left rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition";

  return (
    <div className="rounded-2xl">
      <button
        type="button"
        className={buttonCls}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="font-extrabold text-slate-900">{item.q}</div>
          <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200 text-slate-700">
            {open ? "−" : "+"}
          </span>
        </div>

        {open && <p className="mt-3 text-slate-700 leading-7">{item.a}</p>}
      </button>
    </div>
  );
}
