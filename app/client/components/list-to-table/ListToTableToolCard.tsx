import { useMemo, useState } from "react";
import {
  parseListItems,
  toCsv,
  toHtmlTable,
  toTsv,
  type ParseMode,
} from "./listToTableTransforms";

type Props = {
  input: string;
  setInput: (v: string) => void;
};

type CopyFormat = "html" | "csv" | "tsv";

export function ListToTableToolCard({ input, setInput }: Props) {
  const [mode, setMode] = useState<ParseMode>("whitespace");
  const [copied, setCopied] = useState<CopyFormat | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const items = useMemo(() => parseListItems(input, mode), [input, mode]);

  const htmlTable = useMemo(() => toHtmlTable(items), [items]);
  const csv = useMemo(() => toCsv(items), [items]);
  const tsv = useMemo(() => toTsv(items), [items]);

  function clearAll() {
    setInput("");
    setErrorMsg(null);
    setInfoMsg(null);
    setCopied(null);
  }

  function generate() {
    setErrorMsg(null);
    setInfoMsg(null);
    // No-op conversion of input; output is derived from parsed items.
    if (!input.trim()) return;
    if (!items.length) {
      setInfoMsg("No list items detected. Try switching the split mode.");
      return;
    }
    setInfoMsg(`Ready: ${items.length} item${items.length === 1 ? "" : "s"}.`);
  }

  async function copy(format: CopyFormat) {
    try {
      const text = format === "html" ? htmlTable : format === "csv" ? csv : tsv;

      await navigator.clipboard.writeText(text);
      setCopied(format);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied(null);
      setErrorMsg("Copy failed. Your browser may block clipboard access.");
    }
  }

  // Upload (client-side). Matches the reference tool behavior.
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

  const downloadAsText = (content: string, filename: string) => {
    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
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

      const reportLines: string[] = [];
      reportLines.push("List to Table");
      reportLines.push("");
      reportLines.push(`Items: ${items.length}`);
      reportLines.push(
        `Split mode: ${mode === "whitespace" ? "Whitespace" : "Lines"}`,
      );
      reportLines.push("");
      reportLines.push("CSV (single column):");
      reportLines.push(csv);
      reportLines.push("");
      reportLines.push("TSV (single column):");
      reportLines.push(tsv);
      reportLines.push("");
      reportLines.push("HTML table:");
      reportLines.push(htmlTable);

      const paragraphs = reportLines.join("\n").split(/\r?\n/);
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

      doc.save("list-to-table.pdf");
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

  const pillBase =
    "cursor-pointer inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold ring-1 shadow-sm transition";
  const pillOn = "text-slate-900 ring-sky-200 bg-sky-50";
  const pillOff =
    "text-slate-700 ring-slate-200 hover:ring-sky-200 hover:bg-sky-50";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          List to Table
        </h1>
        <p className="text-slate-600 text-sm leading-6 max-w-2xl mx-auto">
          Paste items like{" "}
          <span className="font-semibold text-slate-900">
            apple banana orange
          </span>{" "}
          and copy them as a 1-column HTML table, CSV, or TSV.
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
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a list here… (spaces, newlines, or both)"
          className="mt-2 h-64 sm:h-72 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
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

              <button type="button" onClick={clearAll} className={buttonBase}>
                Clear
              </button>

              <button
                type="button"
                onClick={generate}
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
              >
                Build table
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={downloadAsPdf}
                disabled={!items.length}
                className={items.length ? buttonBase : disabledButtonBase}
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={() => downloadAsText(csv, "list.csv")}
                disabled={!items.length}
                className={items.length ? buttonBase : disabledButtonBase}
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className={`${pillBase} ${mode === "whitespace" ? pillOn : pillOff}`}
                onClick={() => setMode("whitespace")}
              >
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Split on whitespace
              </button>
              <button
                type="button"
                className={`${pillBase} ${mode === "lines" ? pillOn : pillOff}`}
                onClick={() => setMode("lines")}
              >
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                Split on lines
              </button>

              <span className="text-xs text-slate-600 ml-1">
                Items detected:{" "}
                <span className="font-semibold text-slate-900">
                  {items.length}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={() => copy("html")}
                disabled={!items.length}
                className={items.length ? buttonBase : disabledButtonBase}
              >
                {copied === "html" ? "Copied HTML" : "Copy HTML table"}
              </button>

              <button
                type="button"
                onClick={() => copy("csv")}
                disabled={!items.length}
                className={items.length ? buttonBase : disabledButtonBase}
              >
                {copied === "csv" ? "Copied CSV" : "Copy CSV"}
              </button>

              <button
                type="button"
                onClick={() => copy("tsv")}
                disabled={!items.length}
                className={items.length ? buttonBase : disabledButtonBase}
              >
                {copied === "tsv" ? "Copied TSV" : "Copy TSV"}
              </button>
            </div>
          </div>
        </div>

        {/* Output preview */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              CSV preview
            </div>
            <pre className="mt-2 max-h-32 overflow-auto rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 whitespace-pre-wrap">
              {items.length ? csv : "—"}
            </pre>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              TSV preview
            </div>
            <pre className="mt-2 max-h-32 overflow-auto rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 whitespace-pre-wrap">
              {items.length ? tsv : "—"}
            </pre>
          </div>

          <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              HTML table preview
            </div>
            <pre className="mt-2 max-h-32 overflow-auto rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800 whitespace-pre-wrap">
              {items.length ? htmlTable : "—"}
            </pre>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-600">
          Tip: CSV and TSV are single-column exports. HTML table uses one{" "}
          <code>&lt;td&gt;</code> per row.
        </div>
      </div>
    </div>
  );
}
