import { useMemo, useState } from "react";
import {
  bytesToBinaryString,
  decodeBinary,
  type DecodeEncoding,
  type OutputKind,
} from "./binaryTransforms";

type BinaryToTextToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

type SplitMode = "auto" | 7 | 8;

export function BinaryToTextToolCard({
  input,
  setInput,
}: BinaryToTextToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [bitMode, setBitMode] = useState<SplitMode>("auto");
  const [outputKind, setOutputKind] = useState<OutputKind>("text");
  const [encoding, setEncoding] = useState<DecodeEncoding>("utf-8");

  const [delimiter, setDelimiter] = useState<string>(" ");
  const [insertDelimiterBetweenChars, setInsertDelimiterBetweenChars] =
    useState(false);

  const [lastSummary, setLastSummary] = useState<{
    chosen: 7 | 8 | null;
    groups: number;
    droppedNonBits: number;
    droppedTrailingBits: number;
    cleanedBits: number;
    printable7?: number;
    printable8?: number;
  } | null>(null);

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
    setLastSummary(null);
  }

  const buttonBase =
    "cursor-pointer inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition";

  const primaryButton =
    "cursor-pointer inline-flex items-center rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-700 transition";

  const disabledButtonBase =
    "inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-400 ring-1 ring-slate-200 shadow-sm cursor-not-allowed";

  const pill =
    "cursor-pointer inline-flex items-center rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-white hover:ring-sky-200 transition";

  const pillActive =
    "cursor-pointer inline-flex items-center rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50 hover:ring-sky-200 transition";

  const settingsLabel =
    "text-xs font-semibold uppercase tracking-wide text-slate-500";

  function runDecode() {
    setErrorMsg(null);
    setInfoMsg(null);

    const res = decodeBinary(input, {
      bitMode: bitMode === "auto" ? "auto" : (bitMode as 7 | 8),
      output: outputKind,
      encoding,
      delimiter: delimiter ?? "",
      insertDelimiterBetweenChars,
    });

    if (!res.ok) {
      setLastSummary(null);
      setErrorMsg(res.error || "Could not decode that input.");
      return;
    }

    setLastSummary({
      chosen: res.chosenWidth ?? null,
      groups: res.groups,
      droppedNonBits: res.droppedNonBits,
      droppedTrailingBits: res.droppedTrailingBits,
      cleanedBits: res.cleanedLength,
      printable7: res.printableScore7,
      printable8: res.printableScore8,
    });

    setInput(res.outputText || "");
  }

  // File upload: supports .bin (raw bytes) and text-like files.
  // Attempts PDF/DOCX extraction if corresponding libs exist.
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
      if (ext === "bin") {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const asBinary = bytesToBinaryString(bytes);
        setInput(asBinary);
        setInfoMsg(
          "BIN file loaded locally. Bytes were converted to 8-bit binary groups.",
        );
        return;
      }

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
        setInfoMsg(
          "PDF text extracted locally. Paste binary digits (0/1) to decode.",
        );
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
          "DOCX text extracted locally. Paste binary digits (0/1) to decode.",
        );
        return;
      }

      const text = await readAsText();
      setInput(text);
      setInfoMsg("File loaded locally.");
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not load that file in-browser. Optional libraries may be required (pdfjs-dist for PDF, mammoth for DOCX).",
      );
    }
  };

  const downloadAsText = () => {
    try {
      const blob = new Blob([input], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        outputKind === "text"
          ? "decoded-text.txt"
          : `binary-converted.${outputKind}.txt`;
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

      doc.save("binary-to-text.pdf");
    } catch {
      window.print();
    }
  };

  const resultPreview = useMemo(() => {
    if (!lastSummary) return null;
    const mode = lastSummary.chosen ? `${lastSummary.chosen}-bit` : "—";
    const kind = outputKind === "text" ? "Text" : outputKind.toUpperCase();
    return { mode, kind };
  }, [lastSummary, outputKind]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Binary to Text Converter
        </h1>
        <p className="text-sm text-slate-600">
          Decode 0's and 1's into readable text or numbers. Runs locally in your
          browser.
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
          placeholder="Paste binary here… Example: 01001000 01100101 01101100 01101100 01101111"
          className="mt-2 h-72 sm:h-80 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />

        {/* Settings */}
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
              <div className={settingsLabel}>Bit width</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { k: "Auto", v: "auto" as const },
                  { k: "7-bit", v: 7 as const },
                  { k: "8-bit", v: 8 as const },
                ].map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    className={bitMode === opt.v ? pillActive : pill}
                    onClick={() => setBitMode(opt.v)}
                  >
                    {opt.k}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-6">
                Auto mode scores the result and picks the most readable output.
                8-bit is most common for bytes and .bin files.
              </p>
            </div>

            <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
              <div className={settingsLabel}>Output</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { k: "Text", v: "text" as const },
                  { k: "Decimal", v: "decimal" as const },
                  { k: "Hex", v: "hex" as const },
                  { k: "Octal", v: "octal" as const },
                ].map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    className={outputKind === opt.v ? pillActive : pill}
                    onClick={() => setOutputKind(opt.v)}
                  >
                    {opt.k}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={settingsLabel}>Delimiter</span>
                  <input
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    placeholder={
                      outputKind === "text" ? "Optional" : "Space or comma"
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    For numbers, this separates values (default is a single
                    space). For text, you can optionally insert it between
                    characters.
                  </span>
                </label>

                <label className="block">
                  <span className={settingsLabel}>Encoding</span>
                  <select
                    value={encoding}
                    onChange={(e) =>
                      setEncoding(e.target.value as DecodeEncoding)
                    }
                    className="mt-1 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="utf-8">UTF-8</option>
                    <option value="iso-8859-1">ISO-8859-1 (Latin-1)</option>
                    <option value="windows-1252">Windows-1252</option>
                  </select>
                  <span className="mt-1 block text-xs text-slate-500">
                    Only affects Text output. If your browser does not support
                    an encoding, the tool falls back safely.
                  </span>
                </label>
              </div>

              <label className="mt-3 flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-sky-600 focus:ring-sky-300"
                  checked={insertDelimiterBetweenChars}
                  onChange={(e) =>
                    setInsertDelimiterBetweenChars(e.target.checked)
                  }
                />
                <span>
                  Insert delimiter between characters (Text output only)
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <label className={buttonBase}>
                Upload (.txt, .bin, .pdf, .docx)
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.csv,.json,.html,.xml,.pdf,.docx,.bin"
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
                onClick={runDecode}
                disabled={!input}
                className={input ? primaryButton : disabledButtonBase}
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
              >
                Download TXT
              </button>

              <button
                type="button"
                onClick={downloadAsPdf}
                disabled={!input}
                className={input ? buttonBase : disabledButtonBase}
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={copyText}
                disabled={!input}
                className={input ? buttonBase : disabledButtonBase}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Summary */}
          {lastSummary && (
            <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm font-bold text-slate-900">
                  Last run summary
                </div>
                {resultPreview && (
                  <div className="text-xs font-semibold text-slate-600">
                    Mode:{" "}
                    <span className="text-slate-900">{resultPreview.mode}</span>{" "}
                    • Output:{" "}
                    <span className="text-slate-900">{resultPreview.kind}</span>
                  </div>
                )}
              </div>

              <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                <li>
                  <span className="font-semibold text-slate-900">
                    {lastSummary.groups}
                  </span>{" "}
                  groups decoded
                </li>
                <li>
                  Dropped non-bits:{" "}
                  <span className="font-semibold text-slate-900">
                    {lastSummary.droppedNonBits}
                  </span>
                </li>
                <li>
                  Trailing bits ignored:{" "}
                  <span className="font-semibold text-slate-900">
                    {lastSummary.droppedTrailingBits}
                  </span>
                </li>
                <li>
                  Cleaned bits length:{" "}
                  <span className="font-semibold text-slate-900">
                    {lastSummary.cleanedBits}
                  </span>
                </li>
              </ul>

              <p className="mt-3 text-xs text-slate-600 leading-6">
                Auto detection scores both 7-bit and 8-bit for readability
                (printable ASCII wins). If you know your source, override the
                mode for deterministic output.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
