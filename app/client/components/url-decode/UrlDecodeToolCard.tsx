import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { decodeUrlEncodedText, type UrlDecodingMode } from "./urlDecodeTransforms";

export function UrlDecodeToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<UrlDecodingMode>("component");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setError(null); setStatus(null); };
  function convert() {
    clearResult();
    if (!input) return setError("Enter URL-encoded text to decode.");
    const sizeError = blockedByInputSize(input);
    if (sizeError) return setError(sizeError);
    const result = decodeUrlEncodedText(input, mode);
    if (!result.ok) return setError(result.error);
    setOutput(result.value);
    setStatus(`Decoding complete in ${mode === "component" ? "URL component" : "form value"} mode.`);
  }
  return <ConverterCard idPrefix="url-decode" title="URL Decode" description="Strictly decode percent escapes as UTF-8. Component mode retains literal +; form mode turns + into a space. Decoded URLs are never opened."
    input={input} output={output} inputLabel="Encoded text" outputLabel="Decoded text"
    onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert}
    onClear={() => { setInput(""); clearResult(); }} onLoadExample={() => { setInput("caf%C3%A9+%2B+tea%3F%23%F0%9F%98%80"); clearResult(); }}
    onResetSettings={() => { setMode("component"); clearResult(); }} convertLabel="Decode" error={error} status={status}
    settings={<div className="grid gap-2 sm:grid-cols-2">{([['component', 'URL component mode'], ['form', 'Form value mode']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="url-decode-mode" checked={mode === value} onChange={() => { setMode(value); clearResult(); }} className="h-5 w-5" />{label}</label>)}</div>}
    relatedTools={[{ href: "/url-encode", label: "URL Encode" }, { href: "/base64-encode", label: "Base64 Encode" }, { href: "/text-to-hex", label: "Text to Hex" }]}
  />;
}
