import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { convertJsonLines, jsonLinesMaxBytes, type JsonLinesDirection } from "../../text/json-lines";

const control = "min-h-11 rounded-lg border border-slate-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:opacity-50";
const field = `${control} block w-full resize-y font-mono text-sm`;

export default function JsonLinesPanel() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<JsonLinesDirection>("array-to-lines");
  const [result, setResult] = useState<Extract<ReturnType<typeof convertJsonLines>, { ok: true }>>();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const revision = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => heading.current?.focus(), []);

  function invalidate() {
    revision.current += 1;
    setResult(undefined);
    setStatus("");
    setError("");
    return revision.current;
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    const current = invalidate();
    if (file.size > jsonLinesMaxBytes) {
      setError("Choose a UTF-8 file of 2 MiB or less.");
      return;
    }
    try {
      const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
      if (current !== revision.current) return;
      setInput(text);
      setStatus("File loaded. Choose a conversion direction and convert.");
    } catch {
      if (current === revision.current) setError("The file could not be read as UTF-8.");
    }
  }

  function convert() {
    invalidate();
    const next = convertJsonLines(input, direction);
    if (!next.ok) {
      setError(next.error);
      return;
    }
    setResult(next);
    setStatus(`Converted ${next.count} ${next.count === 1 ? "record" : "records"}.`);
  }

  async function copy() {
    if (!result) return;
    const current = revision.current;
    try {
      await navigator.clipboard.writeText(result.output);
      if (current === revision.current) setStatus("Output copied.");
    } catch {
      if (current === revision.current) setStatus("Clipboard unavailable. Select the output or download it.");
    }
  }

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([result.output], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = direction === "array-to-lines" ? "records.jsonl" : "records.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-labelledby="json-lines-heading" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 id="json-lines-heading" className="text-xl font-semibold" tabIndex={-1} ref={heading}>
        JSON Lines workspace
      </h2>
      <p id="json-lines-help" className="text-sm text-slate-700">
        Convert a JSON array to one JSON value per line, or combine JSON Lines into an array.
        Text stays in this browser. Up to 2 MiB of UTF-8 text and 20,000 records.
      </p>
      <p className="text-sm text-slate-700">
        For example, <code>["Montréal", null]</code> becomes two lines, one containing <code>"Montréal"</code> and one containing <code>null</code>.
      </p>
      <label className="block space-y-1">
        <span className="block font-semibold">Conversion direction</span>
        <select className={`${control} max-w-full`} value={direction} onChange={(event) => {
          invalidate();
          setDirection(event.target.value as JsonLinesDirection);
        }}>
          <option value="array-to-lines">JSON array to JSON Lines</option>
          <option value="lines-to-array">JSON Lines to JSON array</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="block font-semibold">JSON or JSON Lines file</span>
        <input className={`${control} block w-full`} type="file" accept=".json,.jsonl,.ndjson,.txt,application/json,text/plain" onChange={loadFile} />
      </label>
      <label className="block space-y-1">
        <span className="block font-semibold">JSON Lines workspace input</span>
        <textarea aria-describedby="json-lines-help" className={field} rows={6} value={input} onChange={(event) => {
          invalidate();
          setInput(event.target.value);
        }} />
      </label>
      <button className={`${control} bg-slate-900 font-semibold text-white`} type="button" onClick={convert}>Convert format</button>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      <p role="status" className="text-sm text-slate-700">{status}</p>
      {result && (
        <>
          <label className="block space-y-1">
            <span className="block font-semibold">JSON Lines workspace output</span>
            <textarea className={field} rows={6} readOnly value={result.output} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className={control} type="button" onClick={copy}>Copy JSON output</button>
            <button className={control} type="button" onClick={download}>Download JSON output</button>
          </div>
        </>
      )}
    </section>
  );
}
