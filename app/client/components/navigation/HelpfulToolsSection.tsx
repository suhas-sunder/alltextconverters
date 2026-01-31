type HelpfulTool = { emoji: string; name: string; url: string; desc: string };

const tools: HelpfulTool[] = [
  {
    emoji: "📡",
    name: "MorseWords.com",
    url: "https://www.morsewords.com",
    desc: "Translate text to Morse instantly, hear audio beeps, and learn patterns step by step. Fun learning for all ages.",
  },
  {
    emoji: "📜",
    name: "WordMythology",
    url: "https://www.wordmythology.com",
    desc: "Explore the origins, history, and evolution of words and phrases from myths, languages, and cultures.",
  },
  {
    emoji: "🧩",
    name: "iLoveWordSearch",
    url: "https://www.ilovewordsearch.com",
    desc: "Generate and play printable word search puzzles instantly. Great for classrooms, kids, and casual fun.",
  },
];

export function HelpfulToolsSection() {
  return (
    <section className="relative mt-14 mb-20 overflow-hidden">
      {/* subtle background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-5 sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
            🔗 Related tools
          </div>

          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Other Helpful Tools
          </h2>

          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-6 sm:leading-7 max-w-2xl">
            A few related projects that pair well with this tool. Fast, focused,
            and privacy-friendly.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((site) => {
            const host = site.url
              .replace(/^https?:\/\//, "")
              .replace(/\/$/, "");
            return (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 shadow-sm transition
                           active:scale-[0.99] hover:ring-sky-200/80 hover:shadow-md cursor-pointer"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
                />

                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/60 text-xl">
                      {site.emoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                        <h3 className="min-w-0 text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug break-words">
                          {site.name}
                        </h3>

                        <span className="shrink-0 inline-flex w-fit items-center rounded-full bg-slate-50 ring-1 ring-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          Open →
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm sm:text-base text-slate-700 leading-6 sm:leading-7 line-clamp-3 sm:line-clamp-none">
                        {site.desc}
                      </p>

                      <div className="mt-3 text-xs text-slate-500 break-all">
                        {host}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="h-px bg-gradient-to-r from-transparent via-sky-300/50 to-transparent"
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
