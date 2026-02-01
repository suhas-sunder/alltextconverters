import { useMemo, useState } from "react";
import { decodeHexToAscii } from "./hexDecode";

type HexToTextToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function HexToTextToolCard({ input, setInput }: HexToTextToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const decoded = useMemo(() => {
    const res = decodeHexToAscii(input);
    // Keep UI errors controlled by actions, but still show immediate decode result.
    // If input is empty, don't show stale messages.
    if (!input.trim()) return { ok: true as const, text: "", warnings: [] as string[] };
    return res;
  }, [input]);

  const effectiveError = useMemo(() => {
    if (errorMsg) return errorMsg;
    if (decoded.ok) return null;
    return decoded.error;
  }, [decoded, errorMsg]);

  const effectiveInfo = useMemo(() => {
    if (effectiveError) return null;
    if (infoMsg) return infoMsg;
    if (decoded.ok && decoded.warnings.length) return decoded.warnings.join(" ");
    return null;
  }, [decoded, effectiveError, infoMsg]);

  async function copyOutput() {
    if (!decoded.ok) return;
    try {
      await navigator.clipboard.writeText(decoded.text);
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

  function normalizeInput() {
    setErrorMsg(null);
    setInfoMsg(null);

    const cleaned = input
      .replace(/^0x/i, "")
      .replace(/\s+/g, " ")
      .trim();

    setInput(cleaned);
    if (cleaned) setInfoMsg("Input normalized (trimmed and collapsed whitespace).");
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

        // Use pdfjs legacy build for broad bundler compatibility
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

        // Worker setup varies across bundlers; try the common Vite-style ?url first, then fall back.
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
        setInfoMsg("PDF text extracted locally. Review for spacing and line breaks.");
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

      // Text-like files
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

  const downloadOutputAsText = () => {
    if (!decoded.ok) return;
    try {
      const blob = new Blob([decoded.text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "decoded-text.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg("Download failed. Please try again.");
    }
  };

  const downloadOutputAsPdf = async () => {
    if (!decoded.ok) return;
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

      const paragraphs = (decoded.text || "").split(/\r?\n/);
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

      doc.save("decoded-text.pdf");
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

  const hasText = Boolean(input.trim());
  const canUseOutput = decoded.ok && Boolean(decoded.text);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Hex to Text
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Paste hex bytes (spaces allowed), decode to ASCII text, then copy or download.
        </p>
      </div>

      {(effectiveError || effectiveInfo) && (
        <div className="space-y-2">
          {effectiveError && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
              ⚠️ {effectiveError}
            </div>
          )}
          {effectiveInfo && !effectiveError && (
            <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-4 py-3 text-sm">
              {effectiveInfo}
            </div>
          )}
        </div>
      )}

      {/* Single editor for HEX input */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setErrorMsg(null);
            setInfoMsg(null);
          }}
          placeholder="Example: 48 65 6c 6c 6f 21"
          className="mt-2 h-72 sm:h-80 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />

        {/* Actions */}
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
                aria-label="Clear input"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={normalizeInput}
                disabled={!hasText}
                className={hasText ? buttonBase : disabledButtonBase}
                aria-label="Normalize hex input"
              >
                Normalize
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={downloadOutputAsText}
                disabled={!canUseOutput}
                className={canUseOutput ? buttonBase : disabledButtonBase}
                aria-label="Download decoded text"
              >
                Download .txt
              </button>

              <button
                type="button"
                onClick={downloadOutputAsPdf}
                disabled={!canUseOutput}
                className={canUseOutput ? buttonBase : disabledButtonBase}
                aria-label="Download decoded text as PDF"
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={copyOutput}
                disabled={!canUseOutput}
                className={canUseOutput ? primaryButton : disabledButtonBase}
                aria-label="Copy decoded output"
              >
                {copied ? "Copied" : "Copy output"}
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">Decoded ASCII output</h2>
            <span className="text-xs text-slate-500">
              {decoded.ok && hasText ? "Live preview" : ""}
            </span>
          </div>

          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <pre className="whitespace-pre-wrap break-words text-sm text-slate-900">
              {decoded.ok
                ? decoded.text || (hasText ? "(No printable output)" : "")
                : ""}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
