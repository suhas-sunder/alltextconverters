import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { convertJsonLines, jsonLinesMaxBytes, type JsonLinesDirection } from "../../text/json-lines";
import { convertJsonLinesToDelimited } from "../../text/json-lines-delimited";

const control = "min-h-11 rounded-lg border border-slate-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:opacity-50";
const field = `${control} block w-full resize-y font-mono text-sm`;
type Direction = JsonLinesDirection | "lines-to-csv" | "lines-to-tsv";
type SuccessfulResult = Extract<ReturnType<typeof convertJsonLines> | ReturnType<typeof convertJsonLinesToDelimited>, { ok: true }>;

export default function JsonLinesPanel() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("array-to-lines");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [prefixFormulas, setPrefixFormulas] = useState(false);
  const [result, setResult] = useState<SuccessfulResult>();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const revision = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const format = direction === "lines-to-csv" ? "csv" : direction === "lines-to-tsv" ? "tsv" : null;
  const outputLabel = format?.toUpperCase() ?? "JSON";
  const formulaCells = result && "formulaCells" in result ? result.formulaCells : 0;
  const formulaDescription = formulaCells + (formulaCells === 1 ? " formula-like text cell" : " formula-like text cells");

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
    const next = direction === "array-to-lines" || direction === "lines-to-array"
      ? convertJsonLines(input, direction)
      : convertJsonLinesToDelimited(input, { format: direction === "lines-to-csv" ? "csv" : "tsv", includeHeader, prefixFormulas });
    if (!next.ok) {
      setError(next.error);
      return;
    }
    setResult(next);
    const records = next.count + (next.count === 1 ? " record" : " records");
    const columns = "columnCount" in next ? " into " + next.columnCount + (next.columnCount === 1 ? " column" : " columns") : "";
    setStatus("Converted " + records + columns + ".");
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
    const mime = format === "csv" ? "text/csv" : format === "tsv" ? "text/tab-separated-values" : "text/plain";
    const url = URL.createObjectURL(new Blob([result.output], { type: mime + ";charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "records." + (format ?? (direction === "array-to-lines" ? "jsonl" : "json"));
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-labelledby="json-lines-heading" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 id="json-lines-heading" className="text-xl font-semibold" tabIndex={-1} ref={heading}>
        JSON Lines workspace
      </h2>
      <p id="json-lines-help" className="text-sm text-slate-700">
        Convert between JSON arrays and JSON Lines, or export object records as CSV or TSV.
        Text stays in this browser. Up to 2 MiB of UTF-8 text and 20,000 records.
      </p>
      {!format && (
        <p className="text-sm text-slate-700">
          For example, <code>["Montréal", null]</code> becomes two lines, one containing <code>"Montréal"</code> and one containing <code>null</code>.
        </p>
      )}
      <label className="block space-y-1">
        <span className="block font-semibold">Conversion direction</span>
        <select className={`${control} max-w-full`} value={direction} onChange={(event) => {
          invalidate();
          setDirection(event.target.value as Direction);
        }}>
          <option value="array-to-lines">JSON array to JSON Lines</option>
          <option value="lines-to-array">JSON Lines to JSON array</option>
          <option value="lines-to-csv">JSON Lines to CSV</option>
          <option value="lines-to-tsv">JSON Lines to TSV</option>
        </select>
      </label>
      {format && (
        <fieldset className="space-y-2">
          <legend className="font-semibold">Table export settings</legend>
          <p id="json-lines-table-help" className="text-sm text-slate-700">
            Enter one object per line. Top-level keys become columns in the order they first appear. Missing values stay blank.
            Null is written as <code>null</code>. Nested objects and arrays stay JSON in one cell. The table limit is 128 columns and 500,000 cells.
          </p>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={includeHeader} onChange={(event) => {
              invalidate();
              setIncludeHeader(event.target.checked);
            }} />
            Include column headers
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={prefixFormulas} onChange={(event) => {
              invalidate();
              setPrefixFormulas(event.target.checked);
            }} />
            Prefix formula-like text with an apostrophe
          </label>
        </fieldset>
      )}
      <label className="block space-y-1">
        <span className="block font-semibold">JSON or JSON Lines file</span>
        <input className={`${control} block w-full`} type="file" accept=".json,.jsonl,.ndjson,.txt,application/json,text/plain" onChange={loadFile} />
      </label>
      <label className="block space-y-1">
        <span className="block font-semibold">JSON Lines workspace input</span>
        <textarea aria-describedby={format ? "json-lines-help json-lines-table-help" : "json-lines-help"} className={field} rows={6} value={input} onChange={(event) => {
          invalidate();
          setInput(event.target.value);
        }} />
      </label>
      <button className={`${control} bg-slate-900 font-semibold text-white`} type="button" onClick={convert}>Convert format</button>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      <p role="status" className="text-sm text-slate-700">{status}</p>
      {result && (
        <>
          {formulaCells > 0 && (
            <p id="json-lines-formula-warning" className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {prefixFormulas
                ? "Added an apostrophe to " + formulaDescription + ". Spreadsheet apps may still interpret formulas after saving and reopening."
                : "Spreadsheet apps may interpret " + formulaDescription + " as formulas. Enable the apostrophe option and convert again to modify the affected text."}
            </p>
          )}
          <label className="block space-y-1">
            <span className="block font-semibold">JSON Lines workspace output</span>
            <textarea aria-describedby={formulaCells > 0 ? "json-lines-formula-warning" : undefined} className={field} rows={6} readOnly value={result.output} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className={control} type="button" onClick={copy}>Copy {outputLabel} output</button>
            <button className={control} type="button" onClick={download}>Download {outputLabel} output</button>
          </div>
        </>
      )}
    </section>
  );
}
