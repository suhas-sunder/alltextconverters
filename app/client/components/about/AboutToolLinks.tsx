const links = [
  { href: "/word-counter", label: "Word Counter" },
  { href: "/character-counter", label: "Character Counter" },
  { href: "/case-converter", label: "Case Converter" },
  { href: "/text-cleaner", label: "Text Cleaner" },
  { href: "/remove-extra-spaces", label: "Remove Extra Spaces" },
  { href: "/line-break-remover", label: "Line Break Remover" },
  { href: "/base64-encode", label: "Base64 Encode" },
  { href: "/base64-decode", label: "Base64 Decode" },
  { href: "/url-encode", label: "URL Encode" },
  { href: "/url-decode", label: "URL Decode" },
];

export function AboutToolLinks() {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-5">
      <h2 className="text-2xl sm:text-3xl font-bold font-[Poppins] text-slate-900">
        Popular tools on the site
      </h2>

      <p className="text-slate-700 leading-relaxed">
        These are some of the most common “get it done” tools people use for formatting, cleanup, and encoding.
        If you are new here, starting with Word Counter or Text Cleaner is usually the fastest way to see what the site is.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="group rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-colors px-4 py-3 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-slate-900">{l.label}</span>
              <span className="text-slate-500 group-hover:text-slate-700">
                →
              </span>
            </div>
            <p className="text-sm text-slate-700 mt-1">
              Open {l.label.toLowerCase()}.
            </p>
          </a>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <a
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer transition-colors"
        >
          Browse all tools
        </a>
        <a
          href="/contact"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold cursor-pointer transition-colors"
        >
          Contact
        </a>
      </div>
    </section>
  );
}
