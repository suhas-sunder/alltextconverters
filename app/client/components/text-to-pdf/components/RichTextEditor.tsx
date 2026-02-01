import { useEffect, useRef, useState, type MutableRefObject, type ClipboardEvent } from "react";
import { sanitizeRichHtml } from "../utils/sanitizeRichHtml";

type RichTextEditorProps = {
  valueHtml: string;
  onChangeHtml: (next: string) => void;
  placeholder?: string;
  editorRef?: MutableRefObject<HTMLDivElement | null>;
};

function isEffectivelyEmpty(html: string) {
  const t = html
    .replace(/<br\s*\/?\s*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, "")
    .trim();
  return t.length === 0;
}

export function RichTextEditor({
  valueHtml,
  onChangeHtml,
  placeholder = "Paste or type here…",
  editorRef,
}: RichTextEditorProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const ref = editorRef ?? innerRef;

  const [isFocused, setIsFocused] = useState(false);

  // Only push valueHtml into the DOM when it was changed programmatically
  // (upload/clear). Never rewrite the DOM during normal typing, otherwise:
  // - undo/redo breaks
  // - selections collapse
  // - list/heading commands misbehave
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isFocused) return;
    if (el.innerHTML !== valueHtml) el.innerHTML = valueHtml || "";
  }, [ref, valueHtml, isFocused]);
  }, [placeholder]);

  const syncToState = () => {
    const el = ref.current;
    if (!el) return;
    onChangeHtml(el.innerHTML);
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    // Replace paste with a sanitized insert so lists/links/headings survive.
    e.preventDefault();

    const el = ref.current;
    if (!el) return;

    const dt = e.clipboardData;
    const html = dt.getData("text/html");
    const text = dt.getData("text/plain");

    let toInsert = "";
    if (html && html.trim()) {
      toInsert = sanitizeRichHtml(html);
    } else {
      // Plain text: preserve line breaks without introducing random indents.
      const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      toInsert = escaped.replace(/\r\n|\r|\n/g, "<br/>");
    }

    // Insert HTML at caret.
    document.execCommand("insertHTML", false, toInsert);
    syncToState();
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        contentEditable
        spellCheck
        data-placeholder={placeholder}
        onInput={syncToState}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          // Final cleanup on blur only (keeps editing fast + preserves undo stack)
          const el = ref.current;
          if (!el) return;
          const cleaned = sanitizeRichHtml(el.innerHTML);
          if (cleaned !== el.innerHTML) el.innerHTML = cleaned;
          onChangeHtml(cleaned);
        }}
        className="mt-2 relative h-72 sm:h-80 w-full overflow-auto rounded-xl border border-slate-200 bg-slate-50 px-4 pt-3 pb-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300 empty:before:content-[attr(data-placeholder)] before:absolute before:left-4 before:top-3 before:text-slate-400 before:pointer-events-none before:whitespace-pre-wrap [&_p]:my-2 [&_div]:my-1 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-1 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_a]:text-sky-700 [&_a]:underline"
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        aria-label="Rich text editor"
      />
    </div>
  );
}
