import { useMemo, useRef, useState } from "react";
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

  const [readingFile, setReadingFile] = useState(false);
  const fileReadVersion = useRef(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stats = useMemo(() => getStats(input), [input]);

  const updateInput = (value: string) => {
    fileReadVersion.current += 1;
    setReadingFile(false);
    setInput(value);
  };

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

  const handleFileUpload = async (file: File) => {
    const version = ++fileReadVersion.current;
    const isCurrentRead = () => version === fileReadVersion.current;
    setErrorMsg(null);
    setReadingFile(true);

    const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "";

    try {
      let text: string;
      if (ext === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const worker = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url");
        if (!isCurrentRead()) return;

        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const task = pdfjs.getDocument({ data: arrayBuffer });
        try {
          const pdf = await task.promise;
          const pages: string[] = [];
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            if (!isCurrentRead()) return;
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();
            const words = [];
            for (const item of content.items) {
              if ("str" in item && item.str) words.push(item.str);
            }
            pages.push(words.join(" "));
            page.cleanup();
          }
          text = pages.join("\n").trim();
        } finally {
          await task.destroy();
        }
        if (!text) throw new Error("No text found in PDF");
      } else if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import("mammoth/mammoth.browser");
        if (!isCurrentRead()) return;
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value.trim();
        if (!text) throw new Error("No text found in DOCX");
      } else {
        text = await file.text();
      }

      if (isCurrentRead()) setInput(text);
    } catch {
      if (isCurrentRead()) {
        setErrorMsg(
          "Could not extract text from that file in this browser. Try plain text or a smaller, simpler source file.",
        );
      }
    } finally {
      if (isCurrentRead()) setReadingFile(false);
    }
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
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg("Download failed. Please try again.");
    }
  };

  const downloadAsPdf = async () => {
    if (!input) return;

    const printFallback = () => {
      try {
        const escapeHtml = (s: string) =>
          s
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

        const w = window.open(
          "",
          "_blank",
          "noopener,noreferrer,width=900,height=700",
        );
        if (!w) throw new Error("Popup blocked");

        const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>AllTextConverters Export</title>
  <style>
    html, body { margin: 0; padding: 0; }
    body { padding: 24px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12pt; line-height: 1.4; }
    pre { white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <pre>${escapeHtml(input)}</pre>
</body>
</html>`;

        w.document.open();
        w.document.write(html);
        w.document.close();

        // Give the browser a tick to render before printing.
        w.focus();
        window.setTimeout(() => {
          try {
            w.print();
          } catch {
            // ignore
          }
        }, 150);
      } catch {
        setErrorMsg("PDF export failed. Please try again.");
      }
    };

    // jsPDF's built-in fonts do not reliably support Unicode.
    // If we detect non-basic ASCII, use the print-based export for correctness.
    const hasNonBasicAscii = /[^\x09\x0A\x0D\x20-\x7E]/.test(input);
    if (hasNonBasicAscii) {
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-8 py-4 space-y-8">
      <div>
        <h1 className="flex mb-3 w-full justify-center items-center text-center font-bold sm:text-2xl ">
          All Text Converters - Free Online Text Converter
        </h1>
        <textarea
          aria-label="Text editor input"
          id="textInput"
          value={input}
          onChange={(e) => updateInput(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full min-h-[26rem] max-h-[52rem] p-4 border border-gray-300 rounded-md font-mono text-base leading-relaxed bg-white resize-y
            focus:outline-none focus:border-gray-400 hover:border-gray-400 transition-colors"
        />
      </div>

      <div className="flex flex-wrap justify-start gap-8 text-base font-semibold bg-gray-50 px-6 py-4 rounded-md border border-gray-200 text-slate-800">
        <span className="flex items-center gap-2">
          📝 <span>Word Count:</span> {stats.words.toLocaleString()}
        </span>
        <span className="flex items-center gap-2">
          🔠 <span>Character Count:</span> {stats.chars.toLocaleString()}
        </span>
        <span className="flex items-center gap-2">
          📄 <span>Line Count:</span> {stats.lines.toLocaleString()}
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

      <p role="status" className={readingFile ? "text-sm text-slate-700" : "sr-only"}>
        {readingFile ? "Reading file…" : ""}
      </p>
      {errorMsg && (
        <div role="alert" className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".txt,.md,.csv,.json,.html,.xml,.pdf,.docx"
          onChange={async (e) => {
            const inputElement = e.currentTarget;
            const f = e.target.files?.[0];
            if (!f) return;
            inputElement.value = "";
            await handleFileUpload(f);
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
          onClick={() => fileInputRef.current?.click()}
          className="px-5 py-2 rounded-md text-sm font-semibold bg-gray-200 hover:bg-gray-300 cursor-pointer text-slate-800 transition-all active:scale-95"
          type="button"
        >
          ⬆ Upload (.txt, .pdf, .docx)
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
    </div>
  );
}
