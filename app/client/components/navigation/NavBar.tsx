import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import logo from "../../assets/images/all-text-converters-logo.png";

type NavItem = {
  label: string;
  href: string;
  keywords: string[];
};

type Rect = { top: number; left: number; width: number; height: number };

function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop dropdown state
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreRect, setMoreRect] = useState<Rect | null>(null);

  // Mobile search
  const [mobileQuery, setMobileQuery] = useState("");

  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  const isClient = useIsClient();

  // Unique class so our injected CSS only hits these menus
  const SCROLL_CLASS = "atc-scroll";

  const primaryLinks: NavItem[] = useMemo(
    () => [
      {
        label: "Word Counter",
        href: "/word-counter",
        keywords: ["words", "count words", "word count", "essay", "writing"],
      },
      {
        label: "Character Counter",
        href: "/character-counter",
        keywords: ["characters", "char count", "letters", "length"],
      },
      {
        label: "Case Converter",
        href: "/case-converter",
        keywords: [
          "case",
          "uppercase",
          "lowercase",
          "title case",
          "sentence case",
          "swap case",
        ],
      },
      {
        label: "Text Cleaner",
        href: "/text-cleaner",
        keywords: ["clean", "normalize", "cleanup", "sanitize", "format"],
      },
    ],
    [],
  );

  const tools: NavItem[] = useMemo(
    () => [
      ...primaryLinks,

      {
        label: "Uppercase Converter",
        href: "/uppercase-converter",
        keywords: ["upper", "caps", "to uppercase"],
      },
      {
        label: "Lowercase Converter",
        href: "/lowercase-converter",
        keywords: ["lower", "to lowercase"],
      },
      {
        label: "Title Case Converter",
        href: "/title-case-converter",
        keywords: ["title case", "headline", "capitalize words"],
      },
      {
        label: "Sentence Case Converter",
        href: "/sentence-case-converter",
        keywords: ["sentence case", "capitalize sentences"],
      },
      {
        label: "Alternating Case Converter",
        href: "/alternating-case-converter",
        keywords: ["alternating", "spongebob", "mocking case"],
      },
      {
        label: "Text Case Checker",
        href: "/text-case-checker",
        keywords: ["detect case", "case check"],
      },
      {
        label: "Match Case Converter",
        href: "/match-case-converter",
        keywords: ["match case", "copy case", "apply casing"],
      },

      {
        label: "Remove Extra Spaces",
        href: "/remove-extra-spaces",
        keywords: ["spaces", "trim", "double spaces", "extra whitespace"],
      },
      {
        label: "Whitespace Cleaner",
        href: "/whitespace-cleaner",
        keywords: ["whitespace", "tabs", "spaces", "trim"],
      },
      {
        label: "Line Break Remover",
        href: "/line-break-remover",
        keywords: ["remove line breaks", "newlines", "join lines"],
      },
      {
        label: "Remove Duplicate Lines",
        href: "/remove-duplicate-lines",
        keywords: ["dedupe", "duplicate", "unique lines"],
      },
      {
        label: "Remove All Styling From Text",
        href: "/remove-all-styling-from-text",
        keywords: ["strip formatting", "plain text", "remove formatting"],
      },

      {
        label: "Case Insensitive Sort",
        href: "/case-insensitive-sort",
        keywords: ["sort", "alphabetize", "ignore case"],
      },
      {
        label: "Sort List",
        href: "/sort-list",
        keywords: ["sort", "alphabetize", "list"],
      },
      {
        label: "Deduplicate List",
        href: "/deduplicate-list",
        keywords: ["dedupe", "unique", "remove duplicates"],
      },

      {
        label: "Base64 Encode",
        href: "/base64-encode",
        keywords: ["base64", "encode", "b64"],
      },
      {
        label: "Base64 Decode",
        href: "/base64-decode",
        keywords: ["base64", "decode", "b64"],
      },
      {
        label: "URL Encode",
        href: "/url-encode",
        keywords: ["url encode", "percent encode", "escape url"],
      },
      {
        label: "URL Decode",
        href: "/url-decode",
        keywords: ["url decode", "percent decode", "unescape url"],
      },

      {
        label: "ASCII to Text",
        href: "/ascii-to-text",
        keywords: ["ascii", "code to text"],
      },
      {
        label: "Text to ASCII",
        href: "/text-to-ascii",
        keywords: ["ascii", "text to code"],
      },

      {
        label: "JSON to Text",
        href: "/json-to-text",
        keywords: ["json", "format json", "pretty"],
      },
      {
        label: "Text to JSON",
        href: "/text-to-json",
        keywords: ["json", "parse", "convert to json"],
      },
      {
        label: "XML to Text",
        href: "/xml-to-text",
        keywords: ["xml", "strip tags", "extract text"],
      },
      {
        label: "Text to XML",
        href: "/text-to-xml",
        keywords: ["xml", "wrap", "convert to xml"],
      },

      {
        label: "HTML to Text",
        href: "/html-to-text",
        keywords: ["html", "strip tags", "remove html"],
      },
      {
        label: "Text to HTML",
        href: "/text-to-html",
        keywords: ["html", "wrap", "convert to html", "escape"],
      },

      {
        label: "Comma Separated to List",
        href: "/comma-separated-to-list",
        keywords: ["csv", "commas", "split"],
      },
      {
        label: "List to Comma Separated",
        href: "/list-to-comma-separated",
        keywords: ["csv", "commas", "join"],
      },
      {
        label: "List to Table",
        href: "/list-to-table",
        keywords: ["table", "columns", "rows"],
      },
      {
        label: "Table to List",
        href: "/table-to-list",
        keywords: ["table", "flatten"],
      },
      {
        label: "Comma to JSON Array",
        href: "/comma-to-json-array",
        keywords: ["json array", "comma", "csv"],
      },
      {
        label: "JSON Array to List",
        href: "/json-array-to-list",
        keywords: ["json array", "list"],
      },
      {
        label: "Text to Comma Separated List",
        href: "/text-to-comma-separated-list",
        keywords: ["comma", "csv", "join"],
      },
      {
        label: "Text to Bulleted Text List",
        href: "/text-to-bulleted-text-list",
        keywords: ["bullets", "bullet list", "markdown"],
      },
      {
        label: "Text to Ordered List",
        href: "/text-to-ordered-list",
        keywords: ["numbered list", "ordered", "steps"],
      },

      {
        label: "Binary to Text",
        href: "/binary-to-text",
        keywords: ["binary", "bits", "decode binary"],
      },
      {
        label: "Text to Binary",
        href: "/text-to-binary",
        keywords: ["binary", "bits", "encode binary"],
      },
      {
        label: "Hex to Text",
        href: "/hex-to-text",
        keywords: ["hex", "hexadecimal", "decode hex"],
      },
      {
        label: "Text to Hex",
        href: "/text-to-hex",
        keywords: ["hex", "hexadecimal", "encode hex"],
      },
    ],
    [primaryLinks],
  );

  const desktopMoreList: NavItem[] = useMemo(() => {
    const primaryHrefs = new Set(primaryLinks.map((l) => l.href));
    return tools.filter((t) => !primaryHrefs.has(t.href));
  }, [tools, primaryLinks]);

  const filteredMobileTools: NavItem[] = useMemo(() => {
    const q = mobileQuery.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((t) => {
      const hay = [t.label, t.href, ...t.keywords].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [mobileQuery, tools]);

  const closeAll = () => {
    setMobileOpen(false);
    setMoreOpen(false);
  };

  function updateMoreRect() {
    const btn = moreBtnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    setMoreRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }

  // When opening dropdown, measure button location and keep it updated on scroll/resize
  useLayoutEffect(() => {
    if (!moreOpen) return;
    updateMoreRect();

    function onScrollOrResize() {
      updateMoreRect();
    }

    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [moreOpen]);

  // Close desktop dropdown on outside click + Escape
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!moreOpen) return;
      const t = e.target as Node | null;
      if (!t) return;

      const btn = moreBtnRef.current;
      const menu = moreMenuRef.current;

      // menu is in a portal, but ref still works
      if (btn?.contains(t) || menu?.contains(t)) return;

      setMoreOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  // Mobile body lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Mobile close on backdrop click
  useEffect(() => {
    if (!mobileOpen) return;

    function onDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      const panel = mobilePanelRef.current;
      if (panel && panel.contains(t)) return;
      setMobileOpen(false);
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown as any);
    };
  }, [mobileOpen]);

  // Dropdown placement
  const dropdownStyle = useMemo(() => {
    if (!moreRect) return undefined;

    const gap = 8; // px
    const top = Math.round(moreRect.top + moreRect.height + gap);

    // Align right edge of menu to button right edge
    const menuWidth = 320; // matches w-80
    const rightEdge = Math.round(moreRect.left + moreRect.width);
    const left = Math.max(8, rightEdge - menuWidth);

    return {
      position: "fixed" as const,
      top,
      left,
      width: menuWidth,
      zIndex: 2147483647, // max-ish, but portal is the real fix
    };
  }, [moreRect]);

  return (
    <header className="bg-slate-900 text-slate-200">
      {/* Scoped scrollbar styles only for menu containers */}
      <style>{`
        .${SCROLL_CLASS} {
          scrollbar-width: thin;
          scrollbar-color: rgba(148,163,184,.7) rgba(2,6,23,1);
          scrollbar-gutter: stable both-edges;
          overscroll-behavior: contain;
        }
        .${SCROLL_CLASS}::-webkit-scrollbar { width: 10px; }
        .${SCROLL_CLASS}::-webkit-scrollbar-track { background: rgba(2,6,23,1); }
        .${SCROLL_CLASS}::-webkit-scrollbar-thumb {
          background-color: rgba(148,163,184,.65);
          border-radius: 10px;
          border: 2px solid rgba(2,6,23,1);
        }
        .${SCROLL_CLASS}::-webkit-scrollbar-thumb:hover { background-color: rgba(148,163,184,.85); }
        .${SCROLL_CLASS}::-webkit-scrollbar-corner { background: rgba(2,6,23,1); }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-1">
        <div className="flex items-center justify-between py-3">
          <a
            href="/"
            className="group flex items-center gap-3 cursor-pointer"
            onClick={closeAll}
          >
            <img
              src={logo}
              alt="All Text Converters logo"
              className="h-8 w-8 sm:h-9 sm:w-9"
            />
            <div className="text-left">
              <div className="text-base font-bold text-white tracking-tight group-hover:text-sky-200">
                AllTextConverters
              </div>
              <div className="text-xs text-sky-200 font-semibold">
                Fast, private browser-based text tools
              </div>
            </div>
          </a>

          {/* Mobile burger */}
          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center rounded-md px-3 py-2
                       text-slate-200 hover:text-sky-200 hover:bg-slate-800 transition-colors
                       cursor-pointer"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileQuery("");
              setMobileOpen(true);
              setMoreOpen(false);
            }}
          >
            <IconMenu />
          </button>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-5 text-sm">
            {primaryLinks.slice(0, 4).map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-semibold transition-colors hover:text-sky-200 cursor-pointer"
                onClick={closeAll}
              >
                {l.label}
              </a>
            ))}

            <button
              ref={moreBtnRef}
              type="button"
              className="font-semibold transition-colors hover:text-sky-200 hover:bg-slate-800
                         rounded-md px-2 py-2 inline-flex items-center gap-2 cursor-pointer"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              onClick={() => {
                if (!moreOpen) updateMoreRect();
                setMoreOpen((v) => !v);
              }}
            >
              More <IconChevronDown />
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop dropdown rendered in portal so it is always above everything */}
      {isClient && moreOpen && dropdownStyle
        ? createPortal(
            <div
              ref={moreMenuRef}
              role="menu"
              className="rounded-xl border border-slate-700 bg-slate-900 shadow-xl overflow-hidden"
              style={dropdownStyle}
            >
              <div
                className={`${SCROLL_CLASS} max-h-[min(60vh,520px)] overflow-y-auto`}
              >
                {desktopMoreList.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    role="menuitem"
                    className="block px-5 py-4 text-base text-slate-100
                               hover:bg-slate-800 hover:text-sky-200 transition-colors
                               cursor-pointer"
                    onClick={closeAll}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>,
            document.body,
          )
        : null}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-[2147483647]">
          <div className="absolute inset-0 bg-black/55" />

          <div
            ref={mobilePanelRef}
            className="absolute inset-y-0 right-0 w-[92vw] max-w-sm
                       bg-slate-900 border-l border-slate-800 shadow-2xl
                       flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="shrink-0 bg-slate-900/95 backdrop-blur border-b border-slate-800">
              <div className="flex items-center justify-between px-4 py-3">
                <a
                  href="/"
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={closeAll}
                >
                  <img
                    src={logo}
                    alt="All Text Converters logo"
                    className="h-8 w-8"
                  />
                  <div className="leading-tight">
                    <div className="text-sm font-bold text-white">
                      AllTextConverters
                    </div>
                    <div className="text-xs text-sky-200 font-semibold">
                      Fast, private browser-based text tools
                    </div>
                  </div>
                </a>

                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-slate-200
                             hover:text-white hover:bg-slate-800 transition-colors
                             cursor-pointer"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <IconX />
                </button>
              </div>

              <div className="px-4 pb-3">
                <input
                  value={mobileQuery}
                  onChange={(e) => setMobileQuery(e.target.value)}
                  placeholder="Search tools (trim, newline, dedupe, url decode)"
                  className="w-full rounded-lg bg-slate-950 border border-slate-800
                             px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500
                             outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <div className={`${SCROLL_CLASS} h-full overflow-y-auto`}>
                {filteredMobileTools.length === 0 ? (
                  <div className="px-5 py-6 text-sm text-slate-400">
                    No tools match “{mobileQuery.trim()}”.
                  </div>
                ) : (
                  filteredMobileTools.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      className="block px-5 py-4 text-base font-semibold text-slate-100
                                 hover:bg-slate-800 hover:text-sky-200 transition-colors
                                 cursor-pointer"
                      onClick={closeAll}
                    >
                      {l.label}
                    </a>
                  ))
                )}

                <div className="h-[env(safe-area-inset-bottom)]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function IconMenu() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconX() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
