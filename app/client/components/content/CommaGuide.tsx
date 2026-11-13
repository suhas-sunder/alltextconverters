import { Link } from "react-router";
const guides = {
  "comma-separated-to-list": {
    "title": "Turn quoted comma-separated values into lines",
    "intro": "Paste comma-separated data and choose Convert to List. The converter reads CSV quoting, trims values, removes empty items, and flattens rows into one list.",
    "input": "\"Toronto, ON\",Montréal",
    "output": "Toronto, ON\nMontréal",
    "note": "The comma inside the quoted city stays in its value. Double a quotation mark inside a quoted field; an unclosed quoted field produces an error.",
    "faq": [
      [
        "Will rows or columns stay separate?",
        "All fields are flattened in row order. Use CSV to List to extract only one column, or CSV and JSON Converter to keep records and columns."
      ],
      [
        "Can an item contain a newline?",
        "Yes, inside a quoted CSV field. The newline stays in the extracted value, so one input item can occupy several output lines."
      ],
      [
        "Does the tool preserve blank fields?",
        "No. Values are trimmed and empty fields are removed. Use the table workspace when empty cells or surrounding spaces matter."
      ]
    ]
  },
  "comma-to-json-array": {
    "title": "Make a JSON string array from comma-separated fields",
    "intro": "Paste comma-separated values, then convert. CSV quotes protect commas inside values; rows are flattened, values are trimmed, and empty fields are removed. Conversion replaces the current editor contents.",
    "input": "\"Toronto, ON\",007,true",
    "output": "[\"Toronto, ON\",\"007\",\"true\"]",
    "note": "Every retained value becomes a JSON string. Leading zeros stay intact; true is text, not a JSON boolean. Use CSV and JSON Converter for a table of records.",
    "faq": [
      [
        "Does it understand quoted CSV?",
        "Yes. Wrap fields containing commas in double quotes, and double any quote inside a quoted field. Malformed quoting is reported instead of partly converted."
      ],
      [
        "What happens to blank values?",
        "Empty fields and fields containing only surrounding whitespace are removed. This is a compact value list, so column positions are not retained."
      ],
      [
        "Should I upload a PDF of my data?",
        "Prefer the original text or CSV file. PDF and DOCX extraction runs locally, but extracted reading order and line breaks may differ from the document. Scanned PDFs need OCR elsewhere."
      ]
    ]
  }
} as const;
type Kind = keyof typeof guides;
export function CommaGuide({kind}:{kind:Kind}) {
  const guide=guides[kind];
  return <section id="how-it-works" className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-slate-200" aria-labelledby="comma-guide-title">
    <h2 id="comma-guide-title" className="text-2xl font-extrabold">{guide.title}</h2>
    <p className="mt-3 leading-7 text-slate-700">{guide.intro}</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">{[["Input",guide.input],["Output",guide.output]].map(([label,value])=><div key={label} className="min-w-0"><h3 className="text-sm font-semibold">{label}</h3><pre tabIndex={0} aria-label={label+" comma example"} className="mt-2 overflow-x-auto rounded-xl bg-slate-50 p-4 text-sm leading-6">{value}</pre></div>)}</div>
    <p className="mt-3 leading-7 text-slate-700">{guide.note}</p>
    <p className="mt-3 leading-7 text-slate-700">For one selected column, use <Link className="text-sky-700 underline" to="/csv-to-list/">CSV to List</Link>. For structured records, use <Link className="text-sky-700 underline" to="/csv-json-converter/">CSV and JSON Converter</Link>.</p>
  </section>;
}
export function CommaFaq({kind}:{kind:Kind}) {
  return <section id="faq" className="rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-slate-200" aria-labelledby="comma-faq-title"><h2 id="comma-faq-title" className="text-2xl font-extrabold">CSV and list questions</h2><div className="mt-4 space-y-3">{guides[kind].faq.map(([question,answer])=><details key={question} className="rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3 leading-7 text-slate-700">{answer}</p></details>)}</div></section>;
}
