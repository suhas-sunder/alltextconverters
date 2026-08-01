import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { DEFAULT_HTML_TO_TEXT_OPTIONS, htmlToText, type HtmlToTextOptions } from "./htmlToTextTransforms";

export function HtmlToTextToolCard({ htmlInput, setHtmlInput }: { htmlInput: string; setHtmlInput: (value: string) => void }) {
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState<HtmlToTextOptions>({ ...DEFAULT_HTML_TO_TEXT_OPTIONS });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setError(null); setStatus(null); };
  const updateOption = (name: keyof HtmlToTextOptions, checked: boolean) => setOptions((current) => ({ ...current, [name]: checked }));

  function convert() {
    clearResult();
    if (!htmlInput.trim()) return setError("Paste HTML to convert.");
    const sizeError = blockedByInputSize(htmlInput);
    if (sizeError) return setError(sizeError);
    try {
      const result = htmlToText(htmlInput, options);
      setOutput(result.text);
      setStatus(`Conversion complete: ${result.stats.outputLength} text characters; ${result.stats.strippedNodes} unsafe or non-content elements ignored.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "HTML could not be converted.");
    }
  }

  return <ConverterCard
    idPrefix="html-to-text" title="HTML to Text Converter"
    description="Extract readable text from inert HTML while preserving useful paragraphs, lists, and tables. Scripts, frames, remote resources, and unsafe link schemes are ignored."
    input={htmlInput} output={output} inputLabel="HTML input" outputLabel="Plain-text output"
    inputPlaceholder={'<article><h2>Example</h2><p>Hello <strong>world</strong>.</p></article>'}
    onInputChange={(value) => { setHtmlInput(value); clearResult(); }} onConvert={convert}
    onClear={() => { setHtmlInput(""); clearResult(); }}
    onLoadExample={() => { setHtmlInput('<article><h2>Release notes</h2><p>Safe <a href="https://example.com/docs">documentation</a>.</p><ul><li>Fast</li><li>Local</li></ul><script>alert(1)</script></article>'); clearResult(); }}
    onResetSettings={() => { setOptions({ ...DEFAULT_HTML_TO_TEXT_OPTIONS }); clearResult(); }}
    convertLabel="Convert" error={error} status={status}
    download={{ filename: "html-to-text.txt", mime: "text/plain;charset=utf-8", label: "Download TXT" }}
    settings={<div className="grid gap-3 sm:grid-cols-2">
      {([
        ["preserveParagraphs", "Preserve paragraph breaks"],
        ["preserveListMarkers", "Preserve list markers"],
        ["preserveTableStructure", "Preserve table structure"],
        ["appendLinkUrls", "Append safe link URLs"],
        ["collapseBlankLines", "Collapse repeated blank lines"],
      ] as const).map(([name, label]) => <label key={name} className="flex min-h-11 items-center gap-3 text-sm text-slate-800"><input type="checkbox" checked={options[name]} onChange={(event) => updateOption(name, event.target.checked)} className="h-5 w-5" />{label}</label>)}
    </div>}
    relatedTools={[
      { href: "/text-to-html", label: "Text to HTML" }, { href: "/remove-all-styling-from-text", label: "Plain Text Converter" },
      { href: "/line-break-remover", label: "Line Break Remover" }, { href: "/character-counter", label: "Character Counter" },
    ]}
  />;
}
