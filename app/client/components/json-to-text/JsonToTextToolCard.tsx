import { useMemo, useState } from "react";
import { jsonToText } from "./jsonToTextTransforms";

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

  const [separator, setSeparator] = useState<"newline" | "space">("newline");
  const [includeKeys, setIncludeKeys] = useState(false);

  const stats = useMemo(() => {
    const result = jsonToText(input, { separator, includeKeys });
    if (!input.trim()) {
      return { ok: true, extracted: 0, skipped: 0, preview: "" };
    }
    if (!result.ok) return { ok: false, extracted: 0, skipped: 0, preview: "" };
    return {
      ok: true,
      extracted: result.extractedCount,
      skipped: result.skippedCount,
      preview: result.text.slice(0, 240),
    };
  }, [input, separator, includeKeys]);

  async function copyText() {
    try {
      const result = jsonToText(input, { separator, includeKeys });
      if (!result.ok) return;
      await navigator.clipboard.writeText(result.text);
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

  function extractToText() {
    setErrorMsg(null);
    setInfoMsg(null);

    const result = jsonToText(input, { separator, includeKeys });
    if (!result.ok) {
      setErrorMsg(result.error ?? "Could not parse JSON.");
      return;
    }

    // Replace the editor value with the extracted text for easy copy/download.
    setInput(result.text);
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
        setInput(value);
        setInfoMsg(
          "DOCX text extracted locally. Paste JSON or clean it if needed.",
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
      const result = jsonToText(input, { separator, includeKeys });
      if (!result.ok) {
        setErrorMsg(result.error ?? "Could not parse JSON.");
        return;
      }
      const blob = new Blob([result.text], {
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
    try {
      const result = jsonToText(input, { separator, includeKeys });
      if (!result.ok) {
        setErrorMsg(result.error ?? "Could not parse JSON.");
        return;
      }

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

      const paragraphs = (result.text || "").split(/\r?\n/);
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
          JSON to Text
        </h1>
        <p className="text-sm text-slate-600">
          Extract readable text from JSON values. Runs locally in your browser.
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
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSeparator("newline")}
              className={separator === "newline" ? primaryButton : buttonBase}
              aria-label="Join extracted values with newlines"
            >
              Newlines
            </button>
            <button
              type="button"
              onClick={() => setSeparator("space")}
              className={separator === "space" ? primaryButton : buttonBase}
              aria-label="Join extracted values with spaces"
            >
              Spaces
            </button>

            <button
              type="button"
              onClick={() => setIncludeKeys((v) => !v)}
              className={includeKeys ? primaryButton : buttonBase}
              aria-label="Include key paths"
              title="If enabled, output lines look like path.to.value: text"
            >
              {includeKeys ? "Keys: On" : "Keys: Off"}
            </button>
          </div>

          <div className="text-xs text-slate-600">
            {input.trim() ? (
              stats.ok ? (
                <>
                  Extractable:{" "}
                  <span className="font-semibold">{stats.extracted}</span>
                  {stats.skipped ? (
                    <>
                      {" "}
                      · Skipped:{" "}
                      <span className="font-semibold">{stats.skipped}</span>
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
                onClick={extractToText}
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
                aria-label="Extract values from JSON"
              >
                Extract Values
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
                onClick={downloadAsText}
                disabled={!input}
                className={input ? buttonBase : disabledButtonBase}
                aria-label="Download as TXT"
              >
                Download TXT
              </button>

              <button
                type="button"
                onClick={copyText}
                disabled={!input || !stats.ok}
                className={input && stats.ok ? buttonBase : disabledButtonBase}
                aria-label="Copy extracted text"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {input.trim() && stats.ok && stats.preview ? (
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-700">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preview
              </div>
              <div className="mt-2 whitespace-pre-wrap break-words">
                {stats.preview}
                {stats.preview.length >= 240 ? "…" : ""}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
