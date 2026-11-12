export function FaqSection() {
  const faqs: { q: string; a: string }[] = [
    {
      q: "What counts as an item?",
      a: "In Lines mode, each non-empty line becomes one item after trimming and removing a common bullet or number. Commas mode uses commas as the separators.",
    },
    {
      q: "Does it change the text inside items?",
      a: "Lines mode removes list markers. Trim items controls spaces at the edges. Spaces inside items stay as entered unless you choose a split method that uses whitespace.",
    },
    {
      q: "Why is an item missing after conversion?",
      a: "Ignore empty is on by default. Turn it off if you want empty items in the joined text.",
    },
    {
      q: "Should I include a space after each comma?",
      a: "For human-readable lists, comma plus space is usually best. For strict parsers or when spaces are treated as part of the value, turn the space option off.",
    },
    {
      q: "Can I upload a PDF or DOCX?",
      a: "Yes. Text is extracted from PDF and DOCX files in your browser. Check the result for unexpected line breaks before converting.",
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
