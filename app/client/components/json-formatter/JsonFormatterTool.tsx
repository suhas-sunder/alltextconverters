import { useEffect, useRef, useState } from "react";
import { normalizeLineEndings } from "../../text/text-core";
import {
  jsonFormatLimits, type JsonFormatResponse, type JsonFormatResult, type JsonIndent, type JsonOperation,
} from "../../text/json-formatter";

const button = "min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:opacity-50";
const editor = "mt-2 block min-h-64 w-full min-w-0 resize-y rounded-lg border border-slate-400 bg-slate-50 p-3 font-mono text-base focus-visible:outline-2 focus-visible:outline-sky-700";
const actions = [["format", "Format JSON"], ["minify", "Minify JSON"], ["validate", "Validate JSON"]] as const;
const example = String.raw`{"reference":900719925474099312345,"values":[-0,1.20E+09,"\u00E9","東京"],"active":true}`;
type FormatError = Extract<JsonFormatResponse, { error: unknown }>["error"];

function previewOutput(output: string) {
  return output.length <= jsonFormatLimits.preview
    ? output
    : output.slice(0, jsonFormatLimits.preview).replace(/[\uD800-\uDBFF]$/, "");
}

export function JsonFormatterTool() {
  const [source, setSource] = useState("");
  const [indent, setIndent] = useState<JsonIndent>("two");
  const [result, setResult] = useState<JsonFormatResult | null>(null);
  const [error, setError] = useState<FormatError | null>(null);
  const [pending, setPending] = useState<"worker" | "file" | null>(null);
  const [status, setStatus] = useState("");
  const revision = useRef(0);
  const worker = useRef<Worker | null>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => {
    revision.current++;
    worker.current?.terminate();
    worker.current = null;
  }, []);

  function invalidate() {
    revision.current++;
    worker.current?.terminate();
    worker.current = null;
    setResult(null);
    setError(null);
    setPending(null);
    setStatus("");
    return revision.current;
  }

  function changeSource(value: string) {
    invalidate();
    if (value.length > jsonFormatLimits.inputBytes) {
      setError({ message: "The input exceeds 1 MiB. Your previous source was kept." });
    } else setSource(value);
  }

  function run(operation: JsonOperation) {
    const current = invalidate();
    function finish(response: JsonFormatResponse) {
      if (current !== revision.current) return;
      worker.current?.terminate();
      worker.current = null;
      setPending(null);
      if ("error" in response) setError(response.error);
      else {
        setResult(response.result);
        setStatus(operation === "validate" ? "Valid JSON." : "JSON result ready.");
      }
    }

    setPending("worker");
    try {
      const task = new Worker(new URL("../../text/json-formatter.worker.ts", import.meta.url), { type: "module" });
      worker.current = task;
      task.onmessage = (event: MessageEvent<JsonFormatResponse>) => finish(event.data);
      task.onerror = (event) => {
        event.preventDefault();
        finish({ error: { message: "The JSON worker could not run. Try again." } });
      };
      task.onmessageerror = () => finish({ error: { message: "Could not read the JSON result. Try again." } });
      task.postMessage({ source, indent, operation });
    } catch {
      finish({ error: { message: "Could not start the JSON worker. Try again." } });
    }
  }

  async function importFile(file: File) {
    const current = invalidate();
    if (file.size > jsonFormatLimits.inputBytes) {
      setError({ message: "Choose a UTF-8 file up to 1 MiB. Your previous source was kept." });
      return;
    }
    setPending("file");
    try {
      const contents = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
      if (current !== revision.current) return;
      setSource(normalizeLineEndings(contents));
      setStatus("Local JSON file loaded.");
    } catch {
      if (current === revision.current) setError({ message: "Could not read the file as UTF-8. Your previous source was kept." });
    } finally {
      if (current === revision.current) setPending(null);
    }
  }

  function selectSource(start: number, end = start) {
    const editor = sourceRef.current;
    if (!editor) return;
    editor.focus();
    editor.setSelectionRange(start, end);
  }

  async function copy() {
    if (result?.output == null) return;
    const current = revision.current;
    try {
      await navigator.clipboard.writeText(result.output);
      if (current === revision.current) setStatus("JSON copied.");
    } catch {
      if (current !== revision.current) return;
      if (result.output.length <= jsonFormatLimits.preview && outputRef.current) {
        outputRef.current.focus();
        outputRef.current.select();
        setStatus("Automatic copy was unavailable. Use your device’s copy command on the selected output.");
      } else setStatus("Automatic copy was unavailable. Download the JSON to keep the complete result.");
    }
  }

  function download() {
    if (result?.output == null) return;
    const url = URL.createObjectURL(new Blob([result.output], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-label="JSON workspace" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <label className="block text-sm font-semibold">
            JSON source
            <textarea ref={sourceRef} className={editor} value={source} onChange={(event) => changeSource(event.target.value)}
              aria-describedby="json-formatter-limits" spellCheck={false} wrap="off" />
          </label>
          <label className="block text-sm">
            Import JSON file
            <input className="mt-2 block w-full min-w-0 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-2 file:py-2 focus-visible:outline-2 focus-visible:outline-sky-700"
              type="file" accept=".json,.txt,application/json,text/plain" onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) void importFile(file);
              }} />
          </label>
        </div>
        <div className="min-w-0 space-y-2">
          <label className="block text-sm font-semibold">
            JSON output
            <textarea ref={outputRef} className={editor} readOnly value={previewOutput(result?.output ?? "")}
              placeholder="Format or minify the source to create an output." spellCheck={false} wrap="off" />
          </label>
          {result?.output != null && (
            <div className="space-y-2">
              {result.output.length > jsonFormatLimits.preview && <p className="text-sm text-slate-700">The editor shows a preview. Copy and download use the complete output.</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" className={button} onClick={() => void copy()}>Copy JSON</button>
                <button type="button" className={button} onClick={download}>Download JSON</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p id="json-formatter-limits" className="text-sm text-slate-700">Up to 1 MiB of UTF-8 input, 128 nested containers, and 4 MiB of formatted output.</p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 text-sm font-medium">
          Indentation
          <select className="min-h-11 rounded-lg border border-slate-400 bg-white px-2 text-sm focus-visible:outline-2 focus-visible:outline-sky-700"
            value={indent} disabled={pending === "file"} onChange={(event) => {
              invalidate();
              setIndent(event.target.value as JsonIndent);
            }}>
            <option value="two">2 spaces</option>
            <option value="four">4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </label>
        {actions.map(([operation, label]) => <button key={operation} type="button"
          className={operation === "format" ? button + " border-sky-700 text-sky-800" : button}
          disabled={pending !== null} onClick={() => run(operation)}>{label}</button>)}
        {pending && <button type="button" className={button} onClick={() => {
          invalidate();
          setStatus("Operation canceled.");
          sourceRef.current?.focus();
        }}>Cancel</button>}
        <button type="button" className={button} onClick={() => { changeSource(example); setStatus("Example loaded."); }}>Load example</button>
        <button type="button" className={button} onClick={() => changeSource("")}>Clear</button>
      </div>

      <p role="status" className="text-sm text-slate-700">{pending === "worker" ? "Checking JSON…" : pending === "file" ? "Reading local file…" : status}</p>
      {error && (
        <div className="space-y-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <p role="alert">{error.position && <>Line {error.position.line}, column {error.position.column}. </>}{error.message}</p>
          {error.position && <button type="button" className={button} onClick={() => selectSource(error.position!.offset)}>Go to error</button>}
        </div>
      )}
      {result && (
        <section aria-labelledby="json-structure-title" className="space-y-2 rounded-lg border border-slate-300 bg-slate-50 p-3">
          <h2 id="json-structure-title" className="font-semibold">JSON structure</h2>
          <p className="text-sm text-slate-700">
            Root type {result.root}. Container depth {result.depth}. Input {result.sourceBytes.toLocaleString()} UTF-8 bytes.
            {result.outputBytes !== null && <> Output {result.outputBytes.toLocaleString()} UTF-8 bytes.</>}
          </p>
          {result.duplicates > 0 && <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
            {result.duplicates} repeated {result.duplicates === 1 ? "object key" : "object keys"} found. Formatting preserves every occurrence. Other JSON readers may keep only one.
          </p>}
          {(result.root === "object" || result.root === "array") && (
            <p className="text-sm text-slate-700">{result.topLevelCount} top-level entries. Select one to highlight its value in the source.</p>
          )}
          {result.topLevelCount > result.entries.length && <p className="text-sm text-slate-700">Showing the first {result.entries.length} entries.</p>}
          {result.entries.length > 0 && (
            <ul className="max-h-60 divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 bg-white">
              {result.entries.map((entry, index) => (
                <li key={index}>
                  <button type="button" className="flex min-h-11 w-full items-start justify-between gap-2 px-3 py-2 text-start text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-700"
                    onClick={() => selectSource(entry.start, entry.end)}>
                    <bdi className="min-w-0 font-mono [overflow-wrap:anywhere]">{entry.name}</bdi>
                    <span className="shrink-0 text-slate-600">{entry.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  );
}
