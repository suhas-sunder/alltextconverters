import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { encodeUrlText, type UrlEncodingMode } from "./urlEncodeTransforms";

export function UrlEncodeToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<UrlEncodingMode>("component");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setError(null); setStatus(null); };
  function convert() {
    clearResult();
    if (!input) return setError("Enter text to encode.");
    const sizeError = blockedByInputSize(input);
    if (sizeError) return setError(sizeError);
    const result = encodeUrlText(input, mode);
    if (!result.ok) return setError(result.error);
    setOutput(result.value);
    setStatus(`Encoding complete in ${mode === "component" ? "URL component" : "form value"} mode.`);
  }
  return <ConverterCard idPrefix="url-encode" title="URL Encode" description="Percent-encode a URL component, or encode a form value where spaces become +. This tool does not parse or navigate to full URLs."
    input={input} output={output} inputLabel="Text to encode" outputLabel="Encoded text"
    onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert}
    onClear={() => { setInput(""); clearResult(); }} onLoadExample={() => { setInput("café + tea & cake?/😀"); clearResult(); }}
    onResetSettings={() => { setMode("component"); clearResult(); }} convertLabel="Encode" error={error} status={status}
    download={{ filename: "url-encoded-text.txt", mime: "text/plain;charset=utf-8", label: "Download TXT" }}
    settings={<div className="space-y-3"><div className="grid gap-2 sm:grid-cols-2">{([['component', 'URL component mode'], ['form', 'Form value mode']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="url-encode-mode" checked={mode === value} onChange={() => { setMode(value); clearResult(); }} className="h-5 w-5" />{label}</label>)}</div><p className="text-xs text-slate-600">Component: space → <code>%20</code>. Form: space → <code>+</code>. A literal + always becomes <code>%2B</code>.</p></div>}
    relatedTools={[{ href: "/url-decode", label: "URL Decode" }, { href: "/base64-encode", label: "Base64 Encode" }, { href: "/text-to-hex", label: "Text to Hex" }]}
  />;
}
