import { useState } from "react";
import { applyMatchCase } from "../../text/case";
import { ConverterCard, blockedByInputSize } from "../converter/ConverterCard";

export function MatchCaseConverterToolCard({ input, setInput }: { input: string; setInput: (value: string) => void }) {
  const [pattern, setPattern] = useState("");
  const [output, setOutput] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const clearResult = () => { setOutput(""); setWarning(null); setError(null); setStatus(null); };
  const convert = () => { clearResult(); const sizeError = blockedByInputSize(pattern) ?? blockedByInputSize(input); if (sizeError) return setError(sizeError); const result = applyMatchCase(pattern, input); setOutput(result.output); setWarning(result.warning); setStatus(`Match complete: applied a repeating ${result.patternLength}-letter pattern to ${result.appliedLetters} cased target letters.`); };
  const settings = <label htmlFor="match-case-pattern" className="block text-sm font-semibold text-slate-800">Case pattern
    <textarea id="match-case-pattern" aria-label="Case pattern" value={pattern} onChange={(event) => { setPattern(event.target.value); clearResult(); }} className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 bg-white p-3 font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" placeholder="Example: AbC" />
    <span className="mt-2 block text-xs font-normal text-slate-600">Only cased pattern letters count. The pattern repeats over cased target letters; target punctuation, spacing, numbers, emoji, and uncased scripts are preserved.</span>
  </label>;
  return <ConverterCard idPrefix="match-case-converter" title="Match Case Converter" description="Apply the repeating uppercase/lowercase sequence from a case pattern to target text." input={input} output={output} inputLabel="Target text" outputLabel="Matched text" onInputChange={(value) => { setInput(value); clearResult(); }} onConvert={convert} onClear={() => { setInput(""); setPattern(""); clearResult(); }} onLoadExample={() => { setPattern("AbC"); setInput("example target 123 😀"); clearResult(); }} onResetSettings={() => { setPattern(""); clearResult(); }} convertLabel="Match case" settings={settings} error={error} warning={warning} status={status} relatedTools={[{ href: "/case-converter", label: "Case Converter" }, { href: "/alternating-case-converter", label: "Alternating Case Converter" }, { href: "/text-case-checker", label: "Text Case Checker" }]} download={{ filename: "match-case.txt", mime: "text/plain;charset=utf-8", label: "Download TXT" }} />;
}
