import { useMemo, useState } from "react";
import {
  decodeDecimalAscii,
  formatSkippedPreview,
  type AsciiDecodeReport,
} from "./asciiToTextTransforms";

type AsciiToTextToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function AsciiToTextToolCard({
  input,
  setInput,
}: AsciiToTextToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [lastReport, setLastReport] = useState<AsciiDecodeReport | null>(null);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(input);
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
    setLastReport(null);
  }

  function decodeNow() {
    setErrorMsg(null);
    setInfoMsg(null);
    setLastReport(null);

    const trimmed = (input || "").trim();
    if (!trimmed) return;

    try {
      const { output, report } = decodeDecimalAscii(trimmed);

      if (!report.parsedCount) {
        setErrorMsg(
          "No decimal ASCII codes found. Paste numbers like: 72 101 108 108 111",
        );
        return;
      }

      if (!output) {
        setErrorMsg(
          `Found ${report.parsedCount} code(s), but none were printable ASCII (${report.printableMin}–${report.printableMax}).`,
        );
        setLastReport(report);
        return;
      }

      setInput(output);
      setLastReport(report);

      const skippedNote =
        report.skippedCount > 0
          ? ` Skipped ${report.skippedCount} code(s) outside printable ASCII (${report.printableMin}–${report.printableMax}).`
          : "";
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not decode that input. Check that you are pasting decimal ASCII codes.",
      );
    }
  }

  // File upload (client-side). Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setInfoMsg(null);
    setLastReport(null);

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
        setInfoMsg(
          "PDF text extracted locally. Click Decode to convert decimal ASCII to text.",
        );
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
          "DOCX text extracted locally. Click Decode to convert decimal ASCII to text.",
        );
        return;
      }

      // Text-like files
      const text = await readAsText();
      setInput(text);
      setInfoMsg(
        "File loaded locally. Click Decode to convert decimal ASCII to text.",
      );
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not extract text from that file in-browser. Make sure optional libraries are installed (pdfjs-dist for PDF, mammoth for DOCX).",
      );
    }
  };

  const downloadAsText = () => {
    try {
      const blob = new Blob([input], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ascii-to-text.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg("Download failed. Please try again.");
    }
  };

  const downloadAsPdf = async () => {
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

      const paragraphs = (input || "").split(/\r?\n/);
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
        if (i < paragraphs.length - 1) y += 8;
      }

      doc.save("ascii-to-text.pdf");
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

  const appliedOps = useMemo(() => {
    const base = [
      {
        k: "Decimal ASCII input",
        v: "Parses numbers from space/comma/newline separated text",
      },
      {
        k: "Printable ASCII scope",
        v: "Converts codes 32–126 only (skips others)",
      },
    ];

    if (!lastReport) return base;

    const extra: Array<{ k: string; v: string }> = [
      { k: "Parsed codes", v: String(lastReport.parsedCount) },
      { k: "Converted characters", v: String(lastReport.convertedCount) },
      { k: "Skipped codes", v: String(lastReport.skippedCount) },
    ];
    return [...base, ...extra];
  }, [lastReport]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          ASCII to Text Converter
        </h1>
        <p className="text-sm text-slate-600 leading-6">
          Paste decimal ASCII codes (for example: 72 101 108 108 111) and decode
          printable ASCII (32–126).
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
          placeholder="Enter decimal ASCII codes separated by spaces, commas, or new lines…"
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
                onClick={decodeNow}
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
                aria-label="Decode ASCII to text"
              >
                Decode to text
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={downloadAsText}
                disabled={!input}
                className={input ? buttonBase : disabledButtonBase}
                aria-label="Download as TXT"
              >
                Download TXT
              </button>

              <button
                type="button"
                onClick={downloadAsPdf}
                disabled={!input}
                className={input ? buttonBase : disabledButtonBase}
                aria-label="Download as PDF"
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={copyText}
                disabled={!input}
                className={input ? buttonBase : disabledButtonBase}
                aria-label="Copy output"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {appliedOps.slice(0, 4).map((t) => (
              <div
                key={t.k}
                className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t.k}
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {t.v}
                </div>
              </div>
            ))}
          </div>

          {lastReport && lastReport.skippedCount > 0 && (
            <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
              <div className="text-sm font-bold text-slate-900">
                Skipped (outside printable ASCII)
              </div>
              <p className="mt-2 text-slate-700 text-sm leading-6">
                This tool converts decimal codes in the printable ASCII range (
                {lastReport.printableMin}–{lastReport.printableMax}). Skipped{" "}
                {lastReport.skippedCount} code(s). Preview:{" "}
                {formatSkippedPreview(lastReport.skippedCodes)}
                {lastReport.skippedCount > lastReport.skippedCodes.length
                  ? "…"
                  : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
