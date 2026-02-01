import { useMemo, useState } from "react";
import {
  textToCommaSeparatedList,
  type SplitMode,
  type TextToCommaOptions,
  type TextToCommaResult,
} from "./textToCommaSeparatedListTransforms";

type Props = {
  input: string;
  setInput: (v: string) => void;
};

export function TextToCommaSeparatedListToolCard({ input, setInput }: Props) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<TextToCommaResult | null>(null);

  // Settings
  const [splitMode, setSplitMode] = useState<SplitMode>("lines");
  const [spaceAfterComma, setSpaceAfterComma] = useState(true);
  const [quoteItems, setQuoteItems] = useState(false);
  const [trimItems, setTrimItems] = useState(true);
  const [ignoreEmpty, setIgnoreEmpty] = useState(true);

  const opts: TextToCommaOptions = useMemo(
    () => ({
      splitMode,
      spaceAfterComma,
      quoteItems,
      trimItems,
      ignoreEmpty,
    }),
    [splitMode, spaceAfterComma, quoteItems, trimItems, ignoreEmpty],
  );

  // Lightweight preview (parsing only). This does NOT modify textarea.
  const preview = useMemo(() => {
    try {
      if (!input) return null;
      const r = textToCommaSeparatedList(input, { ...opts, quoteItems: false });
      return r;
    } catch {
      return null;
    }
  }, [input, opts]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(String(input ?? ""));
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
    setLastRun(null);
  }

  function runConvert() {
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const r = textToCommaSeparatedList(input, opts);
      setInput(r.output);
      setLastRun(r);

      const itemCount = r.items.length;
      setInfoMsg(
        `Converted ${itemCount} item${itemCount === 1 ? "" : "s"} locally in your browser.`,
      );
    } catch {
      setErrorMsg(
        "Could not convert this text. Please review your input and try again.",
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
        setLastRun(null);
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
        setLastRun(null);
        return;
      }

      const text = await readAsText();
      setInput(text);
      setInfoMsg("File loaded locally.");
      setLastRun(null);
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not extract text from that file in-browser. Make sure optional libraries are installed (pdfjs-dist for PDF, mammoth for DOCX).",
      );
    }
  };

  const downloadAsText = () => {
    try {
      const blob = new Blob([String(input ?? "")], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "comma-separated-list.txt";
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

      const paragraphs = String(input ?? "").split(/\r?\n/);
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

      doc.save("comma-separated-list.pdf");
    } catch {
      window.print();
    }
  };

  const buttonBase =
    "cursor-pointer inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition";

  const buttonSelected =
    "cursor-pointer inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 shadow-sm hover:bg-sky-100 transition";

  const primaryButton =
    "cursor-pointer inline-flex items-center rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition";

  const disabledButtonBase =
    "inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-400 ring-1 ring-slate-200 shadow-sm cursor-not-allowed";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Text to Comma Separated List
        </h1>
        <p className="text-sm text-slate-600">
          Paste items, choose how to split them, then convert and copy.
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

      {preview && (
        <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-md px-4 py-3 text-sm">
          Preview: {preview.items.length} item
          {preview.items.length === 1 ? "" : "s"} • join with{" "}
          <span className="font-semibold">
            {spaceAfterComma ? '", "' : '","'}
          </span>
          {quoteItems ? " • quoted" : ""}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Text
          </div>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            placeholder={"Example:\napple\nbanana\norange"}
            className="mt-2 h-64 sm:h-72 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900">Split method</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ["lines", "Lines"],
                  ["commas", "Commas"],
                  ["whitespace", "Whitespace"],
                  ["auto", "Auto"],
                ] as Array<[SplitMode, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSplitMode(key)}
                  className={splitMode === key ? buttonSelected : buttonBase}
                  aria-pressed={splitMode === key}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Auto treats commas and line breaks as separators and removes
              common bullets/numbering (best for pasted lists).
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900">
              Output format
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSpaceAfterComma((v) => !v)}
                className={spaceAfterComma ? buttonSelected : buttonBase}
                aria-pressed={spaceAfterComma}
                title="Join items with either ', ' or ','"
              >
                Space after comma: {spaceAfterComma ? "On" : "Off"}
              </button>

              <button
                type="button"
                onClick={() => setQuoteItems((v) => !v)}
                className={quoteItems ? buttonSelected : buttonBase}
                aria-pressed={quoteItems}
                title="Wrap each item in double quotes. Quotes inside items are escaped."
              >
                Quote items: {quoteItems ? "On" : "Off"}
              </button>

              <button
                type="button"
                onClick={() => setTrimItems((v) => !v)}
                className={trimItems ? buttonSelected : buttonBase}
                aria-pressed={trimItems}
                title="Trim whitespace around each item"
              >
                Trim items: {trimItems ? "On" : "Off"}
              </button>

              <button
                type="button"
                onClick={() => setIgnoreEmpty((v) => !v)}
                className={ignoreEmpty ? buttonSelected : buttonBase}
                aria-pressed={ignoreEmpty}
                title="Ignore empty items created by extra separators"
              >
                Ignore empty: {ignoreEmpty ? "On" : "Off"}
              </button>
            </div>
          </div>

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
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
                aria-label="Convert to comma-separated list"
              >
                Convert to comma list
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
                aria-label="Copy"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
            <div className="text-sm font-bold text-slate-900">
              Applied operations{lastRun ? " (last run)" : ""}
            </div>

            <ul className="mt-2 text-sm text-slate-700 list-disc pl-5 space-y-1">
              <li>Split using: {splitMode}</li>
              {trimItems && <li>Trim whitespace around each item</li>}
              {ignoreEmpty && <li>Ignore empty values</li>}
              <li>
                Join items with{" "}
                {spaceAfterComma ? "comma + space" : "comma only"}
              </li>
              {quoteItems && <li>Wrap each item in double quotes</li>}
              {(splitMode === "lines" || splitMode === "auto") && (
                <li>
                  In list-like input, strip common bullets and numbering
                  prefixes
                </li>
              )}
            </ul>

            {!lastRun ? (
              <div className="mt-3 text-xs text-slate-600">
                Run the converter to see a count breakdown.
              </div>
            ) : (
              <div className="mt-3 text-xs text-slate-600">
                Tokens found: {lastRun.tokensFound}. Output items:{" "}
                {lastRun.items.length}. Removed empty:{" "}
                {lastRun.removedEmptyCount}. Trim adjustments:{" "}
                {lastRun.trimmedCount}. Prefixes stripped:{" "}
                {lastRun.strippedPrefixCount}.
              </div>
            )}
          </div>

          <div className="text-xs text-slate-600">
            PDF export requires <span className="font-semibold">jspdf</span>.
            PDF/DOCX upload requires optional libraries.
          </div>
        </div>
      </div>
    </div>
  );
}
