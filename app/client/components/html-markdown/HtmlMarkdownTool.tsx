import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent } from "react";
import { contentByteLimit, type ContentDirection } from "../../text/html-markdown-model";

const editor = "w-full rounded-lg border border-slate-400 bg-white p-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-sky-700";
const action = "min-h-11 rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-sky-700 disabled:opacity-50";
const previewPolicy = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">';
const previewStyles = "<style>body{font-family:system-ui;margin:1rem;overflow-wrap:anywhere}pre{white-space:pre-wrap}table{border-collapse:collapse}th,td{border:1px solid #a3aab3;padding:.35rem;text-align:left}</style>";
type Conversion = { output: string; preview: string; notes: string[] };

export function HtmlMarkdownTool() {
  const [direction, setDirection] = useState<ContentDirection>("html-to-markdown");
  const [source, setSource] = useState("");
  const [result, setResult] = useState<Conversion | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [richPaste, setRichPaste] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const revision = useRef(0);
  const output = useRef<HTMLTextAreaElement>(null);
  const htmlInput = direction === "html-to-markdown";

  useEffect(() => () => { revision.current++; }, []);

  function invalidate() {
    revision.current++;
    setBusy(false);
    setResult(null);
    setShowPreview(false);
    setStatus("");
    setError("");
  }

  function edit(value: string) {
    invalidate();
    setSource(value);
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    invalidate();
    const current = revision.current;
    if (file.size > contentByteLimit) {
      setError("Use a UTF-8 file of at most 128 KiB.");
      return;
    }
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
      if (current === revision.current) {
        edit(text);
        setStatus("UTF-8 source loaded.");
      }
    } catch {
      if (current === revision.current) setError("The file could not be read as valid UTF-8.");
    }
  }

  function paste(event: ClipboardEvent<HTMLTextAreaElement>) {
    if (!htmlInput || !richPaste) return;
    const html = event.clipboardData.getData("text/html");
    if (!html) return;
    event.preventDefault();
    const textarea = event.currentTarget;
    const { value, selectionStart, selectionEnd } = textarea;
    const inserted = html.replace(/\r\n?/g, "\n");
    edit(value.slice(0, selectionStart) + inserted + value.slice(selectionEnd));
    requestAnimationFrame(() => textarea.setSelectionRange(selectionStart + inserted.length, selectionStart + inserted.length));
    setStatus("Formatted clipboard HTML inserted.");
  }

  async function convert() {
    invalidate();
    const current = revision.current;
    setBusy(true);
    setStatus("Converting…");
    try {
      const { convertRichText } = await import("../../text/html-markdown");
      if (current !== revision.current) return;
      setResult(convertRichText(source, direction, document));
      setStatus("Conversion complete.");
    } catch (failure) {
      if (current === revision.current) {
        setStatus("");
        setError(failure instanceof Error ? failure.message : "Conversion could not run.");
      }
    } finally {
      if (current === revision.current) setBusy(false);
    }
  }

  async function copy() {
    if (!result) return;
    const current = revision.current;
    try {
      await navigator.clipboard.writeText(result.output);
      if (current === revision.current) setStatus("Output copied.");
    } catch {
      if (current === revision.current) {
        output.current?.focus();
        output.current?.select();
        setStatus("Clipboard access is unavailable. The output is selected for manual copy.");
      }
    }
  }

  function download(textOnly: boolean) {
    if (!result) return;
    const extension = textOnly ? "txt" : htmlInput ? "md" : "html";
    const mime = extension === "html" ? "text/html" : extension === "md" ? "text/markdown" : "text/plain";
    const url = URL.createObjectURL(new Blob([result.output], { type: mime + ";charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "converted-content." + extension;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <section className="min-w-0 space-y-4 rounded-xl border border-slate-300 bg-white p-4 sm:p-6" aria-label="Content conversion workspace">
    <div className="space-y-1">
      <label htmlFor="rich-text-direction" className="block font-semibold">Conversion direction</label>
      <select id="rich-text-direction" className={editor} value={direction} onChange={event => {
        invalidate();
        setDirection(event.target.value as ContentDirection);
      }}>
        <option value="html-to-markdown">HTML to Markdown</option>
        <option value="markdown-to-html">Markdown to HTML</option>
      </select>
    </div>
    {htmlInput && <label className="flex min-h-11 items-center gap-2">
      <input type="checkbox" checked={richPaste} onChange={event => setRichPaste(event.target.checked)} />
      Prefer formatted HTML when pasting
    </label>}
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <div className="min-w-0 space-y-1">
        <label className="block font-semibold" htmlFor="rich-text-source">{htmlInput ? "HTML source" : "Markdown source"}</label>
        <textarea id="rich-text-source" className={editor} rows={10} spellCheck={false} value={source} onChange={event => edit(event.target.value)} onPaste={paste} />
      </div>
      <div className="min-w-0 space-y-1">
        <label className="block font-semibold" htmlFor="rich-text-output">{htmlInput ? "Markdown output" : "HTML output"}</label>
        <textarea id="rich-text-output" ref={output} className={editor} rows={10} spellCheck={false} readOnly value={result?.output ?? ""} />
      </div>
    </div>
    <label className="block space-y-1 text-sm">
      <span className="block font-semibold">Or load a UTF-8 file</span>
      <input type="file" className="block min-h-11 w-full rounded border border-slate-400 p-2" onChange={event => void loadFile(event)} />
    </label>
    <div className="flex flex-wrap gap-2">
      <button className={action} type="button" disabled={busy} onClick={() => void convert()}>Convert content</button>
      <button className={action} type="button" onClick={() => edit(htmlInput
        ? '<h2>Project notes</h2>\n<p>Read the <a href="https://example.com/guide">guide</a>.</p>\n<ol><li>Prepare the file<ul><li>Check encoding</li></ul></li></ol>'
        : "## Project notes\n\nRead the [guide](https://example.com/guide).\n\n1. Prepare the file\n   - Check encoding")}>Fill example</button>
      {result && <>
        <button className={action} type="button" onClick={() => void copy()}>Copy output</button>
        <button className={action} type="button" onClick={() => download(false)}>Download {htmlInput ? "MD" : "HTML"}</button>
        <button className={action} type="button" onClick={() => download(true)}>Download TXT</button>
        <button className={action} type="button" aria-expanded={showPreview} aria-controls={showPreview ? "rich-text-preview" : undefined} onClick={() => setShowPreview(!showPreview)}>{showPreview ? "Hide preview" : "Show safe preview"}</button>
      </>}
    </div>
    <p role="status" className="text-sm text-slate-700">{status}</p>
    {error && <p role="alert" className="text-red-800">{error}</p>}
    {result && result.notes.length > 0 && <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
      {result.notes.map(note => <li key={note}>{note}</li>)}
    </ul>}
    {showPreview && result && <iframe id="rich-text-preview" sandbox="" title="Safe content preview" className="h-80 w-full rounded-lg border border-slate-300" srcDoc={'<!doctype html><html lang="en"><head><meta charset="utf-8">' + previewPolicy + previewStyles + "</head><body>" + result.preview + "</body></html>"} />}
  </section>;
}
