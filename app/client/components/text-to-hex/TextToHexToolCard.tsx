import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { convertTextToHex, DEFAULT_TEXT_TO_HEX_OPTIONS, type TextToHexOptions } from "./textToHexTransforms";

export function TextToHexToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState<TextToHexOptions>({ ...DEFAULT_TEXT_TO_HEX_OPTIONS });
  const [byteCount, setByteCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setByteCount(0); setError(null); setStatus(null); };
  function convert() {
    clearResult(); if (!input) return setError("Enter text to convert.");
    const sizeError = blockedByInputSize(input); if (sizeError) return setError(sizeError);
    const result = convertTextToHex(input, options); if (!result.ok) return setError(result.error);
    setOutput(result.hex); setByteCount(result.byteCount); setStatus(`Conversion complete: ${result.byteCount} UTF-8 byte${result.byteCount === 1 ? "" : "s"}.`);
  }
  return <ConverterCard idPrefix="text-to-hex" title="Text to Hex Converter" description="Encode text as UTF-8 bytes, rendered as two hexadecimal digits per byte. One visible character can produce several bytes."
    input={input} output={output} inputLabel="Text input" outputLabel="Hexadecimal UTF-8 bytes"
    onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert} onClear={() => { setInput(""); clearResult(); }}
    onLoadExample={() => { setInput("A é 😀"); clearResult(); }} onResetSettings={() => { setOptions({ ...DEFAULT_TEXT_TO_HEX_OPTIONS }); clearResult(); }}
    convertLabel="Convert" error={error} status={status}
    download={{ filename: "text-to-hex.txt", mime: "text/plain;charset=utf-8", label: "Download TXT" }}
    details={output ? <p className="mt-3 text-sm font-semibold text-slate-700">UTF-8 byte count: {byteCount}</p> : null}
    settings={<div className="space-y-4"><div className="grid gap-2 sm:grid-cols-2"><label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="hex-case" checked={!options.uppercase} onChange={() => { setOptions((current) => ({ ...current, uppercase: false })); clearResult(); }} />Lowercase hex</label><label className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="hex-case" checked={options.uppercase} onChange={() => { setOptions((current) => ({ ...current, uppercase: true })); clearResult(); }} />Uppercase hex</label></div><div className="grid gap-2 sm:grid-cols-4">{([['space', 'Space'], ['none', 'None'], ['comma', 'Comma'], ['custom', 'Custom']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="hex-separator" checked={options.separatorMode === value} onChange={() => { setOptions((current) => ({ ...current, separatorMode: value })); clearResult(); }} />{label}</label>)}</div>{options.separatorMode === "custom" ? <label className="block text-sm font-semibold">Custom literal separator<input value={options.customSeparator} onChange={(event) => { setOptions((current) => ({ ...current, customSeparator: event.target.value })); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label> : null}<label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={options.prefix0x} onChange={(event) => { setOptions((current) => ({ ...current, prefix0x: event.target.checked })); clearResult(); }} className="h-5 w-5" />Add 0x prefix to each byte</label></div>}
    relatedTools={[{ href: "/hex-to-text", label: "Hex to Text" }, { href: "/text-to-binary", label: "Text to Binary" }, { href: "/text-to-ascii", label: "Text to ASCII" }, { href: "/byte-counter", label: "Byte Counter" }]}
  />;
}
