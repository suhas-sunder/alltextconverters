import { useMemo, useState } from "react";
import {
  bytesFromBinFile,
  convertTextToHex,
  type TextEncoding,
  type TextToHexOptions,
} from "./textToHexTransforms";

type TextToHexToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

const DEFAULT_OPTS: TextToHexOptions = {
  encoding: "ascii",
  format: {
    uppercase: true,
    delimiter: " ",
    prefix0x: false,
  },
};

export function TextToHexToolCard({ input, setInput }: TextToHexToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [encoding, setEncoding] = useState<TextEncoding>(DEFAULT_OPTS.encoding);
  const [uppercase, setUppercase] = useState(DEFAULT_OPTS.format.uppercase);
  const [delimiter, setDelimiter] = useState<
    TextToHexOptions["format"]["delimiter"]
  >(DEFAULT_OPTS.format.delimiter);
  const [prefix0x, setPrefix0x] = useState(DEFAULT_OPTS.format.prefix0x);

  const opts: TextToHexOptions = useMemo(
    () => ({
      encoding,
      format: {
        uppercase,
        delimiter,
        prefix0x,
      },
    }),
    [encoding, uppercase, delimiter, prefix0x],
  );

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
  }

  function convertNow() {
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      const res = convertTextToHex(input, opts);
      setInput(res.hex);
      const encLabel =
        res.encodingUsed === "ascii"
          ? "ASCII"
          : res.encodingUsed === "latin1"
            ? "Latin-1"
            : "UTF-8";
      setInfoMsg(
        `Converted locally. Output contains ${res.byteCount} byte${res.byteCount === 1 ? "" : "s"} using ${encLabel}.`,
      );
    } catch (e: any) {
      setErrorMsg(String(e?.message ?? "Conversion failed."));
    }
  }

  // File upload (client-side). Supports text-like files directly.
  // Attempts PDF/DOCX extraction if corresponding libs exist in the app.
  // Also supports .bin as raw bytes and converts those bytes to hex output.
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
        const buffer = await file.arrayBuffer();
        const bytes = bytesFromBinFile(buffer);
        const hex = Array.from(bytes)
          .map((b) => {
            const s = b.toString(16).padStart(2, "0");
            const hx = uppercase ? s.toUpperCase() : s.toLowerCase();
            return prefix0x ? `0x${hx}` : hx;
          })
          .join(delimiter === "\n" ? "\n" : delimiter);

        setInput(hex);
        setInfoMsg("BIN loaded locally and converted to hex bytes.");
        return;
      }

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
          "PDF text extracted locally. Click convert to encode as hex.",
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
        setInput(value);
        setInfoMsg(
          "DOCX text extracted locally. Click convert to encode as hex.",
        );
        return;
      }

      const text = await readAsText();
      setInput(text);
      setInfoMsg("File loaded locally. Click convert to encode as hex.");
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
      a.download = "hex-output.txt";
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
      doc.setFontSize(12);

      const lines = doc.splitTextToSize(input || "", maxWidth);
      let y = margin;

      for (let i = 0; i < lines.length; i++) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines[i], margin, y);
        y += 16;
      }

      doc.save("hex-output.pdf");
    } catch (e) {
      console.error(e);
      // fall back to print
      try {
        const w = window.open("", "_blank");
        if (!w) throw new Error("Popup blocked");
        w.document.write(
          '<pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace">',
        );
        w.document.write(
          (input || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;"),
        );
        w.document.write("</pre>");
        w.document.close();
        w.focus();
        w.print();
      } catch {
        setErrorMsg(
          "PDF export failed. Install jspdf for PDF export, or allow popups for print fallback.",
        );
      }
    }
  };

  const fileAccept = ".txt,.md,.csv,.json,.html,.xml,.pdf,.docx,.bin";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70 shadow-sm">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-slate-100/70 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Text to Hex Converter
                </h1>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 text-sky-700 ring-1 ring-sky-200/70 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Runs locally
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Deterministic output
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Encoding
                </div>
                <div className="mt-2">
                  <select
                    value={encoding}
                    onChange={(e) =>
                      setEncoding(e.target.value as TextEncoding)
                    }
                    className="w-full rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="ascii">ASCII (strict)</option>
                    <option value="utf8">UTF-8</option>
                    <option value="latin1">Latin-1</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Output style
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUppercase(true)}
                    className={[
                      "cursor-pointer inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                      uppercase
                        ? "bg-sky-50 text-sky-700 ring-sky-200/70"
                        : "bg-white text-slate-700 ring-slate-200 hover:ring-sky-200/80",
                    ].join(" ")}
                  >
                    Uppercase
                  </button>
                  <button
                    type="button"
                    onClick={() => setUppercase(false)}
                    className={[
                      "cursor-pointer inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                      !uppercase
                        ? "bg-sky-50 text-sky-700 ring-sky-200/70"
                        : "bg-white text-slate-700 ring-slate-200 hover:ring-sky-200/80",
                    ].join(" ")}
                  >
                    Lowercase
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrefix0x((v) => !v)}
                    className={[
                      "cursor-pointer inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                      prefix0x
                        ? "bg-sky-50 text-sky-700 ring-sky-200/70"
                        : "bg-white text-slate-700 ring-slate-200 hover:ring-sky-200/80",
                    ].join(" ")}
                  >
                    Prefix 0x
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white ring-1 ring-slate-200/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delimiter
                </div>
                <div className="mt-2">
                  <select
                    value={delimiter}
                    onChange={(e) =>
                      setDelimiter(
                        e.target
                          .value as TextToHexOptions["format"]["delimiter"],
                      )
                    }
                    className="w-full rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="">None</option>
                    <option value=" ">Space</option>
                    <option value="\n">Newline</option>
                    <option value=", ">Comma + space</option>
                  </select>
                </div>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-900">Text</span>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                placeholder="Paste text here... Encode text into hexadecimal."
                className="mt-2 w-full min-h-[220px] rounded-2xl bg-white ring-1 ring-slate-200/80 p-4 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </label>

            {errorMsg ? (
              <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200/70 p-4 text-rose-800">
                <div className="text-sm font-bold">Error</div>
                <div className="mt-1 text-sm leading-6">{errorMsg}</div>
              </div>
            ) : null}

            {infoMsg ? (
              <div className="rounded-2xl bg-sky-50 ring-1 ring-sky-200/70 p-4 text-slate-900">
                <div className="text-sm font-bold">Info</div>
                <div className="mt-1 text-sm leading-6 text-slate-700">
                  {infoMsg}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:ring-sky-200/80 transition">
                  <input
                    type="file"
                    accept={fileAccept}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.currentTarget.files?.[0];
                      if (f) void handleFileUpload(f);
                      e.currentTarget.value = "";
                    }}
                  />
                  Upload
                </label>

                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer inline-flex items-center rounded-full bg-white ring-1 ring-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:ring-sky-200/80 transition"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={convertNow}
                  className="cursor-pointer inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                >
                  Convert to hex
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={downloadAsText}
                  className="cursor-pointer inline-flex items-center rounded-full bg-white ring-1 ring-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:ring-sky-200/80 transition"
                >
                  Download TXT
                </button>

                <button
                  type="button"
                  onClick={() => void downloadAsPdf()}
                  className="cursor-pointer inline-flex items-center rounded-full bg-white ring-1 ring-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:ring-sky-200/80 transition"
                >
                  Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => void copyText()}
                  className="cursor-pointer inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
