import type { MetaFunction } from "@remix-run/node";
import { useEffect, useMemo, useRef, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Text to PDF" },
    {
      name: "description",
      content:
        "Format your text, then export a clean PDF. Runs locally in your browser.",
    },
  ];
};

type PageSize = "letter" | "a4";
type Orientation = "portrait" | "landscape";

type Margins = { top: number; right: number; bottom: number; left: number };

type PdfExportOptions = {
  fileName: string;
  pageSize: PageSize;
  orientation: Orientation;
  marginPt: Margins;
  scale: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeNumber(v: unknown, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function plainTextFromHtml(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? "").replace(/\u00A0/g, " ").trim();
}

function isProbablyEmptyHtml(html: string) {
  const t = html
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00A0/g, " ")
    .trim();
  return t.length === 0;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChipButton({
  onClick,
  title,
  children,
  disabled,
  variant = "default",
}: {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: "default" | "primary";
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ring-1 shadow-sm transition select-none cursor-pointer";
  const style =
    variant === "primary"
      ? "bg-sky-600 text-white ring-sky-600 hover:bg-sky-700"
      : "bg-white text-slate-900 ring-slate-200 hover:bg-sky-50 hover:ring-sky-200";
  const dis = disabled
    ? "opacity-40 cursor-not-allowed hover:bg-white hover:ring-slate-200"
    : "";

  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        // Prevent focus from leaving editor and collapsing selection.
        e.preventDefault();
      }}
      onClick={(e) => {
        e.preventDefault();
        if (!disabled) onClick?.();
      }}
      disabled={disabled}
      className={`${base} ${style} ${dis}`}
    >
      {children}
    </button>
  );
}

function useSelectionStore(editorRef: React.RefObject<HTMLDivElement | null>) {
  const lastRangeRef = useRef<Range | null>(null);

  const save = () => {
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    // Only save selections that are inside the editor.
    if (!el.contains(r.commonAncestorContainer)) return;
    lastRangeRef.current = r.cloneRange();
  };

  const restore = () => {
    const el = editorRef.current;
    if (!el) return false;
    const r = lastRangeRef.current;
    if (!r) return false;
    const sel = window.getSelection();
    if (!sel) return false;

    // If nodes were removed, range might be invalid.
    try {
      sel.removeAllRanges();
      sel.addRange(r);
      el.focus();
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const handler = () => save();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { save, restore, getLast: () => lastRangeRef.current };
}

function wrapSelectionWithSpanStyle(editorEl: HTMLDivElement, style: Partial<CSSStyleDeclaration>) {
  const sel = window.getSelection();
  if (!sel) return;

  if (sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (!editorEl.contains(range.commonAncestorContainer)) return;

  // If selection is collapsed, insert a marker span and place caret inside.
  if (range.collapsed) {
    const span = document.createElement("span");
    Object.assign(span.style, style);
    span.appendChild(document.createTextNode("\u200B"));
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.setStart(span.firstChild as Text, 1);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    // Clean marker on next input
    return;
  }

  const span = document.createElement("span");
  Object.assign(span.style, style);

  try {
    // Extract contents and wrap.
    const frag = range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);

    // Restore selection around wrapped node.
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } catch {
    // Fallback to execCommand when extraction fails in some edge cases.
    try {
      (document as any).execCommand?.("styleWithCSS", false, "true");
    } catch {
      // ignore
    }
  }
}

function applyFormatBlock(tag: "p" | "h1" | "h2" | "h3" | "h4" | "h5") {
  // formatBlock expects tag in angle brackets in many browsers
  try {
    document.execCommand("formatBlock", false, `<${tag}>`);
  } catch {
    // ignore
  }
}

async function exportToPdf(el: HTMLElement, opts: PdfExportOptions) {
  const [{ jsPDF }, html2canvas] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const page = (() => {
    if (opts.pageSize === "letter") {
      return opts.orientation === "portrait"
        ? { w: 612, h: 792 }
        : { w: 792, h: 612 };
    }
    // A4 in points
    return opts.orientation === "portrait"
      ? { w: 595.28, h: 841.89 }
      : { w: 841.89, h: 595.28 };
  })();

  const pdf = new jsPDF({
    unit: "pt",
    format: [page.w, page.h],
    orientation: opts.orientation,
    compress: true,
  });

  const canvas = await html2canvas.default(el, {
    scale: opts.scale,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  const contentW = page.w - (opts.marginPt.left + opts.marginPt.right);
  const contentH = page.h - (opts.marginPt.top + opts.marginPt.bottom);

  const imgW = contentW;
  const imgH = (canvas.height * imgW) / canvas.width;

  // Single-page fit. This matches your current behavior.
  // If you want true multipage pagination later, we can add it.
  const drawH = Math.min(imgH, contentH);

  pdf.addImage(
    imgData,
    "PNG",
    opts.marginPt.left,
    opts.marginPt.top,
    imgW,
    drawH,
  );

  pdf.save(opts.fileName);
}

export default function TextToPdfRoute() {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [pageSize, setPageSize] = useState<PageSize>("letter");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margins, setMargins] = useState<Margins>({ top: 12, right: 12, bottom: 12, left: 12 });
  const [scale, setScale] = useState<number>(2);

  // This is the input UI value, NOT a derived selection value.
  // Keep it string-controlled so typing never gets clamped mid-edit.
  const [sizeInput, setSizeInput] = useState<string>("16");

  const [fontFamily, setFontFamily] = useState<string>(
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  );
  const [textColor, setTextColor] = useState<string>("#0f172a");

  const editorRef = useRef<HTMLDivElement | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  const selection = useSelectionStore(editorRef);

  const hasContent = useMemo(() => {
    if (typeof document === "undefined") return false;
    return !isProbablyEmptyHtml(html);
  }, [html]);

  const syncFromDom = () => {
    const el = editorRef.current;
    if (!el) return;
    setHtml(el.innerHTML);
  };

  const focusEditor = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
  };

  const withSelection = (fn: () => void) => {
    setErrorMsg(null);
    setInfoMsg(null);

    // Restore selection before applying formatting.
    const restored = selection.restore();
    if (!restored) focusEditor();

    fn();
    syncFromDom();
  };

  const execInline = (cmd: string, value?: string) => {
    withSelection(() => {
      try {
        document.execCommand("styleWithCSS", false, "true");
      } catch {
        // ignore
      }
      try {
        document.execCommand(cmd, false, value);
      } catch {
        setErrorMsg("That formatting action is not supported in this browser.");
      }
    });
  };

  const applyFontSizePx = (px: number) => {
    const el = editorRef.current;
    if (!el) return;
    const n = clamp(Math.round(px), 8, 200);

    withSelection(() => {
      wrapSelectionWithSpanStyle(el, { fontSize: `${n}px` });
    });
  };

  const applyColor = (hex: string) => {
    const el = editorRef.current;
    if (!el) return;

    withSelection(() => {
      wrapSelectionWithSpanStyle(el, { color: hex });
    });
  };

  const applyFontFamilyToSelection = (css: string) => {
    const el = editorRef.current;
    if (!el) return;

    withSelection(() => {
      wrapSelectionWithSpanStyle(el, { fontFamily: css });
    });
  };

  const applyStyleBlock = (tag: "p" | "h1" | "h2" | "h3" | "h4" | "h5") => {
    withSelection(() => {
      applyFormatBlock(tag);
    });
  };

  const onEditorInput = () => {
    syncFromDom();
  };

  const onEditorKeyUp = () => {
    selection.save();
  };

  const onEditorMouseUp = () => {
    selection.save();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Keep basic rich paste without weird left padding from lists.
    // Also strip tab padding.
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const htmlData = e.clipboardData.getData("text/html");

    withSelection(() => {
      if (htmlData) {
        document.execCommand("insertHTML", false, htmlData);
      } else {
        const escaped = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>");
        document.execCommand("insertHTML", false, escaped);
      }
    });
  };

  async function copyPlain() {
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      const el = editorRef.current;
      const text = el ? plainTextFromHtml(el.innerHTML) : "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
      setErrorMsg("Copy failed. Your browser may block clipboard access here.");
    }
  }

  function clearAll() {
    setErrorMsg(null);
    setInfoMsg(null);
    setHtml("");
    const el = editorRef.current;
    if (el) el.innerHTML = "";
  }

  const downloadTxt = () => {
    try {
      const el = editorRef.current;
      const text = el ? plainTextFromHtml(el.innerHTML) : "";
      downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), "text.txt");
    } catch {
      setErrorMsg("Download failed. Please try again.");
    }
  };

  const downloadPdf = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const target = printRef.current;
      if (!target) throw new Error("Missing print element");

      await exportToPdf(target, {
        fileName: "text-to-pdf.pdf",
        pageSize,
        orientation,
        marginPt: margins,
        scale,
      });

      setInfoMsg("PDF generated locally.");
    } catch (e) {
      console.error(e);
      setErrorMsg("PDF export failed. Install jspdf + html2canvas and try again.");
    }
  };

  // Upload handling: keep it minimal and reliable. Optional libs.
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setInfoMsg(null);

    const name = (file.name || "").toLowerCase();
    const ext = name.includes(".") ? name.split(".").pop() : "";

    try {
      if (ext === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        let workerSrc: string | undefined;
        try {
          workerSrc = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default as string;
        } catch {
          workerSrc = undefined;
        }
        if (workerSrc && pdfjs?.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        }

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let full = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const items = (content.items || []) as any[];

          // Simple line breaks: join with spaces, then blank line between pages.
          const pageText = items
            .map((it: any) => (typeof it?.str === "string" ? it.str : ""))
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          if (pageText) full += pageText + "\n\n";
        }

        const escaped = full
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>");

        const el = editorRef.current;
        if (el) {
          el.innerHTML = escaped;
          setHtml(el.innerHTML);
        }
        setInfoMsg("PDF text extracted locally.");
        return;
      }

      if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth: any = await import("mammoth/mammoth.browser");
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const value = String(result?.value ?? "").trim();
        const el = editorRef.current;
        if (el) {
          el.innerHTML = value;
          setHtml(el.innerHTML);
        }
        setInfoMsg("DOCX imported locally.");
        return;
      }

      const text = await file.text();
      const el = editorRef.current;
      if (el) {
        if (ext === "html" || ext === "htm") {
          el.innerHTML = text;
        } else {
          const escaped = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br/>");
          el.innerHTML = escaped;
        }
        setHtml(el.innerHTML);
      }
      setInfoMsg("File loaded locally.");
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not extract/import that file in-browser. Optional libraries: pdfjs-dist (PDF) and mammoth (DOCX).",
      );
    }
  };

  const onSizeCommit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setSizeInput("16");
      return;
    }

    const n = safeNumber(trimmed, 16);
    const clamped = clamp(Math.round(n), 8, 200);
    setSizeInput(String(clamped));
    applyFontSizePx(clamped);
  };

  const bumpSize = (delta: number) => {
    const current = safeNumber(sizeInput, 16);
    const next = clamp(current + delta, 8, 200);
    setSizeInput(String(next));
    applyFontSizePx(next);
  };

  // Print surface width matches page size for more stable canvas rendering.
  const paperWidthPt = useMemo(() => {
    if (pageSize === "letter") return orientation === "portrait" ? 612 : 792;
    return orientation === "portrait" ? 595.28 : 841.89;
  }, [pageSize, orientation]);

  const placeholder =
    "Format your text, then export a clean PDF. Runs locally in your browser.";

  // Keep editor DOM in sync when html state changes from external actions.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [html]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Text to PDF
          </h1>
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
          {/* Toolbar */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <ChipButton title="Bold" onClick={() => execInline("bold")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M7 5h6a3 3 0 0 1 0 6H7zM7 11h7a3 3 0 0 1 0 6H7z" />
                  Bold
                </span>
              </ChipButton>

              <ChipButton title="Italic" onClick={() => execInline("italic")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M10 4h10M4 20h10M14 4l-4 16" />
                  Italic
                </span>
              </ChipButton>

              <ChipButton title="Underline" onClick={() => execInline("underline")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" />
                  Underline
                </span>
              </ChipButton>

              <ChipButton
                title="Link"
                onClick={() => {
                  const urlRaw = window.prompt("Enter a URL (https://...)");
                  if (!urlRaw) return;
                  const u = urlRaw.trim();
                  const url =
                    /^https?:\/\//i.test(u) || /^mailto:/i.test(u) || /^tel:/i.test(u) || u.startsWith("#")
                      ? u
                      : `https://${u}`;
                  execInline("createLink", url);
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
                  Link
                </span>
              </ChipButton>

              <ChipButton title="Bullets" onClick={() => execInline("insertUnorderedList")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01" />
                  Bullets
                </span>
              </ChipButton>

              <ChipButton title="Numbers" onClick={() => execInline("insertOrderedList")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M10 6h11M10 12h11M10 18h11M4 7h1V5H4m0 7h2m-2 0a2 2 0 0 0 2-2m0 8H4l2-2a1 1 0 0 0-1-1H4" />
                  Numbers
                </span>
              </ChipButton>

              <ChipButton title="Left" onClick={() => execInline("justifyLeft")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M4 6h16M4 12h10M4 18h16" />
                  Left
                </span>
              </ChipButton>
              <ChipButton title="Center" onClick={() => execInline("justifyCenter")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M4 6h16M7 12h10M4 18h16" />
                  Center
                </span>
              </ChipButton>
              <ChipButton title="Right" onClick={() => execInline("justifyRight")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M4 6h16M10 12h10M4 18h16" />
                  Right
                </span>
              </ChipButton>

              <ChipButton title="Undo" onClick={() => execInline("undo")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M9 14l-4-4 4-4M5 10h10a4 4 0 0 1 0 8h-3" />
                  Undo
                </span>
              </ChipButton>
              <ChipButton title="Redo" onClick={() => execInline("redo")}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon d="M15 14l4-4-4-4M19 10H9a4 4 0 0 0 0 8h3" />
                  Redo
                </span>
              </ChipButton>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Style */}
              <label
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-sky-200 focus-within:ring-2 focus-within:ring-sky-200"
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="text-sm font-semibold text-slate-700">Style</span>
                <select
                  className="cursor-pointer bg-transparent text-sm focus:outline-none"
                  defaultValue="p"
                  onMouseDown={(e) => e.preventDefault()}
                  onChange={(e) => {
                    const v = e.target.value as any;
                    applyStyleBlock(v);
                  }}
                  aria-label="Text style"
                >
                  <option value="p">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                  <option value="h4">Heading 4</option>
                  <option value="h5">Heading 5</option>
                </select>
              </label>

              {/* Font */}
              <label
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-sky-200 focus-within:ring-2 focus-within:ring-sky-200"
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="text-sm font-semibold text-slate-700">Font</span>
                <select
                  className="cursor-pointer bg-transparent text-sm focus:outline-none"
                  value={fontFamily}
                  onMouseDown={(e) => e.preventDefault()}
                  onChange={(e) => {
                    const css = e.target.value;
                    setFontFamily(css);
                    applyFontFamilyToSelection(css);
                  }}
                  aria-label="Font family"
                >
                  <option value={'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial'}>
                    System
                  </option>
                  <option value={'Arial, Helvetica, sans-serif'}>Arial</option>
                  <option value={'"Helvetica Neue", Helvetica, Arial, sans-serif'}>Helvetica</option>
                  <option value={'Georgia, serif'}>Georgia</option>
                  <option value={'"Times New Roman", Times, serif'}>Times New Roman</option>
                  <option value={'Verdana, Geneva, sans-serif'}>Verdana</option>
                  <option value={'Tahoma, Geneva, sans-serif'}>Tahoma</option>
                  <option value={'"Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", sans-serif'}>
                    Trebuchet MS
                  </option>
                  <option value={'"Courier New", Courier, monospace'}>Courier New</option>
                  <option value={'Garamond, serif'}>Garamond</option>
                </select>
              </label>

              {/* Size */}
              <div
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-sky-200 focus-within:ring-2 focus-within:ring-sky-200"
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="text-sm font-semibold text-slate-700">Size</span>
                <input
                  className="w-16 bg-transparent text-sm focus:outline-none"
                  inputMode="numeric"
                  value={sizeInput}
                  onMouseDown={(e) => {
                    // Do not collapse selection when clicking into input.
                    e.preventDefault();
                  }}
                  onFocus={(e) => {
                    // Allow typing while keeping editor selection stored.
                    e.currentTarget.select();
                  }}
                  onChange={(e) => {
                    // Only allow digits, but do not clamp while typing.
                    const next = e.target.value.replace(/[^0-9]/g, "");
                    setSizeInput(next);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSizeCommit(sizeInput);
                    }
                  }}
                  onBlur={() => {
                    onSizeCommit(sizeInput);
                  }}
                  aria-label="Font size"
                />
                <span className="text-xs text-slate-500">px</span>

                <button
                  type="button"
                  className="h-7 w-7 rounded-full border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => bumpSize(1)}
                  aria-label="Increase font size"
                  title="Increase"
                >
                  +
                </button>
                <button
                  type="button"
                  className="h-7 w-7 rounded-full border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-200 transition cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => bumpSize(-1)}
                  aria-label="Decrease font size"
                  title="Decrease"
                >
                  -
                </button>
              </div>

              {/* Color */}
              <label
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-sky-200 focus-within:ring-2 focus-within:ring-sky-200"
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="text-sm font-semibold text-slate-700">Color</span>
                <input
                  className="h-6 w-10 cursor-pointer rounded border border-slate-200"
                  type="color"
                  value={textColor}
                  onMouseDown={(e) => e.preventDefault()}
                  onChange={(e) => {
                    const hex = e.target.value;
                    setTextColor(hex);
                    applyColor(hex);
                  }}
                  aria-label="Text color"
                />
              </label>
            </div>

            {/* Settings */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-slate-700">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Page</span>
                <select
                  className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSize)}
                  aria-label="Page size"
                >
                  <option value="letter">Letter</option>
                  <option value="a4">A4</option>
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span className="font-semibold">Orientation</span>
                <select
                  className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  aria-label="Orientation"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span className="font-semibold">Margins</span>
                <div className="flex items-center gap-2">
                  <input
                    className="w-16 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    type="number"
                    min={0}
                    max={120}
                    value={margins.top}
                    onChange={(e) => setMargins((m) => ({ ...m, top: safeNumber(e.target.value, m.top) }))}
                    aria-label="Top margin in points"
                  />
                  <span className="text-xs text-slate-500">T</span>
                  <input
                    className="w-16 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    type="number"
                    min={0}
                    max={120}
                    value={margins.right}
                    onChange={(e) => setMargins((m) => ({ ...m, right: safeNumber(e.target.value, m.right) }))}
                    aria-label="Right margin in points"
                  />
                  <span className="text-xs text-slate-500">R</span>
                  <input
                    className="w-16 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    type="number"
                    min={0}
                    max={120}
                    value={margins.bottom}
                    onChange={(e) => setMargins((m) => ({ ...m, bottom: safeNumber(e.target.value, m.bottom) }))}
                    aria-label="Bottom margin in points"
                  />
                  <span className="text-xs text-slate-500">B</span>
                  <input
                    className="w-16 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    type="number"
                    min={0}
                    max={120}
                    value={margins.left}
                    onChange={(e) => setMargins((m) => ({ ...m, left: safeNumber(e.target.value, m.left) }))}
                    aria-label="Left margin in points"
                  />
                  <span className="text-xs text-slate-500">L</span>
                  <span className="text-slate-500">pt</span>
                </div>
              </label>

              <label className="flex items-center gap-2">
                <span className="font-semibold">Quality</span>
                <select
                  className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  value={String(scale)}
                  onChange={(e) => setScale(safeNumber(e.target.value, 2))}
                  aria-label="Render scale"
                >
                  <option value="1.5">Standard</option>
                  <option value="2">High</option>
                  <option value="2.5">Very high</option>
                </select>
              </label>
            </div>
          </div>

          {/* Editor */}
          <div className="relative">
            {!hasContent && (
              <div className="pointer-events-none absolute left-4 top-4 text-slate-400">
                {placeholder}
              </div>
            )}

            <div
              ref={editorRef}
              className="min-h-[340px] rounded-2xl border-2 border-sky-300 bg-slate-50/40 p-4 text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-200"
              contentEditable
              suppressContentEditableWarning
              spellCheck
              onInput={onEditorInput}
              onKeyUp={onEditorKeyUp}
              onMouseUp={onEditorMouseUp}
              onPaste={onPaste}
              style={{
                fontFamily,
                color: textColor,
              }}
            />

            <style
              dangerouslySetInnerHTML={{
                __html: `
                  .prose-editor h1 { font-size: 32px; font-weight: 800; margin: 0.6em 0 0.35em; }
                  .prose-editor h2 { font-size: 26px; font-weight: 800; margin: 0.55em 0 0.35em; }
                  .prose-editor h3 { font-size: 22px; font-weight: 800; margin: 0.5em 0 0.35em; }
                  .prose-editor h4 { font-size: 18px; font-weight: 800; margin: 0.45em 0 0.3em; }
                  .prose-editor h5 { font-size: 16px; font-weight: 800; margin: 0.4em 0 0.3em; }
                  .prose-editor p { margin: 0 0 0.5em; }
                  .prose-editor ul { margin-left: 1.25rem; list-style: disc; }
                  .prose-editor ol { margin-left: 1.25rem; list-style: decimal; }
                `,
              }}
            />
          </div>

          {/* Actions */}
          <div className="mt-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition select-none">
                  <span className="inline-flex items-center gap-2">
                    <Icon d="M12 5v14M5 12h14" />
                    Upload (.txt, .pdf, .docx, .html)
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.md,.csv,.json,.html,.htm,.xml,.pdf,.docx"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      await handleFileUpload(f);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>

                <ChipButton title="Clear" onClick={clearAll} disabled={!hasContent}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon d="M6 7h12M9 7V5h6v2m-8 0l1 14h6l1-14" />
                    Clear
                  </span>
                </ChipButton>

                <ChipButton title="Download TXT" onClick={downloadTxt} disabled={!hasContent}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon d="M12 3v10m0 0l4-4m-4 4l-4-4M5 21h14" />
                    Download TXT
                  </span>
                </ChipButton>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                <ChipButton
                  title="Download PDF"
                  onClick={downloadPdf}
                  disabled={!hasContent}
                  variant="primary"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon d="M12 3v10m0 0l4-4m-4 4l-4-4M5 21h14" />
                    Download PDF
                  </span>
                </ChipButton>

                <ChipButton title="Copy" onClick={copyPlain} disabled={!hasContent}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon d="M9 9h10v10H9zM5 5h10v10" />
                    {copied ? "Copied" : "Copy"}
                  </span>
                </ChipButton>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Note: This editor aims to keep obvious structure (headings, lists, tables) but
              complex layouts may need manual cleanup before exporting.
            </p>
          </div>
        </div>

        {/* Offscreen print surface */}
        <div className="fixed left-[-99999px] top-0 opacity-0 pointer-events-none">
          <div
            ref={printRef}
            style={{
              width: `${paperWidthPt}pt`,
              background: "#fff",
              padding: "0pt",
              fontFamily,
              color: textColor,
              lineHeight: "1.4",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
