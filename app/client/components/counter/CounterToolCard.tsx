import { useEffect, useMemo, useState } from "react";
import { assessInputSize, formatByteCount } from "../../text/input-size";
import { formatMetricNumber, getTextMetrics, type TextMetrics } from "../../text/metrics";
import type { RelatedTool } from "../converter/ConverterCard";

export type CounterFocus = "characters" | "words" | "bytes";
type Metric = { label: string; value: number; description?: string };

const buttonClass = "min-h-11 rounded-xl bg-white px-4 py-2 text-sm font-semibold ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50";

function metricSets(focus: CounterFocus, metrics: TextMetrics): { primary: Metric[]; advanced: Metric[] } {
  const common = {
    characters: { label: "Characters including spaces", value: metrics.graphemes },
    words: { label: "Words", value: metrics.words },
    noSpaces: { label: "Characters excluding literal spaces", value: metrics.withoutLiteralSpaces },
    lines: { label: "Lines", value: metrics.lines },
    bytes: { label: "UTF-8 bytes", value: metrics.utf8Bytes },
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
  return { primary: [common.bytes, { label: "Visible characters", value: metrics.graphemes }, { label: "Unicode code points", value: metrics.codePoints }, { label: "UTF-16 code units", value: metrics.utf16CodeUnits }], advanced: [common.words, common.lines, common.noSpaces, { label: "Characters excluding all Unicode whitespace", value: metrics.withoutWhitespace }] };
}

export function CounterToolCard({ focus, title, description, input, setInput, example, relatedTools }: { focus: CounterFocus; title: string; description: string; input: string; setInput: (value: string) => void; example: string; relatedTools: RelatedTool[] }) {
  const size = assessInputSize(input);
  const [metrics, setMetrics] = useState(() => getTextMetrics(""));
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  useEffect(() => {
    if (size.level === "blocked") { setMetrics(getTextMetrics("")); return; }
    const timer = window.setTimeout(() => setMetrics(getTextMetrics(input)), 180);
    return () => window.clearTimeout(timer);
  }, [input, size.level]);
  const sets = useMemo(() => metricSets(focus, metrics), [focus, metrics]);
  async function copy() { try { await navigator.clipboard.writeText(input); setCopyStatus("Text copied."); } catch { setCopyStatus("Copy failed. Select the text and copy it manually."); } }
  function download() { const url = URL.createObjectURL(new Blob([input], { type: "text/plain;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${focus}-counter-text.txt`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url); }
  async function loadFile(file: File) {
    setFileError(null);
    try {
      const extension = file.name.toLowerCase().split(".").pop();
      let value = "";
      if (extension === "pdf") {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const worker = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          value += content.items.map((item) => "str" in item ? item.str : "").filter(Boolean).join(" ") + (pageNumber < pdf.numPages ? "\n" : "");
        }
      } else if (extension === "docx") {
        const mammoth = await import("mammoth/mammoth.browser");
        value = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
      } else {
        value = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error("File read failed")); reader.onload = () => resolve(String(reader.result ?? "")); reader.readAsText(file); });
      }
      setInput(value);
      setCopyStatus("File loaded locally.");
    } catch { setFileError("Could not read that file locally in this browser."); }
  }
  async function downloadPdf() {
    try {
      const { jsPDF } = await import("jspdf");
      const document = new jsPDF({ unit: "pt", format: "letter" });
      const lines = document.splitTextToSize(input, document.internal.pageSize.getWidth() - 80);
      document.text(lines, 40, 40);
      document.save(`${focus}-counter-text.pdf`);
    } catch { window.print(); }
  }
  return <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-7">
    <header><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p><p className="mt-2 text-xs font-medium text-emerald-700">Counting runs only in this browser. Text is not uploaded.</p></header>
    <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Primary text metrics">{sets.primary.map((metric, index) => <div key={metric.label} className={`rounded-2xl p-4 ring-1 ring-slate-200 ${index === 0 ? "bg-sky-50" : "bg-white"}`}><div className="text-xs font-semibold text-slate-600">{metric.label}</div><div className="mt-1 text-3xl font-extrabold text-slate-900">{formatMetricNumber(metric.value)}</div></div>)}</section>
    <label htmlFor={`${focus}-counter-input`} className="mt-6 block text-sm font-bold">Text to count</label><textarea id={`${focus}-counter-input`} value={input} onChange={(event) => { setInput(event.target.value); setCopyStatus(null); }} aria-describedby={`${focus}-counter-size`} className="mt-2 min-h-72 w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" placeholder="Type or paste text here…" />
    <p id={`${focus}-counter-size`} className={`mt-2 text-xs ${size.level === "blocked" ? "font-semibold text-red-700" : "text-slate-600"}`}>Input size: {formatByteCount(size.bytes)}. {size.message}</p>{size.level === "blocked" || fileError ? <p role="alert" className="mt-2 font-semibold text-red-700">Error: {fileError ?? size.message}</p> : null}
    <div className="mt-4 flex flex-wrap gap-2"><label className={`${buttonClass} cursor-pointer`}>Upload file<input type="file" className="sr-only" accept=".txt,.md,.csv,.json,.html,.xml,.pdf,.docx" onChange={async (event) => { const inputElement = event.currentTarget; const file = inputElement.files?.[0]; if (!file) return; await loadFile(file); inputElement.value = ""; }} /></label><button type="button" className={buttonClass} disabled={!input} onClick={() => void copy()}>Copy</button><button type="button" className={buttonClass} disabled={!input} onClick={download}>Download TXT</button><button type="button" className={buttonClass} disabled={!input} onClick={() => void downloadPdf()}>Download PDF</button><button type="button" className={buttonClass} onClick={() => { setInput(""); setCopyStatus(null); setFileError(null); }}>Clear</button><button type="button" className={buttonClass} onClick={() => { setInput(example); setCopyStatus(null); setFileError(null); }}>Load example</button><button type="button" className={buttonClass} onClick={() => { setInput(""); setCopyStatus(null); setFileError(null); }}>Reset</button></div>
    <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-6 text-sm font-medium text-emerald-700">{copyStatus ?? ""}</p>
    <details className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><summary className="min-h-11 cursor-pointer py-2 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">Advanced metrics and definitions</summary><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{sets.advanced.map((metric) => <div key={metric.label} className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><div className="text-xs font-semibold text-slate-600">{metric.label}</div><div className="text-xl font-bold">{formatMetricNumber(metric.value)}</div>{metric.description ? <p className="mt-1 text-xs text-slate-600">{metric.description}</p> : null}</div>)}</div><p className="mt-3 text-xs leading-5 text-slate-600">Visible characters use grapheme clusters. A grapheme can contain several code points; a code point can use two UTF-16 code units; and UTF-8 may use several bytes. “Excluding spaces” removes only U+0020, while the separate whitespace metric removes Unicode whitespace.</p></details>
    {focus === "bytes" ? <section className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700"><h2 className="font-bold text-slate-900">UTF-8 examples</h2><p className="mt-1">A = 1 byte; é = 2 bytes; 漢 = 3 bytes; 😀 = 4 bytes. This is text encoding size, not the final size of a DOCX, PDF, or other formatted file.</p></section> : null}
    <nav className="mt-5 border-t border-slate-200 pt-4" aria-label={`Related tools for ${title}`}><p className="text-sm font-bold">Related tools</p><ul className="mt-2 flex flex-wrap gap-4 text-sm">{relatedTools.map((tool) => <li key={tool.href}><a href={tool.href} className="font-semibold text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">{tool.label}</a></li>)}</ul></nav>
  </article>;
}
