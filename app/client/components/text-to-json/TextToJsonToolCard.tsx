import { useMemo, useState } from "react";
import {
  convertTextToJson,
  type TextToJsonMode,
  type TextToJsonOptions,
} from "./textToJsonTransforms";

type TextToJsonToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function TextToJsonToolCard({
  input,
  setInput,
}: TextToJsonToolCardProps) {
  const [mode, setMode] = useState<TextToJsonMode>("lines");
  const [ignoreEmptyLines, setIgnoreEmptyLines] = useState(true);
  const [trimValues, setTrimValues] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [allowDuplicateKeys, setAllowDuplicateKeys] = useState(false);

  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const options: TextToJsonOptions = useMemo(
    () => ({
      mode,
      ignoreEmptyLines,
      trimValues,
      prettyPrint,
      allowDuplicateKeys,
    }),
    [mode, ignoreEmptyLines, trimValues, prettyPrint, allowDuplicateKeys],
  );

  const lastRun = useMemo(() => {
    if (!output && !input.trim()) return null;
    const result = convertTextToJson(input, options);
    return result;
  }, [input, options, output]);

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

  function runConvert() {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!input.trim()) {
      setOutput("");
      return;
    }

    const result = convertTextToJson(input, options);
    setOutput(result.json);

    if (result.warnings.length) {
      setInfoMsg(result.warnings.join(" "));
    }
  }

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
        setInfoMsg("PDF text extracted locally. Review and then convert.");
        setOutput("");
        return;
      }

      if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth: any = await import("mammoth/mammoth.browser");
        const result = await mammoth.extractRawText({ arrayBuffer });
        const value = String(result?.value ?? "").trim();
        if (!value) throw new Error("No text found in DOCX");
        setInput(value);
        setInfoMsg(
          "DOCX text extracted locally. Formatting may be simplified.",
        );
        setOutput("");
        return;
      }

      const text = await readAsText();
      setInput(text);
      setInfoMsg("File loaded locally.");
      setOutput("");
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not extract text from that file in-browser. Make sure optional libraries are installed (pdfjs-dist for PDF, mammoth for DOCX).",
      );
    }
  };

  const downloadAsJson = () => {
    try {
      const blob = new Blob([output], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.json";
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
      const jsPDFMod: any = await import("jspdf");
      const JsPDF = jsPDFMod?.jsPDF ?? jsPDFMod?.default;
      if (!JsPDF) throw new Error("jsPDF not available");

      const doc = new JsPDF({ unit: "pt", format: "letter" });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - margin * 2;

      doc.setFont("times", "normal");
      doc.setFontSize(10);

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
          y += 13;
        }
        if (i < paragraphs.length - 1) y += 7;
      }

      doc.save("output.pdf");
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
          Text to JSON
        </h1>
        <p className="text-sm text-slate-600 leading-6 max-w-2xl mx-auto">
          Best-effort converter for turning plain text into JSON. Choose “Lines
          to array” or parse simple{" "}
          <span className="font-semibold text-slate-900">key:value</span> lines.
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
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Input
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Example:\nname: Alice\nage: 22\n\nor:\nfirst line\nsecond line`}
              className="mt-2 h-56 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Output (JSON)
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Click Convert to generate JSON…"
              className="mt-2 h-56 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 pt-3 font-mono text-[12px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
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
                onClick={runConvert}
                disabled={!input.trim()}
                className={input.trim() ? primaryButton : disabledButtonBase}
                aria-label="Convert text to JSON"
              >
                Convert
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap lg:justify-end">
              <button
                type="button"
                onClick={downloadAsPdf}
                disabled={!output}
                className={output ? buttonBase : disabledButtonBase}
                aria-label="Download output as PDF"
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={downloadAsJson}
                disabled={!output}
                className={output ? buttonBase : disabledButtonBase}
                aria-label="Download output as JSON"
              >
                Download JSON
              </button>

              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className={output ? buttonBase : disabledButtonBase}
                aria-label="Copy output JSON"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-700">
                  Mode
                </span>

                <button
                  type="button"
                  className={mode === "lines" ? primaryButton : buttonBase}
                  onClick={() => setMode("lines")}
                  aria-label="Lines to array mode"
                >
                  Lines → Array
                </button>

                <button
                  type="button"
                  className={mode === "keyValue" ? primaryButton : buttonBase}
                  onClick={() => setMode("keyValue")}
                  aria-label="Key value mode"
                >
                  Key:value → Object
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={ignoreEmptyLines}
                    onChange={(e) => setIgnoreEmptyLines(e.target.checked)}
                    className="cursor-pointer accent-sky-600"
                  />
                  Ignore empty lines
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={prettyPrint}
                    onChange={(e) => setPrettyPrint(e.target.checked)}
                    className="cursor-pointer accent-sky-600"
                  />
                  Pretty print
                </label>

                {mode === "keyValue" && (
                  <>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={trimValues}
                        onChange={(e) => setTrimValues(e.target.checked)}
                        className="cursor-pointer accent-sky-600"
                      />
                      Trim values
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={allowDuplicateKeys}
                        onChange={(e) =>
                          setAllowDuplicateKeys(e.target.checked)
                        }
                        className="cursor-pointer accent-sky-600"
                      />
                      Keep duplicate keys
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-600 leading-6">
              <span className="font-semibold text-slate-900">
                Best-effort disclaimer:
              </span>{" "}
              This tool makes simple, deterministic assumptions. It will not
              guess schemas or “fix” messy data. Review the output before you
              use it in production.
            </div>

            {lastRun && (output || input.trim()) && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Input lines", String(lastRun.stats.inputLines)],
                  ["Kept lines", String(lastRun.stats.keptLines)],
                  [
                    mode === "keyValue" ? "Parsed pairs" : "Array items",
                    mode === "keyValue"
                      ? String(lastRun.stats.parsedPairs)
                      : String(
                          Array.isArray(lastRun.value)
                            ? (lastRun.value as any[]).length
                            : 0,
                        ),
                  ],
                  ["Skipped lines", String(lastRun.stats.skippedLines)],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {k}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
