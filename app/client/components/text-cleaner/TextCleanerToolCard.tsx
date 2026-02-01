import { useMemo, useState } from "react";
import { cleanText, type AppliedOperation } from "./textCleanerTransforms";

type TextCleanerToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function TextCleanerToolCard({ input, setInput }: TextCleanerToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [applied, setApplied] = useState<AppliedOperation[] | null>(null);

  const appliedSummary = useMemo(() => {
    if (!applied) return null;
    const total = applied.reduce((acc, x) => acc + (x.count ?? 0), 0);
    return { steps: applied.length, total };
  }, [applied]);

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
    setApplied(null);
    setErrorMsg(null);
    setInfoMsg(null);
  }

  function runCleaner() {
    setErrorMsg(null);
    setInfoMsg(null);

    const result = cleanText(input, { collapseSpaces: true });
    setInput(result.output);
    setApplied(result.applied);

    if (result.applied.length === 0) {
      setInfoMsg("No cleanup needed. Your text already looks consistent.");
    } else {
      setInfoMsg("Cleaned locally in your browser. Review and copy when ready.");
    }
  }

  // File upload (client-side). Supports text-like files directly.
  // Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setInfoMsg(null);
    setApplied(null);

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

        const extracted = fullText.trim();
        if (!extracted) throw new Error("No text found in PDF");

        setInput(extracted);
        setInfoMsg("PDF text extracted locally. Click Clean to normalize it.");
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
        setInfoMsg("DOCX text extracted locally. Click Clean to normalize it.");
        return;
      }

      const text = await readAsText();
      setInput(text);
      setInfoMsg("File loaded locally. Click Clean to apply cleanup rules.");
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not extract text from that file in-browser. Make sure optional libraries are installed (pdfjs-dist for PDF, mammoth for DOCX).",
      );
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

      doc.save("cleaned-text.pdf");
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Text Cleaner
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
            setApplied(null);
            setErrorMsg(null);
            setInfoMsg(null);
          }}
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
                onClick={runCleaner}
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
                aria-label="Clean text"
              >
                Clean text
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
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
                aria-label="Copy text"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  Applied operations
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  {applied
                    ? "This list reflects changes made by the last Clean action."
                    : "Run Clean to see what changed."}
                </div>
              </div>

              {appliedSummary && (
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    {appliedSummary.steps} step{appliedSummary.steps === 1 ? "" : "s"}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              {applied && applied.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {applied.map((op) => (
                    <li
                      key={op.key}
                      className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 hover:ring-sky-200/80 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500/90" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-bold text-slate-900">
                              {op.label}
                            </div>
                            {typeof op.count === "number" && (
                              <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-2 py-0.5 text-xs font-semibold">
                                {op.count}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-slate-700">
                            {op.detail}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : applied && applied.length === 0 ? (
                <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 text-sm text-slate-700">
                  No changes were needed. If you expected cleanup, try uploading
                  the original source or check for non-breaking spaces and other
                  special characters in your destination app.
                </div>
              ) : (
                <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 text-sm text-slate-700">
                  Click <span className="font-semibold text-slate-900">Clean text</span> to apply trimming,
                  line-ending normalization, space collapsing, and zero-width removal.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
