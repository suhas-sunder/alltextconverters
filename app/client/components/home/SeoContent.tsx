type ToolExample = {
  title: string;
  description: string;
  example: { input: string; output: string };
  overflowX?: boolean;
};

const toolExamples: ToolExample[] = [
  {
    title: "UPPERCASE Converter",
    description:
      "Converts every letter in your text to uppercase. Commonly used in headlines, coding constants, and attention-grabbing text styles.",
    example: {
      input: "Convert me to uppercase",
      output: "CONVERT ME TO UPPERCASE",
    },
  },
  {
    title: "lowercase Converter",
    description:
      "Turns all text into lowercase, ideal for normalizing user input, cleaning email lists, or making data case-insensitive in scripts.",
    example: { input: "SIMPLE CASE FIXER", output: "simple case fixer" },
  },
  {
    title: "Title Case Converter",
    description:
      "Capitalizes the first letter of each word. This format is widely used in article titles, book names, and UI button labels.",
    example: {
      input: "welcome to alltextconverters",
      output: "Welcome To Alltextconverters",
    },
  },
  {
    title: "Capitalized Case Converter",
    description:
      "Similar to Title Case but smarter with spacing and punctuation. Great for resumes, headings, and formal writing where proper nouns need emphasis.",
    example: {
      input: "this is a better title example",
      output: "This Is A Better Title Example",
    },
  },
  {
    title: "aLtErNaTiNg cAsE Generator",
    description:
      "Alternates between uppercase and lowercase letters for a playful or sarcastic effect. Often used in memes, social media captions, or stylized text art.",
    example: { input: "mocking text format", output: "MoCkInG TeXt FoRmAt" },
  },
  {
    title: "InVeRsE CaSe Converter",
    description:
      "Flips the case of every letter. Useful for toggling between stylized text formats or reversing mistakenly applied transformations.",
    example: { input: "eXaMpLe TeXt", output: "ExAmPlE tExT" },
  },
  {
    title: "Sentence case Converter",
    description:
      "Makes the first letter of each sentence uppercase while keeping the rest lowercase. This is the preferred format for paragraphs, messages, and formal writing.",
    example: {
      input: "this is one sentence. this is another.",
      output: "This is one sentence. This is another.",
    },
  },
  {
    title: "Encode Base64 Converter",
    description:
      "Base64 encoding converts binary or text data into a set of readable ASCII characters. It’s commonly used for embedding small files (like images or credentials) into JSON, HTML, or email content.",
    example: { input: "Hello World", output: "SGVsbG8gV29ybGQ=" },
    overflowX: true,
  },
  {
    title: "Decode Base64 Converter",
    description:
      "Decodes Base64 strings back into their original readable format. Essential for developers working with API tokens, encoded data, or web requests.",
    example: { input: "U29mdHdhcmUgVGVzdA==", output: "Software Test" },
    overflowX: true,
  },
  {
    title: "Trim & Clean Converter",
    description:
      "Removes redundant spaces, tabs, and line breaks to produce clean, copy-ready text. This feature is especially helpful when pasting from PDFs, web pages, or email drafts.",
    example: {
      input: " Too many spaces here. ",
      output: "Too many spaces here.",
    },
    overflowX: true,
  },
  {
    title: "Word & Character Counter",
    description:
      "The built-in word counter tracks the number of words, characters, and lines in real time as you type or paste text.",
    example: {
      input: "Paste 200 words of text",
      output: "Shows 200 words, 1,200 characters, 10 lines",
    },
  },
];

function ExampleBlock({
  input,
  output,
  overflowX,
}: {
  input: string;
  output: string;
  overflowX?: boolean;
}) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm" +
        (overflowX ? " overflow-x-auto" : "")
      }
    >
      {/* subtle top accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent"
      />

      <div className="grid gap-4 p-4 sm:p-5">
        {/* Input */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/70">
              ⌨️
            </span>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-600">
              Input
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full bg-slate-50 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
            Example
          </span>
        </div>

        <pre className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/80 px-4 py-3 text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words font-mono">
          {`"${input}"`}
        </pre>

        {/* Output */}
        <div className="flex items-center gap-2 pt-1">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-200/70">
            ✅
          </span>
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-600">
            Output
          </div>
        </div>

        <pre className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/80 px-4 py-3 text-sm leading-6 text-slate-900 whitespace-pre-wrap break-words font-mono">
          {`"${output}"`}
        </pre>
      </div>
    </div>
  );
}

export function SeoContent() {
  return (
    <div className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 space-y-12">
      {/* HERO / INTRO */}
      <section className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
        {/* background interest */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-sky-100/60 blur-3xl" />
          <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-slate-100/70 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-slate-200" />
        </div>

        <div className="relative px-5 py-8 sm:px-8 sm:py-10">
          <div className="rounded-3xl ring-1 ring-slate-200/70 bg-white/70 backdrop-blur p-5 sm:p-7">
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-3">
                  <div className="text-2xl leading-none">📝</div>
                </div>

                <div className="min-w-0">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Explore Every Conversion Tool
                  </h2>

                  <p className="mt-2 text-base sm:text-lg text-slate-600 leading-7 max-w-prose">
                    Fast, clean text conversions for writers and developers.
                    Everything runs locally in your browser. No accounts, no
                    uploads.
                  </p>

                  {/* chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "🔒 Privacy-first",
                      "⚡ Instant results",
                      "📱 Mobile friendly",
                      "🧼 Clean formatting",
                    ].map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:ring-sky-200/80 transition"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* mini value grid */}
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    k: "What you can do",
                    v: "Convert case, clean whitespace, encode and decode Base64, and count text instantly.",
                  },
                  {
                    k: "Who it helps",
                    v: "Students, writers, editors, and developers who work with text every day.",
                  },
                  {
                    k: "How it works",
                    v: "Paste text, click a tool, copy the result. Your text stays on your device.",
                  },
                ].map((x) => (
                  <div
                    key={x.k}
                    className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition"
                  >
                    <div className="text-xs font-extrabold uppercase tracking-wide text-slate-600">
                      {x.k}
                    </div>
                    <div className="mt-2 text-sm text-slate-700 leading-6">
                      {x.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOOL LIST */}
          <div className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Tools and examples
                </h3>
                <p className="mt-2 text-base text-slate-600 leading-7 max-w-prose">
                  Each tool includes a quick example so users immediately
                  understand what it does.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-6">
              {toolExamples.map((tool) => (
                <article
                  key={tool.title}
                  className="group relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm "
                >
                  {/* left accent rail */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
                  />

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                          {tool.title}
                        </h4>
                        <p className="mt-2 text-base text-slate-700 leading-7">
                          {tool.description}
                        </p>
                      </div>

                      <div className="shrink-0 hidden sm:flex">
                        <span className="inline-flex items-center rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                          Example
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <ExampleBlock
                        input={tool.example.input}
                        output={tool.example.output}
                        overflowX={tool.overflowX}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* WHY IT MATTERS */}
            <div className="mt-10 relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
              >
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
              </div>

              <div className="relative p-6 sm:p-8">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Why Text Conversion Matters
                </h3>

                <div className="mt-3 space-y-3 text-base text-slate-700 leading-7 max-w-prose">
                  <p>
                    Converting and cleaning text improves readability,
                    consistency, and data accuracy. From writing essays to
                    preparing code or cleaning CSV data, the right case or
                    spacing can make a big difference in clarity.
                  </p>
                  <p>
                    <strong>AllTextConverters.com</strong> runs locally in your
                    browser without tracking, ads, or logins. It combines case
                    converters, formatters, Base64 utilities, and a real-time
                    counter in one place.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      t: "Clean inputs",
                      d: "Remove messy spaces and line breaks before you paste into docs or tools.",
                    },
                    {
                      t: "Consistent formatting",
                      d: "Fix capitalization across titles, headings, and paragraphs quickly.",
                    },
                    {
                      t: "Developer utilities",
                      d: "Encode and decode Base64 when working with APIs or embedded data.",
                    },
                  ].map((c) => (
                    <div
                      key={c.t}
                      className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 hover:ring-sky-200/80 transition"
                    >
                      <div className="text-sm font-extrabold text-slate-900">
                        {c.t}
                      </div>
                      <div className="mt-1 text-sm text-slate-600 leading-6">
                        {c.d}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LONG FORM, STILL READABLE */}
      <section className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        </div>

        <div className="relative p-6 sm:p-10">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
              ✨ Learn how it helps
            </div>

            <h2 className="mt-4 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              How Text Conversion Tools Simplify Writing and Data Cleaning
            </h2>

            <div className="mt-5 space-y-4 text-base sm:text-lg text-slate-700 leading-7">
              <p>
                Online text converters have become essential for anyone who
                writes, edits, or works with data. Whether you're formatting
                essays, preparing blog posts, managing code snippets, or
                cleaning up raw data, a good text converter saves time and
                improves clarity. <strong>AllTextConverters.com</strong>{" "}
                provides case conversion, Base64 encoding and decoding,
                whitespace cleanup, and real-time word counting, all processed
                privately in your browser.
              </p>

              <p>
                Unlike traditional word processors that require several clicks
                or add-ons, AllTextConverters runs instantly. You can paste
                unformatted text, clean it, and reformat it for web, print, or
                programming use without losing your line breaks or punctuation.
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200/80 pt-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
                />
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/70">
                      🧩
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Everyday use cases
                    </h3>
                  </div>

                  <ul className="mt-4 space-y-3 text-base text-slate-700 leading-7">
                    <li>
                      <strong>Writers and bloggers:</strong> Convert case styles
                      to match publication guidelines or improve readability.
                    </li>
                    <li>
                      <strong>Students:</strong> Clean essays or assignments
                      before submitting, ensuring consistent spacing and
                      presentation.
                    </li>
                    <li>
                      <strong>Developers:</strong> Encode credentials or assets
                      with Base64 for safe storage in JSON, HTML, or environment
                      files.
                    </li>
                    <li>
                      <strong>SEO professionals:</strong> Prepare meta
                      descriptions, keyword lists, or snippets with consistent
                      casing.
                    </li>
                    <li>
                      <strong>Editors:</strong> Quickly correct inconsistent
                      capitalization across articles or manuscripts.
                    </li>
                    <li>
                      <strong>Social media managers:</strong> Create stylized
                      text like <em>aLtErNaTiNg cAsE</em> for captions.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-slate-300 via-slate-200 to-transparent"
                />
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/70">
                      ✅
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                      Tips
                    </h3>
                  </div>

                  <ol className="mt-4 list-decimal pl-5 space-y-3 text-base text-slate-700 leading-7">
                    <li>
                      Paste plain text, not rich text, to avoid hidden
                      formatting.
                    </li>
                    <li>
                      Use “Trim &amp; Clean” before conversion if the text was
                      copied from a web page or PDF.
                    </li>
                    <li>
                      Check word and character counts after trimming to confirm
                      limits for essays, tweets, or SEO descriptions.
                    </li>
                    <li>
                      Use “Sentence case” for paragraphs so new sentences are
                      capitalized after punctuation.
                    </li>
                    <li>
                      Encode short Base64 samples only. For large files, use
                      dedicated encoders.
                    </li>
                  </ol>

                  <div className="mt-6 rounded-2xl bg-slate-900 text-white p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                        🔒
                      </span>
                      <div className="text-sm font-extrabold text-sky-200">
                        Privacy note
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-slate-100 leading-6">
                      Every conversion runs entirely in your browser. No text is
                      uploaded, stored, or logged.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
