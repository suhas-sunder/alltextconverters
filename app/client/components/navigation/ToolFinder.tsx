import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { canonicalUrl } from "../../../site-config";
import { parseToolFavorites, searchTools, type SearchableTool } from "./tool-search";

const storageKey = "atc.tool-favorites.v1";

export function ToolFinder({ tools, close }: { tools: readonly SearchableTool[]; close(): void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const resultLinks = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    input.current?.focus();
    try { setFavorites(parseToolFavorites(localStorage.getItem(storageKey), tools)); } catch { /* Favorites remain available for this session. */ }
  }, [tools]);

  const results = searchTools(onlyFavorites ? tools.filter((tool) => favorites.includes(tool.href)) : tools, query);
  const activeIndex = Math.min(selected, results.length - 1);

  function changeFavorites(next: string[]) {
    setFavorites(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Session state still works. */ }
  }

  function handleSearchKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || !results.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = (activeIndex + delta + results.length) % results.length;
      setSelected(next);
      resultLinks.current.get(results[next].href)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      event.preventDefault();
      resultLinks.current.get(results[activeIndex].href)?.click();
    }
  }

  return (
    <section id="tool-finder" aria-labelledby="tool-finder-heading"
      className="mx-auto max-w-6xl px-4 pb-5 sm:px-6"
      onKeyDown={(event) => {
        if (event.key === "Escape") { event.preventDefault(); close(); }
      }}>
      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="tool-finder-heading" className="font-bold text-white">Find a tool</h2>
          <button type="button" onClick={close} className="min-h-11 rounded px-3 underline focus-visible:outline-2">Close finder</button>
        </div>
        <label className="block text-sm font-semibold" htmlFor="tool-finder-query">Search by name or task</label>
        <input id="tool-finder-query" ref={input} type="search" value={query} maxLength={100}
          aria-describedby="tool-finder-instructions"
          onChange={(event) => { setQuery(event.target.value); setSelected(0); }}
          onKeyDown={handleSearchKeys}
          placeholder="Try UTF-8 bytes, newline, or spreadsheet column"
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 text-white focus-visible:outline-2 focus-visible:outline-sky-400" />
        <p id="tool-finder-instructions" className="mt-2 text-sm text-slate-300">Use arrow keys to choose a result and Enter to open it. Tab reaches the links and favorite buttons.</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button type="button" aria-pressed={onlyFavorites}
            onClick={() => { setOnlyFavorites(!onlyFavorites); setSelected(0); }}
            className="min-h-11 rounded border border-slate-600 px-3 focus-visible:outline-2">
            Favorites only
          </button>
          {favorites.length > 0 && <button type="button" onClick={() => { changeFavorites([]); input.current?.focus(); }}
            className="min-h-11 rounded px-2 underline focus-visible:outline-2">Clear favorites</button>}
        </div>
        <p role="status" aria-atomic="true" className="mt-2 text-sm text-slate-300">
          {results.length} {results.length === 1 ? "result" : "results"}{activeIndex >= 0 ? ". Selected: " + results[activeIndex].label : "."}
        </p>
        <ul className="mt-2 max-h-64 divide-y divide-slate-800 overflow-y-auto overscroll-contain">
          {results.map((tool, index) => {
            const saved = favorites.includes(tool.href);
            return (
              <li key={tool.href} className="flex items-center gap-2">
                <a ref={(link) => { if (link) resultLinks.current.set(tool.href, link); else resultLinks.current.delete(tool.href); }}
                  href={new URL(canonicalUrl(tool.href)).pathname}
                  className={"min-h-11 min-w-0 flex-1 rounded px-3 py-3 font-semibold focus-visible:outline-2 " +
                    (index === activeIndex ? "bg-slate-800 text-sky-200" : "text-white hover:bg-slate-800")}
                  onClick={close}>{tool.label}</a>
                <button type="button" aria-label={"Favorite " + tool.label} aria-pressed={saved}
                  onClick={() => {
                    changeFavorites(saved ? favorites.filter((path) => path !== tool.href) : [...favorites, tool.href]);
                    if (saved && onlyFavorites) input.current?.focus();
                  }}
                  className="min-h-11 min-w-11 rounded px-3 text-xl text-amber-300 focus-visible:outline-2">
                  <span aria-hidden="true">{saved ? "★" : "☆"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
