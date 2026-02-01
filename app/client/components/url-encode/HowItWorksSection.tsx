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
                  How the URL Encoder Works
                </h2>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste text, encode it with encodeURIComponent, then copy or download the result. This tool focuses on predictable percent-encoding for URL components, and it runs locally in your browser.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Unicode-safe
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Local processing
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { k: "Query strings", v: "Search, filters, parameters" },
                { k: "Path segments", v: "Slugs, IDs, names" },
                { k: "APIs", v: "Request payload values" },
                { k: "Clipboard", v: "Copy clean encoded output" },
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
            <SectionCard title="What URL encoding is actually doing" icon="list">
              <p>
                URLs are not free-form text fields. They are structured strings with special characters that have meaning to browsers, servers, and proxies. For example, a question mark typically starts a query string, an ampersand separates parameters, and a hash indicates a fragment. If you paste raw text that contains these characters into the wrong part of a URL, you can change the meaning of the URL, or you can produce a value that is interpreted differently by different systems.
              </p>

              <p className="mt-3">
                URL encoding, also called percent-encoding, solves this by converting characters that are not safe in a given context into a percent sign followed by two hexadecimal digits. A space becomes %20. A newline becomes %0A. Symbols like & and = become %26 and %3D, which prevents them from being treated as separators in a query string. The goal is not to make text pretty. The goal is to make the meaning of a URL unambiguous.
              </p>

              <p className="mt-3">
                This page uses <span className="font-semibold text-slate-900">encodeURIComponent</span> on the current textarea value. That specific API is meant for encoding a single URL component, like a parameter value or a path segment. It deliberately does not encode every character, because some characters are safe inside components. That is a feature, not a bug. It keeps encoded output readable while still preventing breaking characters from changing how the URL is parsed.
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <div className="text-sm font-bold text-slate-900">
                  Runs locally in your browser
                </div>
                <p className="mt-2">
                  Encoding happens on your device using built-in browser functions. Your text is not uploaded to a server by this tool. Upload is optional and is only used to load a file into the editor in your own browser session.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Where to use encodeURIComponent (and where not to)" icon="type">
              <p>
                A common mistake is using the wrong encoder for the job. If you are encoding a full URL, you typically want to keep separators like : / ? # and & intact. If you run encodeURIComponent on an entire URL, it will encode those separators and you will get a string that is no longer a usable URL without decoding.
              </p>

              <p className="mt-3">
                Instead, use this encoder on the part that is untrusted or user-generated. Examples include a query parameter value like q, a filter string, a filename, or a tag. You build the final URL by combining the normal separators with encoded values. That way, your URL structure stays readable, and the value stays safe.
              </p>

              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Encoding query parameter values",
                    "If you have something like ?q=, encode only the q value. This prevents spaces and symbols from breaking the query string.",
                  ],
                  [
                    "Encoding path segments",
                    "If your app places user text in a path segment, encode it before concatenating. This avoids accidental slashes or control characters.",
                  ],
                  [
                    "Encoding API request fields",
                    "Some systems expect URL-encoded values inside forms or query strings. Use encoding to keep payload parsing stable.",
                  ],
                  [
                    "Not for full URLs",
                    "Do not encode the entire URL string with encodeURIComponent unless you explicitly want a fully escaped representation.",
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

              <div className="mt-4 rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-5">
                <div className="text-sm font-bold text-slate-900">Quick example</div>
                <p className="mt-2 text-slate-700">
                  If you want to build a search link, you might use: https://example.com/search?q= plus the encoded query. If the query is “cats & dogs”, the encoded value becomes “cats%20%26%20dogs”, so the ampersand stays part of the value instead of splitting the query string.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Deterministic rules and common edge cases" icon="list">
              <p>
                This tool uses simple, deterministic browser rules. It does not try to guess your intent or rewrite your text. It encodes what the browser encoder encodes, and it leaves safe characters alone. That makes the output consistent and predictable across common workflows.
              </p>

              <p className="mt-3">
                The main edge case is malformed Unicode. Rarely, text can contain an unpaired surrogate, which is an invalid sequence for UTF-16. encodeURIComponent will throw a URIError for that kind of input. When that happens, this page shows an error message and does not crash. If you hit this, the fastest fix is usually to remove suspicious invisible characters, or copy the text into a plain editor that normalizes encoding.
              </p>

              <p className="mt-3">
                Another practical issue is size. Extremely large inputs can cause clipboard, PDF export, or the browser encoder itself to slow down. If you are encoding megabytes of text, consider doing it in smaller chunks. For typical URL and query use cases, inputs are usually short and the tool is effectively instant.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Space handling
                  </div>
                  <p className="mt-2">
                    encodeURIComponent encodes spaces as %20. Some legacy systems use + for spaces in form encoding. This tool intentionally stays with %20 because it is the standard percent-encoding representation for URL components.
                  </p>
                </div>

                <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-5">
                  <div className="text-sm font-bold text-slate-900">
                    Newlines and tabs
                  </div>
                  <p className="mt-2">
                    Control characters like newlines and tabs are encoded too. That is helpful when you are moving multi-line content into a single query parameter, but you should verify that your destination system accepts those characters.
                  </p>
                </div>
              </div>
            </SectionCard>

            <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-7">
              <div aria-hidden="true" className="absolute inset-0 opacity-30">
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-500 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-500 blur-3xl" />
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-sky-200">
                  Practical tip
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight">
                  Encode only the parts that need encoding
                </h3>
                <p className="mt-2 text-slate-100 leading-7">
                  If your encoded output will be combined into a full URL, keep the URL structure readable and stable by encoding only component values. Test by pasting the final URL into a browser address bar or an API client and confirming the server receives the value you intended.
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
