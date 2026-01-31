import { useMemo, useState } from "react";
import { converters, converterKeys } from "./textConverters";
import { getStats } from "./textStats";

const btnColors = [
  "bg-sky-600 hover:bg-sky-700",
  "bg-indigo-600 hover:bg-indigo-700",
  "bg-teal-600 hover:bg-teal-700",
  "bg-amber-600 hover:bg-amber-700",
  "bg-fuchsia-600 hover:bg-fuchsia-700",
  "bg-rose-600 hover:bg-rose-700",
  "bg-lime-600 hover:bg-lime-700",
  "bg-cyan-600 hover:bg-cyan-700",
  "bg-blue-600 hover:bg-blue-700",
  "bg-emerald-600 hover:bg-emerald-700",
];

type TextToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function TextToolCard({ input, setInput }: TextToolCardProps) {
  const [prev, setPrev] = useState(""); // for undo
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stats = useMemo(() => getStats(input), [input]);

  const handleCopy = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed:", err);
      setErrorMsg("Copy failed. Please try again.");
    }
  };

  const handleConvert = (key: string) => {
    setErrorMsg(null);
    const fn = converters[key];
    if (!fn) return;

    try {
      const result = fn(input);
      if (typeof result === "string" && result.startsWith("⚠️")) {
        setErrorMsg(result.replace("⚠️", "").trim());
        return; // do not overwrite text
      }
      setPrev(input);
      setInput(result);
    } catch {
      setErrorMsg("Conversion failed. Please check your input.");
    }
  };

  const handleClear = () => {
    if (input) setPrev(input);
    setInput("");
    setErrorMsg(null);
  };

  const handleUndo = () => {
    if (!prev) return;
    setInput(prev);
    setPrev("");
    setErrorMsg(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-8 py-4 space-y-8">
      <div>
        <h1 className="flex mb-3 w-full justify-center items-center text-center font-bold sm:text-2xl ">
          All Text Converters - Free Online Text Converter
        </h1>
        <textarea
          aria-label="Text editor input"
          id="textInput"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full min-h-[26rem] max-h-[52rem] p-4 border border-gray-300 rounded-md font-mono text-base leading-relaxed bg-white resize-y
            focus:outline-none focus:border-gray-400 hover:border-gray-400 transition-colors"
        />
      </div>

      <div className="flex flex-wrap justify-start gap-8 text-base font-semibold bg-gray-50 px-6 py-4 rounded-md border border-gray-200 text-slate-800">
        <span className="flex items-center gap-2">
          📝 <span>Word Count:</span> {stats.words}
        </span>
        <span className="flex items-center gap-2">
          🔠 <span>Character Count:</span> {stats.chars}
        </span>
        <span className="flex items-center gap-2">
          📄 <span>Line Count:</span> {stats.lines}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {converterKeys.map((key, i) => (
          <button
            key={key}
            onClick={() => handleConvert(key)}
            className={`${btnColors[i % btnColors.length]} cursor-pointer text-white px-5 py-2 rounded-md text-sm font-semibold transition-all duration-150 active:scale-95 hover:brightness-110`}
            type="button"
          >
            {key}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-3">
        <button
          onClick={handleCopy}
          disabled={!input}
          className={`px-5 py-2 rounded-md text-sm font-semibold text-white transition-all active:scale-95 ${
            input
              ? "bg-slate-800 hover:bg-slate-900 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          type="button"
        >
          {copied ? "✓ Copied!" : "📋 Copy Text"}
        </button>

        <button
          onClick={handleClear}
          className="px-5 py-2 rounded-md text-sm font-semibold bg-gray-200 hover:bg-gray-300 cursor-pointer text-slate-800 transition-all active:scale-95"
          type="button"
        >
          🧹 Clear
        </button>

        {prev && (
          <button
            onClick={handleUndo}
            className="px-5 py-2 rounded-md text-sm font-semibold bg-gray-200 hover:bg-gray-300 cursor-pointer text-slate-800 transition-all active:scale-95"
            type="button"
          >
            ↩ Undo
          </button>
        )}
      </div>
    </div>
  );
}
