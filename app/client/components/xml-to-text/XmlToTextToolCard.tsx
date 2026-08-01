import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { xmlToText, type XmlExtractionMode } from "./xmlToTextTransforms";

export function XmlToTextToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<XmlExtractionMode>("all");
  const [elementName, setElementName] = useState("item");
  const [attributeName, setAttributeName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setError(null); setStatus(null); };

  function convert() {
    clearResult();
    const sizeError = blockedByInputSize(input);
    if (sizeError) return setError(sizeError);
    const result = xmlToText(input, { mode, elementName, attributeName });
    if (!result.ok) return setError(result.error);
    setOutput(result.text);
    setStatus(`Extraction complete: ${result.matches} matching block${result.matches === 1 ? "" : "s"}, ${result.textNodes} text node${result.textNodes === 1 ? "" : "s"}.`);
  }

  return <ConverterCard
    idPrefix="xml-to-text" title="XML to Text Converter"
    description="Parse XML locally and extract text without resolving DTDs or entities. Unprefixed element and attribute controls match case-sensitive local names; prefixed controls match qualified names."
    input={input} output={output} inputLabel="XML input" outputLabel="Extracted text"
    inputPlaceholder={'<catalog><item id="a1">First</item><item id="a2">Second</item></catalog>'}
    onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert}
    onClear={() => { setInput(""); clearResult(); }}
    onLoadExample={() => { setInput('<catalog xmlns:p="urn:products"><p:item id="a1">Café</p:item><p:item>😀</p:item><empty /></catalog>'); clearResult(); }}
    onResetSettings={() => { setMode("all"); setElementName("item"); setAttributeName(""); clearResult(); }}
    convertLabel="Convert" error={error} status={status}
    download={{ filename: "xml-to-text.txt", mime: "text/plain;charset=utf-8", label: "Download TXT" }}
    settings={<div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">{([['all', 'Extract all text'], ['selected', 'One line per selected element'], ['boundaries', 'Preserve element boundaries']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="xml-extraction-mode" checked={mode === value} onChange={() => { setMode(value); clearResult(); }} className="h-5 w-5" />{label}</label>)}</div>
      {mode === "selected" ? <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Selected element name<input value={elementName} onChange={(event) => { setElementName(event.target.value); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label><label className="text-sm font-semibold">Selected attribute (optional)<input value={attributeName} onChange={(event) => { setAttributeName(event.target.value); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label></div> : null}
      <p className="text-xs text-slate-600">Attribute output uses <code>[name=value] text</code>; a missing attribute is shown as <code>(missing)</code>. XPath is not supported.</p>
    </div>}
    relatedTools={[{ href: "/text-to-xml", label: "Text to XML" }, { href: "/json-to-text", label: "JSON to Text" }, { href: "/text-to-json", label: "Text to JSON" }, { href: "/remove-all-styling-from-text", label: "Plain Text Converter" }]}
  />;
}
