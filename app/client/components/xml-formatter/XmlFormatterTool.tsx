import { useEffect, useRef, useState } from "react";
import { normalizeLineEndings } from "../../text/text-core";
import {
  xmlFormatLimits, type XmlFormatError, type XmlFormatIndent, type XmlFormatOperation, type XmlFormatResponse,
  type XmlFormatResult, type XmlWorkerRequest, type XmlWorkerResponse,
} from "../../text/xml-format-options";

const button = "min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:opacity-50";
const editor = "mt-2 block min-h-64 w-full min-w-0 resize-y rounded-lg border border-slate-400 bg-slate-50 p-3 font-mono text-base focus-visible:outline-2 focus-visible:outline-sky-700";
const actions = [["format", "Format XML"], ["compact", "Compact XML"], ["validate", "Validate XML"]] as const;
const example = '<?xml version="1.0" encoding="UTF-8"?><catalog region="Montréal" lang="fr"><item id="3"/><note>Read <b>this</b> first.</note></catalog>';

export function XmlFormatterTool() {
  const [source, setSource] = useState("");
  const [indent, setIndent] = useState<XmlFormatIndent>("two");
  const [reindentContent, setReindentContent] = useState(false);
  const [result, setResult] = useState<XmlFormatResult | null>(null);
  const [error, setError] = useState<XmlFormatError | null>(null);
  const [pending, setPending] = useState<"format" | "file" | null>(null);
  const [status, setStatus] = useState("");
  const revision = useRef(0);
  const worker = useRef<Worker | null>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const output = result?.output ?? "";
  const preview = output.length <= xmlFormatLimits.preview
    ? output : output.slice(0, xmlFormatLimits.preview).replace(/[\uD800-\uDBFF]$/, "");

  useEffect(() => () => {
    revision.current++;
    worker.current?.terminate();
    worker.current = null;
  }, []);

  function invalidate() {
    revision.current++;
    worker.current?.terminate();
    worker.current = null;
    setResult(null);
    setError(null);
    setPending(null);
    setStatus("");
    return revision.current;
  }

  function changeSource(value: string) {
    invalidate();
    if (value.length > xmlFormatLimits.inputBytes) {
      setError({ message: "The input exceeds 512 KiB. Your previous source was kept." });
    } else setSource(value);
  }

  function run(operation: XmlFormatOperation) {
    const current = invalidate();
    function finish(response: XmlFormatResponse) {
      if (current !== revision.current) return;
      worker.current?.terminate();
      worker.current = null;
      setPending(null);
      if ("error" in response) setError(response.error);
      else {
        setResult(response.result);
        setStatus(operation === "validate" ? "Well-formed XML." : "XML result ready.");
      }
    }
    const failed = { error: { message: "The XML formatter could not start. Try again." } };
    setPending("format");
    try {
      const task = new Worker(new URL("../../text/xml-formatter.worker.ts", import.meta.url), { type: "module" });
      worker.current = task;
      const native = import("../../text/xml-formatter-native").catch(() => null);
      task.onmessage = async ({ data }: MessageEvent<XmlWorkerResponse>) => {
        if (current !== revision.current) return;
        if (data.kind === "result") {
          finish(data.response);
          return;
        }
        // The worker checks the input caps and rejects external declarations
        // before allowing the native parser to see the source.
        const module = await native;
        if (current !== revision.current) return;
        if (!module) {
          finish({ error: { message: "The XML parser could not load. Copy your source before reloading the page." } });
          return;
        }
        const response = module.validateXmlDocument(source, data.bom, data.shape);
        if ("error" in response) finish(response);
        else task.postMessage({ kind: "finish", metadata: response.metadata } satisfies XmlWorkerRequest);
      };
      task.onerror = (event) => {
        event.preventDefault();
        finish(failed);
      };
      task.onmessageerror = () => finish(failed);
      task.postMessage({ kind: "start", source, options: { operation, indent, reindentContent } } satisfies XmlWorkerRequest);
    } catch {
      finish(failed);
    }
  }

  async function importFile(file: File) {
    const current = invalidate();
    if (file.size > xmlFormatLimits.inputBytes) {
      setError({ message: "Choose a UTF-8 file up to 512 KiB. Your previous source was kept." });
      return;
    }
    setPending("file");
    try {
      const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
      if (current !== revision.current) return;
      setSource(text);
      setStatus("Local XML file loaded.");
    } catch {
      if (current === revision.current) setError({ message: "Could not read this file as UTF-8. Your previous source was kept." });
    } finally {
      if (current === revision.current) setPending(null);
    }
  }

  function goToError() {
    if (!error?.position || !sourceRef.current) return;
    const offset = normalizeLineEndings(source.slice(0, error.position.offset)).length;
    sourceRef.current.focus();
    sourceRef.current.setSelectionRange(offset, offset);
  }

  async function copy() {
    if (result?.output == null) return;
    const current = revision.current;
    try {
      await navigator.clipboard.writeText(result.output);
      if (current === revision.current) setStatus("XML copied.");
    } catch {
      if (current === revision.current) setStatus("Automatic copy was unavailable. Download the XML to keep the complete result.");
    }
  }

  function download() {
    if (result?.output == null) return;
    const url = URL.createObjectURL(new Blob([result.output], { type: "application/xml;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.xml";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-label="XML workspace" className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <label className="block text-sm font-semibold">
            XML source
            <textarea ref={sourceRef} className={editor} value={source} onChange={(event) => changeSource(event.target.value)}
              aria-describedby="xml-formatter-limits" spellCheck={false} wrap="off" />
          </label>
          <label className="block text-sm">
            Import XML file
            <input className="mt-2 block w-full min-w-0 text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-2 file:py-2 focus-visible:outline-2 focus-visible:outline-sky-700"
              type="file" accept=".xml,.txt,text/xml,application/xml,text/plain" onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) void importFile(file);
              }} />
          </label>
        </div>
        <div className="min-w-0 space-y-2">
          <label className="block text-sm font-semibold">
            XML output
            <textarea className={editor} readOnly value={preview}
              placeholder="Format or compact XML to create an output." spellCheck={false} wrap="off" />
          </label>
          {result?.output != null && (
            <div className="space-y-2">
              {output.length > xmlFormatLimits.preview && <p className="text-sm text-slate-700">The editor shows a preview. Copy and download use the complete output.</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" className={button} onClick={() => void copy()}>Copy XML</button>
                <button type="button" className={button} onClick={download}>Download XML</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p id="xml-formatter-limits" className="text-sm text-slate-700">XML 1.0, up to 512 KiB UTF-8, 128 levels, and 30,000 text or markup tokens.</p>
      <fieldset className="flex flex-wrap items-start gap-4 rounded-lg border border-slate-300 p-3">
        <legend className="px-1 text-sm font-semibold">Formatting options</legend>
        <label className="grid gap-1 text-sm font-medium">
          Indentation
          <select className="min-h-11 rounded-lg border border-slate-400 bg-white px-2 text-sm focus-visible:outline-2 focus-visible:outline-sky-700"
            value={indent} disabled={pending === "file"} onChange={(event) => {
              invalidate();
              setIndent(event.target.value as XmlFormatIndent);
            }}>
            <option value="two">2 spaces</option>
            <option value="four">4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </label>
        <div className="max-w-xl space-y-1">
          <label className="flex items-start gap-2 text-sm font-medium">
            <input className="mt-1" type="checkbox" aria-describedby="xml-content-warning" checked={reindentContent} disabled={pending === "file"}
              onChange={(event) => { invalidate(); setReindentContent(event.target.checked); }} />
            Reindent element-only content
          </label>
          <p id="xml-content-warning" className="text-sm text-slate-700">This option can add or remove whitespace text nodes between child elements. Mixed content and preserved sections stay intact.</p>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-2">
        {actions.map(([operation, label]) => <button key={operation} type="button"
          className={operation === "format" ? button + " border-sky-700 text-sky-800" : button}
          disabled={pending !== null} onClick={() => run(operation)}>{label}</button>)}
        {pending === "format" && <button type="button" className={button} onClick={() => {
          invalidate();
          setStatus("Formatting canceled.");
          sourceRef.current?.focus();
        }}>Cancel</button>}
        <button type="button" className={button} onClick={() => { changeSource(example); setStatus("Example loaded."); }}>Load example</button>
        <button type="button" className={button} onClick={() => changeSource("")}>Clear</button>
      </div>

      <p role="status" className="text-sm text-slate-700">{pending === "format" ? "Checking XML…" : pending === "file" ? "Reading local file…" : status}</p>
      {error && <div className="space-y-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
        <p role="alert">{error.position && <>Line {error.position.line}, column {error.position.column}. </>}{error.message}</p>
        {error.position && <button type="button" className={button} onClick={goToError}>Go to error</button>}
      </div>}
      {result && <section aria-labelledby="xml-structure-title" className="space-y-2 rounded-lg border border-slate-300 bg-slate-50 p-3">
        <h2 id="xml-structure-title" className="font-semibold">XML structure</h2>
        <p className="text-sm text-slate-700">
          {result.elements.toLocaleString()} elements. Maximum depth {result.depth}. {result.protectedSections.toLocaleString()} sections with character data or a whitespace preservation flag.
        </p>
        <p className="text-sm text-slate-700">
          Input {result.sourceBytes.toLocaleString()} UTF-8 bytes.
          {result.outputBytes !== null && <> Output {result.outputBytes.toLocaleString()} UTF-8 bytes.</>}
        </p>
      </section>}
    </section>
  );
}
