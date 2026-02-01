import { useMemo, useState } from "react";
import {
  getDefaultTextToXmlOptions,
  textToXml,
  type TextToXmlOptions,
} from "./textToXmlTransforms";

type TextToXmlToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function TextToXmlToolCard({ input, setInput }: TextToXmlToolCardProps) {
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [options, setOptions] = useState<TextToXmlOptions>(() =>
    getDefaultTextToXmlOptions(),
  );

  const lastStats = useMemo(() => {
    // Quick stats based on current output.
    const lines = output ? output.split(/\r?\n/).length : 0;
    return { outputChars: output.length, outputLines: lines };
  }, [output]);

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
  }

  function runConversion() {
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const result = textToXml(input, options);
      setOutput(result.xml);

      if (result.warnings.length) {
        setInfoMsg(result.warnings.join(" "));
      }
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Conversion failed. Check your settings and try again. This tool runs locally in your browser.",
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
        setInfoMsg(
          "DOCX text extracted locally. Formatting may be simplified.",
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
      a.download = "text.xml";
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

      doc.save("text.xml.pdf");
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

  const fieldLabel =
    "text-xs font-semibold uppercase tracking-wide text-slate-500";

  const toggleWrap =
    "cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-white ring-1 ring-slate-200/80 px-3 py-2 text-sm font-semibold text-slate-800 hover:ring-sky-200/80 transition";

  const inputLike =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Text to XML Converter
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Convert plain text into simple XML using predictable rules. Runs
          locally in your browser.
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

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className={fieldLabel}>Root element</div>
            <input
              value={options.rootTag}
              onChange={(e) =>
                setOptions((p) => ({ ...p, rootTag: e.target.value }))
              }
              className={inputLike}
              placeholder="root"
              aria-label="Root element name"
            />
          </div>

          <div className="space-y-2">
            <div className={fieldLabel}>Item element</div>
            <input
              value={options.itemTag}
              onChange={(e) =>
                setOptions((p) => ({ ...p, itemTag: e.target.value }))
              }
              className={inputLike}
              placeholder="line"
              aria-label="Item element name"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={toggleWrap}
            onClick={() =>
              setOptions((p) => ({ ...p, splitByLines: !p.splitByLines }))
            }
            aria-pressed={options.splitByLines}
          >
            <span
              className={
                "h-2.5 w-2.5 rounded-full " +
                (options.splitByLines ? "bg-sky-500" : "bg-slate-300")
              }
            />
            Split by lines
          </button>

          <button
            type="button"
            className={toggleWrap}
            onClick={() =>
              setOptions((p) => ({
                ...p,
                includeEmptyLines: !p.includeEmptyLines,
              }))
            }
            aria-pressed={options.includeEmptyLines}
          >
            <span
              className={
                "h-2.5 w-2.5 rounded-full " +
                (options.includeEmptyLines ? "bg-sky-500" : "bg-slate-300")
              }
            />
            Include empty lines
          </button>

          <button
            type="button"
            className={toggleWrap}
            onClick={() =>
              setOptions((p) => ({
                ...p,
                addIndexAttribute: !p.addIndexAttribute,
              }))
            }
            aria-pressed={options.addIndexAttribute}
          >
            <span
              className={
                "h-2.5 w-2.5 rounded-full " +
                (options.addIndexAttribute ? "bg-sky-500" : "bg-slate-300")
              }
            />
            Add index attribute
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className={fieldLabel}>Input text</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type text here…"
              className="mt-2 h-52 sm:h-60 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div>
            <div className={fieldLabel}>XML output</div>
            <textarea
              value={output}
              readOnly
              placeholder="Your XML output will appear here…"
              className="mt-2 h-52 sm:h-60 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 font-mono text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <div className="mt-2 text-xs text-slate-500">
              {output
                ? `${lastStats.outputChars.toLocaleString()} chars, ${lastStats.outputLines.toLocaleString()} lines`
                : "Generate output to enable copy and download."}
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-3">
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
                aria-label="Clear"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={runConversion}
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
                aria-label="Convert text to XML"
              >
                Convert to XML
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={downloadAsText}
                disabled={!output}
                className={output ? buttonBase : disabledButtonBase}
                aria-label="Download XML"
              >
                Download XML
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
                onClick={copyOutput}
                disabled={!output}
                className={output ? buttonBase : disabledButtonBase}
                aria-label="Copy output"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-700">
            <div className="font-bold text-slate-900">What gets generated</div>
            <p className="mt-2">
              This tool creates a simple XML wrapper and escapes special
              characters like <span className="font-mono">&lt;</span> and{" "}
              <span className="font-mono">&amp;</span>. It does not infer a
              schema and does not try to guess element names beyond your chosen
              root and item tags.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
