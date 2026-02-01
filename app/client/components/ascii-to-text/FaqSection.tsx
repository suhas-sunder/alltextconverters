export function FaqSection() {
  return (
    <section className="rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          FAQ
        </h2>

        <div className="mt-6 space-y-4">
          <FaqItem
            q="What input does this ASCII decoder accept?"
            a="Paste decimal ASCII codes. Separators can be spaces, commas, new lines, or mixed punctuation. The parser extracts numbers and decodes them in order."
          />
          <FaqItem
            q="Why does it only convert printable ASCII (32–126)?"
            a="Printable ASCII covers the characters you normally expect to copy and paste: letters, digits, punctuation, and common symbols. Skipping control codes avoids invisible characters and unpredictable paste behavior in other apps."
          />
          <FaqItem
            q="What happens to codes outside the printable range?"
            a="They are skipped and reported in the summary. This keeps the output safe and makes it obvious when your data is not plain ASCII."
          />
          <FaqItem
            q="Does this handle extended ASCII like 128–255?"
            a="No. Values above 126 are not part of the core ASCII standard, and different systems map them differently. If your list contains codes above 126, you likely need a specific encoding converter instead of ASCII."
          />
          <FaqItem
            q="Can I upload a PDF or DOCX with ASCII codes in it?"
            a="Yes, if the optional extraction libraries are installed in your app. PDF text extraction uses pdfjs-dist, and DOCX extraction uses mammoth. The decoding still runs locally after the text is extracted."
          />
          <FaqItem
            q="Is my text sent to a server?"
            a="No. Decoding runs locally in your browser. Uploaded files are read client-side, and the resulting text is not transmitted by this tool."
          />
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl bg-slate-50 ring-1 ring-slate-200 px-5 py-4 open:bg-white open:ring-sky-200/70 transition">
      <summary className="cursor-pointer list-none font-bold text-slate-900 flex items-start justify-between gap-4">
        <span className="min-w-0">{q}</span>
        <span className="shrink-0 text-slate-500 group-open:text-sky-600">
          +
        </span>
      </summary>
      <p className="mt-3 text-slate-700 leading-7">{a}</p>
    </details>
  );
}
