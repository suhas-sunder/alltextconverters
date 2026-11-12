import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { assertInspectorInput, inspectorByteLimit, inspectorPreviewLimit, previewUnicodeCleanup, safeTextPreview, type Cleanup, type Inspection } from "../../text/unicode-inspector";

const action = "min-h-11 rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-600";
const editor = "w-full rounded-lg border border-slate-400 bg-white p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-sky-700";
const defaults: Cleanup = { normalization: "", removeBom: false, removeZwsp: false, replaceNbsp: false };
const encoder = new TextEncoder();

function save(file: Blob, name: string) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function UnicodeInspector() {
  const [source, setSource] = useState("");
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [filtered, setFiltered] = useState(false);
  const [cleanup, setCleanup] = useState(defaults);
  const [cleaned, setCleaned] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const worker = useRef<Worker | null>(null);
  const revision = useRef(0);
  const manualOutput = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => {
    revision.current++;
    worker.current?.terminate();
  }, []);
  useEffect(() => {
    if (manual) {
      manualOutput.current?.focus();
      manualOutput.current?.select();
    }
  }, [manual]);

  function stop() {
    worker.current?.terminate();
    worker.current = null;
    setBusy(false);
  }

  function replace(value: string) {
    revision.current++;
    stop();
    setSource(value);
    setInspection(null);
    setCleaned(null);
    setManual(false);
    setError("");
    setStatus("");
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const current = ++revision.current;
    stop();
    setError("");
    if (file.size > inspectorByteLimit) {
      setError("Use a UTF-8 file of at most 32 KiB.");
      return;
    }
    try {
      const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
      if (revision.current !== current) return;
      replace(text);
      setStatus("UTF-8 file loaded. Line endings and any byte order mark are preserved until you edit the source.");
    } catch {
      if (revision.current === current) setError("The file could not be read as valid UTF-8.");
    }
  }

  function run(exportRecords: boolean) {
    stop();
    setError("");
    setStatus(exportRecords ? "Preparing the full JSON Lines report…" : "Inspecting Unicode text…");
    try {
      assertInspectorInput(source);
      const job = new Worker(new URL("../../text/unicode-inspector.worker.ts", import.meta.url), { type: "module" });
      worker.current = job;
      setBusy(true);
      job.onmessage = (event: MessageEvent<{ error?: string; result?: Inspection; file?: Blob }>) => {
        if (worker.current !== job) return;
        stop();
        if (event.data.error || !event.data.result) {
          setStatus("");
          setError(event.data.error ?? "Unable to inspect the text.");
          return;
        }
        const result = event.data.result;
        setInspection(result);
        if (event.data.file) save(event.data.file, "unicode-inspection.jsonl");
        setStatus(event.data.file ? "Full inspection report prepared." : result.points + " code points inspected.");
      };
      job.onerror = () => {
        if (worker.current !== job) return;
        stop();
        setStatus("");
        setError("The inspection could not run. Reload the page and try again.");
      };
      job.postMessage({ source, exportRecords });
    } catch (failure) {
      setStatus("");
      setError(failure instanceof Error ? failure.message : "Unable to inspect the text.");
    }
  }

  function changeCleanup(options: Cleanup) {
    revision.current++;
    setCleanup(options);
    setCleaned(null);
    setManual(false);
    setError("");
    setStatus("");
  }

  function buildPreview() {
    revision.current++;
    setError("");
    setManual(false);
    try {
      const output = previewUnicodeCleanup(source, cleanup);
      setCleaned(output);
      setStatus(output === source ? "The selected options leave this source unchanged." : "Cleanup preview ready. Source preserved.");
    } catch (failure) {
      setCleaned(null);
      setStatus("");
      setError(failure instanceof Error ? failure.message : "Unable to preview cleanup.");
    }
  }

  async function copyCleaned() {
    if (cleaned === null) return;
    const current = revision.current;
    try {
      await navigator.clipboard.writeText(cleaned);
      if (revision.current === current) setStatus("Cleaned text copied.");
    } catch {
      if (revision.current === current) {
        setManual(true);
        setStatus("Clipboard access is unavailable. Cleaned text is selected for manual copy.");
      }
    }
  }

  const rows = filtered ? inspection?.flaggedPreview : inspection?.preview;
  const matches = filtered ? inspection?.flagged : inspection?.points;
  return <div className="space-y-6">
    <section aria-labelledby="inspect-title" className="min-w-0 space-y-4 rounded-xl border border-slate-300 bg-white p-4 sm:p-6">
      <h2 id="inspect-title" className="text-xl font-semibold">Inspect your text</h2>
      <div className="space-y-1">
        <label className="block font-semibold" htmlFor="unicode-source">Source text</label>
        <textarea id="unicode-source" className={editor} rows={5} dir="auto" spellCheck={false} value={source} onChange={event => replace(event.target.value)} />
      </div>
      <label className="block max-w-full space-y-1 text-sm">
        <span className="block font-semibold">Or load a UTF-8 text file</span>
        <input type="file" className="block min-h-11 w-full rounded border border-slate-400 p-2" onChange={event => void importFile(event)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={action} type="button" disabled={busy} onClick={() => run(false)}>Inspect text</button>
        <button className={action} type="button" onClick={() => replace("café / cafe\u0301 · 👩🏽\u200D💻 · A\u00A0B · Ａ\u200BＢ · مرحبًا\u200F · ❤️")}>Load example</button>
        {busy && <button className={action} type="button" onClick={() => { stop(); setStatus("Inspection cancelled."); }}>Cancel inspection</button>}
      </div>
      {inspection && <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div><dt>{inspection.segmentation === "grapheme" ? "Grapheme clusters" : "Code-point groups"}</dt><dd className="text-lg font-bold">{inspection.groups}</dd></div>
          <div><dt>Code points</dt><dd className="text-lg font-bold">{inspection.points}</dd></div>
          <div><dt>UTF-8 bytes</dt><dd className="text-lg font-bold">{inspection.bytes}</dd></div>
          <div><dt>UTF-16 units</dt><dd className="text-lg font-bold">{inspection.units}</dd></div>
        </dl>
        {inspection.segmentation === "code-point" && <p>This browser does not support grapheme segmentation. Each code point is shown as a separate group.</p>}
        <p>{inspection.flagged} flagged code points, including {inspection.directional} directional controls. These characters can affect spacing, shaping or displayed order.</p>
        <label className="flex min-h-11 items-center gap-2">
          <input type="checkbox" checked={filtered} onChange={event => setFiltered(event.target.checked)} />
          Show flagged code points only
        </label>
        {rows?.length ? <>
          <p id="unicode-table-note" className="text-sm text-slate-700">Showing {rows.length} of {matches} code points. Indices start at zero. Scroll the table to see all columns.</p>
          <div tabIndex={0} role="region" aria-label="Unicode inspection table" aria-describedby="unicode-table-note" className="overflow-x-auto rounded-lg border border-slate-300 focus-visible:outline-2 focus-visible:outline-sky-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100"><tr>{["Group", "Point", "Code point", "Glyph", "Description", "UTF-8 offset / bytes", "UTF-16 offset / units", "Flag"].map(label => <th key={label} scope="col" className="px-3 py-2">{label}</th>)}</tr></thead>
              <tbody>{rows.map(row => <tr key={row.point} className="border-t border-slate-200">
                <td className="px-3 py-2">{row.grapheme}</td><td className="px-3 py-2">{row.point}</td>
                <th className="px-3 py-2 font-mono font-medium whitespace-nowrap" scope="row">{row.code}</th>
                <td className="px-3 py-2 font-mono"><bdi>{row.glyph}</bdi></td>
                <td className="px-3 py-2">{row.description}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.utf8Offset} / {row.utf8Bytes}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.utf16Offset} / {row.utf16Units}</td>
                <td className="px-3 py-2">{row.warning ?? "—"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </> : <p>{filtered ? "No flagged code points." : "There is no text to inspect."}</p>}
        <button className={action} type="button" disabled={busy || !inspection.points} onClick={() => run(true)}>Download all records (JSONL)</button>
        <p className="text-sm text-slate-700">The table shows up to {inspectorPreviewLimit} records. The JSON Lines download includes every code point in source order.</p>
      </div>}
    </section>
    <section aria-labelledby="cleanup-title" className="min-w-0 space-y-4 rounded-xl border border-slate-300 bg-white p-4 sm:p-6">
      <h2 id="cleanup-title" className="text-xl font-semibold">Preview optional cleanup</h2>
      <p className="text-sm">Choose the changes you want to make. Joiners, direction marks and variation selectors stay in the text.</p>
      <label className="block space-y-1 font-semibold">
        <span className="block">Normalization</span>
        <select className={editor} value={cleanup.normalization} onChange={event => changeCleanup({ ...cleanup, normalization: event.target.value as Cleanup["normalization"] })}>
          <option value="">Keep original</option><option value="NFC">NFC (compose)</option><option value="NFD">NFD (decompose)</option>
        </select>
      </label>
      <div className="space-y-2">
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={cleanup.removeBom} onChange={event => changeCleanup({ ...cleanup, removeBom: event.target.checked })} />Remove initial byte order mark (U+FEFF)</label>
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={cleanup.removeZwsp} onChange={event => changeCleanup({ ...cleanup, removeZwsp: event.target.checked })} />Remove zero width spaces (U+200B)</label>
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={cleanup.replaceNbsp} onChange={event => changeCleanup({ ...cleanup, replaceNbsp: event.target.checked })} />Replace no-break spaces (U+00A0) with spaces</label>
      </div>
      <button className={action} type="button" onClick={buildPreview}>Preview cleanup</button>
      {cleaned !== null && <>
        <div className="grid gap-3 sm:grid-cols-2">
          {[{ label: "Before", value: source }, { label: "After", value: cleaned }].map(({ label, value }) => {
            const preview = safeTextPreview(value);
            return <div key={label} className="min-w-0 space-y-1 rounded-lg bg-slate-100 p-3">
              <h3 className="font-semibold">{label} · {encoder.encode(value).length} UTF-8 bytes</h3>
              <pre className="whitespace-pre-wrap wrap-anywhere font-mono text-sm"><bdi>{preview.text || "(empty)"}</bdi>{preview.truncated && "…"}</pre>
            </div>;
          })}
        </div>
        <p className="text-sm">The preview escapes invisible code points. Copy and download use the full text.</p>
        <div className="flex flex-wrap gap-2">
          <button className={action} type="button" onClick={() => void copyCleaned()}>Copy cleaned text</button>
          <button className={action} type="button" onClick={() => save(new Blob([cleaned], { type: "text/plain;charset=utf-8" }), "unicode-cleaned.txt")}>Download cleaned text</button>
        </div>
        {manual && <div className="space-y-1"><label className="block font-semibold" htmlFor="unicode-cleaned">Cleaned text for manual copy</label><textarea id="unicode-cleaned" ref={manualOutput} className={editor} rows={4} dir="auto" readOnly value={cleaned} /></div>}
      </>}
    </section>
    <p role="status" className="text-sm text-slate-700">{status}</p>
    {error && <p role="alert" className="font-medium text-red-800">{error}</p>}
  </div>;
}
