import { useMemo, useState } from "react";
import { removeDuplicateLines } from "./removeDuplicateLinesTransforms";

type RemoveDuplicateLinesToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

type LastRun = {
  totalLines: number;
  uniqueLines: number;
  removedDuplicates: number;
  caseInsensitive: boolean;
  preserveOriginalOrder: boolean;
} | null;

export function RemoveDuplicateLinesToolCard({
  input,
  setInput,
}: RemoveDuplicateLinesToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [preserveOriginalOrder, setPreserveOriginalOrder] = useState(true);
  const [lastRun, setLastRun] = useState<LastRun>(null);

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
    setLastRun(null);
  }

  function runDedup() {
    setErrorMsg(null);
    setInfoMsg(null);

    const result = removeDuplicateLines(input, {
      caseInsensitive,
      preserveOriginalOrder,
    });

    setInput(result.output);
    setLastRun({
      ...result,
      caseInsensitive,
      preserveOriginalOrder,
    });

    const removed = result.removedDuplicates;
    if (removed === 0) {
      setInfoMsg("No duplicate lines found. Nothing was removed.");
    } else {
      setInfoMsg(
        `Removed ${removed} duplicate line${removed === 1 ? "" : "s"}. Kept ${result.uniqueLines} unique line${result.uniqueLines === 1 ? "" : "s"}.`,
      );
    }
  }

  // File upload (client-side). Supports text-like files directly.
  // Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setInfoMsg(null);
    setLastRun(null);

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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
        setInfoMsg("DOCX text extracted locally. Formatting may be simplified.");
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

      doc.save("unique-lines.pdf");
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

  const optionPill =
    "cursor-pointer inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:ring-sky-200 hover:bg-sky-50 transition";

  const stats = useMemo(() => {
    if (!lastRun) return null;
    return [
      { k: "Total lines", v: String(lastRun.totalLines) },
      { k: "Unique lines", v: String(lastRun.uniqueLines) },
      { k: "Removed duplicates", v: String(lastRun.removedDuplicates) },
      {
        k: "Matching",
        v: lastRun.caseInsensitive ? "Case-insensitive" : "Case-sensitive",
      },
      {
        k: "Output order",
        v: lastRun.preserveOriginalOrder ? "Original order" : "Sorted",
      },
    ];
  }, [lastRun]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Remove Duplicate Lines
        </h1>
        <p className="text-sm text-slate-600 leading-6 max-w-2xl mx-auto">
          Paste a list, log output, CSV column, or any line-based text. Remove repeated
          lines in one click with practical options for matching and ordering.
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
          onChange={(e) => {
            setInput(e.target.value);
            setLastRun(null);
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          placeholder="Paste or type line-based text here… (one item per line)"
          className="mt-2 h-72 sm:h-80 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={optionPill}
              aria-pressed={caseInsensitive}
              onClick={() => setCaseInsensitive((v) => !v)}
            >
              <span
                className={
                  caseInsensitive
                    ? "h-2.5 w-2.5 rounded-full bg-sky-500"
                    : "h-2.5 w-2.5 rounded-full bg-slate-300"
                }
              />
              Case-insensitive
            </button>

            <button
              type="button"
              className={optionPill}
              aria-pressed={preserveOriginalOrder}
              onClick={() => setPreserveOriginalOrder((v) => !v)}
            >
              <span
                className={
                  preserveOriginalOrder
                    ? "h-2.5 w-2.5 rounded-full bg-sky-500"
                    : "h-2.5 w-2.5 rounded-full bg-slate-300"
                }
              />
              Preserve original order
            </button>
          </div>

          {stats && (
            <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Last run summary
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.k}
                    className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-3"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {s.k}
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900">
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                onClick={runDedup}
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
                aria-label="Remove duplicate lines"
              >
                Remove duplicates
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

          <div className="text-xs text-slate-500 leading-5">
            Tip: If your text has a header line (like a column name), it will be treated like any other line.
            If you want to always keep a header, keep “Preserve original order” on so the first occurrence stays first.
          </div>
        </div>
      </div>
    </div>
  );
}
