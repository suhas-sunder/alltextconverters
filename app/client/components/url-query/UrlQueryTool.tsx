import { useRef, useState, type FormEvent } from "react";
import { buildQueryOutput, parseQueryInput, queryRowLimit, type QueryPair } from "../../text/url-query";

type Row = QueryPair & { id: number };
type Format = "url" | "query" | "json";
const button = "min-h-11 rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-50";
const field = "min-h-11 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 font-mono text-sm focus-visible:outline-2 focus-visible:outline-sky-700";

export function UrlQueryTool() {
  const [source, setSource] = useState("");
  const [mode, setMode] = useState<"url" | "query">("url");
  const [base, setBase] = useState("");
  const [fragment, setFragment] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [format, setFormat] = useState<Format>("url");
  const [spaces, setSpaces] = useState<"plus" | "percent">("plus");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const nextId = useRef(0);
  const version = useRef(0);
  const outputField = useRef<HTMLTextAreaElement>(null);

  function invalidate() {
    version.current++;
    setOutput(null);
    setError("");
    setStatus("");
    setManualCopy(false);
  }

  function editSource(value: string) {
    invalidate();
    setSource(value);
    setLoaded(false);
    setRows([]);
  }

  function parse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    invalidate();
    const result = parseQueryInput(source, mode);
    if (!result.ok) {
      setLoaded(false);
      setError(result.error);
      return;
    }
    setBase(result.value.base);
    setFragment(result.value.fragment);
    setRows(result.value.pairs.map(pair => ({ ...pair, id: ++nextId.current })));
    setFormat(mode);
    setLoaded(true);
    setStatus(`${result.value.pairs.length} parameters loaded. Edit the rows, then build the output.`);
  }

  function add() {
    invalidate();
    const id = ++nextId.current;
    setRows([...rows, { id, key: "", value: "" }]);
    requestAnimationFrame(() => document.getElementById(`url-query-key-${id}`)?.focus());
  }

  function move(index: number, distance: number) {
    invalidate();
    const id = rows[index].id;
    const next = rows.slice();
    [next[index], next[index + distance]] = [next[index + distance], next[index]];
    setRows(next);
    setStatus(`Parameter ${index + 1} moved to position ${index + distance + 1}.`);
    requestAnimationFrame(() => {
      const movedButton = document.getElementById(`url-query-move-${id}-${distance}`) as HTMLButtonElement | null;
      if (movedButton?.disabled) document.getElementById(`url-query-key-${id}`)?.focus();
    });
  }

  function edit(id: number, key: keyof QueryPair, value: string) {
    invalidate();
    setRows(rows.map(row => row.id === id ? { ...row, [key]: value } : row));
  }

  function build() {
    invalidate();
    const result = buildQueryOutput({ base, fragment, pairs: rows.map(({ key, value }) => ({ key, value })) }, format, spaces);
    if (result.ok) {
      setOutput(result.value);
      setStatus(result.value ? "Output is ready." : "The query is empty.");
    } else {
      setError(result.error);
    }
  }

  async function copy() {
    if (output === null) return;
    const current = version.current;
    try {
      await navigator.clipboard.writeText(output);
      if (current === version.current) setStatus("Output copied.");
    } catch {
      if (current === version.current) {
        setManualCopy(true);
        outputField.current?.focus();
        outputField.current?.select();
        setStatus("Clipboard access is unavailable. The output is selected for manual copy.");
      }
    }
  }

  function download() {
    if (output === null) return;
    const json = format === "json";
    const url = URL.createObjectURL(new Blob([output], { type: json ? "application/json;charset=utf-8" : "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = json ? "url-parameters.json" : "url-parameters.txt";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <section className="space-y-5 rounded-xl border border-slate-300 bg-white p-4 sm:p-6" aria-label="Query workspace">
    <form onSubmit={parse} className="space-y-3">
      <div className="space-y-1">
        <label className="block font-semibold" htmlFor="url-query-input-type">Input type</label>
        <select id="url-query-input-type" className={field} value={mode} onChange={event => { setMode(event.target.value as typeof mode); editSource(source); }}>
          <option value="url">Full URL</option><option value="query">Query string</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="block font-semibold" htmlFor="url-query-source">URL or query input</label>
        <textarea id="url-query-source" className={field} rows={4} value={source} onChange={event => editSource(event.target.value)} spellCheck={false} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={button} type="submit">Load parameters</button>
        <button className={button} type="button" onClick={() => {
          editSource(mode === "url" ? "https://example.com/search?tag=red&tag=blue&name=A+B#results" : "tag=red&tag=blue&name=A+B");
        }}>Fill example</button>
      </div>
    </form>
    {loaded && <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 font-semibold"><span className="block">Base URL</span>
          <input className={field} value={base} onChange={event => { invalidate(); setBase(event.target.value); }} spellCheck={false} />
        </label>
        <label className="space-y-1 font-semibold"><span className="block">Fragment with #</span>
          <input className={field} value={fragment} onChange={event => { invalidate(); setFragment(event.target.value); }} spellCheck={false} />
        </label>
      </div>
      <ol aria-label="Editable parameters" className="space-y-2">
        {rows.map((row, index) => <li key={row.id} className="rounded-lg border border-slate-200 p-3">
          <fieldset className="min-w-0 space-y-2">
            <legend className="text-sm font-semibold">Parameter {index + 1}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1"><label className="block text-sm" htmlFor={`url-query-key-${row.id}`}>Key {index + 1}</label>
                <textarea rows={1} id={`url-query-key-${row.id}`} className={field} value={row.key} onChange={event => edit(row.id, "key", event.target.value)} spellCheck={false} />
              </div>
              <div className="space-y-1"><label className="block text-sm" htmlFor={`url-query-value-${row.id}`}>Value {index + 1}</label>
                <textarea rows={1} id={`url-query-value-${row.id}`} className={field} value={row.value} onChange={event => edit(row.id, "value", event.target.value)} spellCheck={false} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button id={`url-query-move-${row.id}--1`} className={button} type="button" aria-label={`Move parameter ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}>Move up</button>
              <button id={`url-query-move-${row.id}-1`} className={button} type="button" aria-label={`Move parameter ${index + 1} down`} disabled={index === rows.length - 1} onClick={() => move(index, 1)}>Move down</button>
              <button className={button} type="button" aria-label={`Remove parameter ${index + 1}`} onClick={() => {
                invalidate();
                setRows(rows.filter(candidate => candidate.id !== row.id));
                const neighbor = rows[index + 1] ?? rows[index - 1];
                requestAnimationFrame(() => document.getElementById(neighbor ? `url-query-key-${neighbor.id}` : "url-query-add")?.focus());
              }}>Remove</button>
            </div>
          </fieldset>
        </li>)}
      </ol>
      <button id="url-query-add" className={button} type="button" disabled={rows.length >= queryRowLimit} onClick={add}>Add parameter</button>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1"><label className="block font-semibold" htmlFor="url-query-format">Output format</label>
          <select id="url-query-format" className={field} value={format} onChange={event => { invalidate(); setFormat(event.target.value as Format); }}>
            <option value="url">Full URL</option><option value="query">Query only</option><option value="json">Ordered JSON pairs</option>
          </select>
        </div>
        <div className="space-y-1"><label className="block font-semibold" htmlFor="url-query-spaces">Encode spaces as</label>
          <select id="url-query-spaces" className={field} value={spaces} disabled={format === "json"} onChange={event => { invalidate(); setSpaces(event.target.value as typeof spaces); }}>
            <option value="plus">Plus sign (+)</option><option value="percent">Percent escape (%20)</option>
          </select>
        </div>
      </div>
      <button className={button} type="button" onClick={build}>Build output</button>
    </>}
    {error && <p role="alert" className="text-red-800">{error}</p>}
    <p role="status" className="text-sm text-slate-700">{status}</p>
    {output !== null && <div className="space-y-3">
      <div className="space-y-1">
        <label className="block font-semibold" htmlFor="url-query-output">Built output</label>
        <textarea id="url-query-output" ref={outputField} className={field} rows={5} value={output} readOnly spellCheck={false} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button className={button} type="button" onClick={() => void copy()}>Copy output</button>
        <button className={button} type="button" onClick={download}>Download output</button>
      </div>
      {manualCopy && <p className="text-sm">Use your device’s copy shortcut or touch menu.</p>}
    </div>}
  </section>;
}
