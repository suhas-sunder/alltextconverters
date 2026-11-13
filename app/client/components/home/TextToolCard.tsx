import { needsUnicodePrint, openTextPrintView } from "../../text/print-view";
import { DOCUMENT_IMPORT_ACCEPT, DOCUMENT_IMPORT_HELP } from "../../text/document-import";
import { useMemo, useRef, useState } from "react";
import { useLocalFileImport } from "../useLocalFileImport";
import { converters, converterKeys } from "./textConverters";
import { getStats } from "./textStats";

const btnColors = [
  "bg-sky-700 hover:bg-sky-800",
  "bg-indigo-600 hover:bg-indigo-700",
  "bg-teal-700 hover:bg-teal-800",
  "bg-amber-700 hover:bg-amber-800",
  "bg-fuchsia-600 hover:bg-fuchsia-700",
  "bg-rose-600 hover:bg-rose-700",
  "bg-lime-700 hover:bg-lime-800",
  "bg-cyan-700 hover:bg-cyan-800",
  "bg-blue-600 hover:bg-blue-700",
  "bg-emerald-700 hover:bg-emerald-800",
];

type TextToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function TextToolCard({ input, setInput }: TextToolCardProps) {
  const [prev, setPrev] = useState(""); // for undo
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadButton = useRef<HTMLButtonElement | null>(null);
  const fileImport = useLocalFileImport((text) => {
    setPrev(input);
    setInput(text);
  });

  const stats = useMemo(() => getStats(input), [input]);

  const updateInput = (value: string) => {
    fileImport.reset();
    setErrorMsg(null);
    setInput(value);
  };

  const handleCopy = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setErrorMsg("Clipboard access failed. Select the text or download TXT.");
    }
  };

  const handleConvert = (key: string) => {
    setErrorMsg(null);
    const fn = converters[key];
    if (!fn) return;

    try {
      const result = fn(input);
      setPrev(input);
      updateInput(result);
    } catch {
      setErrorMsg("Conversion failed. Please check your input.");
    }
  };

  const handleClear = () => {
    if (input) setPrev(input);
    updateInput("");
    setErrorMsg(null);
  };

  const handleUndo = () => {
    if (!prev) return;
    updateInput(prev);
    setPrev("");
    setErrorMsg(null);
  };

  const handleFileUpload = (file: File) => {
    setErrorMsg(null);
    void fileImport.open(file);
  };

  const downloadAsText = () => {
    if (!input) return;
    try {
      const blob = new Blob([input], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "alltextconverters-text.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(URL.revokeObjectURL, 1000, url);
    } catch {
      setErrorMsg("Download failed. Please try again.");
    }
  };

  const downloadAsPdf = async () => {
    if (!input) return;

    const printFallback = () => {
      if (!openTextPrintView("AllTextConverters text export", input)) {
        setErrorMsg("Could not open the print view. Allow pop-ups for this site and try again.");
      }
    };
    if (needsUnicodePrint(input)) {
      printFallback();
      return;
    }

    try {
      // Optional: jspdf
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jsPDFMod: any = await import("jspdf");
      const JsPDF = jsPDFMod?.jsPDF ?? jsPDFMod?.default;
      if (!JsPDF) throw new Error("jsPDF not available");

      const doc = new JsPDF({ unit: "pt", format: "letter" });
      const margin = 40;

      doc.setFont("times", "normal");
      doc.setFontSize(11);

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - margin * 2;

      const lines: string[] = doc.splitTextToSize(input, maxWidth);
      const lineHeight = 14;

      let y = margin;
      for (const line of lines) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(String(line), margin, y);
        y += lineHeight;
      }

      doc.save("alltextconverters-text.pdf");
    } catch {
      // Fallback: print dialog (user can "Save as PDF")
      printFallback();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-4 sm:px-8 space-y-5">
      <div>
        <h1 className="flex mb-3 w-full justify-center items-center text-center font-bold sm:text-2xl ">
          All Text Converters - Free Online Text Converter
        </h1>
        <p id="home-editor-help" className="mb-3 text-sm leading-6 text-slate-600">
          Paste text, then choose a conversion below. The result replaces the text here; Undo restores the previous version.
        </p>
        <label htmlFor="textInput" className="mb-2 block text-sm font-semibold">Your text and result</label>
        <textarea
          aria-label="Text editor input"
          id="textInput"
          aria-describedby="home-editor-help"
          value={input}
          onChange={(e) => updateInput(e.target.value)}
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes("Files")) event.preventDefault();
          }}
          onDrop={(event) => {
            const files = event.dataTransfer.files;
            if (!files.length) return;
            event.preventDefault();
            if (files.length === 1) handleFileUpload(files[0]);
            else {
              fileImport.reset();
              setErrorMsg("Drop one file at a time.");
            }
          }}
          placeholder="Type or paste your text here..."
          className="w-full min-h-[14rem] sm:min-h-[20rem] max-h-[52rem] p-4 border border-gray-300 rounded-md font-mono text-base leading-relaxed bg-white resize-y
            focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-1 focus:border-gray-400 hover:border-gray-400 transition-colors"
        />
      </div>

      <div className="flex flex-wrap justify-start gap-x-5 gap-y-2 text-sm font-semibold bg-gray-50 px-3 py-4 rounded-md border border-gray-200 text-slate-800">
        <span className="flex items-center gap-2 whitespace-nowrap">
          📝 <span>Word Count:</span> {stats.words.toLocaleString()}
        </span>
        <span className="flex items-center gap-2 whitespace-nowrap">
          🔠 <span>Character Count:</span> {stats.chars.toLocaleString()}
        </span>
        <span className="flex items-center gap-2 whitespace-nowrap">
          📄 <span>Line Count:</span> {stats.lines.toLocaleString()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {converterKeys.map((key, i) => (
          <button
            key={key}
            onClick={() => handleConvert(key)}
            className={`${btnColors[i % btnColors.length]} cursor-pointer min-h-11 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-150 active:scale-95 hover:brightness-110`}
            type="button"
          >
            {key}
          </button>
        ))}
      </div>

      <p role="status" className={fileImport.status ? "text-sm text-slate-700" : "sr-only"}>
        {fileImport.status}
      </p>
      {(fileImport.error || errorMsg) && (
        <div role="alert" className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
          {fileImport.error || errorMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={DOCUMENT_IMPORT_ACCEPT}
          onChange={(event) => {
            const picker = event.currentTarget;
            const file = picker.files?.[0];
            picker.value = "";
            if (file) handleFileUpload(file);
          }}
        />

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
          ref={uploadButton}
          onClick={() => fileInputRef.current?.click()}
          aria-describedby="home-document-import-help"
          className="min-h-11 px-5 py-2 rounded-md text-sm font-semibold bg-gray-200 hover:bg-gray-300 cursor-pointer text-slate-800 transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-sky-600"
          type="button"
        >
          ⬆ Upload (.txt, .pdf, .docx)
        </button>
        {fileImport.reading && (
          <button type="button" onClick={() => { fileImport.cancel(); uploadButton.current?.focus(); }}
            className="min-h-11 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2">
            Cancel file import
          </button>
        )}
        <button type="button" onClick={downloadAsText} disabled={!input}
          className="min-h-11 rounded-md bg-gray-200 px-4 text-sm font-semibold text-slate-800 hover:bg-gray-300 focus-visible:outline-2 disabled:opacity-50">
          Download TXT
        </button>

        <button
          onClick={downloadAsPdf}
          disabled={!input}
          className={`px-5 py-2 rounded-md text-sm font-semibold transition-all active:scale-95 ${
            input
              ? "bg-gray-200 hover:bg-gray-300 cursor-pointer text-slate-800"
              : "bg-gray-200 text-slate-400 cursor-not-allowed"
          }`}
          type="button"
        >
          🖨️ PDF
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
      <p id="home-document-import-help" className="text-sm text-slate-700">
        Drop one file into the editor or use Upload. {DOCUMENT_IMPORT_HELP}
      </p>
    </div>
  );
}
