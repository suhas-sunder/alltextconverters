import { useMemo, useState } from "react";
import {
  textToAscii,
  summarizeSkipped,
  type AsciiDelimiter,
} from "./textToAsciiTransforms";

type TextToAsciiToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

export function TextToAsciiToolCard({
  input,
  setInput,
}: TextToAsciiToolCardProps) {
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [delimiter, setDelimiter] = useState<AsciiDelimiter>("space");
  const [printableOnly, setPrintableOnly] = useState(true);

  const lastRun = useMemo(() => {
    if (!output && !errorMsg) return null;
    // The output is produced by the last successful run; the stats message is stored in infoMsg.
    return true;
  }, [output, errorMsg]);

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

  function runEncode() {
    setErrorMsg(null);
    setInfoMsg(null);

    const trimmed = input ?? "";
    if (!trimmed) {
      setOutput("");
      return;
    }

    const res = textToAscii(trimmed, { delimiter, printableOnly });

    if (!res.output) {
      setOutput("");
      setInfoMsg(
        "No printable ASCII characters were found (printable ASCII is 32–126).",
      );
      return;
    }

    const skipped = summarizeSkipped(res.stats);
    const skippedTotal = res.stats.skippedCharacters;

    const suffix =
      skippedTotal > 0
        ? ` Skipped ${skippedTotal} character${skippedTotal === 1 ? "" : "s"} outside printable ASCII.`
        : "";

    setOutput(res.output);

    if (skippedTotal > 0) {
      const breakdown = skipped.map(([k, n]) => `${n} ${k}`).join(", ");
      setInfoMsg(
        `Encoded ${res.stats.encodedCharacters} character${res.stats.encodedCharacters === 1 ? "" : "s"} into decimal ASCII codes.${suffix} (${breakdown}).`,
      );
    } else {
      setInfoMsg(
        `Encoded ${res.stats.encodedCharacters} character${res.stats.encodedCharacters === 1 ? "" : "s"} into decimal ASCII codes.`,
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
        setOutput("");
        setInfoMsg(
          "PDF text extracted locally. Click Encode to generate ASCII codes.",
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
        setOutput("");
        setInfoMsg(
          "DOCX text extracted locally. Click Encode to generate ASCII codes.",
        );
        return;
      }

      const text = await readAsText();
      setInput(text);
      setOutput("");
      setInfoMsg("File loaded locally. Click Encode to generate ASCII codes.");
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
      a.download = "text-to-ascii.txt";
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

      const lines = (output || "").split(/\r?\n/);
      let y = margin;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? "";
        const wrapped = doc.splitTextToSize(line, maxWidth) as string[];
        const outLines = wrapped.length ? wrapped : [""];
        for (const l of outLines) {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(l, margin, y);
          y += 14;
        }
        if (i < lines.length - 1) y += 4;
      }

      doc.save("text-to-ascii.pdf");
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
          Text to ASCII
        </h1>
        <p className="text-sm text-slate-600">
          Encode text into{" "}
          <span className="font-semibold text-slate-900">decimal</span> ASCII
          codes.
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
              Input text
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type text here…"
              className="mt-2 h-56 sm:h-72 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Output (decimal ASCII codes)
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="Click Encode to generate ASCII codes…"
              className="mt-2 h-56 sm:h-72 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
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

            <button type="button" onClick={clearAll} className={buttonBase}>
              Clear
            </button>

            <button
              type="button"
              onClick={runEncode}
              disabled={!input}
              className={input ? primaryButton : disabledButtonBase}
              aria-label="Encode text to ASCII"
            >
              Encode to ASCII
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={printableOnly}
                  onChange={(e) => setPrintableOnly(e.target.checked)}
                />
                Printable ASCII only (32–126)
              </label>

              <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition">
                Delimiter
                <select
                  className="cursor-pointer bg-transparent outline-none"
                  value={delimiter}
                  onChange={(e) =>
                    setDelimiter(e.target.value as AsciiDelimiter)
                  }
                >
                  <option value="space">Space</option>
                  <option value="comma">Comma</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={downloadAsText}
              disabled={!output}
              className={output ? buttonBase : disabledButtonBase}
              aria-label="Download as text"
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
              onClick={copyOutput}
              disabled={!output}
              className={output ? buttonBase : disabledButtonBase}
              aria-label="Copy output"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {lastRun && output && (
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Output notes</div>
            <p className="mt-1">
              This page focuses on{" "}
              <span className="font-semibold text-slate-900">
                printable ASCII
              </span>
              . If your input contains emoji, non-Latin scripts, or control
              characters, those are reported as skipped when “Printable ASCII
              only” is enabled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
