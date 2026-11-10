import { useMemo, useRef, useState } from "react";
import { parseCsv } from "../../text/csv";
import { removeDuplicateItems } from "../../text/list-core";

type Workspace = typeof import("./TableWorkspace").default;
type WorkspaceSource = Parameters<Workspace>[0];

const button = "inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50";
const textarea = "mt-2 h-64 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-normal";
const control = "ml-1 max-w-full rounded border p-1";

export function CsvToListToolCard() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState("auto");
  const [header, setHeader] = useState(false);
  const [column, setColumn] = useState(0);
  const [trim, setTrim] = useState(true);
  const [keepEmpty, setKeepEmpty] = useState(false);
  const [dedupe, setDedupe] = useState(false);
  const [outputDelimiter, setOutputDelimiter] = useState("\n");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [workspaceSource, setWorkspaceSource] = useState<WorkspaceSource | null>(null);
  const [Workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceError, setWorkspaceError] = useState("");
  const loadingWorkspace = useRef(false);

  const { parsed, maxColumns } = useMemo(() => {
    const parsed = parseCsv(input, delimiter === "auto" ? undefined : delimiter);
    const maxColumns = parsed.rows.reduce((width, row) => Math.max(width, row.length), 1);
    return { parsed, maxColumns };
  }, [input, delimiter]);
  const rows = parsed.rows;
  const selectedColumn = Math.min(column, maxColumns - 1);
  const previewColumns = Math.min(maxColumns, 12);

  function updateInput(value: string, message = "") {
    setInput(value);
    setOutput("");
    setStatus(message);
  }

  function convert() {
    if ("error" in parsed) return;
    let values = rows.slice(header ? 1 : 0).map((row) => {
      const value = row[selectedColumn] ?? "";
      return trim ? value.trim() : value;
    });
    if (!keepEmpty) values = values.filter(Boolean);
    if (dedupe) values = removeDuplicateItems(values).items;
    setOutput(values.join(outputDelimiter === "custom" ? customDelimiter : outputDelimiter));
    setStatus(`Conversion complete. ${values.length} value${values.length === 1 ? "" : "s"} generated.`);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setStatus("Output copied.");
    } catch {
      setStatus("Copy failed. Select the output and copy it manually.");
    }
  }

  async function toggleWorkspace() {
    if (workspaceSource) {
      setWorkspaceSource(null);
      return;
    }
    setWorkspaceSource({ initialInput: input, initialDelimiter: delimiter, initialHeader: header });
    if (Workspace || loadingWorkspace.current) return;
    loadingWorkspace.current = true;
    setWorkspaceError("");
    try {
      const module = await import("./TableWorkspace");
      setWorkspace(() => module.default);
    } catch {
      setWorkspaceError("Could not load the table workspace. Reload the page to try again.");
    } finally {
      loadingWorkspace.current = false;
    }
  }

  function loadExample() {
    updateInput('name,city\nAda,"Toronto, Ontario"\nLin,Montréal', "Example loaded.");
    setDelimiter("auto");
    setHeader(true);
    setColumn(1);
  }

  return (
    <section className="space-y-5 rounded-xl border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-lg sm:px-8">
      <div className="text-center">
        <h1 className="font-[Poppins] text-2xl font-extrabold sm:text-3xl">CSV to List Converter</h1>
        <p className="mt-1 text-sm text-slate-600">Parse quoted CSV locally and extract one selected column.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="text-sm font-semibold">
          CSV or delimited text
          <textarea value={input} onChange={(event) => updateInput(event.target.value)} className={textarea} placeholder={'name,city\nAda,"Toronto, Ontario"'} />
        </label>
        <label className="text-sm font-semibold">
          List output
          <textarea readOnly value={output} className={textarea} />
        </label>
      </div>
      <fieldset
        className="grid min-w-0 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2"
        onChange={() => { setOutput(""); setStatus(""); }}
      >
        <legend className="px-1 text-sm font-semibold">Parsing and output</legend>
        <label>
          Source delimiter <select value={delimiter} onChange={(event) => setDelimiter(event.target.value)} className={control}>
            <option value="auto">Auto ({parsed.delimiter === "\t" ? "tab" : parsed.delimiter})</option>
            <option value=",">Comma</option><option value=";">Semicolon</option><option value={"\t"}>Tab</option><option value="|">Pipe</option>
          </select>
        </label>
        <label><input type="checkbox" checked={header} onChange={(event) => { setHeader(event.target.checked); setColumn(0); }} /> First row is a header</label>
        <label className="min-w-0">
          Column <select value={selectedColumn} onChange={(event) => setColumn(Number(event.target.value))} className={control}>
            {Array.from({ length: maxColumns }, (_, index) => (
              <option key={index} value={index}>
                {header && rows[0]?.[index] ? `${rows[0][index]} (${index + 1})` : `Column ${index + 1}`}
              </option>
            ))}
          </select>
        </label>
        <label>
          Output delimiter <select value={outputDelimiter} onChange={(event) => setOutputDelimiter(event.target.value)} className={control}>
            <option value={"\n"}>Newline</option><option value=", ">Comma and space</option><option value=",">Comma</option>
            <option value=";">Semicolon</option><option value={"\t"}>Tab</option><option value="custom">Custom</option>
          </select>
        </label>
        {outputDelimiter === "custom" && <label>Custom delimiter <input value={customDelimiter} onChange={(event) => setCustomDelimiter(event.target.value)} className={control} /></label>}
        <label><input type="checkbox" checked={trim} onChange={(event) => setTrim(event.target.checked)} /> Trim values</label>
        <label><input type="checkbox" checked={keepEmpty} onChange={(event) => setKeepEmpty(event.target.checked)} /> Include empty values</label>
        <label><input type="checkbox" checked={dedupe} onChange={(event) => setDedupe(event.target.checked)} /> Remove duplicates</label>
      </fieldset>
      {"error" in parsed ? (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{parsed.error}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <caption className="p-2 text-left text-slate-600">
                Parsed preview: first {Math.min(rows.length, 25)} rows{rows.length > 25 ? " (truncated)" : ""}.
                {maxColumns > previewColumns ? ` Showing the first ${previewColumns} of ${maxColumns} columns.` : ""}
              </caption>
              <tbody>
                {rows.slice(0, 25).map((row, rowIndex) => (
                  <tr className="border-t" key={rowIndex}>
                    {Array.from({ length: previewColumns }, (_, columnIndex) => (
                      <td className="max-w-xs truncate p-2" key={columnIndex}>{row[columnIndex] ?? ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.warnings.map((warning) => <p key={warning} className="text-sm text-amber-700">{warning}</p>)}
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={convert} disabled={!rows.length || "error" in parsed}>Convert</button>
        <button className={button} type="button" disabled={!output} onClick={copy}>Copy</button>
        <button className={button} type="button" onClick={loadExample}>Load example</button>
        <button className={button} type="button" onClick={() => updateInput("", "Cleared.")}>Clear</button>
      </div>
      <p role="status" className="text-sm text-slate-600">{status}</p>
      <div className="space-y-2 border-t border-slate-200 pt-4">
        <button
          aria-expanded={workspaceSource !== null}
          aria-controls="csv-table-workspace"
          className={button}
          type="button"
          onClick={() => void toggleWorkspace()}
        >
          {workspaceSource ? "Close table workspace" : "Open table workspace"}
        </button>
        <p className="text-sm text-slate-600">Select and reorder multiple columns for CSV or TSV export. Opening copies the current source and settings. Closing clears the workspace.</p>
        <div id="csv-table-workspace" hidden={!workspaceSource}>
          {workspaceSource && Workspace && <Workspace {...workspaceSource} />}
          {workspaceSource && !Workspace && (
            workspaceError
              ? <p role="alert" className="text-sm text-red-800">{workspaceError}</p>
              : <p role="status">Loading table workspace.</p>
          )}
        </div>
      </div>
    </section>
  );
}
