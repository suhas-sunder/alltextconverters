import { useMemo, useState } from "react";
import {
  htmlToText,
  type HtmlToTextOptions,
  type HtmlToTextStats,
} from "./htmlToTextTransforms";

type HtmlToTextToolCardProps = {
  htmlInput: string;
  setHtmlInput: (v: string) => void;
};

type AppliedOp = { label: string; detail?: string };

export function HtmlToTextToolCard({
  htmlInput,
  setHtmlInput,
}: HtmlToTextToolCardProps) {
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [opts, setOpts] = useState<HtmlToTextOptions>({
    collapseRepeatedSpaces: true,
    preserveLineBreaks: true,
    removeZeroWidth: true,
    collapseBlankLines: true,
  });

  const [lastStats, setLastStats] = useState<HtmlToTextStats | null>(null);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  function clearAll() {
    setHtmlInput("");
    setOutput("");
    setLastStats(null);
    setErrorMsg(null);
    setInfoMsg(null);
  }

  function runExtract() {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!htmlInput.trim()) {
      setOutput("");
      setLastStats(null);
      return;
    }

    try {
      const res = htmlToText(htmlInput, opts);
      setOutput(res.text);
      setLastStats(res.stats);

      if (!res.text.trim()) {
        setInfoMsg(
          "No readable text was found after stripping HTML. Try pasting full page HTML (including <body>) or disabling extra cleanup options.",
        );
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not parse that HTML. Make sure the input is valid markup or try removing any non-HTML wrapper content.",
      );
      setOutput("");
      setLastStats(null);
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

        // PDF is already plain text; treat it as the "HTML" input for extraction.
        setHtmlInput(cleaned);
        setInfoMsg(
          "PDF text extracted locally. Paste real HTML if you want tag-aware extraction.",
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
        setHtmlInput(value);
        setInfoMsg(
          "DOCX text extracted locally. Paste HTML for tag-aware extraction.",
        );
        return;
      }

      const text = await readAsText();
      setHtmlInput(text);
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
      a.download = "html-to-text.txt";
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

      doc.save("html-to-text.pdf");
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

  const appliedOps: AppliedOp[] = useMemo(() => {
    const ops: AppliedOp[] = [
      {
        label: "Strip scripts/styles",
        detail:
          "Removes <script>, <style>, <noscript>, <template> before extraction.",
      },
    ];
    if (opts.preserveLineBreaks)
      ops.push({
        label: "Preserve line breaks",
        detail: "Keeps paragraph-like breaks when possible.",
      });
    else
      ops.push({
        label: "Single-line output",
        detail: "Collapses all whitespace into one space.",
      });

    if (opts.collapseRepeatedSpaces)
      ops.push({
        label: "Collapse repeated spaces",
        detail: "Turns tabs and 2+ spaces into one space.",
      });
    if (opts.collapseBlankLines && opts.preserveLineBreaks)
      ops.push({
        label: "Collapse blank lines",
        detail: "Reduces very tall spacing to a readable block.",
      });
    if (opts.removeZeroWidth)
      ops.push({
        label: "Remove zero-width characters",
        detail: "Strips invisible Unicode that can break matching/search.",
      });
    return ops;
  }, [opts]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          HTML to Text Converter
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

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div className="grid gap-3 sm:gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              HTML input
            </div>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste HTML here… (a fragment or a full page)"
              className="mt-2 h-52 sm:h-56 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <label className={buttonBase}>
                  Upload (.html, .txt, .pdf, .docx)
                  <input
                    type="file"
                    className="hidden"
                    accept=".html,.htm,.txt,.md,.csv,.json,.xml,.pdf,.docx"
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
                  onClick={runExtract}
                  disabled={!htmlInput.trim()}
                  className={
                    htmlInput.trim() ? primaryButton : disabledButtonBase
                  }
                  aria-label="Extract text from HTML"
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
                  aria-label="Download as TXT"
                >
                  Download TXT
                </button>

                <button
                  type="button"
                  onClick={downloadAsPdf}
                  disabled={!output}
                  className={output ? buttonBase : disabledButtonBase}
                  aria-label="Download as PDF"
                >
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={copyText}
                  disabled={!output}
                  className={output ? buttonBase : disabledButtonBase}
                  aria-label="Copy extracted text"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Extracted text
              </div>
              {lastStats ? (
                <div className="text-xs text-slate-500">
                  {Math.max(0, lastStats.inputLength)} chars in →{" "}
                  {Math.max(0, lastStats.outputLength)} chars out
                </div>
              ) : null}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Your plain text output will appear here…"
              className="mt-2 h-52 sm:h-56 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
        </div>

        {/* Options */}
        <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
          <div className="text-sm font-bold text-slate-900">
            Cleanup options
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Toggle
              checked={opts.preserveLineBreaks}
              onChange={(v) =>
                setOpts((p) => ({ ...p, preserveLineBreaks: v }))
              }
              label="Preserve line breaks"
              description="Keeps readable breaks when possible (recommended)."
            />
            <Toggle
              checked={opts.collapseRepeatedSpaces}
              onChange={(v) =>
                setOpts((p) => ({ ...p, collapseRepeatedSpaces: v }))
              }
              label="Collapse repeated spaces"
              description="Turns tabs and multiple spaces into a single space."
            />
            <Toggle
              checked={opts.collapseBlankLines}
              onChange={(v) =>
                setOpts((p) => ({ ...p, collapseBlankLines: v }))
              }
              label="Collapse blank lines"
              description="Reduces excessive blank lines in multi-line output."
            />
            <Toggle
              checked={opts.removeZeroWidth}
              onChange={(v) => setOpts((p) => ({ ...p, removeZeroWidth: v }))}
              label="Remove zero-width characters"
              description="Strips invisible Unicode that can break matching/search."
            />
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Applied operations
            </div>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {appliedOps.map((op) => (
                <li
                  key={op.label}
                  className="rounded-xl bg-white ring-1 ring-slate-200/80 p-3"
                >
                  <div className="font-semibold text-slate-900 text-sm">
                    {op.label}
                  </div>
                  {op.detail ? (
                    <div className="mt-1 text-xs text-slate-600 leading-6">
                      {op.detail}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            {lastStats && opts.removeZeroWidth ? (
              <div className="mt-3 text-xs text-slate-600">
                Removed zero-width characters:{" "}
                <span className="font-semibold text-slate-900">
                  {lastStats.removedZeroWidth}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="cursor-pointer flex items-start gap-3 rounded-2xl bg-white ring-1 ring-slate-200/80 p-3 hover:ring-sky-200/80 transition">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-sky-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-900">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-slate-600 leading-6">
          {description}
        </span>
      </span>
    </label>
  );
}
