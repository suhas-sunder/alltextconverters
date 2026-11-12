import { useRef, useState, type ChangeEvent } from "react";
import { csvJsonLimits, delimitedToJson, jsonToDelimited } from "../../text/csv-json";

const inputClass = "min-h-11 max-w-full rounded-lg border border-slate-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-sky-600";
const textArea = inputClass + " block w-full resize-y font-mono text-sm";
const button = inputClass + " text-sm font-semibold hover:bg-sky-50 disabled:opacity-50";
const previewLimit = 16_000;
const csvSample = 'sku,city,note\r\n0012,Montréal,"First line\r\nSecond line"\r\n0013,東京,';
const jsonSample = '[\n  {"sku": "0012", "total": 9007199254740993, "details": {"paid": true}},\n  {"sku": "0013", "total": null, "city": "東京"}\n]';
type Direction = "csv-to-json" | "json-to-csv";
type Output = Extract<ReturnType<typeof delimitedToJson>, { ok: true }>;

const outputTypes = {
  json: { label: "JSON", mime: "application/json" },
  csv: { label: "CSV", mime: "text/csv" },
  tsv: { label: "TSV", mime: "text/tab-separated-values" },
} as const;

export function CsvJsonTool() {
  const [direction, setDirection] = useState<Direction>("csv-to-json");
  const [input, setInput] = useState("");
  const [inputDelimiter, setInputDelimiter] = useState("auto");
  const [outputDelimiter, setOutputDelimiter] = useState(",");
  const [sourceHeader, setSourceHeader] = useState(true);
  const [outputHeader, setOutputHeader] = useState(true);
  const [sortRows, setSortRows] = useState(false);
  const [interpretJson, setInterpretJson] = useState(false);
  const [outputShape, setOutputShape] = useState<"objects" | "arrays">("objects");
  const [allowNested, setAllowNested] = useState(true);
  const [prefixFormulas, setPrefixFormulas] = useState(false);
  const [reading, setReading] = useState(false);
  const [result, setResult] = useState<Output | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const revision = useRef(0);
  const source = useRef<HTMLTextAreaElement>(null);
  const fromCsv = direction === "csv-to-json";
  const extension = fromCsv ? "json" : outputDelimiter === "\t" ? "tsv" : "csv";
  const { label, mime } = outputTypes[extension];

  function invalidate() {
    revision.current += 1;
    setResult(null);
    setError("");
    setStatus("");
    setReading(false);
    return revision.current;
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    const request = invalidate();
    if (file.size > csvJsonLimits.bytes) {
      setError("Choose a UTF-8 file of 1 MiB or less.");
      return;
    }
    setReading(true);
    setStatus("Reading file.");
    try {
      const value = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
      if (request !== revision.current) return;
      setInput(value);
      if (fromCsv) setInputDelimiter(/\.tsv$/i.test(file.name) ? "\t" : "auto");
      setStatus("File loaded. Review the settings and convert.");
    } catch {
      if (request !== revision.current) return;
      setStatus("");
      setError("This file could not be read as UTF-8.");
    } finally {
      if (request === revision.current) setReading(false);
    }
  }

  function convert() {
    invalidate();
    const next = fromCsv
      ? delimitedToJson(input, { delimiter: inputDelimiter, includeHeader: sourceHeader, interpretJson, outputShape, sortRows })
      : jsonToDelimited(input, { delimiter: outputDelimiter, includeHeader: outputHeader, allowNested, prefixFormulas, sortRows });
    if (!next.ok) {
      setError(next.error);
      return;
    }
    setResult(next);
    setStatus("Converted " + next.rows + (next.rows === 1 ? " row" : " rows") + " and " + next.columns
      + (next.columns === 1 ? " column." : " columns."));
  }

  async function copy() {
    if (!result) return;
    const request = revision.current;
    try {
      await navigator.clipboard.writeText(result.output);
      if (request === revision.current) setStatus("Full " + label + " copied.");
    } catch {
      if (request === revision.current) setStatus("Clipboard access failed. Download the full " + label + " instead.");
    }
  }

  function download() {
    if (!result) return;
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([result.output], { type: mime + ";charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted." + extension;
      document.body.append(link);
      try {
        link.click();
      } finally {
        link.remove();
      }
      setStatus(label + " download started.");
    } catch {
      setStatus("The download failed. Try copying the full " + label + ".");
    } finally {
      if (url) window.setTimeout(URL.revokeObjectURL, 1000, url);
    }
  }

  function reverse() {
    if (!result) return;
    const nextInput = result.output;
    if (new TextEncoder().encode(nextInput).byteLength > csvJsonLimits.bytes) {
      setStatus("The result exceeds the 1 MiB source limit. Copy or download the full result.");
      return;
    }
    invalidate();
    setInput(nextInput);
    if (!fromCsv) {
      setInputDelimiter(outputDelimiter);
      setSourceHeader(outputHeader);
    }
    setDirection(fromCsv ? "json-to-csv" : "csv-to-json");
    source.current?.focus();
    setStatus("Result moved to the source. Review the settings and convert.");
  }

  const preview = result?.output.slice(0, previewLimit).replace(/[\uD800-\uDBFF]$/, "");
  const previewIsLimited = result !== null && result.output.length > previewLimit;

  return (
    <section aria-labelledby="csv-json-tool" className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 id="csv-json-tool" className="text-xl font-semibold">Convert a table</h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 space-y-1 text-sm font-semibold">
          <span className="block">Direction</span>
          <select className={inputClass} value={direction} onChange={(event) => {
            invalidate();
            setDirection(event.target.value as Direction);
          }}>
            <option value="csv-to-json">CSV or TSV to JSON</option>
            <option value="json-to-csv">JSON to CSV or TSV</option>
          </select>
        </label>
        <button className={button} type="button" onClick={() => {
          invalidate();
          setInput(fromCsv ? csvSample : jsonSample);
          setStatus("Example loaded.");
        }}>Load example</button>
        <button className={button} type="button" onClick={() => { invalidate(); setInput(""); }}>Clear source</button>
      </div>
      <label className="block space-y-1 text-sm font-semibold">
        <span className="block">Open UTF-8 file</span>
        <input className={inputClass + " block w-full text-sm"} type="file"
          accept=".csv,.tsv,.json,.txt,text/csv,text/tab-separated-values,application/json,text/plain" onChange={loadFile} />
      </label>
      <label className="block space-y-1 text-sm font-semibold">
        <span className="block">Source text</span>
        <textarea ref={source} className={textArea} rows={7} value={input} aria-describedby="csv-json-limits"
          onChange={(event) => { invalidate(); setInput(event.target.value); }} spellCheck={false} />
      </label>
      <p id="csv-json-limits" className="text-sm text-slate-700">Up to 1 MiB, 20,000 records, 128 columns and 250,000 cells.</p>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Conversion settings</legend>
        {fromCsv ? (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1 text-sm">
                <span className="block">Source delimiter</span>
                <select className={inputClass} value={inputDelimiter} onChange={(event) => {
                  invalidate(); setInputDelimiter(event.target.value);
                }}>
                  <option value="auto">Auto detect</option>
                  <option value=",">Comma</option>
                  <option value={"\t"}>Tab</option>
                  <option value=";">Semicolon</option>
                  <option value="|">Pipe</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="block">JSON structure</span>
                <select className={inputClass} value={outputShape} onChange={(event) => {
                  invalidate(); setOutputShape(event.target.value === "arrays" ? "arrays" : "objects");
                }}>
                  <option value="objects">Array of objects</option>
                  <option value="arrays">Array of arrays</option>
                </select>
              </label>
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={sourceHeader} onChange={(event) => {
                invalidate(); setSourceHeader(event.target.checked);
              }} /> First record contains headers
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={interpretJson} onChange={(event) => {
                invalidate(); setInterpretJson(event.target.checked);
              }} /> Interpret valid JSON values in cells
            </label>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1 text-sm">
                <span className="block">Output delimiter</span>
                <select className={inputClass} value={outputDelimiter} onChange={(event) => {
                  invalidate(); setOutputDelimiter(event.target.value);
                }}>
                  <option value=",">Comma (CSV)</option>
                  <option value={"\t"}>Tab (TSV)</option>
                  <option value=";">Semicolon (CSV)</option>
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="block">Nested values</span>
                <select className={inputClass} value={allowNested ? "json" : "reject"} onChange={(event) => {
                  invalidate(); setAllowNested(event.target.value === "json");
                }}>
                  <option value="json">Keep as JSON in one cell</option>
                  <option value="reject">Reject nested values</option>
                </select>
              </label>
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={outputHeader} onChange={(event) => {
                invalidate(); setOutputHeader(event.target.checked);
              }} /> Include column headers
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" checked={prefixFormulas} onChange={(event) => {
                invalidate(); setPrefixFormulas(event.target.checked);
              }} /> Prefix formula-like text with an apostrophe
            </label>
          </>
        )}
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={sortRows} onChange={(event) => {
            invalidate(); setSortRows(event.target.checked);
          }} /> Sort by the first column as text
        </label>
      </fieldset>
      <button className={inputClass + " bg-sky-800 text-sm font-semibold text-white hover:bg-sky-900 disabled:opacity-50"} type="button" disabled={reading} onClick={convert}>Convert table</button>
      {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      <p role="status" className="text-sm text-slate-700">{status}</p>
      {result && (
        <div className="space-y-3">
          {result.notices.map((notice) => <p className="text-sm text-slate-700" key={notice}>{notice}</p>)}
          {result.formulaCells > 0 && (
            <p id="csv-json-formula" className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {prefixFormulas
                ? "Added an apostrophe to " + result.formulaCells + (result.formulaCells === 1 ? " cell. " : " cells. ")
                  + "Spreadsheet apps may still interpret formulas after saving and reopening."
                : "Spreadsheet apps may interpret formula-like text in " + result.formulaCells
                  + (result.formulaCells === 1 ? " cell. " : " cells. ")
                  + "Enable the apostrophe option and convert again to change those cells."}
            </p>
          )}
          {previewIsLimited && <p id="csv-json-preview-limit" className="text-sm text-slate-700">Preview shows the first 16,000 characters. Copy and download use the full result.</p>}
          <label className="block space-y-1 text-sm font-semibold">
            <span className="block">Output preview</span>
            <textarea className={textArea} rows={7} readOnly value={preview}
              aria-describedby={[
                previewIsLimited ? "csv-json-preview-limit" : "",
                result.formulaCells > 0 ? "csv-json-formula" : "",
              ].filter(Boolean).join(" ") || undefined} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className={button} type="button" onClick={() => void copy()}>Copy {label}</button>
            <button className={button} type="button" onClick={download}>Download {label}</button>
            <button className={button} type="button" onClick={reverse}>Use result as source</button>
          </div>
        </div>
      )}
    </section>
  );
}
