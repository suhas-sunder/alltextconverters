import { Link } from "react-router";

type ToolLink = { label: string; to: string };
type ToolCategory = { title: string; items: ToolLink[] };

export function Footer() {
  const year = new Date().getFullYear();

  const categories: ToolCategory[] = [
    {
      title: "Counters",
      items: [
        { label: "Word Counter", to: "/word-counter" },
        { label: "Character Counter", to: "/character-counter" },
      ],
    },
    {
      title: "Case & Formatting",
      items: [
        { label: "Case Converter", to: "/case-converter" },
        { label: "Uppercase Converter", to: "/uppercase-converter" },
        { label: "Lowercase Converter", to: "/lowercase-converter" },
        { label: "Title Case Converter", to: "/title-case-converter" },
        { label: "Sentence Case Converter", to: "/sentence-case-converter" },
        {
          label: "Alternating Case Converter",
          to: "/alternating-case-converter",
        },
        { label: "Text Case Checker", to: "/text-case-checker" },
        { label: "Match Case Converter", to: "/match-case-converter" },
      ],
    },
    {
      title: "Text Cleanup",
      items: [
        { label: "Text Cleaner", to: "/text-cleaner" },
        { label: "Remove Extra Spaces", to: "/remove-extra-spaces" },
        { label: "Whitespace Cleaner", to: "/whitespace-cleaner" },
        { label: "Line Break Remover", to: "/line-break-remover" },
        { label: "Remove Duplicate Lines", to: "/remove-duplicate-lines" },
        {
          label: "Remove All Styling From Text",
          to: "/remove-all-styling-from-text",
        },
      ],
    },
    {
      title: "Lists & Tables",
      items: [
        { label: "Case Insensitive Sort", to: "/case-insensitive-sort" },
        { label: "Comma Separated to List", to: "/comma-separated-to-list" },
        { label: "List to Comma Separated", to: "/list-to-comma-separated" },
        { label: "List to Table", to: "/list-to-table" },
        { label: "Table to List", to: "/table-to-list" },
        {
          label: "Text to Comma Separated List",
          to: "/text-to-comma-separated-list",
        },
        {
          label: "Text to Bulleted Text List",
          to: "/text-to-bulleted-text-list",
        },
        { label: "Text to Ordered List", to: "/text-to-ordered-list" },
      ],
    },
    {
      title: "Encode / Decode",
      items: [
        { label: "Base64 Encode", to: "/base64-encode" },
        { label: "Base64 Decode", to: "/base64-decode" },
        { label: "URL Encode", to: "/url-encode" },
        { label: "URL Decode", to: "/url-decode" },
      ],
    },
    {
      title: "Data (JSON / XML / HTML)",
      items: [
        { label: "JSON to Text", to: "/json-to-text" },
        { label: "Text to JSON", to: "/text-to-json" },
        { label: "XML to Text", to: "/xml-to-text" },
        { label: "Text to XML", to: "/text-to-xml" },
        { label: "HTML to Text", to: "/html-to-text" },
        { label: "Text to HTML", to: "/text-to-html" },
        { label: "Comma to JSON Array", to: "/comma-to-json-array" },
        { label: "JSON Array to List", to: "/json-array-to-list" },
      ],
    },
    {
      title: "Number Systems",
      items: [
        { label: "ASCII to Text", to: "/ascii-to-text" },
        { label: "Text to ASCII", to: "/text-to-ascii" },
        { label: "Binary to Text", to: "/binary-to-text" },
        { label: "Text to Binary", to: "/text-to-binary" },
        { label: "Hex to Text", to: "/hex-to-text" },
        { label: "Text to Hex", to: "/text-to-hex" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-[1180px] px-4 py-8">
        {/* Tools Directory */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-bold text-white">Tools</h2>
            <span className="text-xs text-slate-400">
              Browse utilities by category
            </span>
          </div>

          {/* Key:
              - Mobile: single column (no truncation)
              - Desktop+: masonry columns (packed)
          */}
          <div className="mt-3 columns-1 sm:columns-2 lg:columns-3 xl:columns-4 [column-gap:1.5rem]">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="mb-4 break-inside-avoid rounded-lg border border-slate-800/40 bg-slate-950/15 p-3"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-slate-200">
                  {cat.title}
                </div>

                <ul className="mt-2 space-y-1 text-sm leading-snug">
                  {cat.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="block text-slate-300 hover:text-white hover:underline underline-offset-4
                                   transition-colors cursor-pointer
                                   whitespace-normal break-words"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="mt-5 flex flex-col items-center justify-center gap-2 text-center">
          <nav aria-label="Footer links" className="text-sm">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies-policy"
                  className="hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white hover:underline underline-offset-4 cursor-pointer"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>

          <p className="text-xs text-slate-400">
            © {year} AllTextConverters.com. Free browser-based text tools.
          </p>
        </div>
      </div>
    </footer>
  );
}
