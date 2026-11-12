import { useState } from "react";
import { countLines } from "../../text/text-core";
import { transformLineBreaks, type LineBreakOptions } from "./lineBreakTransforms";

type Props = { input: string; setInput: (value: string) => void };

const modes = [
  ["space", "Replace with spaces"],
  ["nothing", "Remove without adding"],
  ["custom", "Use custom separator"],
  ["paragraphs", "Preserve paragraphs"],
  ["blank-lines", "Remove blank lines only"],
] as const;

const modeHelp: Record<LineBreakOptions["mode"], string> = {
  space: "Choose Preserve paragraphs to keep one blank line between paragraphs.",
  nothing: "Lines touch after joining. Use this for a wrapped ID or other uninterrupted value.",
  custom: "The separator is inserted as entered between lines, including its spaces and tabs.",
  paragraphs: "A blank or whitespace-only line separates paragraphs. Lines within each paragraph are joined.",
  "blank-lines": "Empty and whitespace-only lines are removed. Breaks between remaining lines are kept.",
};

const button = "inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50";
const editor = "mt-2 h-64 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500";

export function LineBreakRemoverToolCard({ input, setInput }: Props) {
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<LineBreakOptions["mode"]>("space");
  const [separator, setSeparator] = useState(", ");
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [trimLines, setTrimLines] = useState(false);
  const [preserveIndentation, setPreserveIndentation] = useState(false);
  const [retainFinalNewline, setRetainFinalNewline] = useState(false);
  const [status, setStatus] = useState("");

  function clearResult(nextStatus = "") {
    setOutput("");
    setStatus(nextStatus);
  }

  function updateInput(value: string, nextStatus = "") {
    setInput(value);
    clearResult(nextStatus);
  }

  function convert() {
    const result = transformLineBreaks(input, {
      mode,
      separator,
      collapseJoinSpaces: collapseSpaces,
      trimEachLine: trimLines,
      preserveIndentation,
      retainFinalNewline,
    });
    setOutput(result.output);
    setStatus(result.output ? `Conversion complete. Output lines: ${result.statistics.outputLines}.` : "Conversion complete. Output is empty.");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setStatus("Output copied.");
    } catch {
      setStatus("Copy failed. Select the output and copy it manually.");
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([output], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "line-break-removed.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Text download started.");
  }

  return (
    <section className="space-y-5 rounded-xl border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-lg sm:px-8" aria-labelledby="line-break-title">
      <div className="text-center">
        <h1 id="line-break-title" className="font-[Poppins] text-2xl font-extrabold sm:text-3xl">Line Break Remover</h1>
        <p className="mt-1 text-sm text-slate-600">Join hard-wrapped text or remove blank lines. By default, a space separates the joined lines.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block min-w-0 text-sm font-semibold text-slate-800">
          Input text
          <textarea id="line-break-input" value={input} onChange={(event) => updateInput(event.target.value)} className={editor} placeholder="Paste text with line breaks…" />
        </label>
        <label className="block min-w-0 text-sm font-semibold text-slate-800">
          Output
          <textarea id="line-break-output" value={output} readOnly className={editor} placeholder="Converted text appears here" />
        </label>
      </div>
      <fieldset className="min-w-0 rounded-lg border border-slate-200 p-3" onChange={() => clearResult()} aria-describedby="line-break-mode-help">
        <legend className="px-1 text-sm font-semibold">How to handle line breaks</legend>
        <div className="mt-1 flex flex-wrap gap-x-4">
          {modes.map(([value, label]) => (
            <label key={value} className="flex min-h-9 items-center gap-1 text-sm">
              <input type="radio" name="line-break-mode" checked={mode === value} onChange={() => setMode(value)} />
              {label}
            </label>
          ))}
        </div>
        {mode === "custom" && (
          <label className="mt-3 block text-sm">
            Custom separator
            <input value={separator} onChange={(event) => setSeparator(event.target.value)} className="mt-1 block min-h-9 w-full max-w-56 rounded border border-slate-300 px-2 py-1 sm:ml-2 sm:mt-0 sm:inline-block" />
          </label>
        )}
        <p id="line-break-mode-help" className="mt-2 text-xs text-slate-600">{modeHelp[mode]}</p>
      </fieldset>
      <details className="rounded-lg border border-slate-200 p-3" onChange={() => clearResult()}>
        <summary className="cursor-pointer font-semibold">Advanced options</summary>
        <div className="mt-3 flex flex-wrap gap-x-4 text-sm">
          {mode === "space" && <label className="flex min-h-9 items-center gap-1"><input type="checkbox" checked={collapseSpaces} onChange={(event) => setCollapseSpaces(event.target.checked)} /> Collapse runs of breaks to one space</label>}
          {mode !== "blank-lines" && <label className="flex min-h-9 items-center gap-1"><input type="checkbox" checked={preserveIndentation} onChange={(event) => setPreserveIndentation(event.target.checked)} /> Keep leading indentation when joining</label>}
          <label className="flex min-h-9 items-center gap-1"><input type="checkbox" checked={trimLines} onChange={(event) => setTrimLines(event.target.checked)} /> Trim each output line</label>
          <label className="flex min-h-9 items-center gap-1"><input type="checkbox" checked={retainFinalNewline} onChange={(event) => setRetainFinalNewline(event.target.checked)} /> Keep one final newline if present</label>
        </div>
      </details>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-10 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50" disabled={!input} onClick={convert}>Convert</button>
        <button type="button" className={button} onClick={copy} disabled={!output}>Copy</button>
        <button type="button" className={button} onClick={download} disabled={!output}>Download TXT</button>
        <button type="button" className={button} onClick={() => updateInput("This paragraph was\nhard wrapped while copying.\n\nThis is a second paragraph.", "Example loaded.")}>Load example</button>
        <button type="button" className={button} onClick={() => updateInput("", "Cleared.")}>Clear</button>
      </div>
      <p className="text-xs text-slate-600">Input lines: {countLines(input)}. Output lines: {countLines(output)}. Generated text uses LF line endings.</p>
      <p className="min-h-5 text-sm text-slate-600" role="status" aria-atomic="true">{status}</p>
    </section>
  );
}
