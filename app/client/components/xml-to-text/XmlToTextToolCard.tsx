import { useMemo, useState } from "react";
import { xmlToText } from "./xmlToTextTransforms";

type XmlToTextToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function XmlToTextToolCard({ input, setInput }: XmlToTextToolCardProps) {
  const [output, setOutput] = useState("");
  const [collapseWhitespace, setCollapseWhitespace] = useState(true);
  const [keepLineBreaks, setKeepLineBreaks] = useState(false);

  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [lastStats, setLastStats] = useState<{
    inputChars: number;
    outputChars: number;
    textNodes: number;
    parseOk: boolean;
    collapsedWhitespace: boolean;
    keptLineBreaks: boolean;
  } | null>(null);

  const canRun = Boolean(input.trim());

  const summaryLine = useMemo(() => {
    if (!lastStats) return null;
    if (!lastStats.parseOk) return "Invalid XML. Fix the XML, then try again.";
    const parts = [
      `${lastStats.textNodes} text node${lastStats.textNodes === 1 ? "" : "s"}`,
      `${lastStats.outputChars} output character${lastStats.outputChars === 1 ? "" : "s"}`,
      lastStats.collapsedWhitespace
        ? "whitespace collapsed"
        : "whitespace preserved",
      lastStats.keptLineBreaks ? "line breaks kept" : "line breaks removed",
    ];
    return parts.join(" • ");
  }, [lastStats]);

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setErrorMsg(null);
    setInfoMsg(null);
    setLastStats(null);
  }

  function runConvert() {
    setErrorMsg(null);
    setInfoMsg(null);

    const res = xmlToText(input, { collapseWhitespace, keepLineBreaks });

    setLastStats(res.stats);

    if (!res.stats.parseOk) {
      setOutput("");
      setErrorMsg(
        "That input does not parse as valid XML. This tool extracts text only when the XML is well-formed.",
      );
      return;
    }

    setOutput(res.text);

    if (!res.text) {
      setInfoMsg(
        "XML parsed successfully, but no readable text was found (or it was all whitespace).",
      );
    }
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
        setInfoMsg(
          "PDF text extracted locally. Paste XML into the editor if needed.",
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
          "DOCX text extracted locally. Paste XML into the editor if needed.",
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

  const downloadAsText = () => {
    try {
      const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "xml-to-text.txt";
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

      const paragraphs = (output || "").split(/\r?\n/);
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

      doc.save("xml-to-text.pdf");
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

  const toggleBase =
    "cursor-pointer inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          XML to Text
        </h1>
      </div>

      {(errorMsg || infoMsg || summaryLine) && (
        <div className="space-y-2">
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
              ⚠️ {errorMsg}
            </div>
          )}
          {!errorMsg && infoMsg && (
            <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-4 py-3 text-sm">
              {infoMsg}
            </div>
          )}
          {!errorMsg && summaryLine && (
            <div className="bg-white border border-slate-200 text-slate-700 rounded-md px-4 py-3 text-sm">
              <span className="font-semibold text-slate-900">Last run:</span>{" "}
              {summaryLine}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              XML input
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste XML here…"
              className="mt-2 h-64 sm:h-72 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Extracted text
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Output will appear here…"
              className="mt-2 h-64 sm:h-72 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <label className={buttonBase}>
                Upload (.txt, .xml, .pdf, .docx)
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
                aria-label="Clear"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => setCollapseWhitespace((v) => !v)}
                className={toggleBase}
                aria-label="Toggle collapse whitespace"
              >
                <span
                  className={
                    "h-2.5 w-2.5 rounded-full " +
                    (collapseWhitespace ? "bg-sky-500" : "bg-slate-300")
                  }
                />
                Collapse whitespace
              </button>

              <button
                type="button"
                onClick={() => setKeepLineBreaks((v) => !v)}
                className={toggleBase}
                aria-label="Toggle keep line breaks"
              >
                <span
                  className={
                    "h-2.5 w-2.5 rounded-full " +
                    (keepLineBreaks ? "bg-sky-500" : "bg-slate-300")
                  }
                />
                Keep line breaks
              </button>

              <button
                type="button"
                onClick={runConvert}
                disabled={!canRun}
                className={canRun ? primaryButton : disabledButtonBase}
                aria-label="Extract text"
              >
                Extract text
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={downloadAsText}
                disabled={!output}
                className={output ? buttonBase : disabledButtonBase}
                aria-label="Download TXT"
              >
                Download TXT
              </button>

              <button
                type="button"
                onClick={downloadAsPdf}
                disabled={!output}
                className={output ? buttonBase : disabledButtonBase}
                aria-label="Download PDF"
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className={output ? buttonBase : disabledButtonBase}
                aria-label="Copy output"
              >
                {copied ? "Copied" : "Copy output"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
