import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { DEFAULT_TEXT_TO_BINARY_OPTIONS, textToBinary, type TextToBinaryOptions } from "./textToBinaryTransforms";

export function TextToBinaryToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState(""); const [options, setOptions] = useState<TextToBinaryOptions>({ ...DEFAULT_TEXT_TO_BINARY_OPTIONS });
  const [byteCount, setByteCount] = useState(0); const [error, setError] = useState<string | null>(null); const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setByteCount(0); setError(null); setStatus(null); };
  function convert() { clearResult(); if (!input) return setError("Enter text to convert."); const sizeError = blockedByInputSize(input); if (sizeError) return setError(sizeError); const result = textToBinary(input, options); if (!result.ok) return setError(result.error); setOutput(result.value); setByteCount(result.stats.bytes); setStatus(`Conversion complete: ${result.stats.bytes} UTF-8 byte${result.stats.bytes === 1 ? "" : "s"}.`); }
  return <ConverterCard idPrefix="text-to-binary" title="Text to Binary Converter" description="Encode text as UTF-8 bytes and show every byte as exactly eight bits. One visible character can produce several bytes."
    input={input} output={output} inputLabel="Text input" outputLabel="Binary UTF-8 bytes" onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert} onClear={() => { setInput(""); clearResult(); }} onLoadExample={() => { setInput("A é 😀"); clearResult(); }} onResetSettings={() => { setOptions({ ...DEFAULT_TEXT_TO_BINARY_OPTIONS }); clearResult(); }} convertLabel="Convert" error={error} status={status}
    download={{ filename: "text-to-binary.txt", mime: "text/plain;charset=utf-8", label: "Download TXT" }}
    details={output ? <p className="mt-3 text-sm font-semibold text-slate-700">UTF-8 byte count: {byteCount}</p> : null}
    settings={<div className="space-y-4"><div className="grid gap-2 sm:grid-cols-3">{([['space', 'Space'], ['none', 'None'], ['custom', 'Custom separator']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="binary-separator" checked={options.separatorMode === value} onChange={() => { setOptions((current) => ({ ...current, separatorMode: value })); clearResult(); }} />{label}</label>)}</div>{options.separatorMode === "custom" ? <label className="block text-sm font-semibold">Custom literal separator<input value={options.customSeparator} onChange={(event) => { setOptions((current) => ({ ...current, customSeparator: event.target.value })); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label> : null}</div>}
    relatedTools={[{ href: "/binary-to-text", label: "Binary to Text" }, { href: "/text-to-hex", label: "Text to Hex" }, { href: "/byte-counter", label: "Byte Counter" }]}
  />;
}
