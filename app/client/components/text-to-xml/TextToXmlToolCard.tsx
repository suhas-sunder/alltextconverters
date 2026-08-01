import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { getDefaultTextToXmlOptions, textToXml, type TextToXmlOptions } from "./textToXmlTransforms";

export function TextToXmlToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState<TextToXmlOptions>(() => getDefaultTextToXmlOptions());
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setError(null); setStatus(null); };

  function convert() {
    clearResult();
    if (!input) return setError("Enter text to convert.");
    const sizeError = blockedByInputSize(input);
    if (sizeError) return setError(sizeError);
    const result = textToXml(input, options);
    if (!result.ok) return setError(result.error);
    setOutput(result.xml);
    setStatus(`Conversion complete: generated valid XML with ${result.stats.emittedItems} item${result.stats.emittedItems === 1 ? "" : "s"}.`);
  }

  return <ConverterCard
    idPrefix="text-to-xml" title="Text to XML Converter"
    description="Generate simple XML with validated element names, escaped content, rejected XML control characters, and a parse check before success."
    input={input} output={output} inputLabel="Plain-text input" outputLabel="Generated XML"
    onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert}
    onClear={() => { setInput(""); clearResult(); }}
    onLoadExample={() => { setInput("Alpha & beta\nCafé\n😀"); clearResult(); }}
    onResetSettings={() => { setOptions(getDefaultTextToXmlOptions()); clearResult(); }}
    convertLabel="Convert" error={error} status={status}
    download={{ filename: "converted-text.xml", mime: "application/xml;charset=utf-8", label: "Download XML" }}
    settings={<div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">{([['single', 'Entire text in root'], ['lines', 'One child per line'], ['paragraphs', 'One child per paragraph']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="text-xml-mode" checked={options.mode === value} onChange={() => { setOptions((current) => ({ ...current, mode: value })); clearResult(); }} className="h-5 w-5" />{label}</label>)}</div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Root element name<input value={options.rootTag} onChange={(event) => { setOptions((current) => ({ ...current, rootTag: event.target.value })); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label>{options.mode !== "single" ? <label className="text-sm font-semibold">Child element name<input value={options.itemTag} onChange={(event) => { setOptions((current) => ({ ...current, itemTag: event.target.value })); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label> : null}</div>
      <div className="grid gap-2 sm:grid-cols-3"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={options.includeDeclaration} onChange={(event) => { setOptions((current) => ({ ...current, includeDeclaration: event.target.checked })); clearResult(); }} className="h-5 w-5" />Include XML declaration</label>{options.mode !== "single" ? <><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={options.preserveBlankLines} onChange={(event) => { setOptions((current) => ({ ...current, preserveBlankLines: event.target.checked })); clearResult(); }} className="h-5 w-5" />Preserve blank records</label><label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={options.addIndexAttribute} onChange={(event) => { setOptions((current) => ({ ...current, addIndexAttribute: event.target.checked })); clearResult(); }} className="h-5 w-5" />Add numeric index attribute</label></> : null}</div>
    </div>}
    relatedTools={[{ href: "/xml-to-text", label: "XML to Text" }, { href: "/json-to-text", label: "JSON to Text" }, { href: "/text-to-json", label: "Text to JSON" }, { href: "/remove-all-styling-from-text", label: "Plain Text Converter" }]}
  />;
}
