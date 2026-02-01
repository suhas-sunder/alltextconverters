import { useMemo, useState } from "react";
import { checkTextCase, formatCaseReport } from "./caseCheck";

type TextCaseCheckerToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function TextCaseCheckerToolCard({
  input,
  setInput,
}: TextCaseCheckerToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const analysis = useMemo(() => checkTextCase(input), [input]);
  const reportText = useMemo(
    () => formatCaseReport(analysis.summary, analysis.perLine),
    [analysis.summary, analysis.perLine],
  );

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  function clearAll() {
    setInput("");
    setErrorMsg(null);
    setInfoMsg(null);
  }

  // File upload (client-side). Supports text-like files directly.
  // Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setInfoMsg(null);

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
        // Requires: pdfjs-dist
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

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
            .map((it: any) => it.str)
            .filter(Boolean);
          fullText += strings.join(" ") + "\n";
        }

        const cleaned = fullText.trim();
        if (!cleaned) throw new Error("No text found in PDF");
        setInput(cleaned);
        setInfoMsg("PDF text extracted locally. Review for layout artifacts.");
        return;
      }

      if (ext === "docx") {
        // Requires: mammoth
        const arrayBuffer = await file.arrayBuffer();
        const mammoth: any = await import("mammoth/mammoth.browser");
        const result = await mammoth.extractRawText({ arrayBuffer });
        const value = String(result?.value ?? "").trim();
        if (!value) throw new Error("No text found in DOCX");
        setInput(value);
        setInfoMsg(
          "DOCX text extracted locally. Formatting may be simplified.",
        );
        return;
      }

      const text = await readAsText();
      setInput(text);
      setInfoMsg("File loaded locally.");
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not extract text from that file in-browser. Make sure optional libraries are installed (pdfjs-dist for PDF, mammoth for DOCX).",
      );
    }
  };

  const downloadReportAsPdf = async () => {
    try {
      // Requires: jspdf
      const jsPDFMod: any = await import("jspdf");
      const JsPDF = jsPDFMod?.jsPDF ?? jsPDFMod?.default;
      if (!JsPDF) throw new Error("jsPDF not available");

      const doc = new JsPDF({ unit: "pt", format: "letter" });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - margin * 2;

      doc.setFont("times", "normal");
      doc.setFontSize(11);

      const paragraphs = (reportText || "").split(/\r?\n/);
      let y = margin;

      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i] ?? "";
        const wrapped = doc.splitTextToSize(para, maxWidth) as string[];
        const lines = wrapped.length ? wrapped : [""];
        for (const line of lines) {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 14;
        }
        if (i < paragraphs.length - 1) y += 6;
      }

      doc.save("text-case-report.pdf");
    } catch {
      window.print();
    }
  };

  const buttonBase =
    "cursor-pointer inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition";

  const primaryButton =
    "cursor-pointer inline-flex items-center rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition";

  const disabledButtonBase =
    "inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-400 ring-1 ring-slate-200 shadow-sm cursor-not-allowed";

  const labelPill = (label: string) => {
    const map: Record<string, string> = {
      Uppercase: "bg-sky-50 text-sky-700 ring-sky-200/70",
      Lowercase: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
      Mixed: "bg-amber-50 text-amber-700 ring-amber-200/70",
      "Title-like": "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
      "Sentence-like": "bg-violet-50 text-violet-700 ring-violet-200/70",
      "No letters": "bg-slate-50 text-slate-700 ring-slate-200/70",
    };
    const cls = map[label] ?? "bg-slate-50 text-slate-700 ring-slate-200/70";
    return (
      <span
        className={
          "inline-flex items-center gap-2 rounded-full ring-1 px-3 py-1 text-xs font-semibold " +
          cls
        }
      >
        <span className="h-2 w-2 rounded-full bg-current opacity-60" />
        {label}
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Text Case Checker
        </h1>
        <p className="text-sm text-slate-600 leading-6 max-w-2xl mx-auto">
          Analyzes text to identify casing patterns like uppercase, lowercase,
          mixed, title-like, and sentence-like.
        </p>
      </div>

      {(errorMsg || infoMsg) && (
        <div className="space-y-2">
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
              ⚠️ {errorMsg}
            </div>
          )}
          {infoMsg && !errorMsg && (
            <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-4 py-3 text-sm">
              {infoMsg}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type text here…"
          className="mt-2 h-72 sm:h-80 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />

        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <label className={buttonBase}>
                Upload (.txt, .pdf, .docx)
                <input
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
              </label>

              <button
                type="button"
                onClick={clearAll}
                className={buttonBase}
                aria-label="Clear text"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => {
                  // No conversion: button exists only to clear messages and signal intent.
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
                aria-label="Analyze casing"
              >
                Analyze
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={downloadReportAsPdf}
                disabled={!input}
                className={input ? buttonBase : disabledButtonBase}
                aria-label="Download report as PDF"
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={copyReport}
                disabled={!input}
                className={input ? buttonBase : disabledButtonBase}
                aria-label="Copy report"
              >
                {copied ? "Copied" : "Copy Stats"}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm font-semibold text-slate-900">
                Detected:
              </div>
              {labelPill(analysis.summary.label)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900">
              Why this label?
            </div>
            <p className="mt-2 text-sm text-slate-700 leading-7">
              {analysis.summary.reason}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quick stats
                </div>
                <ul className="mt-2 text-sm text-slate-800 space-y-1">
                  <li>
                    <span className="font-semibold">Lines:</span>{" "}
                    {analysis.summary.lines}
                  </li>
                  <li>
                    <span className="font-semibold">Words (rough):</span>{" "}
                    {analysis.summary.words}
                  </li>
                  <li>
                    <span className="font-semibold">Letters:</span>{" "}
                    {analysis.summary.letters}
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Heuristics used
                </div>
                <ul className="mt-2 text-sm text-slate-800 space-y-1">
                  <li>
                    <span className="font-semibold">Title-like words:</span>{" "}
                    {analysis.summary.titleWordLike}/
                    {analysis.summary.titleWordCount}
                  </li>
                  <li>
                    <span className="font-semibold">Sentence starts:</span>{" "}
                    {analysis.summary.sentenceStartsUpper}/
                    {analysis.summary.sentenceStarts}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-600">
              Tip: This checker uses simple deterministic rules. It does not try
              to preserve brand styling (like “iPhone”) or apply
              language/grammar logic.
            </div>
          </div>

          <details className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">
              Show per-line labels (first 50 lines)
            </summary>
            <div className="mt-3 grid gap-2">
              {analysis.perLine.slice(0, 50).map((l) => (
                <div
                  key={l.lineNumber}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2"
                >
                  <div className="text-xs font-semibold text-slate-700">
                    Line {l.lineNumber}
                  </div>
                  <div className="text-xs font-semibold text-slate-900">
                    {l.label}
                  </div>
                </div>
              ))}
              {analysis.perLine.length > 50 && (
                <div className="text-xs text-slate-600">
                  Showing 50 of {analysis.perLine.length} labeled lines.
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
