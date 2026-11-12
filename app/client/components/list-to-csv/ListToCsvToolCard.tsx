import { useMemo, useState } from "react";
import { parseSimpleList, removeDuplicateItems } from "../../text/list-core";
import { serializeCsv } from "../../text/csv";

const button = "inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50";
const textarea = "mt-2 h-64 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-normal";
const control = "ml-1 max-w-full rounded border p-1";

export function ListToCsvToolCard() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState(false);
  const [headerName, setHeaderName] = useState("value");
  const [keepBlank, setKeepBlank] = useState(false);
  const [delimiter, setDelimiter] = useState(",");
  const [alwaysQuote, setAlwaysQuote] = useState(false);
  const [dedupe, setDedupe] = useState(false);
  const [bom, setBom] = useState(false);
  const [lineEnding, setLineEnding] = useState<"LF" | "CRLF">("CRLF");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(() => {
    // A final line ending terminates the preceding item. A second one adds a blank row.
    const source = input.replace(/(?:\r\n|\r|\n)$/, "");
    let items = input ? parseSimpleList(source, { keepEmpty: keepBlank }) : [];
    if (dedupe) items = removeDuplicateItems(items).items;
    return [...(header ? [[headerName]] : []), ...items.map((item) => [item])];
  }, [input, header, headerName, keepBlank, dedupe]);

  function updateInput(value: string, message = "") {
    setInput(value);
    setOutput("");
    setStatus(message);
  }

  function generate() {
    if (!rows.length) {
      setStatus("Add at least one item to generate a CSV.");
      return;
    }
    setOutput(serializeCsv(rows, { delimiter, alwaysQuote, bom, lineEnding }));
    setStatus(`CSV generated. ${rows.length} row${rows.length === 1 ? "" : "s"}.`);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setStatus("CSV copied.");
    } catch {
      setStatus("Copy failed. Select the output and copy it manually.");
    }
  }

  function download() {
    try {
      const url = URL.createObjectURL(new Blob([output], { type: "text/csv;charset=utf-8" }));
      try {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "list.csv";
        anchor.click();
        setStatus("CSV download started.");
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch {
      setStatus("Download failed. Please try again.");
    }
  }

  return (
    <section className="space-y-5 rounded-xl border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-lg sm:px-8">
      <div className="text-center">
        <h1 className="font-[Poppins] text-2xl font-extrabold sm:text-3xl">List to CSV Converter</h1>
        <p className="mt-1 text-sm text-slate-600">Make a one-column CSV with one record per line. Commas and quotes inside values are escaped for import.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="text-sm font-semibold">
          One item per line
          <textarea value={input} onChange={(event) => updateInput(event.target.value)} className={textarea} placeholder={'Toronto, Ontario\nHe said "hello"'} />
        </label>
        <label className="text-sm font-semibold">
          CSV output
          <textarea readOnly value={output} className={textarea} placeholder="Generate CSV to preview it" />
        </label>
      </div>
      <fieldset
        className="grid min-w-0 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2"
        onChange={() => { setOutput(""); setStatus(""); }}
      >
        <legend className="px-1 text-sm font-semibold">CSV settings</legend>
        <label><input type="checkbox" checked={header} onChange={(event) => setHeader(event.target.checked)} /> Include header</label>
        {header && <label>Header name <input value={headerName} onChange={(event) => setHeaderName(event.target.value)} className={control} /></label>}
        <label><input type="checkbox" checked={keepBlank} onChange={(event) => setKeepBlank(event.target.checked)} /> Include blank lines</label>
        <label><input type="checkbox" checked={dedupe} onChange={(event) => setDedupe(event.target.checked)} /> Remove duplicate values</label>
        <label>
          Delimiter <select value={delimiter} onChange={(event) => setDelimiter(event.target.value)} className={control}>
            <option value=",">Comma</option><option value=";">Semicolon</option><option value={"\t"}>Tab</option><option value="|">Pipe</option>
          </select>
        </label>
        <label><input type="checkbox" checked={alwaysQuote} onChange={(event) => setAlwaysQuote(event.target.checked)} /> Always quote fields</label>
        <label><input type="checkbox" checked={bom} onChange={(event) => setBom(event.target.checked)} /> UTF-8 BOM for Excel</label>
        <label>
          Line ending <select value={lineEnding} onChange={(event) => setLineEnding(event.target.value as "LF" | "CRLF")} className={control}>
            <option value="CRLF">CRLF</option><option value="LF">LF</option>
          </select>
        </label>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white" type="button" onClick={generate}>Generate CSV</button>
        <button className={button} type="button" onClick={copy} disabled={!output}>Copy CSV</button>
        <button className={button} type="button" onClick={download} disabled={!output}>Download CSV</button>
        <button className={button} type="button" onClick={() => updateInput('apple\nToronto, Ontario\nHe said "hello"', "Example loaded.")}>Load example</button>
        <button className={button} type="button" onClick={() => updateInput("", "Cleared.")}>Clear</button>
      </div>
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <caption className="p-2 text-left text-slate-600">Preview: first {Math.min(rows.length, 25)} rows{rows.length > 25 ? " (truncated)" : ""}.</caption>
          <tbody>
            {rows.slice(0, 25).map((row, index) => <tr key={index} className="border-t"><td className="p-2">{row[0]}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p role="status" className="text-sm text-slate-600">{status}</p>
      <p className="text-xs text-slate-600">Values are processed only in this browser. Formula-like values are preserved unchanged; use care when opening any CSV in a spreadsheet.</p>
    </section>
  );
}
