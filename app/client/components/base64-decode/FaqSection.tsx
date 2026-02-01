export function FaqSection() {
  const faqs: Array<{ q: string; a: string }> = [
    {
      q: "What is Base64 decoding?",
      a: "Base64 decoding converts a Base64-encoded string back into its original bytes, then this page interprets those bytes as UTF-8 text. If the original content was plain text, the output should be readable.",
    },
    {
      q: "Why do I see an error for some inputs?",
      a: "Errors usually mean the Base64 is incomplete, contains extra non-Base64 characters, or was truncated when copied. This tool ignores whitespace, but punctuation like quotes or commas can still break decoding unless you paste a full data URL.",
    },
    {
      q: "Can I decode Base64 data URLs?",
      a: "Yes. If you paste a data URL like data:text/plain;base64,.... the tool automatically decodes the part after the comma.",
    },
    {
      q: "Does this page upload my text?",
      a: "No. Decoding runs locally in your browser. Upload is optional and only reads files from your device to populate the textarea.",
    },
    {
      q: "Why does the output look garbled?",
      a: "The Base64 may represent binary data (like an image) or text in a different encoding. The Base64 can still be valid even if the bytes do not map cleanly to readable UTF-8 text.",
    },
  ];

  return (
    <section
      id="faq"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div className="p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            FAQ
          </h2>

          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 sm:p-5 hover:ring-sky-200/80 transition"
              >
                <summary className="cursor-pointer list-none font-bold text-slate-900 flex items-start justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-slate-700 leading-7">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
