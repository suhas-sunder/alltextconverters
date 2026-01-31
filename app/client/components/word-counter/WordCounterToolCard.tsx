import { useEffect, useMemo, useRef, useState } from "react";
import { getWordCounterStats } from "./wordCounterStats";

type WordCounterToolCardProps = {
  input: string;
  setInput: (v: string) => void;
};

const caseOptions = [
  "UPPERCASE",
  "lowercase",
  "Title Case",
  "Capitalized Case",
  "Sentence case",
  "aLtErNaTiNg cAsE",
  "InVeRsE CaSe",
] as const;

type CaseOption = (typeof caseOptions)[number];

type SelectionRange = { start: number; end: number };

export function WordCounterToolCard({ input, setInput }: WordCounterToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Track selection so it survives clicking tool controls (dropdown, buttons, etc.)
  const lastSelectionRef = useRef<SelectionRange>({ start: 0, end: 0 });

  const stats = useMemo(() => getWordCounterStats(input), [input]);

  // Undo/redo (bounded)
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const historyIgnoreRef = useRef(false);
  const historyTimerRef = useRef<number | null>(null);
  const historyRef = useRef<string[]>([""]);
  const historyIndexRef = useRef(0);

  const [selectedCase, setSelectedCase] = useState<CaseOption>("UPPERCASE");

  // Initialize history from initial prop value (so undo/redo works immediately).
  useEffect(() => {
    if (history.length === 1 && history[0] === "" && input) {
      setHistory([input]);
      setHistoryIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

  // Track changes for undo/redo without spamming history on every keystroke.
  useEffect(() => {
    if (historyIgnoreRef.current) {
      historyIgnoreRef.current = false;
      return;
    }

    if (historyTimerRef.current) window.clearTimeout(historyTimerRef.current);
    historyTimerRef.current = window.setTimeout(() => {
      const prev = historyRef.current;
      const prevIdx = historyIndexRef.current;
      const current = prev[prevIdx];
      if (current === input) return;

      const next = prev.slice(0, prevIdx + 1);
      next.push(input);

      // Cap history to keep memory bounded
      const capped = next.length > 200 ? next.slice(next.length - 200) : next;
      const nextIndex = capped.length - 1;

      setHistory(capped);
      setHistoryIndex(nextIndex);
    }, 250);

    return () => {
      if (historyTimerRef.current) window.clearTimeout(historyTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const setInputFromHistory = (nextValue: string, nextIndex: number) => {
    historyIgnoreRef.current = true;
    setHistoryIndex(nextIndex);
    setInput(nextValue);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    setInputFromHistory(history[historyIndex - 1] ?? "", historyIndex - 1);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    setInputFromHistory(history[historyIndex + 1] ?? "", historyIndex + 1);
  };

  // Case conversion helpers (homepage-aligned)
  const titleCase = (t: string) => {
    const smallWords =
      /\b(a|an|and|as|at|but|by|for|if|in|of|on|or|the|to|with)\b/gi;
    return t
      .replace(
        /\b([A-Za-zÀ-ÖØ-öø-ÿ])([A-Za-zÀ-ÖØ-öø-ÿ]*)\b/g,
        (_m, first, rest) => String(first).toUpperCase() + String(rest).toLowerCase(),
      )
      .replace(smallWords, (w) => w.toLowerCase());
  };

  const converters: Record<CaseOption, (t: string) => string> = {
    UPPERCASE: (t) => t.toUpperCase(),
    lowercase: (t) => t.toLowerCase(),
    "Title Case": (t) => titleCase(t),
    "Capitalized Case": (t) => t.replace(/\b\w/g, (m) => m.toUpperCase()),
    "aLtErNaTiNg cAsE": (t) =>
      t
        .split("")
        .map((c, i) => (i % 2 ? c.toLowerCase() : c.toUpperCase()))
        .join(""),
    "InVeRsE CaSe": (t) =>
      [...t]
        .map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()))
        .join(""),
    "Sentence case": (t) =>
      t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (m) => m.toUpperCase()),
  };

  const snapshotSelection = () => {
    const el = textareaRef.current;
    if (!el) return;
    lastSelectionRef.current = { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
  };

  const restoreSelection = (range: SelectionRange) => {
    const el = textareaRef.current;
    if (!el) return;
    window.requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(range.start, range.end);
    });
  };

  const applyConverter = (label: CaseOption, rangeOverride?: SelectionRange) => {
    const el = textareaRef.current;
    const fn = converters[label];
    if (!fn) return;

    const range = rangeOverride ?? (el ? { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 } : lastSelectionRef.current);
    const start = range.start ?? 0;
    const end = range.end ?? 0;

    // Apply to selection if any, otherwise apply to all text
    if (start !== end) {
      const before = input.slice(0, start);
      const selected = input.slice(start, end);
      const after = input.slice(end);
      const converted = fn(selected);
      const next = before + converted + after;
      setInput(next);

      // keep selection on the transformed block for continuity
      restoreSelection({ start, end: start + converted.length });
      return;
    }

    setInput(fn(input));
  };

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

        // Use pdfjs legacy build for broad bundler compatibility
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

        // Worker setup varies across bundlers; try the common Vite-style ?url first, then fall back.
        let workerSrc: string | undefined;
        try {
          workerSrc = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default as string;
        } catch {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            workerSrc = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs" as any)).default as string;
          } catch {
            // If workerSrc can't be resolved, pdfjs may still work (slower) or fail; we'll handle the error below.
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
          const strings = (content.items || []).map((it: any) => it.str).filter(Boolean);
          fullText += strings.join(" ") + "\n";
        }

        const cleaned = fullText.trim();
        if (!cleaned) {
          throw new Error("No text found in PDF");
        }
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
        setInfoMsg("DOCX text extracted locally. Formatting may be simplified.");
        return;
      }

      // Text-like files
      const text = await readAsText();
      setInput(text);
      setInfoMsg("File loaded locally.");
    } catch (e: any) {
      console.error(e);
      setErrorMsg(
        "Could not extract text from that file in-browser. Make sure optional libraries are installed (pdfjs-dist for PDF, mammoth for DOCX).",
      );

      // Bring the error into view immediately
      window.requestAnimationFrame(() => {
        const el = document.getElementById("wordCounterAlertRegion");
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    }
  };

  const downloadAsText = () => {
    try {
      const blob = new Blob([input], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "word-counter-text.txt";
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
      const maxWidth = pageWidth - margin * 2;
      const lines = doc.splitTextToSize(input || "", maxWidth);
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text(lines, margin, margin);
      doc.save("word-counter-text.pdf");
    } catch {
      // Fallback: print dialog (user can "Save as PDF")
      window.print();
    }
  };

  const handleCopy = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed:", err);
      setErrorMsg("Copy failed. Please try again.");
    }
  };

  const handleClear = () => {
    setInput("");
    setErrorMsg(null);
    setInfoMsg(null);
  };

  const handleCaseChange = (next: CaseOption) => {
    // Snapshot selection BEFORE focus shifts away from textarea
    const range = lastSelectionRef.current;
    setSelectedCase(next);
    if (!input) return;

    // Apply immediately (no Apply button)
    applyConverter(next, range);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
          Word Counter
        </h1>
      </div>

      {/* Primary stats (large) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Word count
          </div>
          <div className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {stats.words}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Character count
          </div>
          <div className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {stats.chars}
          </div>
        </div>
      </div>

      {/* Alerts right near the top so users notice immediately */}
      <div id="wordCounterAlertRegion" className="space-y-2">
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

      {/* Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        {/* Desktop / large screens: one lean row */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                historyIndex <= 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200"
                  : "bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200"
              }`}
              type="button"
            >
              ↩ Undo
            </button>

            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                historyIndex >= history.length - 1
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200"
                  : "bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200"
              }`}
              type="button"
            >
              ↪ Redo
            </button>

            <label className="px-3 py-2 rounded-lg text-sm font-semibold bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200 transition-all active:scale-95">
              ⬆ Upload
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
              onClick={downloadAsText}
              disabled={!input}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                input
                  ? "bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200"
              }`}
              type="button"
            >
              ⬇ .txt
            </button>

            <button
              onClick={downloadAsPdf}
              disabled={!input}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                input
                  ? "bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200"
              }`}
              type="button"
            >
              🖨️ PDF
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCase}
              onChange={(e) => handleCaseChange(e.target.value as CaseOption)}
              onMouseDown={() => snapshotSelection()}
              className="h-10 rounded-lg bg-white ring-1 ring-slate-200 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
              title="Applies to highlighted text if selected; otherwise applies to all text"
            >
              {caseOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile / small screens: collapsed menu */}
        <details className="lg:hidden">
          <summary className="list-none">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">Tools</div>
              <div className="px-3 py-2 rounded-lg text-sm font-semibold bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200 transition-all">
                Open
              </div>
            </div>
          </summary>

          <div className="mt-4 grid gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                  historyIndex <= 0
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200"
                    : "bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200"
                }`}
                type="button"
              >
                ↩ Undo
              </button>

              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                  historyIndex >= history.length - 1
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200"
                    : "bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200"
                }`}
                type="button"
              >
                ↪ Redo
              </button>

              <label className="px-3 py-2 rounded-lg text-sm font-semibold bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200 transition-all active:scale-95">
                ⬆ Upload
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
                onClick={downloadAsText}
                disabled={!input}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                  input
                    ? "bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200"
                }`}
                type="button"
              >
                ⬇ .txt
              </button>

              <button
                onClick={downloadAsPdf}
                disabled={!input}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                  input
                    ? "bg-white hover:bg-slate-50 text-slate-800 cursor-pointer ring-1 ring-slate-200"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed ring-1 ring-slate-200"
                }`}
                type="button"
              >
                🖨️ PDF
              </button>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Case tools
              </label>

              <select
                value={selectedCase}
                onMouseDown={() => snapshotSelection()}
                onChange={(e) => handleCaseChange(e.target.value as CaseOption)}
                className="h-10 rounded-lg bg-white ring-1 ring-slate-200 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                title="Applies to highlighted text if selected; otherwise applies to all text"
              >
                {caseOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>
      </div>

      <div>
        <label htmlFor="wordCounterInput" className="sr-only">
          Text input
        </label>
        <textarea
          ref={textareaRef}
          aria-label="Word counter text input"
          id="wordCounterInput"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSelect={snapshotSelection}
          onKeyUp={snapshotSelection}
          onMouseUp={snapshotSelection}
          onBlur={snapshotSelection}
          placeholder="Type or paste your text here..."
          className="w-full min-h-[22rem] sm:min-h-[26rem] max-h-[52rem] p-4 border border-gray-300 rounded-md font-mono text-base leading-relaxed bg-white resize-y focus:outline-none focus:border-gray-400 hover:border-gray-400 transition-colors"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Lines
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">{stats.lines}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Spaces
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">{stats.spaces}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Sentences
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">{stats.sentences}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Paragraphs
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">{stats.paragraphs}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Chars (no spaces)
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">{stats.charsNoSpaces}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Reading time
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">
            {stats.words ? `${Math.ceil(stats.readingTimeMinutes)} min` : "0"}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Speaking time
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">
            {stats.words ? `${Math.ceil(stats.speakingTimeMinutes)} min` : "0"}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            History
          </div>
          <div className="mt-1 text-xl font-bold text-slate-900">{Math.min(history.length, 200)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          disabled={!input}
          className={`px-5 py-2 rounded-md text-sm font-semibold text-white transition-all active:scale-95 ${
            input ? "bg-slate-800 hover:bg-slate-900 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
          }`}
          type="button"
        >
          {copied ? "✓ Copied!" : "📋 Copy Text"}
        </button>

        <button
          onClick={handleClear}
          className="px-5 py-2 rounded-md text-sm font-semibold bg-gray-200 hover:bg-gray-300 cursor-pointer text-slate-800 transition-all active:scale-95"
          type="button"
        >
          🧹 Clear
        </button>
      </div>
    </div>
  );
}
