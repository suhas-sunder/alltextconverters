import React from "react";

export function FaqSection() {
  const faqs: { q: string; a: React.ReactNode }[] = [
    {
      q: "What input formats does this accept?",
      a: (
        <>
          Paste any mix of <span className="font-semibold">0</span> and{" "}
          <span className="font-semibold">1</span> characters. Spaces, commas, and line breaks are fine because the tool extracts only bits.
          If you upload a <span className="font-semibold">.bin</span> file, it is read as raw bytes and converted into 8-bit groups automatically.
        </>
      ),
    },
    {
      q: "What is the difference between 7-bit and 8-bit decoding?",
      a: (
        <>
          <span className="font-semibold">7-bit</span> groups are classic ASCII (values 0–127).{" "}
          <span className="font-semibold">8-bit</span> groups represent bytes (0–255) which is how most modern data is stored.
          Auto mode tries both and picks the one that looks most like readable output.
        </>
      ),
    },
    {
      q: "Why does the tool ignore trailing bits sometimes?",
      a: (
        <>
          Decoding requires complete groups. If your cleaned bit stream is not divisible by the chosen width (7 or 8), the remainder is ignored and reported in the summary.
          If that remainder matters, adjust the bit width or add the missing bits.
        </>
      ),
    },
    {
      q: "How does encoding affect the result?",
      a: (
        <>
          Encoding only matters for <span className="font-semibold">Text</span> output. UTF-8 is the default for modern text, while ISO-8859-1 and Windows-1252 are single-byte encodings
          often used in older data. If your browser does not support a selected encoding, the converter falls back to a safe byte-to-character mapping.
        </>
      ),
    },
    {
      q: "Does this upload my data to a server?",
      a: (
        <>
          No. Decoding and conversions run locally in your browser. File uploads are read client-side, and downloads are generated on your device.
        </>
      ),
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Frequently Asked Questions
          </h2>

          <div className="mt-8 space-y-4">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl bg-white ring-1 ring-slate-200/80 p-5 hover:ring-sky-200/80 transition"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-base font-extrabold text-slate-900 tracking-tight">
                      {f.q}
                    </div>
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200 text-slate-700 group-open:bg-sky-50 group-open:ring-sky-200">
                      <span className="block group-open:hidden">+</span>
                      <span className="hidden group-open:block">−</span>
                    </span>
                  </div>
                </summary>
                <div className="mt-3 text-slate-700 leading-7">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
