import { useState } from "react";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";
import { DEFAULT_TEXT_TO_ASCII_OPTIONS, textToAscii, type TextToAsciiOptions } from "./textToAsciiTransforms";

export function TextToAsciiToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [output, setOutput] = useState(""); const [options, setOptions] = useState<TextToAsciiOptions>({ ...DEFAULT_TEXT_TO_ASCII_OPTIONS });
  const [error, setError] = useState<string | null>(null); const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setError(null); setStatus(null); };
  function convert() { clearResult(); if (!input) return setError("Enter ASCII text to convert."); const sizeError = blockedByInputSize(input); if (sizeError) return setError(sizeError); const result = textToAscii(input, options); if (!result.ok) return setError(result.error); setOutput(result.output); setStatus(`Conversion complete: ${result.characterCount} ASCII value${result.characterCount === 1 ? "" : "s"}.`); }
  return <ConverterCard idPrefix="text-to-ascii" title="Text to ASCII Converter" description="Convert only ASCII characters to decimal values from 0 through 127. Non-ASCII text is rejected rather than transliterated or mislabeled as Unicode code points."
    input={input} output={output} inputLabel="ASCII text input" outputLabel="Decimal ASCII values" onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert} onClear={() => { setInput(""); clearResult(); }} onLoadExample={() => { setInput("Hello!\t"); clearResult(); }} onResetSettings={() => { setOptions({ ...DEFAULT_TEXT_TO_ASCII_OPTIONS }); clearResult(); }} convertLabel="Convert" error={error} status={status}
    download={{ filename: "text-to-ascii.txt", mime: "text/plain;charset=utf-8", label: "Download TXT" }}
    settings={<div className="space-y-4"><div className="grid gap-2 sm:grid-cols-3">{([['space', 'Space'], ['comma', 'Comma'], ['custom', 'Custom separator']] as const).map(([value, label]) => <label key={value} className="flex min-h-11 items-center gap-2 text-sm"><input type="radio" name="ascii-output-separator" checked={options.delimiter === value} onChange={() => { setOptions((current) => ({ ...current, delimiter: value })); clearResult(); }} />{label}</label>)}</div>{options.delimiter === "custom" ? <label className="block text-sm font-semibold">Custom literal separator<input value={options.customSeparator} onChange={(event) => { setOptions((current) => ({ ...current, customSeparator: event.target.value })); clearResult(); }} className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label> : null}</div>}
    relatedTools={[{ href: "/ascii-to-text", label: "ASCII to Text" }, { href: "/text-to-hex", label: "Text to Hex" }, { href: "/byte-counter", label: "Byte Counter" }]}
  />;
}
