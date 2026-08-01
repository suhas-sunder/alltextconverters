import { useState, type ReactNode } from "react";
import { assessInputSize, formatByteCount } from "../../text/input-size";

export type RelatedTool = { href: string; label: string };

type ConverterCardProps = {
  idPrefix: string;
  title: string;
  description: string;
  input: string;
  output: string;
  inputLabel: string;
  outputLabel: string;
  inputPlaceholder?: string;
  onInputChange: (value: string) => void;
  onConvert: () => void;
  onClear: () => void;
  onLoadExample: () => void;
  onResetSettings: () => void;
  convertLabel: string;
  settings?: ReactNode;
  error: string | null;
  status: string | null;
  warning?: string | null;
  details?: ReactNode;
  relatedTools: RelatedTool[];
  download?: { filename: string; mime: string; label: string };
  previewHtml?: string | null;
};

const buttonClass = "min-h-11 rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass = "min-h-11 rounded-xl px-5 py-2 text-sm font-bold bg-sky-600 text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2";

function downloadOutput(output: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([output], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ConverterCard(props: ConverterCardProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const size = assessInputSize(props.input);
  const inputDescriptionId = `${props.idPrefix}-input-description`;

  async function copyCurrentOutput() {
    try {
      await navigator.clipboard.writeText(props.output);
      setCopyStatus(`${props.outputLabel} copied.`);
    } catch {
      setCopyStatus("Copy failed. Select the output and copy it manually.");
    }
  }

  return (
    <article id={`${props.idPrefix}-tool`} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-7">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{props.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{props.description}</p>
        <p className="mt-2 text-xs font-medium text-emerald-700">Conversion runs only in this browser. Input and output are not uploaded.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor={`${props.idPrefix}-input`} className="block text-sm font-bold text-slate-800">{props.inputLabel}</label>
          <textarea
            id={`${props.idPrefix}-input`}
            value={props.input}
            onChange={(event) => props.onInputChange(event.target.value)}
            placeholder={props.inputPlaceholder}
            aria-describedby={inputDescriptionId}
            className="mt-2 min-h-64 w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          />
          <p id={inputDescriptionId} className={`mt-2 text-xs ${size.level === "blocked" ? "font-semibold text-red-700" : "text-slate-600"}`}>
            Input size: {formatByteCount(size.bytes)}. {size.message}
          </p>
        </div>

        <div>
          <label htmlFor={`${props.idPrefix}-output`} className="block text-sm font-bold text-slate-800">{props.outputLabel}</label>
          <textarea
            id={`${props.idPrefix}-output`}
            value={props.output}
            readOnly
            className="mt-2 min-h-64 w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-4 font-mono text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          />
        </div>
      </div>

      {props.settings ? <fieldset className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <legend className="px-2 text-sm font-bold text-slate-900">Settings</legend>
        {props.settings}
      </fieldset> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={props.onConvert} className={primaryButtonClass}>{props.convertLabel}</button>
        <button type="button" onClick={() => void copyCurrentOutput()} disabled={!props.output} className={buttonClass}>Copy</button>
        {props.download ? (
          <button type="button" onClick={() => downloadOutput(props.output, props.download!.filename, props.download!.mime)} disabled={!props.output} className={buttonClass}>
            {props.download.label}
          </button>
        ) : null}
        <button type="button" onClick={props.onClear} className={buttonClass}>Clear</button>
        <button type="button" onClick={props.onLoadExample} className={buttonClass}>Load example</button>
        <button type="button" onClick={props.onResetSettings} className={buttonClass}>Reset settings</button>
      </div>

      <div className="mt-4 min-h-6">
        {props.error ? <p role="alert" className="font-semibold text-red-700">Error: {props.error}</p> : null}
        {props.warning ? <p className="font-semibold text-amber-800">Warning: {props.warning}</p> : null}
        <p role="status" aria-live="polite" aria-atomic="true" className="text-sm font-medium text-emerald-700">
          {copyStatus ?? props.status ?? ""}
        </p>
      </div>

      {props.details}
      {props.previewHtml ? (
        <section className="mt-5 rounded-2xl border border-slate-200 p-4" aria-labelledby={`${props.idPrefix}-preview-title`}>
          <h2 id={`${props.idPrefix}-preview-title`} className="text-sm font-bold text-slate-900">Generated HTML preview</h2>
          <div className="prose mt-3 max-w-none" dangerouslySetInnerHTML={{ __html: props.previewHtml }} />
        </section>
      ) : null}

      <nav className="mt-6 border-t border-slate-200 pt-4" aria-label={`Related tools for ${props.title}`}>
        <p className="text-sm font-bold text-slate-800">Related tools</p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {props.relatedTools.map((tool) => <li key={tool.href}><a className="font-semibold text-sky-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" href={tool.href}>{tool.label}</a></li>)}
        </ul>
      </nav>
    </article>
  );
}

export function blockedByInputSize(input: string): string | null {
  const size = assessInputSize(input);
  return size.level === "blocked" ? size.message : null;
}
