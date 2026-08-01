import { useState } from "react";
import { transformLineBreaks, type LineBreakOptions } from "./lineBreakTransforms";

type Props = { input: string; setInput: (value: string) => void };
const button = "inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500";

export function LineBreakRemoverToolCard({ input, setInput }: Props) {
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<LineBreakOptions["mode"]>("space");
  const [separator, setSeparator] = useState(", ");
  const [collapseSpaces, setCollapseSpaces] = useState(true);
  const [trimLines, setTrimLines] = useState(false);
  const [preserveIndentation, setPreserveIndentation] = useState(false);
  const [retainFinalNewline, setRetainFinalNewline] = useState(false);
  const [status, setStatus] = useState("");
  const result = () => transformLineBreaks(input, { mode, separator, collapseJoinSpaces: collapseSpaces, trimEachLine: trimLines, preserveIndentation, whitespaceLinesAreBlank: true, retainFinalNewline });
  const convert = () => { const next = result(); setOutput(next.output); setStatus(`Conversion complete. ${next.statistics.outputLines ?? 0} output lines generated.`); };
  const copy = async () => { try { await navigator.clipboard.writeText(output); setStatus("Output copied."); } catch { setStatus("Copy failed. Select the output and copy it manually."); } };
  const loadExample = () => { setInput("This paragraph was\nhard wrapped while copying.\n\nThis is a second paragraph."); setOutput(""); setStatus("Example loaded."); };
  const download = () => { const url = URL.createObjectURL(new Blob([output], { type: "text/plain;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = "line-break-removed.txt"; link.click(); URL.revokeObjectURL(url); setStatus("Text download started."); };
  return <section className="space-y-5 rounded-xl border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-lg sm:px-8" aria-labelledby="line-break-title">
    <div className="text-center"><h1 id="line-break-title" className="font-[Poppins] text-2xl font-extrabold sm:text-3xl">Line Break Remover</h1><p className="mt-1 text-sm text-slate-600">Join unwanted line breaks locally. The default keeps readable word spacing.</p></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="block text-sm font-semibold text-slate-800">Input text<textarea value={input} onChange={(event) => { setInput(event.target.value); setStatus(""); }} className="mt-2 h-64 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-normal focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Paste text with line breaks…" /></label>
      <label className="block text-sm font-semibold text-slate-800">Output<textarea value={output} readOnly className="mt-2 h-64 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-normal" placeholder="Converted text appears here" /></label>
    </div>
    <fieldset className="rounded-lg border border-slate-200 p-3"><legend className="px-1 text-sm font-semibold">How to handle line breaks</legend><div className="mt-1 flex flex-wrap gap-2">{([['space','Replace with spaces'],['nothing','Remove without adding'],['custom','Use custom separator'],['paragraphs','Preserve paragraphs'],['blank-lines','Remove blank lines only']] as const).map(([value,label]) => <label key={value} className="flex items-center gap-1 text-sm"><input type="radio" name="line-break-mode" checked={mode === value} onChange={() => setMode(value)} /> {label}</label>)}</div>{mode === "custom" && <label className="mt-3 block text-sm">Custom separator<input value={separator} onChange={(event) => setSeparator(event.target.value)} className="ml-2 rounded border border-slate-300 px-2 py-1" /></label>}</fieldset>
    <details className="rounded-lg border border-slate-200 p-3"><summary className="cursor-pointer font-semibold">Advanced options</summary><div className="mt-3 flex flex-wrap gap-4 text-sm">{[[collapseSpaces,setCollapseSpaces,'Collapse repeated spaces at joins'],[trimLines,setTrimLines,'Trim each resulting line'],[preserveIndentation,setPreserveIndentation,'Preserve indentation'],[retainFinalNewline,setRetainFinalNewline,'Retain final trailing newline']] .map(([value,setter,label]) => <label key={String(label)} className="flex items-center gap-1"><input type="checkbox" checked={Boolean(value)} onChange={(event) => (setter as (next: boolean) => void)(event.target.checked)} /> {String(label)}</label>)}</div></details>
    <div className="flex flex-wrap gap-2"><button type="button" className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500" onClick={convert}>Convert</button><button type="button" className={button} onClick={copy} disabled={!output}>Copy</button><button type="button" className={button} onClick={download} disabled={!output}>Download TXT</button><button type="button" className={button} onClick={loadExample}>Load example</button><button type="button" className={button} onClick={() => { setInput(""); setOutput(""); setStatus("Cleared."); }}>Clear</button></div>
    <p className="text-xs text-slate-600">Input: {input.length} characters, {input ? input.replace(/\r\n|\r/g, "\n").split("\n").length : 0} lines. Output: {output.length} characters, {output ? output.split("\n").length : 0} lines. Generated text uses LF line endings.</p>
    <p className="sr-only" aria-live="polite">{status}</p>{status && <p className="text-sm text-slate-600" role="status">{status}</p>}
  </section>;
}
