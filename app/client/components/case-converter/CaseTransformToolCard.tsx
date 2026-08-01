import { useState, type ReactNode } from "react";
import { applyCaseTransform, toAlternatingCase, type AlternatingStart, type AlternatingUnit, type CaseMode } from "../../text/case";
import { getTextMetrics } from "../../text/metrics";
import { ConverterCard, blockedByInputSize, type RelatedTool } from "../converter/ConverterCard";

const MODE_LABELS: Record<CaseMode, string> = {
  uppercase: "UPPERCASE",
  lowercase: "lowercase",
  title: "Title Case",
  sentence: "Sentence case",
  alternating: "aLtErNaTiNg cAsE",
};

type Props = {
  input: string;
  setInput: (value: string) => void;
  idPrefix: string;
  title: string;
  description: string;
  example: string;
  relatedTools: RelatedTool[];
  fixedMode?: CaseMode;
  showStatistics?: boolean;
};

export function CaseTransformToolCard(props: Props) {
  const defaultMode = props.fixedMode ?? "uppercase";
  const [mode, setMode] = useState<CaseMode>(defaultMode);
  const [start, setStart] = useState<AlternatingStart>("lowercase");
  const [unit, setUnit] = useState<AlternatingUnit>("letters");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const clearResult = () => { setOutput(""); setError(null); setStatus(null); };
  const changeInput = (value: string) => { props.setInput(value); clearResult(); };
  const convert = () => {
    clearResult();
    const sizeError = blockedByInputSize(props.input);
    if (sizeError) return setError(sizeError);
    const result = mode === "alternating" ? toAlternatingCase(props.input, { start, unit }) : applyCaseTransform(props.input, mode);
    setOutput(result);
    setStatus(`Conversion complete: ${MODE_LABELS[mode]}.`);
  };
  const reset = () => { setMode(defaultMode); setStart("lowercase"); setUnit("letters"); clearResult(); };
  const metrics = getTextMetrics(props.input);

  let settings: ReactNode = null;
  if (!props.fixedMode || mode === "alternating") {
    settings = <div className="grid gap-4 sm:grid-cols-2">
      {!props.fixedMode ? <label className="text-sm font-semibold text-slate-800">Transformation
        <select aria-label="Transformation" value={mode} onChange={(event) => { setMode(event.target.value as CaseMode); clearResult(); }} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
          {(Object.keys(MODE_LABELS) as CaseMode[]).map((value) => <option key={value} value={value}>{MODE_LABELS[value]}</option>)}
        </select>
      </label> : null}
      {mode === "alternating" ? <>
        <label className="text-sm font-semibold text-slate-800">Starting case
          <select aria-label="Starting case" value={start} onChange={(event) => { setStart(event.target.value as AlternatingStart); clearResult(); }} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"><option value="lowercase">Lowercase</option><option value="uppercase">Uppercase</option></select>
        </label>
        <label className="text-sm font-semibold text-slate-800">Alternation unit
          <select aria-label="Alternation unit" value={unit} onChange={(event) => { setUnit(event.target.value as AlternatingUnit); clearResult(); }} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"><option value="letters">Cased letters only</option><option value="graphemes">Every visible grapheme</option></select>
        </label>
      </> : null}
    </div>;
  }

  const details = props.showStatistics ? <section className="mt-5" aria-labelledby={`${props.idPrefix}-statistics`}><h2 id={`${props.idPrefix}-statistics`} className="text-sm font-bold text-slate-900">Input statistics</h2><div className="mt-2 grid grid-cols-3 gap-3">{[["Characters", metrics.graphemes], ["Words", metrics.words], ["Lines", metrics.lines]].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"><div className="text-xs text-slate-600">{label}</div><div className="text-xl font-bold">{Number(value).toLocaleString()}</div></div>)}</div></section> : null;

  return <ConverterCard idPrefix={props.idPrefix} title={props.title} description={props.description} input={props.input} output={output} inputLabel="Source text" outputLabel="Converted text" inputPlaceholder="Type or paste text here…" onInputChange={changeInput} onConvert={convert} onClear={() => changeInput("")} onLoadExample={() => changeInput(props.example)} onResetSettings={reset} convertLabel="Convert" settings={settings} error={error} status={status} details={details} relatedTools={props.relatedTools} download={{ filename: `${props.idPrefix}.txt`, mime: "text/plain;charset=utf-8", label: "Download TXT" }} />;
}
