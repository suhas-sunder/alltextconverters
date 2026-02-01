export function FaqSection() {
  const items = [
    {
      q: "What formats does the hex input support?",
      a: "The decoder accepts plain hex pairs like 48656c6c6f, spaced hex like 48 65 6c 6c 6f, and common separators such as commas or new lines. It also tolerates 0x prefixes (for example 0x48 0x65).",
    },
    {
      q: "Why do I get an even-length error?",
      a: "Hex represents bytes using two characters per byte. If the cleaned input has an odd number of hex characters, the last byte is incomplete. Add a leading 0 to the final nibble or remove the stray character.",
    },
    {
      q: "Is this ASCII only?",
      a: "This page is optimized for ASCII output. Tab and new lines are preserved. Other control bytes and bytes outside ASCII may be replaced with � and a warning so you do not miss hidden characters.",
    },
    {
      q: "Does this upload my data?",
      a: "No. Decoding happens in your browser from the textarea value. Uploading a file reads it locally and decodes it on your device.",
    },
    {
      q: "Why can PDF or DOCX upload fail?",
      a: "PDF and DOCX extraction depends on optional libraries in the app build. If pdfjs-dist (PDF) or mammoth (DOCX) are not installed, the upload can fail. TXT and other text-like files work without those optional packages.",
    },
  ];

  return (
    <section className="rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm p-6 sm:p-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          FAQ
        </h2>

        <div className="mt-6 space-y-4">
          {items.map((it) => (
            <div
              key={it.q}
              className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5"
            >
              <div className="text-sm font-bold text-slate-900">{it.q}</div>
              <p className="mt-2 text-slate-700 leading-7">{it.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
