import { useState } from "react";
import { describeLine } from "../../text/text-diff-model";
import type { DiffResult, LineContext, WordSegment } from "../../text/text-diff-model";

const previewLines = 16;
const previewCharacters = 1_600;
const button = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:opacity-50 aria-disabled:opacity-50";
const lineClass = "min-w-0 break-words whitespace-pre-wrap font-mono text-sm [overflow-wrap:anywhere]";
const escapeWhitespace = (value: string) => value.replace(/[ \t\u00a0\uFEFF]/g, (character) => {
  if (character === " ") return "·";
  if (character === "\t") return "→";
  return character === "\u00a0" ? "⍽" : "⟦BOM⟧";
});

function Line({ raw, words, showWhitespace, variant }: {
  raw: string;
  words?: WordSegment[];
  showWhitespace: boolean;
  variant?: "removed" | "added";
}) {
  const { text, ending } = describeLine(raw);
  const truncated = text.length > previewCharacters;
  const plain = truncated ? text.slice(0, previewCharacters).replace(/[\uD800-\uDBFF]$/, "") : text;
  const display = (value: string) => showWhitespace ? escapeWhitespace(value) : value;
  const highlight = variant === "removed" ? "bg-red-200 text-red-950" : "bg-emerald-200 text-emerald-950";
  return (
    <>
      <div className={lineClass} dir="auto">
        {!truncated && words
          ? words.map((word, index) => word.changed
            ? <mark key={index} className={highlight}>{display(word.text)}</mark>
            : <span key={index}>{display(word.text)}</span>)
          : display(plain)}
        {text === "" && <span className="font-sans text-slate-600">(blank line)</span>}
      </div>
      <span className="block text-xs text-slate-700">{ending}{truncated ? " · Preview shortened" : ""}</span>
    </>
  );
}

function Context({ lines, showWhitespace, label }: {
  lines: LineContext[];
  showWhitespace: boolean;
  label: string;
}) {
  if (!lines.length) return null;
  return (
    <section aria-label={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <ul className="space-y-2">
        {lines.map(({ original, revised, raw }) => (
          <li key={original}>
            <span className="text-xs text-slate-700">Original {original} · Revised {revised}</span>
            <Line raw={raw} showWhitespace={showWhitespace} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TextDiffResults({ result }: { result: DiffResult }) {
  const [selected, setSelected] = useState(0);
  const [page, setPage] = useState(0);
  const [showWhitespace, setShowWhitespace] = useState(false);
  const group = result.groups[selected];
  const pageCount = group ? Math.ceil(Math.max(group.removed.length, group.added.length) / previewLines) : 0;

  function selectGroup(index: number) {
    setSelected(index);
    setPage(0);
  }

  return (
    <section aria-labelledby="text-diff-results-heading" className="space-y-4 border-t border-slate-200 pt-4">
      <h2 id="text-diff-results-heading" className="text-xl font-bold">Comparison results</h2>
      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <div className="flex gap-2"><dt>Removed lines</dt><dd className="font-bold">{result.removed}</dd></div>
        <div className="flex gap-2"><dt>Added lines</dt><dd className="font-bold">{result.added}</dd></div>
        <div className="flex gap-2"><dt>Unchanged lines</dt><dd className="font-bold">{result.unchanged}</dd></div>
      </dl>
      {group && (
        <>
          <div className="flex flex-wrap items-center gap-2" aria-label="Change navigation" role="group">
            <button type="button" className={button} onClick={() => { if (selected > 0) selectGroup(selected - 1); }} aria-disabled={selected === 0}>Previous change</button>
            <button type="button" className={button} onClick={() => { if (selected + 1 < result.groups.length) selectGroup(selected + 1); }} aria-disabled={selected + 1 === result.groups.length}>Next change</button>
            <p role="status" className="text-sm">Change {selected + 1} of {result.groups.length}</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={showWhitespace} onChange={(event) => setShowWhitespace(event.target.checked)} />
            Show spaces, tabs, and byte-order marks
          </label>
          {showWhitespace && <p className="text-xs text-slate-600">· space, → tab, ⍽ non-breaking space, ⟦BOM⟧ byte-order mark.</p>}
          {page === 0 && <Context lines={group.before} showWhitespace={showWhitespace} label="Unchanged context before" />}
          <div className="grid gap-3 md:grid-cols-2">
            {(["removed", "added"] as const).map((variant) => {
              const original = variant === "removed";
              const firstLine = original ? group.originalStart : group.revisedStart;
              const heading = original ? "Original · Removed" : "Revised · Added";
              const list = group[variant].slice(page * previewLines, (page + 1) * previewLines);
              return (
                <section key={variant} aria-label={heading} className={"min-w-0 rounded-lg border p-3 " + (original ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50")}>
                  <h3 className="text-sm font-bold">{heading}</h3>
                  {list.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {list.map((line, index) => (
                        <li key={index} className="border-b border-black/10 pb-2 last:border-b-0 last:pb-0">
                          <span className="block text-xs text-slate-700">Line {firstLine + page * previewLines + index}</span>
                          <Line raw={line} variant={variant} showWhitespace={showWhitespace}
                            words={original ? group.words?.original : group.words?.revised} />
                        </li>
                      ))}
                    </ul>
                  ) : <p className="mt-2 text-sm text-slate-700">No {variant} lines on this page.</p>}
                </section>
              );
            })}
          </div>
          {pageCount > 1 && (
            <div className="flex flex-wrap items-center gap-2" aria-label="Change preview pages" role="group">
              <button type="button" className={button} aria-disabled={page === 0} onClick={() => setPage(0)}>First page</button>
              <button type="button" className={button} aria-disabled={page === 0} onClick={() => { if (page > 0) setPage(page - 1); }}>Previous page</button>
              <button type="button" className={button} aria-disabled={page + 1 === pageCount}
                onClick={() => { if (page + 1 < pageCount) setPage(page + 1); }}>Next page</button>
              <button type="button" className={button} aria-disabled={page + 1 === pageCount} onClick={() => setPage(pageCount - 1)}>Last page</button>
              <p role="status" className="text-sm">Page {page + 1} of {pageCount}</p>
            </div>
          )}
          {page + 1 === pageCount &&
            <Context lines={group.after} showWhitespace={showWhitespace} label="Unchanged context after" />}
          <p className="text-sm text-slate-600">The report includes every changed line, including text shortened in the preview.</p>
        </>
      )}
    </section>
  );
}
