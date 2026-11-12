import { useMemo, useRef, useState } from "react";
import { jsonToText } from "./jsonToTextTransforms";
import { needsUnicodePrint, openTextPrintView } from "../../text/print-view";

type JsonToTextToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function JsonToTextToolCard({
  input,
  setInput,
}: JsonToTextToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [sourceBeforeExtraction, setSourceBeforeExtraction] = useState<string | null>(null);
  const revision = useRef(0);

  const [separator, setSeparator] = useState<"newline" | "space">("newline");
  const [includeKeys, setIncludeKeys] = useState(false);

  const source = sourceBeforeExtraction ?? input;
  const result = useMemo(() => jsonToText(source, { separator, includeKeys }), [source, separator, includeKeys]);
  const exportText = sourceBeforeExtraction !== null ? input : result.ok ? result.text : null;
  const preview = exportText?.slice(0, 240);

  function replaceSource(value: string) {
    revision.current++;
    setSourceBeforeExtraction(null);
    setInput(value);
    setCopied(false);
    setErrorMsg(null);
    setInfoMsg(null);
  }

  function restoreSource() {
    if (sourceBeforeExtraction !== null) replaceSource(sourceBeforeExtraction);
    else replaceSource(input);
  }

  async function copyText() {
    if (!exportText) return;
    const current = revision.current;
    try {
      await navigator.clipboard.writeText(exportText);
      if (current !== revision.current) return;
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      if (current === revision.current) setErrorMsg("Could not copy. Select the text or download it.");
    }
  }

  function clearAll() {
    replaceSource("");
  }

  function extractToText() {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!result.ok) {
      setErrorMsg(result.error ?? "Could not parse JSON.");
      return;
    }

    revision.current++;
    setSourceBeforeExtraction(source);
    setInput(result.text);
  }

  // File upload (client-side). Supports text-like files directly.
  // Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  const handleFileUpload = async (file: File) => {
    const current = ++revision.current;
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
        if (current !== revision.current) return;
        replaceSource(cleaned);
        setInfoMsg(
          "PDF text extracted locally. Paste JSON or clean it if needed.",
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
        if (current !== revision.current) return;
        replaceSource(value);
        setInfoMsg(
          "DOCX text extracted locally. Paste JSON or clean it if needed.",
        );
        return;
      }

      const text = await readAsText();
      if (current !== revision.current) return;
      replaceSource(text);
      setInfoMsg("File loaded locally.");
    } catch {
      if (current !== revision.current) return;
      setErrorMsg(
        "Could not extract text from that file in-browser. Make sure optional libraries are installed (pdfjs-dist for PDF, mammoth for DOCX).",
      );
    }
  };

  const downloadAsText = () => {
    if (!exportText) return;
    try {
      const blob = new Blob([exportText], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "json-to-text.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg("Download failed. Please try again.");
    }
  };

  const downloadAsPdf = async () => {
    if (!exportText) return;
    if (needsUnicodePrint(exportText)) {
      if (!openTextPrintView("JSON to Text", exportText)) setErrorMsg("Allow pop-ups to open the print view.");
      return;
    }
    const current = revision.current;
    try {
      const jsPDFMod: any = await import("jspdf");
      if (current !== revision.current) return;
      const JsPDF = jsPDFMod?.jsPDF ?? jsPDFMod?.default;
      if (!JsPDF) throw new Error("jsPDF not available");

      const doc = new JsPDF({ unit: "pt", format: "letter" });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - margin * 2;

      doc.setFont("times", "normal");
      doc.setFontSize(11);

      const paragraphs = exportText.split(/\r?\n/);
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

      doc.save("json-to-text.pdf");
    } catch {
      if (current === revision.current) setErrorMsg("Could not create the PDF. The text download is still available.");
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
          JSON to Text
        </h1>
        <p className="text-sm text-slate-600">
          Extract readable text from JSON values. Runs locally in your browser.
        </p>
      </div>

      {(errorMsg || infoMsg) && (
        <div className="space-y-2">
          {errorMsg && (
            <div role="alert" className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
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
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => { if (separator !== "newline") { restoreSource(); setSeparator("newline"); } }}
              className={separator === "newline" ? primaryButton : buttonBase}
              aria-label="Join extracted values with newlines"
            >
              Newlines
            </button>
            <button
              type="button"
              onClick={() => { if (separator !== "space") { restoreSource(); setSeparator("space"); } }}
              className={separator === "space" ? primaryButton : buttonBase}
              aria-label="Join extracted values with spaces"
            >
              Spaces
            </button>

            <button
              type="button"
              onClick={() => { restoreSource(); setIncludeKeys((v) => !v); }}
              className={includeKeys ? primaryButton : buttonBase}
              aria-label="Include key paths"
              title="If enabled, output lines look like path.to.value: text"
            >
              {includeKeys ? "Keys: On" : "Keys: Off"}
            </button>
          </div>

          <div className="text-xs text-slate-600">
            {source.trim() ? (
              result.ok ? (
                <>
                  Extractable:{" "}
                  <span className="font-semibold">{result.extractedCount}</span>
                  {result.skippedCount ? (
                    <>
                      {" "}
                      · Skipped:{" "}
                      <span className="font-semibold">{result.skippedCount}</span>
                    </>
                  ) : null}
                </>
              ) : (
                <span className="text-red-700 font-semibold">Invalid JSON</span>
              )
            ) : (
              "Paste JSON to see a preview"
            )}
          </div>
        </div>

        <textarea
          id="json-to-text-editor"
          value={input}
          onChange={(e) => {
            if (sourceBeforeExtraction === null) replaceSource(e.target.value);
            else {
              revision.current++;
              setInput(e.target.value);
              setCopied(false);
              setErrorMsg(null);
            }
          }}
          aria-label={sourceBeforeExtraction !== null ? "Extracted text" : "JSON input"}
          placeholder='Paste JSON here… Example: {"message":"hello","items":[{"text":"a"},{"text":"b"}]}'
          className="mt-3 h-72 sm:h-80 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
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
                    const inputElement = e.currentTarget;
                    const f = e.target.files?.[0];
                    if (!f) return;
                    await handleFileUpload(f);
                    inputElement.value = "";
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

              {sourceBeforeExtraction !== null && (
                <button type="button" onClick={restoreSource} className={buttonBase}>Restore source JSON</button>
              )}

              <button
                type="button"
                onClick={extractToText}
                disabled={!source.trim()}
                className={source.trim() ? primaryButton : disabledButtonBase}
                aria-label="Extract values from JSON"
              >
                Extract Values
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={downloadAsPdf}
                disabled={!exportText}
                className={exportText ? buttonBase : disabledButtonBase}
                aria-label="Download as PDF"
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={downloadAsText}
                disabled={!exportText}
                className={exportText ? buttonBase : disabledButtonBase}
                aria-label="Download as TXT"
              >
                Download TXT
              </button>

              <button
                type="button"
                onClick={copyText}
                disabled={!exportText}
                className={exportText ? buttonBase : disabledButtonBase}
                aria-label="Copy extracted text"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {sourceBeforeExtraction === null && preview ? (
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-700">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preview
              </div>
              <div className="mt-2 whitespace-pre-wrap break-words">
                {preview}
                {preview.length < (exportText?.length ?? 0) ? "…" : ""}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
