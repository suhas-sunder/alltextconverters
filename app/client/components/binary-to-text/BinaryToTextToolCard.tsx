import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { decodeBinary, DEFAULT_BINARY_DECODE_OPTIONS, type DecodeOptions } from "./binaryTransforms";

export function BinaryToTextToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState(""); const [options, setOptions] = useState<DecodeOptions>({ ...DEFAULT_BINARY_DECODE_OPTIONS });
  const [byteCount, setByteCount] = useState(0); const [error, setError] = useState<string | null>(null); const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setByteCount(0); setError(null); setStatus(null); };
  function convert() { clearResult(); const sizeError = blockedByInputSize(input); if (sizeError) return setError(sizeError); const result = decodeBinary(input, options); if (!result.ok) return setError(result.error); setOutput(result.outputText); setByteCount(result.byteCount); setStatus(`Decoding complete: ${result.byteCount} UTF-8 byte${result.byteCount === 1 ? "" : "s"}.`); }
  return <ConverterCard idPrefix="binary-to-text" title="Binary to Text Converter" description="Strictly parse complete eight-bit groups and decode them as UTF-8. Invalid characters, incomplete bytes, empty groups, and invalid UTF-8 fail visibly."
    input={input} output={output} inputLabel="Binary input" outputLabel="Decoded UTF-8 text" onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert} onClear={() => { setInput(""); clearResult(); }} onLoadExample={() => { setInput("01000001 11000011 10101001 11110000 10011111 10011000 10000000"); clearResult(); }} onResetSettings={() => { setOptions({ ...DEFAULT_BINARY_DECODE_OPTIONS }); clearResult(); }} convertLabel="Decode" error={error} status={status}
    details={output ? <p className="mt-3 text-sm font-semibold text-slate-700">Decoded byte count: {byteCount}</p> : null}
    settings={<div className="space-y-4"><div className="grid gap-2 sm:grid-cols-3">{([['continuous', 'Continuous bits'], ['space', 'Space-separated bytes'], ['custom', 'Custom separator']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="binary-input-mode" checked={options.mode === value} onChange={() => { setOptions((current) => ({ ...current, mode: value })); clearResult(); }} />{label}</label>)}</div>{options.mode === "custom" ? <label className="block text-sm font-semibold">Custom literal separator<input value={options.customSeparator} onChange={(event) => { setOptions((current) => ({ ...current, customSeparator: event.target.value })); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label> : null}</div>}
    relatedTools={[{ href: "/text-to-binary", label: "Text to Binary" }, { href: "/text-to-hex", label: "Text to Hex" }, { href: "/byte-counter", label: "Byte Counter" }]}
  />;
}
