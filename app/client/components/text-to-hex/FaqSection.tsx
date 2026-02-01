const faqs = [
  {
    q: "What does this tool output?",
    a: "It outputs a hexadecimal representation of the bytes produced from your input. Each byte becomes two hex digits, optionally separated by spaces, newlines, or commas.",
  },
  {
    q: "What encoding should I use?",
    a: "Use ASCII when you need strict 0 to 127 bytes. Use UTF-8 for general text and Unicode. Use Latin-1 only when you know the destination expects ISO-8859-1 style bytes.",
  },
  {
    q: "Why do I see an error under ASCII?",
    a: "ASCII cannot represent characters above 127. The converter blocks those inputs so you do not accidentally generate the wrong bytes. Switch to UTF-8 or remove non-ASCII characters.",
  },
  {
    q: "Does this run on a server?",
    a: "No. Conversion runs locally in your browser. Upload parsing also happens locally. PDF and DOCX extraction requires optional packages in the app build.",
  },
  {
    q: "Can I convert a .bin file?",
    a: "Yes. Uploading a .bin file treats the file as raw bytes and renders each byte as hex. This is useful for quick inspection of small binary blobs.",
  },
];

export function FaqSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm">
      <div className="p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            FAQ
          </h2>

          <div className="mt-6 grid gap-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 open:ring-sky-200/80 transition"
              >
                <summary className="cursor-pointer list-none font-bold text-slate-900">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-500 align-middle" />
                  {f.q}
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
