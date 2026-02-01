import { useMemo, useState } from "react";
import {
  listToCommaSeparated,
  listToCsvSingleColumn,
  parseLines,
} from "./listToCommaTransforms";

type Props = {
  input: string;
  setInput: (v: string) => void;
};

export function ListToCommaSeparatedToolCard({ input, setInput }: Props) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [spaceAfterComma, setSpaceAfterComma] = useState(true);

  // Keep the most recent line parse so CSV export still works after conversion
  const [lastParsedLines, setLastParsedLines] = useState<string[] | null>(null);

  const hasText = (input || "").trim().length > 0;

  const delimiterLabel = spaceAfterComma ? "Comma + space" : "Comma only";

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
    setLastParsedLines(null);
  }

  function convertNow() {
    setErrorMsg(null);
    setInfoMsg(null);

    const { output, items, delimiter } = listToCommaSeparated(input, {
      spaceAfterComma,
    });

    setLastParsedLines(items);
    setInput(output);

    const ignored = Math.max(
      0,
      input.split(/\r\n|\n|\r/).length - items.length,
    );
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
        setLastParsedLines(null);
        setInfoMsg("PDF text extracted locally. Review for layout artifacts.");
        return;
      }

      if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth: any = await import("mammoth/mammoth.browser");
        const result = await mammoth.extractRawText({ arrayBuffer });
        const value = String(result?.value ?? "").trim();
        if (!value) throw new Error("No text found in DOCX");
        setInput(value);
        setLastParsedLines(null);
        setInfoMsg(
          "DOCX text extracted locally. Formatting may be simplified.",
        );
        return;
      }

      const text = await readAsText();
      setInput(text);
      setLastParsedLines(null);
      setInfoMsg("File loaded locally.");
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
      a.download = "comma-separated.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg("Download failed. Please try again.");
    }
  };

  const downloadAsCsv = () => {
    try {
      const rows = lastParsedLines ?? parseLines(input);
      const header = "value";
      const body = rows
        .map((r) => (/[",\r\n]/.test(r) ? `"${r.replace(/"/g, '""')}"` : r))
        .join("\n");
      const csv = rows.length ? `${header}\n${body}\n` : `${header}\n`;

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "list.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setInfoMsg("CSV exported locally.");
    } catch {
      setErrorMsg("CSV export failed. Please try again.");
    }
  };

  const downloadAsPdf = async () => {
    try {
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

      doc.save("comma-separated.pdf");
    } catch {
      window.print();
    }
  };

  const stats = useMemo(() => {
    const lines = (input || "").split(/\r\n|\n|\r/);
    const trimmed = parseLines(input);
    return {
      rawLines: lines.filter((l) => l.length > 0).length,
      items: trimmed.length,
    };
  }, [input]);

  const buttonBase =
    "cursor-pointer inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition";

  const primaryButton =
    "cursor-pointer inline-flex items-center rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition";

  const disabledButtonBase =
    "inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-400 ring-1 ring-slate-200 shadow-sm cursor-not-allowed";

  const togglePill =
    "cursor-pointer inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          List to Comma-Separated Text
        </h1>
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
          onChange={(e) => {
            setInput(e.target.value);
            setLastParsedLines(null);
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          placeholder="Paste a line-separated list and turn it into a clean comma-separated string. Example [⏎ = Enter Key]: apple ⏎ banana ⏎ orange"
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
                onClick={() => setSpaceAfterComma((v) => !v)}
                className={togglePill}
                aria-label="Toggle space after comma"
                title="Choose whether to insert a space after each comma"
              >
                <span
                  className={
                    "h-2 w-2 rounded-full " +
                    (spaceAfterComma ? "bg-sky-500" : "bg-slate-400")
                  }
                />
                {delimiterLabel}
              </button>

              <button
                type="button"
                onClick={convertNow}
                disabled={!hasText}
                className={hasText ? primaryButton : disabledButtonBase}
                aria-label="Convert list to comma-separated"
              >
                Convert
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={downloadAsCsv}
                disabled={!hasText}
                className={hasText ? buttonBase : disabledButtonBase}
                aria-label="Download CSV"
              >
                Download CSV
              </button>

              <button
                type="button"
                onClick={downloadAsText}
                disabled={!hasText}
                className={hasText ? buttonBase : disabledButtonBase}
                aria-label="Download as text"
              >
                Download TXT
              </button>

              <button
                type="button"
                onClick={downloadAsPdf}
                disabled={!hasText}
                className={hasText ? buttonBase : disabledButtonBase}
                aria-label="Download as PDF"
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={copyText}
                disabled={!hasText}
                className={hasText ? buttonBase : disabledButtonBase}
                aria-label="Copy output"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Items detected:{" "}
              <span className="font-semibold text-slate-900">
                {stats.items}
              </span>
            </span>
            <span>
              Non-empty lines:{" "}
              <span className="font-semibold text-slate-900">
                {stats.rawLines}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
