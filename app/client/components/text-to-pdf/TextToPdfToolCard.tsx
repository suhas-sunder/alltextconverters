import { useEffect, useMemo, useRef, useState } from "react";
import { ChipButton } from "./components/ChipButton";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconCopy,
  IconDownload,
  IconHeading,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconRedo,
  IconTrash,
  IconUnderline,
  IconUndo,
  IconUpload,
} from "./components/Icons";
import { RichTextEditor } from "./components/RichTextEditor";
import { extractPlainText } from "./utils/extractPlainText";
import { sanitizeRichHtml } from "./utils/sanitizeRichHtml";
import { exportElementToPdf } from "./utils/pdfExport";
import { extractPdfHtmlWithLineBreaks } from "./utils/extractPdfText";

type PageSize = "letter" | "a4";
type Orientation = "portrait" | "landscape";
type BlockStyle = "p" | "h1" | "h2" | "h3" | "h4" | "h5";

const FONT_FAMILY_MAP: Record<string, string> = {
  system:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  arial: "Arial, Helvetica, sans-serif",
  helvetica: "Helvetica, Arial, sans-serif",
  georgia: "Georgia, serif",
  times: '"Times New Roman", Times, serif',
  verdana: "Verdana, Geneva, sans-serif",
  tahoma: "Tahoma, Geneva, sans-serif",
  trebuchet: '"Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", sans-serif',
  courier: '"Courier New", Courier, monospace',
};

const HEADING_PX: Record<BlockStyle, number> = {
  p: 16,
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function isNodeInside(container: HTMLElement, node: Node | null) {
  if (!node) return false;
  return container === node || container.contains(node);
}

function findNearestBlock(editor: HTMLElement, node: Node | null): HTMLElement | null {
  let cur: Node | null = node;
  while (cur && cur !== editor) {
    if (cur.nodeType === Node.ELEMENT_NODE) {
      const el = cur as HTMLElement;
      const tag = el.tagName.toUpperCase();
      if (
        tag === "P" ||
        tag === "DIV" ||
        tag === "LI" ||
        tag === "H1" ||
        tag === "H2" ||
        tag === "H3" ||
        tag === "H4" ||
        tag === "H5"
      ) {
        return el;
      }
    }
    cur = cur.parentNode;
  }
  return null;
}

export function TextToPdfToolCard() {
  const [html, setHtml] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const [pageSize, setPageSize] = useState<PageSize>("letter");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<number>(12);
  const [scale, setScale] = useState<number>(2);

  const [blockStyle, setBlockStyle] = useState<BlockStyle>("p");
  const [baseFontFamily, setBaseFontFamily] = useState<string>("system");
  const [baseTextColor, setBaseTextColor] = useState<string>("#0f172a");

  // font size input must be string-controlled so typing "25" doesn't get clamped mid-entry
  const [fontSizeInput, setFontSizeInput] = useState<string>("16");

  const editorRef = useRef<HTMLDivElement | null>(null);
  const printRef = useRef<HTMLDivElement | null>(null);

  // Persist selection across toolbar interactions (select/input focus steals selection)
  const savedRangeRef = useRef<Range | null>(null);

  const hasContent = useMemo(() => extractPlainText(html).length > 0, [html]);

  const saveSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const r = sel.getRangeAt(0);
    if (!isNodeInside(editor, r.commonAncestorContainer)) return;
    savedRangeRef.current = r.cloneRange();
  };

  const restoreSelection = (): boolean => {
    const editor = editorRef.current;
    const r = savedRangeRef.current;
    if (!editor || !r) return false;
    editor.focus();
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(r);
    return true;
  };

  useEffect(() => {
    const onSel = () => saveSelection();
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncDomToState = () => {
    const el = editorRef.current;
    if (!el) return;
    setHtml(el.innerHTML);
  };

  const exec = (command: string, value?: string) => {
    setErrorMsg(null);
    setInfoMsg(null);

    const el = editorRef.current;
    if (!el) return;

    // restore selection before applying commands, so users can chain actions
    restoreSelection();

    try {
      document.execCommand("styleWithCSS", false, "true");
      document.execCommand(command, false, value);
      syncDomToState();
    } catch {
      setErrorMsg("That formatting action is not supported in this browser.");
    }
  };

  const replaceSelectionWithStyledSpan = (style: Record<string, string>) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Prefer the *current* selection if it's inside the editor.
    // Only fall back to a previously saved Range if focus was stolen by toolbar UI.
    let sel = window.getSelection();
    let range: Range | null = null;

    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (isNodeInside(editor, r.commonAncestorContainer)) range = r;
    }

    if (!range) {
      const ok = restoreSelection();
      if (!ok) return;
      sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      range = sel.getRangeAt(0);
      if (!isNodeInside(editor, range.commonAncestorContainer)) return;
    }

    const span = document.createElement("span");
    for (const [k, v] of Object.entries(style)) span.style.setProperty(k, v);

    if (range.collapsed) {
      // Insert a zero-width marker so typing continues with the style
      span.textContent = "\u200B";
      range.insertNode(span);

      // Place caret after the marker inside the span
      const r2 = document.createRange();
      r2.setStart(span.firstChild as Text, 1);
      r2.collapse(true);
      sel.removeAllRanges();
      sel.addRange(r2);
      savedRangeRef.current = r2.cloneRange();
      syncDomToState();
      return;
    }

    const frag = range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);

    // Move caret to end of inserted span
    const r3 = document.createRange();
    r3.selectNodeContents(span);
    r3.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r3);
    savedRangeRef.current = r3.cloneRange();

    syncDomToState();
  };

  const normalizeFontTags = (root: HTMLElement, px: number) => {
    // execCommand("fontSize") produces <font size="...">. Convert to <span style="font-size:..."> so sanitize keeps it.
    const fonts = Array.from(root.querySelectorAll("font[size]")) as HTMLElement[];
    for (const f of fonts) {
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      // Preserve inner markup
      span.innerHTML = f.innerHTML;
      f.replaceWith(span);
    }
  };

  const applyFontSize = (px: number) => {
    const editor = editorRef.current;
    if (!editor) return;

    const v = clamp(px, 8, 96);

    // Restore selection and apply fontSize via execCommand (more robust across lists/blocks).
    const ok = restoreSelection();
    if (!ok) return;

    try {
      document.execCommand("styleWithCSS", false, "true");
      // Legacy mapping 1..7; we use 7 (largest) then normalize to exact px.
      document.execCommand("fontSize", false, "7");
      normalizeFontTags(editor, v);
      syncDomToState();
    } catch {
      // Fallback: wrap with span for basic cases
      replaceSelectionWithStyledSpan({ "font-size": `${v}px` });
    }
  };

  const applyTextColor = (hex: string) => {
    replaceSelectionWithStyledSpan({ color: hex });
  };

  const applyFontFamily = (key: string) => {
    const css = FONT_FAMILY_MAP[key] ?? FONT_FAMILY_MAP.system;
    replaceSelectionWithStyledSpan({ "font-family": css });
  };

  const applyBlock = (style: BlockStyle) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Use current selection if possible, otherwise restore the last editor selection.
    let sel = window.getSelection();
    let range: Range | null = null;

    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (isNodeInside(editor, r.commonAncestorContainer)) range = r;
    }

    if (!range) {
      const ok = restoreSelection();
      if (!ok) return;
      sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      range = sel.getRangeAt(0);
      if (!isNodeInside(editor, range.commonAncestorContainer)) return;
    }

    const startNode = range.startContainer;
    const block = findNearestBlock(editor, startNode);
    if (!block) return;

    const tag = style === "p" ? "P" : style.toUpperCase();
    const next = document.createElement(tag);

    // Move children across
    while (block.firstChild) next.appendChild(block.firstChild);

    // Apply strict sizes for headings (avoid "scaling" based on editor base size)
    const px = HEADING_PX[style];
    next.style.fontSize = `${px}px`;
    next.style.lineHeight = "1.2";
    if (style !== "p") next.style.fontWeight = "800";

    // Keep alignment if present
    const align = (block.style && block.style.textAlign) || "";
    if (align) next.style.textAlign = align;

    block.replaceWith(next);

    // Place caret inside new block
    const r2 = document.createRange();
    r2.selectNodeContents(next);
    r2.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r2);
    savedRangeRef.current = r2.cloneRange();

    syncDomToState();
  };

  async function copyPlain() {
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      const text = extractPlainText(html);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
      setErrorMsg("Copy failed. Your browser may block clipboard access here.");
    }
  }

  function clearAll() {
    setHtml("");
    setErrorMsg(null);
    setInfoMsg(null);
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
          workerSrc = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default as string;
        } catch {
          workerSrc = undefined;
        }
        if (workerSrc && pdfjs?.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        }

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullHtml = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const items = (content.items || []) as any[];
          const pageHtml = extractPdfHtmlWithLineBreaks(items as any[], (content as any).styles as any);
          if (pageHtml) fullHtml += pageHtml + "<br/><br/>";
        }

        const cleaned = fullHtml.trim();
        if (!cleaned) throw new Error("No text found in PDF");

        setHtml(sanitizeRichHtml(cleaned));
        setInfoMsg("PDF text extracted locally. Review for layout artifacts.");
        return;
      }

      if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth: any = await import("mammoth/mammoth.browser");
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const value = String(result?.value ?? "").trim();
        if (!value) throw new Error("No text found in DOCX");
        setHtml(sanitizeRichHtml(value));
        setInfoMsg("DOCX imported locally. Review headings, tables, and spacing.");
        return;
      }

      const text = await readAsText();
      if (ext === "html" || ext === "htm") {
        setHtml(sanitizeRichHtml(text));
        setInfoMsg("HTML loaded locally. Unsupported elements are removed.");
        return;
      }

      setHtml(sanitizeRichHtml(text.replace(/\n/g, "<br/>")));
      setInfoMsg("File loaded locally.");
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "Could not extract/import that file in-browser. Optional libraries: pdfjs-dist (PDF) and mammoth (DOCX).",
      );
    }
  };

  const downloadPdf = async () => {
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const target = printRef.current;
      if (!target) throw new Error("Missing print element");

      await exportElementToPdf(target, {
        fileName: "text-to-pdf.pdf",
        pageSize,
        orientation,
        marginPt: margin,
        scale,
      });

      setInfoMsg("PDF generated locally.");
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "PDF export failed. Install required libraries (jspdf + html2canvas) and try again.",
      );
    }
  };

  const downloadTxt = () => {
    try {
      const text = extractPlainText(html);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "text.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setErrorMsg("Download failed. Please try again.");
    }
  };

  const paperWidthClass =
    pageSize === "letter"
      ? orientation === "portrait"
        ? "w-[612pt]"
        : "w-[792pt]"
      : orientation === "portrait"
        ? "w-[595pt]"
        : "w-[842pt]";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-6 sm:px-8 pb-8 pt-4 space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-[Poppins]">
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
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <ChipButton ariaLabel="Bold" title="Bold" onClick={() => exec("bold")}>
              <IconBold />
              <span>Bold</span>
            </ChipButton>

            <ChipButton ariaLabel="Italic" title="Italic" onClick={() => exec("italic")}>
              <IconItalic />
              <span>Italic</span>
            </ChipButton>

            <ChipButton ariaLabel="Underline" title="Underline" onClick={() => exec("underline")}>
              <IconUnderline />
              <span>Underline</span>
            </ChipButton>

            <ChipButton
              ariaLabel="Insert link"
              title="Insert link"
              onClick={() => {
                const urlRaw = window.prompt("Enter a URL (https://...)");
                if (!urlRaw) return;
                const u = urlRaw.trim();
                const url =
                  /^https?:\/\//i.test(u) || /^mailto:/i.test(u) || /^tel:/i.test(u) || u.startsWith("#")
                    ? u
                    : `https://${u}`;
                exec("createLink", url);
              }}
            >
              <IconLink />
              <span>Link</span>
            </ChipButton>

            <ChipButton ariaLabel="Bulleted list" title="Bulleted list" onClick={() => exec("insertUnorderedList")}>
              <IconList />
              <span>Bullets</span>
            </ChipButton>

            <ChipButton ariaLabel="Numbered list" title="Numbered list" onClick={() => exec("insertOrderedList")}>
              <IconListNumbers />
              <span>Numbers</span>
            </ChipButton>

            <ChipButton ariaLabel="Align left" title="Align left" onClick={() => exec("justifyLeft")}>
              <IconAlignLeft />
              <span>Left</span>
            </ChipButton>

            <ChipButton ariaLabel="Align center" title="Align center" onClick={() => exec("justifyCenter")}>
              <IconAlignCenter />
              <span>Center</span>
            </ChipButton>

            <ChipButton ariaLabel="Align right" title="Align right" onClick={() => exec("justifyRight")}>
              <IconAlignRight />
              <span>Right</span>
            </ChipButton>

            <ChipButton ariaLabel="Undo" title="Undo" onClick={() => exec("undo")}>
              <IconUndo />
              <span>Undo</span>
            </ChipButton>

            <ChipButton ariaLabel="Redo" title="Redo" onClick={() => exec("redo")}>
              <IconRedo />
              <span>Redo</span>
            </ChipButton>
          </div>

          {/* Style + font controls */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-700">
            <label
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm max-w-full min-w-0"
              onMouseDownCapture={saveSelection}
            >
              <IconHeading />
              <span className="text-sm font-semibold text-slate-700">Style</span>
              <select
                className="cursor-pointer bg-transparent text-sm focus:outline-none min-w-0"
                value={blockStyle}
                onChange={(e) => {
                  const v = e.target.value as BlockStyle;
                  setBlockStyle(v);
                  applyBlock(v);
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

            <label
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm max-w-full min-w-0"
              onMouseDownCapture={saveSelection}
            >
              <span className="text-sm font-semibold text-slate-700">Font</span>
              <select
                className="cursor-pointer bg-transparent text-sm focus:outline-none min-w-0"
                value={baseFontFamily}
                onChange={(e) => {
                  setBaseFontFamily(e.target.value);
                  applyFontFamily(e.target.value);
                }}
                aria-label="Font family"
              >
                <option value="system">System</option>
                <option value="arial">Arial</option>
                <option value="helvetica">Helvetica</option>
                <option value="georgia">Georgia</option>
                <option value="times">Times New Roman</option>
                <option value="verdana">Verdana</option>
                <option value="tahoma">Tahoma</option>
                <option value="trebuchet">Trebuchet MS</option>
                <option value="courier">Courier New</option>
              </select>
            </label>

            <label
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm max-w-full min-w-0"
              onMouseDownCapture={saveSelection}
            >
              <span className="text-sm font-semibold text-slate-700">Size</span>
              <input
                className="w-16 bg-transparent text-sm focus:outline-none"
                inputMode="numeric"
                pattern="[0-9]*"
                value={fontSizeInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setFontSizeInput(raw);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const n = Number(fontSizeInput);
                    if (Number.isFinite(n)) applyFontSize(n);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                onBlur={() => {
                  const n = Number(fontSizeInput);
                  if (!Number.isFinite(n) || n === 0) {
                    setFontSizeInput("16");
                    return;
                  }
                  const v = clamp(n, 8, 96);
                  setFontSizeInput(String(v));
                  applyFontSize(v);
                }}
                aria-label="Font size in pixels"
              />
              <span className="text-xs text-slate-500">px</span>

              <button
                type="button"
                className="cursor-pointer rounded-full border border-slate-200 px-2 py-0.5 text-xs font-bold hover:bg-slate-50"
                onMouseDown={(e) => {
                  // Don't steal selection
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={() => {
                  const n = Number(fontSizeInput || "16");
                  const v = clamp((Number.isFinite(n) ? n : 16) + 1, 8, 96);
                  setFontSizeInput(String(v));
                  applyFontSize(v);
                }}
                aria-label="Increase font size"
                title="Increase font size"
              >
                +
              </button>

              <button
                type="button"
                className="cursor-pointer rounded-full border border-slate-200 px-2 py-0.5 text-xs font-bold hover:bg-slate-50"
                onMouseDown={(e) => {
                  e.preventDefault();
                  saveSelection();
                }}
                onClick={() => {
                  const n = Number(fontSizeInput || "16");
                  const v = clamp((Number.isFinite(n) ? n : 16) - 1, 8, 96);
                  setFontSizeInput(String(v));
                  applyFontSize(v);
                }}
                aria-label="Decrease font size"
                title="Decrease font size"
              >
                -
              </button>
            </label>

            <label
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm max-w-full min-w-0"
              onMouseDownCapture={saveSelection}
            >
              <span className="text-sm font-semibold text-slate-700">Color</span>
              <input
                className="h-6 w-8 cursor-pointer rounded border border-slate-200"
                type="color"
                value={baseTextColor}
                onChange={(e) => {
                  setBaseTextColor(e.target.value);
                  applyTextColor(e.target.value);
                }}
                aria-label="Text color"
              />
            </label>
          </div>

          {/* Export settings */}
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-700">
            <label className="flex items-center gap-2">
              <span className="font-semibold">Page</span>
              <select
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
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
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as Orientation)}
                aria-label="Orientation"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <span className="font-semibold">Margin</span>
              <input
                className="w-16 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                type="number"
                min={0}
                max={120}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                aria-label="Margin in points"
              />
              <span className="text-slate-500">pt</span>
            </label>

            <label className="flex items-center gap-2">
              <span className="font-semibold">Quality</span>
              <select
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
                value={String(scale)}
                onChange={(e) => setScale(Number(e.target.value))}
                aria-label="Render scale"
              >
                <option value="1.5">Standard</option>
                <option value="2">High</option>
                <option value="2.5">Very high</option>
              </select>
            </label>
          </div>
        </div>

        <RichTextEditor
          valueHtml={html}
          onChangeHtml={setHtml}
          editorRef={editorRef}
          placeholder="Format your text, then export a clean PDF. Runs locally in your browser."
        />

        <div className="mt-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 shadow-sm hover:ring-sky-200 hover:bg-sky-50 transition select-none">
                <IconUpload />
                <span>Upload (.txt, .pdf, .docx, .html)</span>
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

              <ChipButton ariaLabel="Clear" title="Clear" onClick={clearAll} disabled={!hasContent}>
                <IconTrash />
                <span>Clear</span>
              </ChipButton>

              <ChipButton ariaLabel="Download text file" title="Download TXT" onClick={downloadTxt} disabled={!hasContent}>
                <IconDownload />
                <span>Download TXT</span>
              </ChipButton>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <ChipButton
                ariaLabel="Download PDF"
                title="Download PDF"
                onClick={downloadPdf}
                disabled={!hasContent}
                variant="primary"
              >
                <IconDownload />
                <span>Download PDF</span>
              </ChipButton>

              <ChipButton ariaLabel="Copy text" title="Copy (plain text)" onClick={copyPlain} disabled={!hasContent}>
                <IconCopy />
                <span>{copied ? "Copied" : "Copy"}</span>
              </ChipButton>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Note: This editor aims to keep obvious structure (headings, lists, tables) but complex layouts may need manual cleanup before exporting.
          </p>
        </div>
      </div>

      <div className="fixed left-[-99999px] top-0 opacity-0 pointer-events-none">
        <div
          ref={printRef}
          className={`${paperWidthClass} bg-white text-slate-900 [&_h1]:text-[32px] [&_h2]:text-[26px] [&_h3]:text-[22px] [&_h4]:text-[18px] [&_h5]:text-[16px] [&_h1]:font-extrabold [&_h2]:font-bold [&_h3]:font-bold [&_h4]:font-semibold [&_h5]:font-semibold`}
          style={{
            padding: `0pt`,
            fontFamily: FONT_FAMILY_MAP[baseFontFamily] ?? FONT_FAMILY_MAP.system,
            fontSize: "16px",
            lineHeight: "1.4",
            color: baseTextColor,
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }} />
        </div>
      </div>
    </div>
  );
}
