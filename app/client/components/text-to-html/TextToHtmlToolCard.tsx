import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { DEFAULT_TEXT_TO_HTML_OPTIONS, textToHtml, type TextToHtmlOptions } from "./textToHtmlTransforms";

export function TextToHtmlToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState("");
  const [preview, setPreview] = useState("");
  const [options, setOptions] = useState<Required<TextToHtmlOptions>>({ ...DEFAULT_TEXT_TO_HTML_OPTIONS });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setPreview(""); setError(null); setStatus(null); };

  function convert() {
    clearResult();
    if (!input) return setError("Enter text to convert.");
    const sizeError = blockedByInputSize(input);
    if (sizeError) return setError(sizeError);
    const html = textToHtml(input, options);
    setOutput(html);
    setPreview(textToHtml(input, { ...options, fullDocument: false }));
    setStatus(`Conversion complete: generated ${options.fullDocument ? "a full HTML document" : "an HTML fragment"}.`);
  }

  const modeLabels = { paragraphs: "Paragraphs", br: "Line breaks (<br>)", pre: "Preformatted (<pre>)", "unordered-list": "Unordered list", "ordered-list": "Ordered list" } as const;
  return <ConverterCard
    idPrefix="text-to-html" title="Text to HTML Converter"
    description="Generate escaped HTML from plain text. Typed tags remain literal text, and the preview renders only the generated output."
    input={input} output={output} inputLabel="Plain-text input" outputLabel="Generated HTML"
    onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert}
    onClear={() => { setInput(""); clearResult(); }}
    onLoadExample={() => { setInput("First paragraph\nwith a second line.\n\n<script>alert('literal')</script>\n\nFinal paragraph."); clearResult(); }}
    onResetSettings={() => { setOptions({ ...DEFAULT_TEXT_TO_HTML_OPTIONS }); clearResult(); }}
    convertLabel="Convert" error={error} status={status} previewHtml={preview || null}
    download={{ filename: "converted-text.html", mime: "text/html;charset=utf-8", label: "Download HTML" }}
    settings={<div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">{Object.entries(modeLabels).map(([mode, label]) => <label key={mode} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="text-html-mode" value={mode} checked={options.mode === mode} onChange={() => { setOptions((current) => ({ ...current, mode: mode as typeof options.mode })); clearResult(); }} className="h-5 w-5" />{label}</label>)}</div>
      {options.mode === "paragraphs" ? <div><span className="text-sm font-bold">Lines inside a paragraph</span><div className="mt-1 flex flex-wrap gap-4">{([['br', 'Use <br>'], ['space', 'Join with spaces'], ['preserve', 'Preserve newline text']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="paragraph-lines" checked={options.paragraphLineMode === value} onChange={() => { setOptions((current) => ({ ...current, paragraphLineMode: value })); clearResult(); }} />{label}</label>)}</div></div> : null}
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={options.fullDocument} onChange={(event) => { setOptions((current) => ({ ...current, fullDocument: event.target.checked })); clearResult(); }} className="h-5 w-5" />Full-document wrapper</label>
      {options.fullDocument ? <label className="block text-sm font-semibold">Document title<input value={options.title} onChange={(event) => { setOptions((current) => ({ ...current, title: event.target.value })); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label> : null}
    </div>}
    relatedTools={[{ href: "/html-to-text", label: "HTML to Text" }, { href: "/remove-all-styling-from-text", label: "Plain Text Converter" }, { href: "/line-break-remover", label: "Line Break Remover" }, { href: "/character-counter", label: "Character Counter" }]}
  />;
}
