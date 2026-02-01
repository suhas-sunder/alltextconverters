import { useMemo, useState } from "react";
import {
  convertTextToOrderedList,
  type MarkerStyle,
  type SplitMode,
} from "./orderedListTransforms";

type TextToOrderedListToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

const splitModes: Array<{ key: SplitMode; label: string; hint: string }> = [
  { key: "lines", label: "Lines", hint: "One item per line" },
  { key: "commas", label: "Commas", hint: "Split on commas" },
];

const markerStyles: Array<{
  key: MarkerStyle;
  label: string;
  example: string;
}> = [
  { key: "numeric", label: "Numbers", example: "1. 2. 3." },
  { key: "roman-upper", label: "Roman (I)", example: "I. II. III." },
  { key: "roman-lower", label: "Roman (i)", example: "i. ii. iii." },
  { key: "alpha-upper", label: "Letters (A)", example: "A. B. C." },
  { key: "alpha-lower", label: "Letters (a)", example: "a. b. c." },
];

export function TextToOrderedListToolCard({
  input,
  setInput,
}: TextToOrderedListToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [splitMode, setSplitMode] = useState<SplitMode>("lines");
  const [markerStyle, setMarkerStyle] = useState<MarkerStyle>("numeric");
  const [startAt, setStartAt] = useState<number>(1);
  const [trimItems, setTrimItems] = useState(true);
  const [ignoreEmpty, setIgnoreEmpty] = useState(true);

  const [lastApplied, setLastApplied] = useState<string[]>([]);
  const [lastSummary, setLastSummary] = useState<string | null>(null);

  const canConvert = (input || "").length > 0;

  const preview = useMemo(() => {
    if (!input.trim()) return null;
    const res = convertTextToOrderedList(input, {
      splitMode,
      markerStyle,
      startAt,
      trimItems,
      ignoreEmpty,
    });
    const sample = res.output.split(/\r?\n/).slice(0, 3).join("  ");
    return {
      itemCount: res.itemCount,
      sample: sample || "",
    };
  }, [input, splitMode, markerStyle, startAt, trimItems, ignoreEmpty]);

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
    setLastApplied([]);
    setLastSummary(null);
  }

  function runConvert() {
    setErrorMsg(null);
    setInfoMsg(null);

    const startAtSafe =
      Number.isFinite(startAt) && startAt > 0 ? Math.floor(startAt) : 1;

    const res = convertTextToOrderedList(input, {
      splitMode,
      markerStyle,
      startAt: startAtSafe,
      trimItems,
      ignoreEmpty,
    });

    setInput(res.output);
    setLastApplied(res.applied);
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
        setInfoMsg("PDF text extracted locally. Review for layout artifacts.");
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
      const blob = new Blob([input], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ordered-list.txt";
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

      doc.save("ordered-list.pdf");
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

  const pillToggleOn =
    "cursor-pointer inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200/70 hover:bg-sky-100 transition";
  const pillToggleOff =
    "cursor-pointer inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Text to Ordered List
        </h1>
      </div>

      {(errorMsg || infoMsg || lastSummary) && (
        <div className="space-y-2">
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-700 rounded-md px-4 py-3 text-sm">
              Warning: {errorMsg}
            </div>
          )}
          {!errorMsg && (infoMsg || lastSummary) && (
            <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-4 py-3 text-sm">
              {lastSummary ?? infoMsg}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste items here... Choose a split method and numbering style, convert, then copy or download."
          className="mt-2 h-72 sm:h-80 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />

        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Split method
            </div>
            <div className="flex flex-wrap gap-2">
              {splitModes.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSplitMode(m.key)}
                  className={splitMode === m.key ? pillToggleOn : pillToggleOff}
                  aria-label={`Split by ${m.label}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-600">
              {splitModes.find((s) => s.key === splitMode)?.hint}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Numbering style
            </div>
            <div className="flex flex-wrap gap-2">
              {markerStyles.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMarkerStyle(m.key)}
                  className={
                    markerStyle === m.key ? pillToggleOn : pillToggleOff
                  }
                  aria-label={`Use ${m.label}`}
                  title={m.example}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Start at
              </label>
              <input
                type="number"
                value={Number.isFinite(startAt) ? startAt : 1}
                min={1}
                onChange={(e) => setStartAt(Number(e.target.value || 1))}
                className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              <div className="text-xs text-slate-600">
                Applies to numbers, letters, and roman numerals.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTrimItems((v) => !v)}
                className={trimItems ? pillToggleOn : pillToggleOff}
                aria-label="Toggle trim whitespace"
              >
                Trim items: {trimItems ? "On" : "Off"}
              </button>

              <button
                type="button"
                onClick={() => setIgnoreEmpty((v) => !v)}
                className={ignoreEmpty ? pillToggleOn : pillToggleOff}
                aria-label="Toggle ignore empty items"
              >
                Ignore empty: {ignoreEmpty ? "On" : "Off"}
              </button>
            </div>
          </div>

          {preview && (
            <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">Preview</div>
              <div className="mt-1">
                {preview.itemCount} item{preview.itemCount === 1 ? "" : "s"} •
                first lines:
              </div>
              <div className="mt-2 font-mono text-xs whitespace-pre-wrap break-words text-slate-800">
                {preview.sample || "..."}
              </div>
            </div>
          )}
        </div>

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
                onClick={runConvert}
                disabled={!canConvert}
                className={canConvert ? primaryButton : disabledButtonBase}
                aria-label="Convert to ordered list"
              >
                Convert
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
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
                aria-label="Copy output"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {lastApplied.length > 0 && (
          <div className="mt-5 rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
            <div className="text-sm font-bold text-slate-900">
              Applied operations
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
              {lastApplied.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
