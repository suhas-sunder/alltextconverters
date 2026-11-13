import { useRef, useState } from "react";
import type { Alignment, TableConversion, TableFormat } from "../../text/markdown-table";

type Result = Exclude<TableConversion, { error: string }>;
type DelimitedFormat = Exclude<TableFormat, "markdown">;

const formats = { markdown: "Markdown", csv: "CSV", tsv: "TSV" };
const files = {
  markdown: { extension: "md", mime: "text/markdown" },
  csv: { extension: "csv", mime: "text/csv" },
  tsv: { extension: "tsv", mime: "text/tab-separated-values" },
};
const examples = {
  markdown: "| Item | Region | Notes |\n| :--- | :---: | --- |\n| Field kit | Montréal | Red \\| blue |\n| Travel pack | 東京 | First line&#10;Second line |",
  csv: 'Item,Region,Notes\nField kit,Montréal,"Red, blue"\nTravel pack,東京,"First line\nSecond line"',
  tsv: 'Item\tRegion\tNotes\nField kit\tMontréal\tRed | blue\nTravel pack\t東京\t"First line\nSecond line"',
};
const alignmentClass = {
  default: "text-start",
  left: "text-left",
  center: "text-center",
  right: "text-right",
};
const buttonBase = "rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:opacity-50";
const button = buttonBase + " border-slate-300 bg-white hover:bg-slate-100";
const field = "rounded-lg border border-slate-300 bg-white p-2 text-sm";
const editor = "mt-2 block min-h-64 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-base";
const maxFileBytes = 512 * 1024;

export function MarkdownTableTool() {
  const [source, setSource] = useState<TableFormat>("markdown");
  const [delimitedOutput, setDelimitedOutput] = useState<DelimitedFormat>("csv");
  const [firstRowHeader, setFirstRowHeader] = useState(true);
  const [alignment, setAlignment] = useState<Alignment>("default");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const revision = useRef(0);
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const target = source === "markdown" ? delimitedOutput : "markdown";

  function invalidateOutput() {
    revision.current += 1;
    setResult(null);
    setError("");
    setStatus("");
    setBusy(false);
    return revision.current;
  }

  async function convert() {
    const current = invalidateOutput();
    setBusy(true);
    try {
      const { convertTable } = await import("../../text/markdown-table");
      if (current !== revision.current) return;
      const next = convertTable(input, source === "markdown"
        ? { source, target: delimitedOutput }
        : { source, firstRowHeader, alignment });
      if ("error" in next) {
        setError(next.error);
      } else {
        setResult(next);
        setStatus(next.rows.length + " data rows, " + next.header.length + " columns converted.");
      }
    } catch {
      if (current === revision.current) setError("The converter could not load. Try again.");
    } finally {
      if (current === revision.current) setBusy(false);
    }
  }

  async function loadFile(file: File) {
    const current = invalidateOutput();
    if (file.size > maxFileBytes) {
      setError("Choose a UTF-8 text file up to 512 KiB.");
      return;
    }
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
      if (current !== revision.current) return;
      if (text.includes("\0")) {
        setError("This file contains null characters. Choose a UTF-8 text file.");
        return;
      }
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "md" || extension === "markdown") setSource("markdown");
      if (extension === "csv" || extension === "tsv") setSource(extension);
      setInput(text);
      setStatus("File loaded into the source editor.");
    } catch {
      if (current === revision.current) setError("Could not read this file as UTF-8 text.");
    }
  }

  async function copy() {
    if (!result) return;
    const current = revision.current;
    try {
      await navigator.clipboard.writeText(result.output);
      if (current === revision.current) setStatus(formats[target] + " copied.");
    } catch {
      if (current !== revision.current) return;
      outputRef.current?.focus();
      outputRef.current?.select();
      setStatus("Automatic copy was unavailable. Use your device’s copy command on the selected output.");
    }
  }

  function download() {
    if (!result) return;
    const { extension, mime } = files[target];
    const url = URL.createObjectURL(new Blob([result.output], { type: mime + ";charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "converted-table." + extension;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function changeInput(value: string) {
    invalidateOutput();
    setInput(value);
  }

  return (
    <section aria-label="Table converter" className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <fieldset className="flex flex-wrap items-end gap-4">
        <legend className="mb-2 font-semibold">Conversion options</legend>
        <div className="grid gap-1 text-sm font-medium">
          <label htmlFor="markdown-table-source">Source format</label>
          <select id="markdown-table-source" className={field} value={source} onChange={(event) => {
            invalidateOutput();
            setSource(event.target.value as TableFormat);
          }}>
            <option value="markdown">Markdown table</option>
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
          </select>
        </div>
        {source === "markdown" ? (
          <div className="grid gap-1 text-sm font-medium">
            <label htmlFor="markdown-table-output">Output format</label>
            <select id="markdown-table-output" className={field} value={delimitedOutput} onChange={(event) => {
              invalidateOutput();
              setDelimitedOutput(event.target.value as DelimitedFormat);
            }}>
              <option value="csv">CSV</option>
              <option value="tsv">TSV</option>
            </select>
          </div>
        ) : (
          <>
            <div className="grid gap-1 text-sm font-medium">
              <label htmlFor="markdown-table-alignment">Markdown alignment</label>
              <select id="markdown-table-alignment" className={field} value={alignment} onChange={(event) => {
                invalidateOutput();
                setAlignment(event.target.value as Alignment);
              }}>
                <option value="default">Default</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <label className="flex items-center gap-2 py-2 text-sm font-medium">
              <input type="checkbox" checked={firstRowHeader} onChange={(event) => {
                invalidateOutput();
                setFirstRowHeader(event.target.checked);
              }} />
              First row contains column headings
            </label>
          </>
        )}
      </fieldset>

      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 text-sm font-medium">
          Open UTF-8 file
          <input
            type="file"
            accept=".md,.markdown,.csv,.tsv,.txt"
            className="mt-1 block max-w-full rounded border border-slate-300 text-sm file:mr-2 file:border-0 file:bg-slate-100 file:p-2"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (file) void loadFile(file);
            }}
          />
        </label>
        <button type="button" className={button} onClick={() => changeInput(examples[source])}>Load example</button>
        <button type="button" className={button} onClick={() => changeInput("")}>Clear</button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="min-w-0 text-sm font-semibold">
          {formats[source]} input
          <textarea className={editor} aria-describedby="markdown-table-limits" value={input}
            onChange={(event) => changeInput(event.target.value)} spellCheck={false} />
        </label>
        <label className="min-w-0 text-sm font-semibold">
          {formats[target]} output
          <textarea className={editor} ref={outputRef} readOnly value={result?.output ?? ""} spellCheck={false} />
        </label>
      </div>
      <p id="markdown-table-limits" className="text-sm text-slate-600">
        Up to 512 KiB per file or 524,288 pasted characters, with a maximum of 256 columns and 50,000 cells.
      </p>

      <div className="flex flex-wrap gap-3">
        <button type="button" className={buttonBase + " border-sky-700 bg-sky-700 text-white hover:bg-sky-800"}
          onClick={() => void convert()} disabled={!input || busy}>{busy ? "Converting…" : "Convert table"}</button>
        <button type="button" className={button} onClick={() => void copy()} disabled={!result}>Copy {formats[target]}</button>
        <button type="button" className={button} onClick={download} disabled={!result}>Download {formats[target]}</button>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <p role="status" className="text-sm text-slate-700">{status}</p>

      {result && (
        <div className="space-y-2">
          {result.warnings.map((warning) => <p key={warning} className="text-sm text-amber-900">{warning}</p>)}
          <div className="overflow-x-auto rounded-lg border border-slate-200" role="region" aria-label="Table preview" tabIndex={0}>
            <table className="w-full border-collapse text-sm">
              <caption className="p-3 text-left text-slate-700">
                Preview of up to 20 data rows and 12 columns. Copy and download include the full table.
              </caption>
              <thead className="bg-slate-100">
                <tr>
                  {result.header.slice(0, 12).map((cell, index) => (
                    <th key={index} scope="col" className={"min-w-24 max-w-72 break-words whitespace-pre-wrap p-2 " + alignmentClass[result.alignment[index]]}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 20).map((row, index) => (
                  <tr key={index} className="border-t border-slate-200">
                    {row.slice(0, 12).map((cell, column) => (
                      <td key={column} className={"min-w-24 max-w-72 break-words whitespace-pre-wrap p-2 " + alignmentClass[result.alignment[column]]}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
