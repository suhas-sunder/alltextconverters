import { useCallback, useEffect, useRef, useState } from "react";
import { applyEditorEdit, decodeDiffFile, diffLimits, editorValue, replaceDisplayedRange } from "../../text/text-diff-model";
import type { DiffRequest, DiffResponse, DiffResult } from "../../text/text-diff-model";
import { TextDiffResults } from "./TextDiffResults";

type Side = "original" | "revised";
const sides: Side[] = ["original", "revised"];
const sideLabel = { original: "Original text", revised: "Revised text" };
const empty = { original: "", revised: "" };
const example = {
  original: "Supplier agreement\nPayment is due in 30 days.\nContact: Renée\n\nSend the invoice by post.\nDelivery is included.\n",
  revised: "Supplier agreement\nPayment is due in 45 days.\nContact: Renée\n\nSend the invoice by email.\nDelivery is included.\n",
};
const buttonBase = "rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:opacity-50 aria-disabled:opacity-50";
const button = buttonBase + " border-slate-300 bg-white hover:bg-slate-100";
const primaryButton = buttonBase + " border-sky-700 bg-sky-700 text-white hover:bg-sky-800";

export function TextDiffTool() {
  const [input, setInput] = useState(empty);
  const [highlightWords, setHighlightWords] = useState(true);
  const [fileMessages, setFileMessages] = useState(empty);
  const [loading, setLoading] = useState({ original: false, revised: false });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const fileRevision = useRef({ original: 0, revised: 0 });
  const comparisonRevision = useRef(0);
  const active = useRef<{ worker: Worker; timer: number } | null>(null);

  const stopWorker = useCallback(() => {
    if (!active.current) return;
    window.clearTimeout(active.current.timer);
    active.current.worker.terminate();
    active.current = null;
  }, []);

  useEffect(() => stopWorker, [stopWorker]);

  function clearComparison() {
    comparisonRevision.current += 1;
    stopWorker();
    setBusy(false);
    setResult(null);
    setError("");
    setStatus("");
    setExportStatus("");
  }

  function replaceInputs(next: typeof input) {
    for (const side of sides) fileRevision.current[side] += 1;
    clearComparison();
    setInput(next);
    setFileMessages(empty);
    setLoading({ original: false, revised: false });
  }

  function changeText(side: Side, value: string) {
    fileRevision.current[side] += 1;
    clearComparison();
    setInput((previous) => ({ ...previous, [side]: value }));
    setFileMessages((previous) => ({ ...previous, [side]: "" }));
    setLoading((previous) => ({ ...previous, [side]: false }));
  }

  async function loadFile(side: Side, file: File) {
    const ticket = ++fileRevision.current[side];
    clearComparison();
    setFileMessages((previous) => ({ ...previous, [side]: "" }));
    setLoading((previous) => ({ ...previous, [side]: true }));
    try {
      if (file.size > diffLimits.bytes) throw new Error("Choose a UTF-8 text file up to 512 KiB.");
      const buffer = await file.arrayBuffer();
      if (fileRevision.current[side] !== ticket) return;
      const text = decodeDiffFile(buffer);
      setInput((previous) => ({ ...previous, [side]: text }));
      setStatus(sideLabel[side] + " loaded from file.");
    } catch (failure) {
      if (fileRevision.current[side] === ticket) {
        setFileMessages((previous) => ({
          ...previous,
          [side]: failure instanceof Error ? failure.message : "This file could not be read.",
        }));
      }
    } finally {
      if (fileRevision.current[side] === ticket) setLoading((previous) => ({ ...previous, [side]: false }));
    }
  }

  function compare() {
    if (active.current || loading.original || loading.revised) return;
    clearComparison();
    try {
      const worker = new Worker(new URL("../../text/text-diff.worker.ts", import.meta.url), { type: "module" });
      const finish = (response: DiffResponse) => {
        if (active.current?.worker !== worker) return;
        stopWorker();
        setBusy(false);
        setStatus("");
        if ("error" in response) {
          setError(response.error);
        } else {
          setResult(response.result);
          const { groups, added, removed } = response.result;
          setStatus(groups.length
            ? groups.length + (groups.length === 1 ? " change group. " : " change groups. ") + removed + " removed, " + added + " added."
            : "The two texts are identical.");
        }
      };
      const timer = window.setTimeout(() => finish({ error: "The comparison timed out. Try smaller sections or try again." }), diffLimits.watchdogMs);
      active.current = { worker, timer };
      worker.onmessage = (event: MessageEvent<DiffResponse>) => finish(event.data);
      worker.onerror = (event) => {
        event.preventDefault();
        finish({ error: "The comparison worker could not run. Try again." });
      };
      worker.onmessageerror = () => finish({ error: "The browser could not read the comparison result. Try again." });
      setBusy(true);
      setStatus("Comparing the two texts…");
      worker.postMessage({ ...input, highlightWords } satisfies DiffRequest);
    } catch {
      stopWorker();
      setBusy(false);
      setStatus("");
      setError("The comparison worker could not start. Try again.");
    }
  }

  async function copy() {
    if (!result) return;
    const revision = comparisonRevision.current;
    try {
      await navigator.clipboard.writeText(result.report);
      if (revision === comparisonRevision.current) setExportStatus("Report copied.");
    } catch {
      if (revision === comparisonRevision.current) setExportStatus("Automatic copy was unavailable. Download the report instead.");
    }
  }

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([result.report], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "text-comparison.txt";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-label="Text comparison tool" className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <p id="text-diff-input-limits" className="text-sm text-slate-600">
        Use up to 512 KiB of UTF-8 and 12,000 lines per input. Open text files to compare their exact line endings.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {sides.map((side) => (
          <div key={side} className="min-w-0 space-y-2">
            <label htmlFor={"text-diff-" + side} className="block text-sm font-semibold">{sideLabel[side]}</label>
            <textarea id={"text-diff-" + side} aria-describedby="text-diff-input-limits" value={editorValue(input[side])}
              dir="auto" spellCheck={false} className="block min-h-60 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-base focus-visible:outline-2 focus-visible:outline-sky-700"
              onChange={(event) => changeText(side, applyEditorEdit(input[side], event.currentTarget.value))}
              onPaste={(event) => {
                if (!event.clipboardData.types.includes("text/plain")) return;
                event.preventDefault();
                const inserted = event.clipboardData.getData("text/plain");
                const field = event.currentTarget;
                const caret = field.selectionStart + editorValue(inserted).length;
                const raw = replaceDisplayedRange(input[side], field.selectionStart, field.selectionEnd, inserted);
                changeText(side, raw);
                window.requestAnimationFrame(() => {
                  if (field.value === editorValue(raw) && field === document.activeElement) field.setSelectionRange(caret, caret);
                });
              }} />
            <label htmlFor={"text-diff-file-" + side} className="block text-sm font-medium">
              Open {side} text file
            </label>
            <input id={"text-diff-file-" + side} type="file" accept=".txt,.md,.csv,.tsv,.json,.xml,.html,.css,.js,.ts,.log"
              className="block max-w-full rounded border border-slate-300 text-sm file:mr-2 file:border-0 file:bg-slate-100 file:p-2"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) void loadFile(side, file);
              }} />
            {loading[side] && <p role="status" className="text-sm text-slate-600">Reading {side} file…</p>}
            {fileMessages[side] && <p role="alert" className="text-sm text-red-800">{fileMessages[side]}</p>}
          </div>
        ))}
      </div>
      <label className="flex items-start gap-2 text-sm font-medium">
        <input type="checkbox" checked={highlightWords} className="mt-0.5"
          onChange={(event) => { clearComparison(); setHighlightWords(event.target.checked); }} />
        Highlight words in short one-line replacements
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={primaryButton} onClick={compare}
          aria-disabled={busy || loading.original || loading.revised}>Compare text</button>
        <button type="button" className={button} disabled={!busy} onClick={() => {
          clearComparison();
          setStatus("Comparison cancelled.");
        }}>Cancel comparison</button>
        <button type="button" className={button} onClick={() => replaceInputs(example)}>Load example</button>
        <button type="button" className={button} onClick={() => replaceInputs(empty)}>Clear</button>
      </div>
      <p role="status" className="text-sm text-slate-700">{status}</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {result && (
        <div className="space-y-4">
          <TextDiffResults key={comparisonRevision.current} result={result} />
          <div className="flex flex-wrap gap-3">
            <button type="button" className={button} onClick={() => void copy()}>Copy report</button>
            <button type="button" className={button} onClick={download}>Download report</button>
          </div>
          <p role="status" className="text-sm text-slate-700">{exportStatus}</p>
        </div>
      )}
    </section>
  );
}
