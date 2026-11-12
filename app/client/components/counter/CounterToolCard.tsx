import { canonicalPath } from "../../../url-path";
import { needsUnicodePrint, openTextPrintView } from "../../text/print-view";
import { DOCUMENT_IMPORT_ACCEPT } from "../../text/document-import";
import { useEffect, useMemo, useState } from "react";
import { assessInputSize, formatByteCount } from "../../text/input-size";
import { formatMetricNumber, getTextMetrics, type TextMetrics } from "../../text/metrics";
import type { RelatedTool } from "../converter/ConverterCard";
import { useLocalFileImport } from "../useLocalFileImport";

export type CounterFocus = "characters" | "words" | "bytes";
type Metric = { label: string; value: number; description?: string; immediate?: boolean };
type MetricsResult = { input: string; metrics: TextMetrics | null };
const emptyMetrics = getTextMetrics("");

const buttonClass = "min-h-11 rounded-xl bg-white px-4 py-2 text-sm font-semibold ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50";

function metricSets(focus: CounterFocus, metrics: TextMetrics, utf8Bytes: number, secondaryMetricsBlocked: boolean): { primary: Metric[]; advanced: Metric[] } {
  const common = {
    characters: { label: "Characters including spaces", value: metrics.graphemes },
    words: { label: "Words", value: metrics.words },
    noSpaces: { label: "Characters excluding literal spaces", value: metrics.withoutLiteralSpaces },
    lines: { label: "Lines", value: metrics.lines },
    bytes: { label: "UTF-8 bytes", value: utf8Bytes, immediate: true },
  };
  if (focus === "characters") return {
    primary: [common.characters, common.noSpaces, common.words, common.lines],
    advanced: [
      { label: "Grapheme clusters", value: metrics.graphemes, description: "Visible-character units used by the primary character count." },
      { label: "Unicode code points", value: metrics.codePoints },
      { label: "UTF-16 code units", value: metrics.utf16CodeUnits },
      common.bytes,
      { label: "Characters excluding all Unicode whitespace", value: metrics.withoutWhitespace },
      { label: "Nonblank lines", value: metrics.nonblankLines },
    ],
  };
  if (focus === "words") return { primary: [common.words, common.characters, common.noSpaces, common.lines], advanced: [{ label: "Paragraphs", value: metrics.paragraphs }, { label: "Characters excluding all Unicode whitespace", value: metrics.withoutWhitespace }, common.bytes, { label: "Nonblank lines", value: metrics.nonblankLines }] };
  return { primary: [common.bytes, { label: "Visible characters", value: metrics.graphemes }, { label: "Unicode code points", value: metrics.codePoints }, { label: "UTF-16 code units", value: metrics.utf16CodeUnits }], advanced: secondaryMetricsBlocked ? [] : [common.words, common.lines, common.noSpaces, { label: "Characters excluding all Unicode whitespace", value: metrics.withoutWhitespace }] };
}

export function CounterToolCard({ focus, title, description, input, setInput, example, relatedTools }: { focus: CounterFocus; title: string; description: string; input: string; setInput: (value: string) => void; example: string; relatedTools: RelatedTool[] }) {
  const isByteCounter = focus === "bytes";
  const size = useMemo(() => assessInputSize(input), [input]);
  const [result, setResult] = useState<MetricsResult>({ input: "", metrics: emptyMetrics });
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileImport = useLocalFileImport(setInput, true);
  useEffect(() => {
    if (!input || size.level === "blocked") return;
    if (size.level === "normal") {
      const timer = window.setTimeout(() => setResult({ input, metrics: getTextMetrics(input) }), 180);
      return () => window.clearTimeout(timer);
    }

    let worker: Worker | undefined;
    let disposed = false;
    const finish = (metrics: TextMetrics | null) => {
      worker?.terminate();
      worker = undefined;
      if (!disposed) setResult({ input, metrics });
    };
    const timer = window.setTimeout(() => {
      try {
        worker = new Worker(new URL("./counter-metrics.worker.ts", import.meta.url), { type: "module" });
        worker.onmessage = (event: MessageEvent<TextMetrics>) => finish(event.data);
        worker.onerror = () => finish(null);
        worker.onmessageerror = () => finish(null);
        worker.postMessage(input);
      } catch {
        finish(null);
      }
    }, 180);
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      worker?.terminate();
    };
  }, [input, size.level]);
  const metrics = !input ? emptyMetrics : result.input === input ? result.metrics : null;
  const sets = useMemo(() => metricSets(focus, metrics ?? emptyMetrics, size.bytes, size.level === "blocked"), [focus, metrics, size.bytes, size.level]);
  const display = (metric: Metric) => metric.immediate || metrics ? formatMetricNumber(metric.value) : "—";
  async function copy() { try { await navigator.clipboard.writeText(input); setCopyStatus("Text copied."); } catch { setCopyStatus("Copy failed. Select the text and copy it manually."); } }
  function download() { const url = URL.createObjectURL(new Blob([input], { type: "text/plain;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${focus}-counter-text.txt`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); }
  function loadFile(file: File) {
    setFileError(null);
    setCopyStatus(null);
    void fileImport.open(file);
  }
  function updateInput(value: string) {
    fileImport.reset();
    setInput(value);
    setCopyStatus(null);
    setFileError(null);
  }
  async function downloadPdf() {
    setFileError(null);
    if (needsUnicodePrint(input)) {
      if (!openTextPrintView(title + " text export", input)) {
        setFileError("Could not open the print view. Allow pop-ups or download TXT.");
      }
      return;
    }
    try {
      const { jsPDF } = await import("jspdf");
      const document = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 40;
      const width = document.internal.pageSize.getWidth() - 2 * margin;
      const height = document.internal.pageSize.getHeight() - 2 * margin;
      const lines: string[] = document.splitTextToSize(input, width);
      const lineHeight = document.getFontSize() * document.getLineHeightFactor();
      const linesPerPage = Math.floor(height / lineHeight);

      for (let start = 0; start < lines.length; start += linesPerPage) {
        if (start > 0) document.addPage();
        document.text(lines.slice(start, start + linesPerPage), margin, margin);
      }
      document.save(`${focus}-counter-text.pdf`);
    } catch { setFileError("PDF download failed. Try again or download TXT."); }
  }
  return <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-7">
    <header><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p><p className="mt-2 text-xs font-medium text-emerald-700">Counting runs only in this browser. Text is not uploaded.</p></header>
    <section className={isByteCounter ? "mt-5" : "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"} aria-label="Primary text metrics">
      {(isByteCounter ? sets.primary.slice(0, 1) : sets.primary).map((metric, index) => (
        <div key={metric.label} className={index === 0 ? "min-w-0 rounded-2xl bg-sky-50 p-4 ring-1 ring-slate-200" : "min-w-0 rounded-2xl bg-white p-4 ring-1 ring-slate-200"}>
          <div className="text-xs font-semibold text-slate-600">{metric.label}</div>
          <div className={isByteCounter ? "mt-1 text-4xl font-extrabold text-slate-900" : "mt-1 text-3xl font-extrabold text-slate-900"}>
            {display(metric)}
          </div>
        </div>
      ))}
    </section>
    <label htmlFor={`${focus}-counter-input`} className="mt-6 block text-sm font-bold">Text to count</label><textarea id={`${focus}-counter-input`} value={input} onChange={(event) => updateInput(event.target.value)} aria-describedby={isByteCounter ? "bytes-counter-line-endings" : `${focus}-counter-size`} className="mt-2 min-h-72 w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" placeholder="Type or paste text here…" />
    {isByteCounter ? <p id="bytes-counter-line-endings" className="mt-2 text-xs text-slate-600">The editor uses LF (1 byte per line break) for typed or pasted text. Plain-text imports retain their decoded line endings until edited, including CRLF (2 bytes per line break).</p> : null}
    {!isByteCounter || (size.level !== "normal" && size.level !== "blocked") ? <p id={`${focus}-counter-size`} className={`mt-2 text-xs ${size.level === "blocked" ? "font-semibold text-red-700" : "text-slate-600"}`}>Input size: {formatByteCount(size.bytes)}. {size.message}</p> : null}
    {size.level === "blocked" || fileImport.error || fileError ? <p role="alert" className="mt-2 font-semibold text-red-700">Error: {(fileImport.error || fileError) ?? (isByteCounter ? "Other metrics are unavailable above the 5 MB browser-processing limit." : size.message)}</p> : null}
    {size.level !== "normal" && size.level !== "blocked" && !metrics ? <p role="status" className="mt-2 text-sm text-slate-600">{result.input === input ? "Other counts are unavailable in this browser." : "Counting words and characters in the background…"}</p> : null}
    <div className="mt-4 flex flex-wrap gap-2">
      <label className={`${buttonClass} cursor-pointer ${isByteCounter ? "focus-within:ring-2 focus-within:ring-sky-500" : ""}`}>Upload file<input type="file" className="sr-only" accept={DOCUMENT_IMPORT_ACCEPT} onChange={(event) => { const picker = event.currentTarget; const file = picker.files?.[0]; picker.value = ""; if (file) loadFile(file); }} /></label>
      {fileImport.reading && <button type="button" className={buttonClass} onClick={fileImport.cancel}>Cancel file import</button>}
      <button type="button" className={buttonClass} disabled={!input} onClick={() => void copy()}>{isByteCounter ? "Copy text" : "Copy"}</button>
      <button type="button" className={buttonClass} disabled={!input} onClick={download}>Download TXT</button>
      <button type="button" className={buttonClass} disabled={!input} onClick={() => void downloadPdf()}>Download PDF</button>
      <button type="button" className={buttonClass} onClick={() => updateInput("")}>Clear</button>
      <button type="button" className={buttonClass} onClick={() => updateInput(example)}>Load example</button>
      {!isByteCounter ? <button type="button" className={buttonClass} onClick={() => updateInput("")}>Reset</button> : null}
    </div>
    <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-6 text-sm font-medium text-emerald-700">{copyStatus ?? fileImport.status}</p>
    {isByteCounter ? (
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Other character counts">
        {sets.primary.slice(1).map((metric) => (
          <div key={metric.label} className="min-w-0 rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <dt className="text-xs font-semibold text-slate-600">{metric.label}</dt>
            <dd className="mt-1 text-xl font-extrabold text-slate-900">{display(metric)}</dd>
          </div>
        ))}
      </dl>
    ) : null}
    <details className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><summary className="min-h-11 cursor-pointer py-2 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">Advanced metrics and definitions</summary><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{sets.advanced.map((metric) => <div key={metric.label} className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><div className="text-xs font-semibold text-slate-600">{metric.label}</div><div className="text-xl font-bold">{display(metric)}</div>{metric.description ? <p className="mt-1 text-xs text-slate-600">{metric.description}</p> : null}</div>)}</div><p className="mt-3 text-xs leading-5 text-slate-600">Visible characters use grapheme clusters. A grapheme can contain several code points; a code point can use two UTF-16 code units; and UTF-8 may use several bytes. “Excluding spaces” removes only U+0020, while the separate whitespace metric removes Unicode whitespace.</p></details>
    {focus === "bytes" ? <section className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><h2 className="font-bold text-slate-900">UTF-8 examples</h2><p className="mt-1">A = 1 byte; é = 2 bytes; 漢 = 3 bytes; 😀 = 4 bytes. This is text encoding size, not the final size of a DOCX, PDF, or other formatted file.</p></section> : null}
    <nav className="mt-5 border-t border-slate-200 pt-4" aria-label={`Related tools for ${title}`}><p className="text-sm font-bold">Related tools</p><ul className="mt-2 flex flex-wrap gap-4 text-sm">{relatedTools.map((tool) => <li key={tool.href}><a href={canonicalPath(tool.href)} className="font-semibold text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">{tool.label}</a></li>)}</ul></nav>
  </article>;
}
