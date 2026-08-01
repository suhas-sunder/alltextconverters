import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../../converter/ConverterCard";
import { decodeHexToText, DEFAULT_HEX_DECODE_OPTIONS, type HexDecodeOptions } from "../utils/hexDecode";

export function HexToTextToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState(""); const [options, setOptions] = useState<HexDecodeOptions>({ ...DEFAULT_HEX_DECODE_OPTIONS });
  const [byteCount, setByteCount] = useState(0); const [error, setError] = useState<string | null>(null); const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setByteCount(0); setError(null); setStatus(null); };
  function convert() { clearResult(); const sizeError = blockedByInputSize(input); if (sizeError) return setError(sizeError); const result = decodeHexToText(input, options); if (!result.ok) return setError(result.error); setOutput(result.text); setByteCount(result.byteCount); setStatus(`Decoding complete: ${result.byteCount} UTF-8 byte${result.byteCount === 1 ? "" : "s"}.`); }
  return <ConverterCard idPrefix="hex-to-text" title="Hex to Text Decoder" description="Strictly parse documented hexadecimal byte formats and decode the bytes as UTF-8. Invalid characters, widths, prefixes, and UTF-8 fail instead of being discarded."
    input={input} output={output} inputLabel="Hexadecimal input" outputLabel="Decoded UTF-8 text"
    onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert} onClear={() => { setInput(""); clearResult(); }} onLoadExample={() => { setInput("41 c3 a9 f0 9f 98 80"); clearResult(); }} onResetSettings={() => { setOptions({ ...DEFAULT_HEX_DECODE_OPTIONS }); clearResult(); }} convertLabel="Decode" error={error} status={status}
    details={output ? <p className="mt-3 text-sm font-semibold text-slate-700">Decoded byte count: {byteCount}</p> : null}
    settings={<div className="space-y-4"><div className="grid gap-2 sm:grid-cols-4">{([['continuous', 'Continuous'], ['space', 'Space-separated'], ['comma', 'Comma-separated'], ['custom', 'Custom separator']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="hex-input-mode" checked={options.mode === value} onChange={() => { setOptions((current) => ({ ...current, mode: value })); clearResult(); }} />{label}</label>)}</div>{options.mode === "custom" ? <label className="block text-sm font-semibold">Custom literal separator<input value={options.customSeparator} onChange={(event) => { setOptions((current) => ({ ...current, customSeparator: event.target.value })); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label> : null}<label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={options.allowPrefix} onChange={(event) => { setOptions((current) => ({ ...current, allowPrefix: event.target.checked })); clearResult(); }} className="h-5 w-5" />Allow optional 0x prefixes</label></div>}
    relatedTools={[{ href: "/text-to-hex", label: "Text to Hex" }, { href: "/text-to-binary", label: "Text to Binary" }, { href: "/text-to-ascii", label: "Text to ASCII" }, { href: "/byte-counter", label: "Byte Counter" }]}
  />;
}
