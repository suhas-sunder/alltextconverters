import { useRef, useState, type ClipboardEvent } from "react";
import {
  looksLikeWorkspaceClipboardTsv,
  readWorkspaceClipboardTable,
  writeWorkspaceSpreadsheetClipboard,
} from "./tableWorkspaceClipboard";
import {
  decodeWorkspaceFile,
  exportWorkspaceTable,
  moveWorkspaceColumn,
  parseWorkspaceTable,
  projectWorkspaceRow,
  TABLE_WORKSPACE_LIMITS,
  TABLE_WORKSPACE_SIZE_ERROR,
  workspaceColumnLabel,
  type WorkspaceColumn,
  type WorkspaceFormat,
  type WorkspaceTable,
} from "./tableWorkspaceData";

type Props = { initialInput: string; initialDelimiter: string; initialHeader: boolean };

const button = "min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:opacity-50";
const select = "min-h-10 rounded border border-slate-300 bg-white px-2";
const previewRows = 20;
const previewColumns = 12;

export default function TableWorkspace({ initialInput, initialDelimiter, initialHeader }: Props) {
  const [input, setInput] = useState(initialInput);
  const [delimiter, setDelimiter] = useState(initialDelimiter);
  const [hasHeader, setHasHeader] = useState(initialHeader);
  const [includeHeader, setIncludeHeader] = useState(initialHeader);
  const [table, setTable] = useState<WorkspaceTable | null>(null);
  const [columns, setColumns] = useState<WorkspaceColumn[]>([]);
  const [format, setFormat] = useState<WorkspaceFormat>("csv");
  const [addBom, setAddBom] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [manualTsv, setManualTsv] = useState<string | null>(null);
  const operation = useRef(0);

  const selected = columns.filter((column) => column.included).map((column) => column.source);
  const previewSelection = selected.slice(0, previewColumns);
  const exportable = table && selected.length > 0 && (table.rows.length > 0 || (includeHeader && table.headers));

  function invalidate() {
    operation.current += 1;
    setTable(null);
    setError("");
    setStatus("");
    setReading(false);
    setManualTsv(null);
  }

  function updateInput(value: string) {
    invalidate();
    if (value.length > TABLE_WORKSPACE_LIMITS.bytes) {
      setError(TABLE_WORKSPACE_SIZE_ERROR);
      return;
    }
    setInput(value);
  }

  function pasteSource(event: ClipboardEvent<HTMLTextAreaElement>) {
    const html = event.clipboardData.getData("text/html");
    const plain = event.clipboardData.getData("text/plain");
    if (html) {
      const result = readWorkspaceClipboardTable(html, event.currentTarget.ownerDocument);
      if ("text" in result) {
        event.preventDefault();
        updateInput(result.text);
        setDelimiter("\t");
        setStatus(result.merged
          ? "Spreadsheet range pasted. Merged values stay in their top-left cell. Choose Parse table to continue."
          : "Spreadsheet range pasted. Choose Parse table to continue.");
        return;
      }
      if (!plain) {
        event.preventDefault();
        setStatus("");
        setError(result.error);
        return;
      }
    }

    if (delimiter === "auto" && looksLikeWorkspaceClipboardTsv(plain)) setDelimiter("\t");
  }

  async function openFile(file: File) {
    invalidate();
    const request = operation.current;
    if (file.size > TABLE_WORKSPACE_LIMITS.bytes) {
      setError(TABLE_WORKSPACE_SIZE_ERROR);
      return;
    }
    setReading(true);
    setStatus("Reading file.");
    try {
      const content = decodeWorkspaceFile(await file.arrayBuffer());
      if (request !== operation.current) return;
      if (!content) throw new Error("This file is empty. Choose a file with delimited text.");
      setInput(content);
      setDelimiter(/\.tsv$/i.test(file.name) ? "\t" : "auto");
      setStatus("File loaded. Review the source settings, then parse the table.");
    } catch (cause) {
      if (request !== operation.current) return;
      setError(cause instanceof Error ? cause.message : "Could not read the file.");
      setStatus("");
    } finally {
      if (request === operation.current) setReading(false);
    }
  }

  function parse() {
    invalidate();
    const result = parseWorkspaceTable(input, delimiter, hasHeader);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const { table: next } = result;
    setTable(next);
    setColumns(Array.from({ length: next.columnCount }, (_, source) => ({ source, included: true })));
    setIncludeHeader(hasHeader);
    setStatus("Parsed " + next.rows.length + " data rows and " + next.columnCount + " columns.");
  }

  function updateOutputSettings(message = "") {
    operation.current += 1;
    setError("");
    setStatus(message);
    setManualTsv(null);
  }

  function getOutput(forDownload: boolean) {
    if (!table || !exportable) return "";
    return exportWorkspaceTable(table, selected, {
      format,
      includeHeader,
      bom: forDownload && format === "csv" && addBom,
    });
  }

  async function copyOutput() {
    const output = getOutput(false);
    if (!output) return;
    const request = ++operation.current;
    setError("");
    try {
      await navigator.clipboard.writeText(output);
      if (request === operation.current) setStatus(format.toUpperCase() + " copied.");
    } catch {
      if (request === operation.current) {
        setStatus("");
        setError("Clipboard access failed. Download the table instead.");
      }
    }
  }

  async function copySpreadsheet() {
    if (!table || !exportable) return;
    updateOutputSettings();
    const request = operation.current;
    const result = await writeWorkspaceSpreadsheetClipboard(table, selected, includeHeader);
    if (request !== operation.current) return;
    if (result.kind === "manual") {
      setManualTsv(result.text);
      setStatus("Automatic clipboard access failed. Select and copy the TSV below.");
      return;
    }
    setStatus(result.kind === "rich" ? "Spreadsheet table and TSV copied." : "Spreadsheet TSV copied as plain text.");
  }

  function downloadOutput() {
    const output = getOutput(true);
    if (!output) return;
    updateOutputSettings();
    const mime = format === "tsv" ? "text/tab-separated-values" : "text/csv";
    let url: string | undefined;
    const link = document.createElement("a");
    try {
      url = URL.createObjectURL(new Blob([output], { type: mime + ";charset=utf-8" }));
      link.href = url;
      link.download = "table." + format;
      document.body.append(link);
      link.click();
      setStatus(format.toUpperCase() + " download started.");
    } catch {
      setError("Download failed. Copy the table instead.");
    } finally {
      link.remove();
      if (url) URL.revokeObjectURL(url);
    }
  }

  function moveColumn(position: number, delta: -1 | 1) {
    if (!table) return;
    const column = columns[position];
    const next = moveWorkspaceColumn(columns, position, delta);
    if (next === columns) return;
    setColumns(next);
    updateOutputSettings(workspaceColumnLabel(table, column.source) + " moved to position " + (position + delta + 1) + ".");
  }

  return (
    <section aria-labelledby="csv-workspace-heading" className="min-w-0 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-5">
      <header className="space-y-2">
        <h2 id="csv-workspace-heading" className="text-xl font-bold">Table workspace</h2>
        <p className="text-sm text-slate-700">Paste a spreadsheet range or open a UTF-8 CSV, TSV, or text file. Select and order the columns for export. Processing stays in this browser.</p>
        <p className="text-sm text-slate-600">Limits are 1 MiB, 20,000 records, 64 columns, and 250,000 cells.</p>
      </header>
      <label className="block text-sm font-semibold">
        Workspace source
        <textarea
          className="mt-1 block min-h-32 w-full rounded-lg border border-slate-300 bg-white p-2 font-mono font-normal"
          aria-describedby="workspace-paste-help"
          value={input}
          onChange={(event) => updateInput(event.target.value)}
          onPaste={pasteSource}
        />
      </label>
      <p id="workspace-paste-help" className="text-sm text-slate-600">If the clipboard supplies a table, pasting replaces the source. You can also paste plain text.</p>
      <label className="block text-sm font-semibold">
        Open UTF-8 file
        <input
          type="file"
          accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
          className="mt-1 block w-full text-sm file:mr-2 file:min-h-11 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-2"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) void openFile(file);
          }}
        />
      </label>
      <fieldset className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <legend className="mb-1 text-sm font-semibold">Source settings</legend>
        <label className="flex flex-wrap items-center gap-2 text-sm">
          Workspace delimiter
          <select className={select} value={delimiter} onChange={(event) => { invalidate(); setDelimiter(event.target.value); }}>
            <option value="auto">Auto</option>
            <option value=",">Comma</option>
            <option value={"\t"}>Tab</option>
            <option value=";">Semicolon</option>
            <option value="|">Pipe</option>
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={hasHeader} onChange={(event) => { invalidate(); setHasHeader(event.target.checked); }} />
          First workspace record is a header
        </label>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={reading || !input} onClick={parse}>Parse table</button>
        <button type="button" className={button} onClick={() => updateInput("")}>Clear workspace</button>
      </div>

      {table && (
        <>
          {table.warnings.map((warning) => <p key={warning} className="text-sm text-amber-800">{warning}</p>)}
          <fieldset className="min-w-0">
            <legend className="font-semibold">Columns in output order</legend>
            <p className="mb-2 text-sm text-slate-600">Uncheck a column to omit it. Move columns earlier or later to match the destination.</p>
            <ol className="max-h-72 space-y-2 overflow-y-auto p-1">
              {columns.map((column, position) => {
                const label = workspaceColumnLabel(table, column.source);
                return (
                  <li key={column.source} className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded border border-slate-200 bg-white px-2">
                    <label className="flex min-h-11 min-w-0 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={column.included}
                        onChange={(event) => {
                          const included = event.target.checked;
                          setColumns((previous) => previous.map((entry) => entry.source === column.source ? { ...entry, included } : entry));
                          updateOutputSettings();
                        }}
                      />
                      <span className="[overflow-wrap:anywhere]">{label}</span>
                    </label>
                    <div className="flex flex-wrap gap-1 py-1">
                      <button type="button" className={button} aria-label={"Move " + label + " earlier"} disabled={position === 0} onClick={() => moveColumn(position, -1)}>Earlier</button>
                      <button type="button" className={button} aria-label={"Move " + label + " later"} disabled={position === columns.length - 1} onClick={() => moveColumn(position, 1)}>Later</button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </fieldset>
          {selected.length > 0 ? (
            <div role="region" aria-label="Scrollable output preview" tabIndex={0} className="max-h-96 overflow-auto rounded border border-slate-300 bg-white focus-visible:outline-2 focus-visible:outline-sky-600">
              <table className="min-w-full text-left text-sm">
                <caption className="p-2 text-left font-semibold">
                  Output preview. Showing {Math.min(table.rows.length, previewRows)} of {table.rows.length} data rows and {previewSelection.length} of {selected.length} selected columns. Long cells are shortened here only.
                </caption>
                <thead>
                  <tr>
                    {previewSelection.map((column) => <th className="min-w-24 p-2" scope="col" key={column}>{workspaceColumnLabel(table, column)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.slice(0, previewRows).map((row, index) => (
                    <tr className="border-t border-slate-200" key={index}>
                      {projectWorkspaceRow(row, previewSelection).map((cell, position) => (
                        <td className="max-w-48 whitespace-pre-wrap p-2 align-top [overflow-wrap:anywhere]" key={previewSelection[position]}>
                          {cell.length > 512 ? cell.slice(0, 512) + "…" : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-sm">Select at least one column to preview and export.</p>}
          <fieldset className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <legend className="mb-1 font-semibold">Export settings</legend>
            <label className="flex flex-wrap items-center gap-2 text-sm">
              Output format
              <select className={select} value={format} onChange={(event) => { setFormat(event.target.value === "tsv" ? "tsv" : "csv"); updateOutputSettings(); }}>
                <option value="csv">CSV (comma)</option>
                <option value="tsv">TSV (tab)</option>
              </select>
            </label>
            {table.headers && (
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={includeHeader} onChange={(event) => { setIncludeHeader(event.target.checked); updateOutputSettings(); }} />
                Include header in export
              </label>
            )}
            {format === "csv" && (
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={addBom} onChange={(event) => { setAddBom(event.target.checked); updateOutputSettings(); }} />
                Add UTF-8 BOM to CSV download
              </label>
            )}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={button} disabled={!exportable} onClick={() => void copySpreadsheet()}>Copy for spreadsheet</button>
            <button type="button" className={button} disabled={!exportable} onClick={() => void copyOutput()}>Copy {format.toUpperCase()}</button>
            <button type="button" className={button} disabled={!exportable} onClick={downloadOutput}>Download {format.toUpperCase()}</button>
          </div>
          {manualTsv !== null && (
            <label className="block text-sm font-semibold">
              Spreadsheet TSV for manual copy
              <textarea
                className="mt-1 block min-h-24 w-full rounded-lg border border-slate-300 bg-white p-2 font-mono font-normal"
                value={manualTsv}
                readOnly
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          )}
        </>
      )}
      {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-800">{error}</p>}
      <p role="status" className="text-sm text-slate-700">{status}</p>
    </section>
  );
}
