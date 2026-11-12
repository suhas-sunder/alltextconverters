import { useEffect, useRef, useState } from "react";
import {
  comparisonGroups, comparisonLimits, comparisonText, defaultComparisonOptions,
  type ComparisonGroup, type ComparisonOptions, type ComparisonResponse, type ComparisonResult, type ListSide,
} from "../../text/compare-two-lists";

const groupLabels: Record<ComparisonGroup, string> = {
  onlyA: "Only A", onlyB: "Only B", common: "Common", union: "Union",
};
const groupFiles: Record<ComparisonGroup, string> = {
  onlyA: "only-a", onlyB: "only-b", common: "common", union: "union",
};
const button = "min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:opacity-50";
const field = "w-full rounded-lg border border-slate-400 bg-white p-2 text-sm focus-visible:outline-2 focus-visible:outline-sky-700";
const editor = field + " mt-2 min-h-52 resize-y bg-slate-50 p-3 font-mono text-base";
const fileField = "mt-2 block w-full min-w-0 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-2 file:py-2 file:font-medium focus-visible:outline-2 focus-visible:outline-sky-700";

function previewValue(value: string) {
  if (value === "") return "⟨empty line⟩";
  if (!value.trim()) return "⟨whitespace only⟩";
  return value.length <= 160 ? value : value.slice(0, 159).replace(/[\uD800-\uDBFF]$/, "") + "…";
}

export function CompareTwoListsTool() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [options, setOptions] = useState(defaultComparisonOptions);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState({ A: false, B: false });
  const worker = useRef<Worker | null>(null);
  const revision = useRef(0);
  const fileRevision = useRef({ A: 0, B: 0 });

  useEffect(() => () => {
    revision.current++;
    fileRevision.current.A++;
    fileRevision.current.B++;
    worker.current?.terminate();
    worker.current = null;
  }, []);

  function invalidate() {
    revision.current++;
    worker.current?.terminate();
    worker.current = null;
    setBusy(false);
    setResult(null);
    setError("");
    setStatus("");
  }

  function changeInput(value: string, side: ListSide) {
    fileRevision.current[side]++;
    setLoading((current) => ({ ...current, [side]: false }));
    invalidate();
    if (value.length > comparisonLimits.bytes) {
      setError(`List ${side} exceeds 512 KiB. Your previous text was kept.`);
      return;
    }
    if (side === "A") setA(value);
    else setB(value);
  }

  async function importFile(file: File, side: ListSide) {
    const current = ++fileRevision.current[side];
    invalidate();
    if (file.size > comparisonLimits.bytes) {
      setLoading((loading) => ({ ...loading, [side]: false }));
      setError(`List ${side} needs a UTF-8 file up to 512 KiB. Your previous text was kept.`);
      return;
    }
    setLoading((loading) => ({ ...loading, [side]: true }));
    try {
      const value = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
      if (current !== fileRevision.current[side]) return;
      if (side === "A") setA(value);
      else setB(value);
      setStatus(`File loaded into List ${side}.`);
    } catch {
      if (current === fileRevision.current[side]) setError(`List ${side} could not read this file as UTF-8. Your previous text was kept.`);
    } finally {
      if (current === fileRevision.current[side]) setLoading((loading) => ({ ...loading, [side]: false }));
    }
  }

  function replaceLists(left: string, right: string) {
    fileRevision.current.A++;
    fileRevision.current.B++;
    setLoading({ A: false, B: false });
    invalidate();
    setA(left);
    setB(right);
  }

  function changeOption<K extends keyof ComparisonOptions>(name: K, value: ComparisonOptions[K]) {
    invalidate();
    setOptions((current) => ({ ...current, [name]: value }));
  }

  function compare() {
    invalidate();
    const current = revision.current;
    function finish(response: ComparisonResponse) {
      if (current !== revision.current) return;
      worker.current?.terminate();
      worker.current = null;
      setBusy(false);
      if ("error" in response) setError(response.error);
      else {
        setResult(response.result);
        setStatus("Comparison ready.");
      }
    }

    setBusy(true);
    try {
      const process = new Worker(new URL("../../text/compare-two-lists.worker.ts", import.meta.url), { type: "module" });
      worker.current = process;
      process.onmessage = (event: MessageEvent<ComparisonResponse>) => finish(event.data);
      process.onerror = (event) => {
        event.preventDefault();
        finish({ error: "The comparison worker could not run. Try again." });
      };
      process.onmessageerror = () => finish({ error: "Could not read the comparison result. Try again." });
      process.postMessage({ a, b, options });
    } catch {
      finish({ error: "Could not start the comparison worker. Try again." });
    }
  }

  async function copy(group: ComparisonGroup) {
    if (!result) return;
    const current = revision.current;
    try {
      await navigator.clipboard.writeText(comparisonText(result.outputs[group].values));
      if (current === revision.current) setStatus(groupLabels[group] + " copied.");
    } catch {
      if (current === revision.current) setStatus("Automatic copy was unavailable. Download the TXT to keep the complete result.");
    }
  }

  function download(group: ComparisonGroup) {
    if (!result) return;
    const url = URL.createObjectURL(new Blob([comparisonText(result.outputs[group].values)], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "compare-lists-" + groupFiles[group] + ".txt";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-label="List comparison" className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        {(["A", "B"] as const).map((side) => (
          <div key={side} className="min-w-0">
            <label className="block text-sm font-semibold">
              List {side}
              <textarea className={editor} aria-describedby="compare-limits" value={side === "A" ? a : b} onChange={(event) => changeInput(event.target.value, side)} spellCheck={false} />
            </label>
            <label className="mt-2 block text-sm">
              Import TXT into List {side}
              <input className={fileField} type="file" accept=".txt,text/plain" onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) void importFile(file, side);
              }} />
            </label>
          </div>
        ))}
      </div>
      <p id="compare-limits" className="text-sm text-slate-700">Use one item per line. Each list accepts up to 512 KiB of UTF-8 text and 20,000 input lines.</p>
      <fieldset className="grid gap-3 rounded-lg border border-slate-300 p-3 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold">Comparison options</legend>
        <label className="min-w-0 text-sm font-medium">
          Duplicates
          <select className={field} value={options.duplicates} onChange={(event) => changeOption("duplicates", event.target.value === "multiset" ? "multiset" : "set")}>
            <option value="set">One per distinct item (set)</option>
            <option value="multiset">Count repeated items (multiset)</option>
          </select>
        </label>
        <label className="min-w-0 text-sm font-medium">
          Output order
          <select className={field} value={options.order} onChange={(event) => changeOption("order", event.target.value === "sorted" ? "sorted" : "source")}>
            <option value="source">Source order</option>
            <option value="sorted">Sort by comparison text</option>
          </select>
        </label>
        <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={options.ignoreCase} onChange={(event) => changeOption("ignoreCase", event.target.checked)} /> Ignore letter case when matching</label>
        <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={options.trimEdges} onChange={(event) => changeOption("trimEdges", event.target.checked)} /> Ignore whitespace at line edges when matching</label>
        <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={options.ignoreEmpty} onChange={(event) => changeOption("ignoreEmpty", event.target.checked)} /> Ignore empty entries</label>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button + " border-sky-700 text-sky-800"} disabled={busy || loading.A || loading.B} onClick={compare}>Compare lists</button>
        {busy && <button type="button" className={button} onClick={() => { invalidate(); setStatus("Comparison canceled."); }}>Cancel comparison</button>}
        <button type="button" className={button} onClick={() => {
          replaceLists("SKU-12\nSKU-12\nCafé\nEast", "Café\nSKU-12\nWest");
          setOptions(defaultComparisonOptions);
          setStatus("Example loaded. Compare the lists, then try counting repeats.");
        }}>Load example</button>
        <button type="button" className={button} onClick={() => replaceLists("", "")}>Clear lists</button>
      </div>
      <p role="status" className="text-sm text-slate-700">{busy ? "Comparing…" : loading.A || loading.B ? "Reading local file…" : status}</p>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-800">{error}</p>}
      {result && (
        <section aria-labelledby="list-comparison-results" className="space-y-3">
          <h2 id="list-comparison-results" className="text-xl font-semibold">Comparison results</h2>
          <p className="text-sm text-slate-700">
            List A included {result.included.a} and skipped {result.skipped.a}. List B included {result.included.b} and skipped {result.skipped.b}.
          </p>
          <p className="text-sm text-slate-700">Each preview shows up to {comparisonLimits.previewRows} distinct items and abbreviates long entries. Copy and download include the complete result in order.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {comparisonGroups.map((group) => {
              const output = result.outputs[group];
              const label = groupLabels[group];
              return (
                <section key={group} aria-labelledby={"comparison-" + group} className="min-w-0 space-y-2 rounded-lg border border-slate-300 bg-slate-50 p-3">
                  <h3 id={"comparison-" + group} className="font-semibold">{label}</h3>
                  <p className="text-sm text-slate-700">{output.distinct} distinct · {output.values.length} output occurrences</p>
                  {output.preview.length > 0 && (
                    <ul className="max-h-48 space-y-2 overflow-y-auto rounded border border-slate-200 bg-white p-2">
                      {output.preview.map((row) => (
                        <li key={row.key} className="space-y-0.5">
                          <bdi className="block whitespace-pre-wrap [overflow-wrap:anywhere] font-mono text-sm">{previewValue(row.value)}</bdi>
                          <span className="text-xs text-slate-700">A {row.counts.a} · B {row.counts.b} · Output {row.occurrences}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className={button} disabled={!output.values.length} onClick={() => void copy(group)}>Copy {label}</button>
                    <button type="button" className={button} disabled={!output.values.length} onClick={() => download(group)}>Download {label} TXT</button>
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}
