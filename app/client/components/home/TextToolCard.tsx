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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // File upload (client-side). Supports text-like files directly.
  // Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);

    const name = (file.name || "").toLowerCase();
    const ext = name.includes(".") ? name.split(".").pop() : "";

    const readAsText = () =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("File read failed"));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsText(file);
      });

    try {
      if (ext === "pdf") {
        // Optional: pdfjs-dist
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

        // Try common worker resolution strategies (bundler-dependent)
        let workerSrc: string | undefined;
        try {
          workerSrc = (
            await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")
          ).default as string;
        } catch {
          try {
            workerSrc = (
              await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs" as any)
            ).default as string;
          } catch {
            workerSrc = undefined;
          }
        }

        if (workerSrc && pdfjs?.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        }

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const strings = (content.items || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((it: any) => it.str)
            .filter(Boolean);
          fullText += strings.join(" ") + "\n";
        }

        const cleaned = fullText.trim();
        if (!cleaned) throw new Error("No text found in PDF");
        setInput(cleaned);
        return;
      }

      if (ext === "docx") {
        // Optional: mammoth
        const arrayBuffer = await file.arrayBuffer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mammoth: any = await import("mammoth/mammoth.browser");
        const result = await mammoth.extractRawText({ arrayBuffer });
        const value = String(result?.value ?? "").trim();
        if (!value) throw new Error("No text found in DOCX");
        setInput(value);
        return;
      }

      // Text-like files
      const text = await readAsText();
      setInput(text);
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not extract text from that file in-browser. Install optional libraries (pdfjs-dist for PDF, mammoth for DOCX).",
      );
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
          onChange={(e) => setInput(e.target.value)}
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

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
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
            const f = e.target.files?.[0];
            if (!f) return;
            await handleFileUpload(f);
            e.currentTarget.value = "";
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
