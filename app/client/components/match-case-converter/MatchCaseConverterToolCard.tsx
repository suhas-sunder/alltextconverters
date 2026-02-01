import { useMemo, useState } from "react";
import { applyMatchCase } from "./matchCaseTransforms";

type MatchCaseConverterToolCardProps = {
  referenceText: string;
  setReferenceText: (v: string) => void;
  targetText: string;
  setTargetText: (v: string) => void;
};

export function MatchCaseConverterToolCard({
  referenceText,
  setReferenceText,
  targetText,
  setTargetText,
}: MatchCaseConverterToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [ignoreNonLettersInReference] = useState(true);

  const result = useMemo(() => {
    try {
      const r = applyMatchCase(referenceText, targetText, {
        referenceLettersOnly: ignoreNonLettersInReference,
      });
      return r;
    } catch (e) {
      console.error(e);
      return {
        output: "",
        patternLength: 0,
        appliedLetters: 0,
        warning: "Could not apply the pattern. Check your input and try again.",
      };
    }
  }, [referenceText, targetText, ignoreNonLettersInReference]);

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  function clearAll() {
    setReferenceText("");
    setTargetText("");
    setErrorMsg(null);
    setInfoMsg(null);
  }

  function runConvert() {
    setErrorMsg(null);
    setInfoMsg(null);

    if (!targetText.trim()) {
      setErrorMsg("Paste target text first.");
      return;
    }
    if (!referenceText.trim()) {
      setErrorMsg(
        "Paste reference text first (this defines the casing pattern).",
      );
      return;
    }

    if (result.warning) {
      setInfoMsg(result.warning);
    } else {
      setInfoMsg("Pattern applied locally in your browser.");
    }
  }

  // Shared file upload helper for reference/target (client-side). Supports text-like files directly.
  // Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  const loadFileInto = async (file: File, which: "reference" | "target") => {
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

        if (which === "reference") setReferenceText(cleaned);
        else setTargetText(cleaned);

        setInfoMsg("PDF text extracted locally. Review for layout artifacts.");
        return;
      }

      if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth: any = await import("mammoth/mammoth.browser");
        const result = await mammoth.extractRawText({ arrayBuffer });
        const value = String(result?.value ?? "").trim();
        if (!value) throw new Error("No text found in DOCX");

        if (which === "reference") setReferenceText(value);
        else setTargetText(value);

        setInfoMsg(
          "DOCX text extracted locally. Formatting may be simplified.",
        );
        return;
      }

      const text = await readAsText();

      if (which === "reference") setReferenceText(text);
      else setTargetText(text);

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

      const paragraphs = (result.output || "").split(/\r?\n/);
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

      doc.save("match-case-output.pdf");
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

  const hasOutput = Boolean(result.output);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Match Case Converter
        </h1>
        <p className="text-sm text-slate-600 leading-6 max-w-2xl mx-auto">
          Paste a reference style, and/or target text, then apply the same
          uppercase and lowercase pattern without rewriting your content. ~ {" "}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
            Example: <span className="font-mono">"HeLLo"</span> +{" "}
            <span className="font-mono">"world"</span> →{" "}
            <span className="font-mono">"WoRLd"</span>
          </div>
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
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reference text (pattern)
            </div>
            <textarea
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="Paste a string whose casing you want to imitate…"
              className="mt-2 h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <label className={buttonBase}>
                Upload reference
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.csv,.json,.html,.xml,.pdf,.docx"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    await loadFileInto(f, "reference");
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Target text (apply pattern)
            </div>
            <textarea
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
              placeholder="Paste the text you want to restyle…"
              className="mt-2 h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <label className={buttonBase}>
                Upload target
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.csv,.json,.html,.xml,.pdf,.docx"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    await loadFileInto(f, "target");
                    e.currentTarget.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Output
          </div>
          <textarea
            value={result.output}
            readOnly
            placeholder="Your output will appear here…"
            className="mt-2 h-56 sm:h-64 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={clearAll} className={buttonBase}>
              Clear
            </button>

            <button
              type="button"
              onClick={runConvert}
              className={
                referenceText.trim() && targetText.trim()
                  ? primaryButton
                  : disabledButtonBase
              }
              disabled={!referenceText.trim() || !targetText.trim()}
              aria-label="Apply match case"
            >
              Apply match-case
            </button>

            <span className="text-xs text-slate-500">
              Runs locally in your browser.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            <div className="hidden sm:block text-xs text-slate-500 mr-1">
              Pattern letters:{" "}
              <span className="font-semibold text-slate-700">
                {result.patternLength}
              </span>{" "}
              · Applied:{" "}
              <span className="font-semibold text-slate-700">
                {result.appliedLetters}
              </span>
            </div>

            <button
              type="button"
              onClick={downloadAsPdf}
              disabled={!hasOutput}
              className={hasOutput ? buttonBase : disabledButtonBase}
            >
              Download PDF
            </button>

            <button
              type="button"
              onClick={copyOutput}
              disabled={!hasOutput}
              className={hasOutput ? buttonBase : disabledButtonBase}
              aria-label="Copy output"
            >
              {copied ? "Copied" : "Copy output"}
            </button>
          </div>
        </div>

        {result.warning && (
          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-700">
            <div className="font-bold text-slate-900">Note</div>
            <p className="mt-1">{result.warning}</p>
          </div>
        )}
      </div>
    </div>
  );
}
