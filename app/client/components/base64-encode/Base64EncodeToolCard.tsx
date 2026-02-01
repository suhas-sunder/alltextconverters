import { useState } from "react";
import {
  base64EncodeWithSummary,
  type AppliedOperation,
} from "./base64Transforms";

type Base64EncodeToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function Base64EncodeToolCard({
  input,
  setInput,
}: Base64EncodeToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [appliedOps, setAppliedOps] = useState<AppliedOperation[] | null>(null);

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
    setAppliedOps(null);
  }

  function encodeToBase64() {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!input) {
      setAppliedOps(null);
      return;
    }

    const res = base64EncodeWithSummary(input);
    setAppliedOps(res.ops);

    if (!res.ok) {
      setErrorMsg(res.error);
      return;
    }

    setInput(res.output);
  }

  // File upload (client-side). Supports text-like files directly.
  // Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setInfoMsg(null);
    setAppliedOps(null);

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
      let extracted = "";

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

        extracted = fullText.trim();
        if (!extracted) throw new Error("No text found in PDF");
        setInfoMsg("PDF text extracted locally. Review for layout artifacts.");
      } else if (ext === "docx") {
        // Requires: mammoth
        const arrayBuffer = await file.arrayBuffer();
        const mammoth: any = await import("mammoth/mammoth.browser");
        const result = await mammoth.extractRawText({ arrayBuffer });
        extracted = String(result?.value ?? "").trim();
        if (!extracted) throw new Error("No text found in DOCX");
        setInfoMsg(
          "DOCX text extracted locally. Formatting may be simplified.",
        );
      } else {
        extracted = await readAsText();
        setInfoMsg("File loaded locally.");
      }

      const res = base64EncodeWithSummary(extracted);
      setAppliedOps(res.ops);
      if (!res.ok) {
        setErrorMsg(res.error);
        return;
      }
      setInput(res.output);
      setInfoMsg((prev) =>
        prev
          ? `${prev} Encoded locally in your browser.`
          : "Encoded locally in your browser.",
      );
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

      doc.save("base64-encoded.txt.pdf");
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
          Base64 Encoder
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
                onClick={encodeToBase64}
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
                aria-label="Encode to Base64"
              >
                Encode to Base64
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
                aria-label="Copy Base64"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {appliedOps && appliedOps.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Applied operations
              </div>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {appliedOps.map((op, idx) => (
                  <li
                    key={`${op.label}-${idx}`}
                    className="rounded-lg bg-white ring-1 ring-slate-200/80 px-3 py-2"
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {op.label}
                    </div>
                    {op.detail ? (
                      <div className="text-xs text-slate-600">{op.detail}</div>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-slate-600">
                Everything runs on your device. The page does not send your text
                to a server.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
