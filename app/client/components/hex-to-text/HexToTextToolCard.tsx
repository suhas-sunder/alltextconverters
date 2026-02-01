import { useRef, useState } from "react";
import { decodeHexToAscii } from "./hexToTextTransforms";

type Props = {
  input: string;
  setInput: (v: string) => void;
};

const ACCEPTED_TYPES = ".txt,.md,.csv,.json,.html,.xml,.log,.pdf,.docx,.bin";

export function HexToTextToolCard({ input, setInput }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

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
    setWarnings([]);
  }

  function convertHexToText() {
    setErrorMsg(null);
    setInfoMsg(null);
    setWarnings([]);

    const result = decodeHexToAscii(input);
    if (!result.ok) {
      setErrorMsg(result.error);
      return;
    }

    setInput(result.text);
    setWarnings(result.warnings ?? []);
    setInfoMsg(
      `Decoded ${result.bytes} byte${result.bytes === 1 ? "" : "s"} to ASCII text.`,
    );
  }

  // File upload (client-side). Supports text-like files directly.
  // Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setInfoMsg(null);
    setWarnings([]);

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

        let text = "";
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const content = await page.getTextContent();
          const pageText = (content.items as any[])
            .map((it) => (it?.str ? String(it.str) : ""))
            .join(" ");
          text += (p === 1 ? "" : "\n") + pageText;
        }

        setInput(text);
        setInfoMsg("Loaded PDF text locally. Paste/convert when ready.");
        return;
      }

      if (ext === "docx") {
        // Requires: mammoth
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInput(String(result?.value ?? ""));
        setInfoMsg("Loaded DOCX text locally. Paste/convert when ready.");
        return;
      }

      if (ext === "bin") {
        // Raw bytes -> hex string preview (space-separated)
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const hex = Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ");
        setInput(hex);
        setInfoMsg("Loaded .bin as hex bytes. Convert to decode as ASCII.");
        return;
      }

      // Default: treat as text
      const text = await readAsText();
      setInput(text);
      setInfoMsg("Loaded file locally. Convert when ready.");
    } catch (e: any) {
      const msg =
        e?.message ||
        "Could not read that file. For PDF/DOCX support, optional libraries may be required in your app build.";
      setErrorMsg(String(msg));
    }
  };

  function downloadTxt() {
    const blob = new Blob([input ?? ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hex-to-text.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function downloadPdf() {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 48;
      const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const fontSize = 11;
      doc.setFont("courier", "normal");
      doc.setFontSize(fontSize);

      const lines = doc.splitTextToSize(String(input ?? ""), maxWidth);
      let y = margin;

      for (const line of lines) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += fontSize * 1.35;
      }

      doc.save("hex-to-text.pdf");
    } catch {
      // Fallback: print dialog
      const w = window.open("", "_blank", "noopener,noreferrer");
      if (!w) return;
      w.document.write("<pre>" + escapeHtml(String(input ?? "")) + "</pre>");
      w.document.close();
      w.focus();
      w.print();
      w.close();
    }
  }

  function escapeHtml(s: string) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Hex to Text Converter
                </h1>
                <p className="mt-2 text-slate-600 leading-7 max-w-2xl">
                  Paste hex bytes (spaces and{" "}
                  <span className="font-semibold">0x</span>/
                  <span className="font-semibold">\x</span> prefixes are fine),
                  then decode to ASCII text.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  ASCII output
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Space tolerant
                </span>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 text-white p-4 sm:p-5">
              <div className="text-sm font-semibold text-sky-200">Editor</div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: 48 65 6c 6c 6f 21  (Hello!)"
                spellCheck={false}
                className="mt-3 w-full min-h-[220px] resize-y rounded-2xl bg-slate-950/40 ring-1 ring-white/10 px-4 py-3 text-sm leading-6 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              />

              {(errorMsg || infoMsg || warnings.length > 0) && (
                <div className="mt-3 space-y-2">
                  {errorMsg && (
                    <div className="rounded-2xl bg-rose-500/15 ring-1 ring-rose-400/30 px-4 py-3 text-sm text-rose-100">
                      <div className="font-semibold">Error</div>
                      <div className="mt-1">{errorMsg}</div>
                    </div>
                  )}

                  {infoMsg && !errorMsg && (
                    <div className="rounded-2xl bg-sky-500/15 ring-1 ring-sky-400/30 px-4 py-3 text-sm text-sky-100">
                      <div className="font-semibold">Result</div>
                      <div className="mt-1">{infoMsg}</div>
                    </div>
                  )}

                  {warnings.length > 0 && !errorMsg && (
                    <div className="rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/30 px-4 py-3 text-sm text-amber-100">
                      <div className="font-semibold">Notes</div>
                      <ul className="mt-1 list-disc pl-5 space-y-1">
                        {warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.currentTarget.files?.[0];
                      if (f) void handleFileUpload(f);
                      e.currentTarget.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-3 py-2 text-sm font-semibold text-white transition"
                  >
                    Upload file
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-3 py-2 text-sm font-semibold text-white transition"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={convertHexToText}
                    className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-sky-500 hover:bg-sky-400 px-3 py-2 text-sm font-extrabold text-slate-900 transition"
                  >
                    Convert hex to text
                  </button>

                  <button
                    type="button"
                    onClick={downloadPdf}
                    className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-3 py-2 text-sm font-semibold text-white transition"
                  >
                    Download PDF
                  </button>

                  <button
                    type="button"
                    onClick={downloadTxt}
                    className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-3 py-2 text-sm font-semibold text-white transition"
                  >
                    Download TXT
                  </button>

                  <button
                    type="button"
                    onClick={copyText}
                    className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-3 py-2 text-sm font-semibold text-white transition"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-200/80">
                Tip: separators like spaces, commas,{" "}
                <span className="font-semibold">0x</span> and{" "}
                <span className="font-semibold">\x</span> are accepted. Output
                is ASCII only.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
