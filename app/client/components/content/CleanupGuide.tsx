import { Link } from "react-router";

const guides = {
  "text-cleaner": {
    "heading": "Clean a pasted block of text",
    "intro": "Use this cleaner for prose copied from documents, emails, or web pages. Click Clean text to replace the editor contents, then review the Applied operations summary.",
    "rules": [
      "The cleaner removes zero-width spaces (U+200B) and byte order marks (U+FEFF), and converts CRLF or CR line endings to LF.",
      "Runs of two or more spaces or tabs become one ordinary space. A single tab inside a line stays in place. Whitespace at the start and end of the whole block is trimmed.",
      "Internal line breaks, punctuation, emoji joiners and non-joiners are preserved. This page applies a fixed cleanup; it has no per-rule toggle."
    ],
    "input": "  blue   sky\nnext line  ",
    "output": "blue sky\nnext line",
    "note": "The two lines stay separate. Use Whitespace Cleaner when you want to retain repeated spaces and tabs; use Remove Extra Spaces to choose whether to keep line breaks.",
    "faq": [
      [
        "Will cleanup change code indentation?",
        "Yes. Repeated spaces and tabs can be collapsed, and outer whitespace is trimmed. Keep a copy of source code or aligned columns before cleaning."
      ],
      [
        "Are all invisible characters removed?",
        "No. Zero-width spaces and byte order marks are removed; joiners used in emoji and writing systems stay intact. Use Unicode Inspector to examine unfamiliar invisible characters before deciding to remove them."
      ],
      [
        "Can I clean text from a document?",
        "Paste copied text or use Upload to read a local text file, PDF, or DOCX. PDF extraction needs selectable text; scanned images need OCR elsewhere. Review extraction order and spacing before clicking Clean text."
      ]
    ]
  },
  "whitespace-cleaner": {
    "heading": "Normalize hidden whitespace without flattening your layout",
    "intro": "Use Clean whitespace when copied text looks correct but contains non-breaking spaces or invisible separators. Review the operation counts after conversion.",
    "rules": [
      "Non-breaking spaces (U+00A0) become ordinary spaces. Zero-width spaces (U+200B) and byte order marks (U+FEFF) are removed.",
      "CRLF, CR, Unicode line separator (U+2028), and paragraph separator (U+2029) become LF line breaks.",
      "Tabs, repeated ordinary spaces, line-edge spacing, soft hyphens, and emoji joiners are preserved. There are no per-character category switches on this page."
    ],
    "input": "A[NBSP]B[ZWSP]\tC  D",
    "output": "A B\tC  D",
    "note": "[NBSP] and [ZWSP] above name otherwise invisible characters; do not paste those bracketed labels as literal text. The tab before C and two spaces before D remain.",
    "faq": [
      [
        "Does the cleaner remove tabs?",
        "No. Tabs are preserved so spreadsheet column separators and indentation survive. Use Remove Extra Spaces to collapse repeated spaces or runs containing multiple tabs."
      ],
      [
        "Will emoji or joined letters break?",
        "Joiners and non-joiners are preserved. The cleaner removes zero-width spaces, which are different characters."
      ],
      [
        "Does it trim or collapse repeated spaces?",
        "No. Choose Text Cleaner for a fixed trim-and-collapse pass. Use Unicode Inspector to see exact code points when the cause of a mismatch is unclear."
      ]
    ]
  },
  "remove-extra-spaces": {
    "heading": "Collapse horizontal spacing and choose what happens to lines",
    "intro": "Use Remove extra spaces to reduce repeated spaces and tabs. Leave Preserve line breaks on for a list or multi-line message; turn it off to join the lines.",
    "rules": [
      "Runs of two or more spaces or tabs become one ordinary space. A single tab is preserved. Non-breaking spaces are also converted.",
      "Line endings are normalized to LF. With Preserve line breaks off, line breaks become spaces before the runs are collapsed.",
      "The tool does not remove zero-width characters or trim every line edge. A leading or trailing run may leave one space."
    ],
    "input": "red   blue\nnext\t\titem",
    "output": "red blue\nnext item",
    "note": "This example uses Preserve line breaks on. Turning it off produces red blue next item on one line.",
    "faq": [
      [
        "Will this preserve aligned columns?",
        "No. Collapsing spaces or tabs removes manual alignment. Use a table converter for structured rows and columns."
      ],
      [
        "Does it remove invisible Unicode characters?",
        "It converts non-breaking spaces but does not remove zero-width spaces or joiners. Use Whitespace Cleaner for its documented invisible-character cleanup, or Unicode Inspector to investigate first."
      ],
      [
        "Can I load a file?",
        "Upload reads text locally and applies the spacing cleanup. PDF and DOCX text extraction may change reading order or spacing; check the result against the original document. Scanned PDFs need OCR elsewhere."
      ]
    ]
  }
} as const;

type Kind = keyof typeof guides;

export function CleanupGuide({ kind }: { kind: Kind }) {
  const guide = guides[kind];
  return <section id="how-it-works" className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-200" aria-labelledby="cleanup-guide-title">
    <h2 id="cleanup-guide-title" className="text-2xl font-extrabold text-slate-900">{guide.heading}</h2>
    <p className="mt-3 leading-7 text-slate-700">{guide.intro}</p>
    <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-slate-700">{guide.rules.map(rule => <li key={rule}>{rule}</li>)}</ul>
    <h3 className="mt-6 font-bold">Worked example</h3>
    <div className="mt-3 grid gap-4 sm:grid-cols-2">
      {[["Input", guide.input], ["Output", guide.output]].map(([label, value]) => <div key={label} className="min-w-0">
        <p className="text-sm font-semibold">{label}</p><pre className="mt-2 overflow-x-auto rounded-xl bg-slate-50 p-4 text-sm leading-6" tabIndex={0} aria-label={label + " cleanup example"}>{value}</pre>
      </div>)}
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-700">{guide.note}</p>
    <p className="mt-4 text-sm leading-6 text-slate-700">For individual cleanup choices, open the <Link className="font-semibold text-sky-700 underline" to="/">multi-step text workflow</Link>. To inspect an invisible character first, use <Link className="font-semibold text-sky-700 underline" to="/unicode-inspector/">Unicode Inspector</Link>.</p>
  </section>;
}

export function CleanupFaq({ kind }: { kind: Kind }) {
  return <section id="faq" className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-slate-200" aria-labelledby="cleanup-faq-title">
    <h2 id="cleanup-faq-title" className="text-2xl font-extrabold">Cleanup questions</h2>
    <div className="mt-4 space-y-3">{guides[kind].faq.map(([question, answer]) => <details key={question} className="rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3 leading-7 text-slate-700">{answer}</p></details>)}</div>
  </section>;
}
