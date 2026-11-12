import { canonicalPath } from "../../../url-path";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import logo from "../../assets/images/all-text-converters-logo.png";

import { ToolFinder } from "./ToolFinder";
import { searchTools } from "./tool-search";
import { primaryTools, toolCatalog, toolDirectoryPath } from "./tool-catalog";

export function Navbar() {
  const inDirectory = canonicalPath(useLocation().pathname) === toolDirectoryPath;
  const [mobileOpen, setMobileOpen] = useState(false);

  const [finderOpen, setFinderOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const finderTrigger = useRef<HTMLButtonElement | null>(null);
  const finderFocus = useRef<HTMLElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Unique class so our injected CSS only hits these menus
  const SCROLL_CLASS = "atc-scroll";

  const filteredMobileTools = useMemo(() => searchTools(toolCatalog, mobileQuery), [mobileQuery]);

  const closeAll = () => {
    setMobileOpen(false);
    setFinderOpen(false);
  };

  function openFinder() {
    finderFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setFinderOpen(true);
  }

  function closeFinder() {
    setFinderOpen(false);
    requestAnimationFrame(() => {
      if (finderFocus.current?.isConnected) finderFocus.current.focus();
      else finderTrigger.current?.focus();
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
      const target = event.target;
      const editing = target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (!editing && !mobileOpen && !finderOpen && (event.ctrlKey || event.metaKey) &&
          !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openFinder();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, finderOpen]);

  // Mobile body lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    if (mobileOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => mobileCloseButtonRef.current?.focus());
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
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
        <div className="flex items-center justify-between gap-2 py-3">
          <a
            href="/"
            className="group flex min-w-0 items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={closeAll}
          >
            <img
              src={logo}
              alt="All Text Converters logo"
              width={36}
              height={36}
              className="h-8 w-8 shrink-0 sm:h-9 sm:w-9"
            />
            <div className="text-left">
              <div className="text-base font-bold text-white tracking-tight group-hover:text-sky-200">
                AllTextConverters
              </div>
              <div className="text-xs text-sky-200 font-semibold">
                Browser-based text tools
              </div>
            </div>
          </a>

          <div className="flex shrink-0 items-center gap-1 md:hidden">
            <a href={toolDirectoryPath} aria-label="Browse tools" aria-current={inDirectory ? "page" : undefined} onClick={closeAll}
              className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold hover:bg-slate-800 focus-visible:outline-2">
              Browse
            </a>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 py-2
                         text-slate-200 hover:text-sky-200 hover:bg-slate-800 transition-colors
                         cursor-pointer"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileQuery("");
                setMobileOpen(true);
                setFinderOpen(false);
              }}
            >
              <IconMenu />
            </button>
          </div>

          {/* Desktop nav */}
          <nav aria-label="Primary navigation" className="hidden md:flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm">
            {primaryTools.map((l) => (
              <a
                key={l.href}
                href={canonicalPath(l.href)}
                className="font-semibold transition-colors hover:text-sky-200 cursor-pointer"
                onClick={closeAll}
              >
                {l.label}
              </a>
            ))}

            <a href={toolDirectoryPath} aria-current={inDirectory ? "page" : undefined} onClick={closeAll}
              className="inline-flex min-h-11 items-center rounded-md px-2 font-semibold hover:bg-slate-800 focus-visible:outline-2">
              Browse tools
            </a>
            <button
              ref={finderTrigger}
              type="button"
              className="min-h-11 rounded-md px-3 font-semibold hover:bg-slate-800 focus-visible:outline-2"
              aria-expanded={finderOpen}
              aria-controls={finderOpen ? "tool-finder" : undefined}
              aria-keyshortcuts="Control+K Meta+K"
              onClick={finderOpen ? closeFinder : openFinder}
            >
              Find a tool
            </button>
          </nav>
        </div>
      </div>

      {finderOpen && <ToolFinder tools={toolCatalog} close={closeFinder} />}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[2147483647]">
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
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <div className="leading-tight">
                    <div className="text-sm font-bold text-white">
                      AllTextConverters
                    </div>
                    <div className="text-xs text-sky-200 font-semibold">
                      Browser-based text tools
                    </div>
                  </div>
                </a>

                <button
                  ref={mobileCloseButtonRef}
                  type="button"
                  className="min-h-11 min-w-11 rounded-md px-3 py-2 text-slate-200
                             hover:text-white hover:bg-slate-800 transition-colors
                             cursor-pointer"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <IconX />
                </button>
              </div>

              <div className="px-4 pb-3">
                <a href={toolDirectoryPath} aria-current={inDirectory ? "page" : undefined} onClick={closeAll}
                  className="mb-2 inline-flex min-h-11 items-center rounded-md px-2 text-sm font-semibold text-sky-200 underline underline-offset-4 focus-visible:outline-2">
                  Browse tools by task
                </a>
                <input
                  value={mobileQuery}
                  onChange={(e) => setMobileQuery(e.target.value)}
                  placeholder="Search tools (trim, newline, dedupe, url decode)"
                  aria-label="Search tools"
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
                      href={canonicalPath(l.href)}
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
