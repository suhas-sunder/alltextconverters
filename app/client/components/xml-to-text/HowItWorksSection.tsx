import React from "react";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  How the XML to Text Tool Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  This page extracts the readable text that is stored inside XML elements and ignores markup.
                  Paste XML, click <span className="font-semibold">Extract text</span>, then copy or download the result.
                  The conversion runs locally in your browser so you can clean up feeds, exports, logs, and scraped XML without sending data to a server.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Local processing
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Deterministic output
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Input", v: "Raw XML" },
                { k: "Parse", v: "Well formed XML only" },
                { k: "Extract", v: "Text nodes" },
                { k: "Output", v: "Plain text" },
              ].map((t) => (
                <div
                  key={t.k}
                  className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t.k}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {t.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 space-y-6 text-base text-slate-700 leading-7">
            <SectionCard title="What “XML to text” means in practice" icon="list">
              <p>
                XML is a structured format. It wraps content in tags, attributes, and nested elements so other programs can interpret meaning.
                Humans usually want the opposite when they are searching a dump, reading a feed, or copying a snippet into a document.
                The goal of an XML to text converter is simple: keep the human readable words and remove the markup that surrounds them.
              </p>

              <p className="mt-3">
                This tool extracts values from XML text nodes only. It does not attempt to interpret your schema, guess which tags matter, or infer new punctuation.
                If the XML contains <span className="font-semibold text-slate-900">only</span> metadata in attributes and no text nodes, the output will be empty.
                That is expected. Attributes like <span className="font-mono text-sm">id="123"</span> are still data, but they are not text node content.
              </p>

              <p className="mt-3">
                If you are working with scraped HTML that happens to look like XML, be careful.
                XML parsing is strict. Every opening tag must close, entities must be valid, and the document must be well formed.
                When the parser detects an error, the tool shows a clear message instead of producing misleading output.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Feeds and exports",
                    "Pull titles and descriptions out of XML feeds, sitemap fragments, or exported records so you can review them quickly.",
                  ],
                  [
                    "Logs and diagnostics",
                    "Convert embedded XML blocks into plain text to make troubleshooting easier in tickets or notes.",
                  ],
                  [
                    "Scraping cleanup",
                    "Extract readable text from scraped XML responses before you store or analyze the content.",
                  ],
                  [
                    "Copy and paste workflows",
                    "Remove markup noise so the destination system receives clean text only.",
                  ],
                ].map(([k, v]) => (
                  <li
                    key={k}
                    className="group rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500/90 group-hover:bg-sky-500" />
                      <div>
                        <div className="font-bold text-slate-900">{k}</div>
                        <div className="text-slate-700">{v}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  What this tool does not do
                </div>
                <p className="mt-2">
                  It does not validate against a schema, fix malformed XML, or convert attributes into sentences.
                  It also does not attempt to reformat content based on tag names (for example, inserting commas between items).
                  You get a predictable baseline: the words that appear inside tags, with optional whitespace normalization.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Whitespace options and why they matter" icon="type">
              <p>
                Real XML often contains indentation, line breaks, and spacing that exists only to make the XML itself readable.
                Those characters can become unwanted noise when you extract text.
                That is why this page includes two simple options that control how whitespace is handled after text is extracted.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Collapse whitespace</span> compresses runs of spaces, tabs, and line breaks into a single space.
                This is the safest default for feeds and scraped responses because it produces a clean single flow of text.
                It is especially helpful when the XML contains many short text nodes split across nested tags.
              </p>

              <p className="mt-3">
                <span className="font-semibold text-slate-900">Keep line breaks</span> keeps newline characters from text nodes and joins nodes using newlines.
                Turn it on when you are extracting multi-line descriptions, paragraph-like content, or logs where line boundaries matter.
                If you enable keep line breaks but keep collapse whitespace on, the tool still collapses internal runs of whitespace while retaining line separation.
              </p>

              <p className="mt-3">
                These controls are intentionally simple. The goal is not to perfectly rebuild paragraphs from tags.
                The goal is to give you a quick, deterministic choice between compact output and line oriented output.
                If you need semantic formatting (for example, treating <span className="font-mono text-sm">&lt;item&gt;</span> as a bullet),
                you should extract the text first, then apply your own formatting rules in a follow-up step.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Common edge case: mixed content
                  </div>
                  <p className="mt-2">
                    XML can contain mixed content where text is split around inline tags.
                    For example, a sentence might have a bold tag in the middle.
                    Extracting text nodes preserves the words, but it cannot know where you want spaces.
                    Collapsing whitespace usually produces the most readable result.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Common edge case: entity decoding
                  </div>
                  <p className="mt-2">
                    The browser XML parser decodes valid XML entities during parsing.
                    If your XML contains invalid entities or is not well formed, parsing fails.
                    Fix the XML first so the parser can decode entities reliably.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Quick workflow
                </div>
                <p className="mt-2 text-slate-700">
                  Paste XML, extract with whitespace collapsed, then switch on keep line breaks only if you need line oriented output.
                  Copy the result into your destination tool and do any additional cleanup there.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Uploads, downloads, and privacy" icon="list">
              <p>
                The editor supports pasting directly, but you can also load files when your XML lives in an export.
                Text-like formats are read locally using your browser file APIs and inserted into the editor.
                If you upload a PDF or DOCX, extraction can work as well, but those formats require optional libraries in the app build.
              </p>

              <p className="mt-3">
                Once you have extracted text, you can copy it with one click or download it as a TXT file.
                The PDF download button exports the output using a client-side PDF library when available.
                If the library is not installed, the page falls back to your browser print dialog so you can still save as PDF.
              </p>

              <p className="mt-3">
                Privacy is straightforward: conversions run in your browser from the text currently on screen.
                This page does not need to send your XML to a server to compute the output.
                You control when you upload a file and when you copy the final result.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Practical tip for large XML
                </div>
                <p className="mt-2">
                  Very large XML documents can be slow to parse in any browser.
                  If you are working with a huge export, consider extracting only the relevant fragment first.
                  A smaller input makes parsing faster and reduces the chance of running into browser memory limits.
                </p>
              </div>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">Runs locally</div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Your XML stays on your device
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  Extraction happens from the text in the editor using browser parsing and string processing.
                  If you are handling sensitive exports, you can use this page as a quick local formatter before pasting into your workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: "list" | "type";
  children: React.ReactNode;
}) {
  const Icon = () => {
    const common = "h-5 w-5 text-sky-600";
    switch (icon) {
      case "type":
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={common}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M9 6v12m6-12v12"
            />
          </svg>
        );
      case "list":
      default:
        return (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={common}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 7h16M4 12h12M4 17h14"
            />
          </svg>
        );
    }
  };

  return (
    <div className="group relative rounded-3xl bg-white ring-1 ring-slate-200/80 shadow-sm">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500/80 via-sky-400/50 to-transparent"
      />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-200/60">
            <Icon />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
