export function FaqSection() {
  const faqs: { q: string; a: string }[] = [
    {
      q: "What counts as an item?",
      a: "By default, each non-empty line becomes one item after trimming. If you enable the comma split option, commas in the input also act as separators.",
    },
    {
      q: "Does it change the text inside items?",
      a: "No. The tool does not rewrite or change case. It trims the edges of each item, optionally collapses repeated spaces and tabs inside items, then joins with commas.",
    },
    {
      q: "Why is an item missing after conversion?",
      a: "Empty values are removed. If a line becomes blank after trimming, it is ignored so the output does not contain empty entries.",
    },
    {
      q: "Should I include a space after each comma?",
      a: "For human-readable lists, comma plus space is usually best. For strict parsers or when spaces are treated as part of the value, turn the space option off.",
    },
    {
      q: "Can I upload a PDF or DOCX?",
      a: "Yes, if your site includes the optional libraries. PDF text extraction uses pdfjs-dist and DOCX extraction uses mammoth. If those are not installed, paste text directly instead.",
    },
    {
      q: "Is my text sent to a server?",
      a: "No. Conversion runs locally in your browser. Upload is used only to read file contents locally so you can convert them.",
    },
  ];

  return (
    <section
      id="faq"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div className="p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            FAQ
          </h2>

          <div className="mt-6 grid gap-3">
            {faqs.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition"
              >
                <div className="font-bold text-slate-900">{f.q}</div>
                <div className="mt-2 text-slate-700 leading-7">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
