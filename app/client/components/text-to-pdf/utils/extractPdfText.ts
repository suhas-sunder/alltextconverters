type PdfJsTextItem = {
  str?: string;
  transform?: number[];
  fontName?: string;
};

type PdfJsStyles = Record<
  string,
  {
    fontFamily?: string;
    ascent?: number;
    descent?: number;
    fontWeight?: string | number;
  }
>;

/**
 * Best-effort PDF text extraction with rough line reconstruction.
 * This is still imperfect, but aims to keep:
 * - line breaks
 * - simple emphasis (bold-ish fonts) when pdfjs exposes it
 * - approximate font size (based on transform scale) to help headings stand out
 */
export function extractPdfHtmlWithLineBreaks(
  items: PdfJsTextItem[],
  styles?: PdfJsStyles,
): string {
  const rows: {
    y: number;
    parts: { x: number; html: string; raw: string }[];
  }[] = [];
  const yTol = 2.5;

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  for (const it of items) {
    const raw = String(it?.str ?? "");
    const trimmed = raw.trimEnd();
    if (!trimmed) continue;

    const t = it?.transform ?? [];
    const x = typeof t[4] === "number" ? t[4] : 0;
    const y = typeof t[5] === "number" ? t[5] : 0;

    // Approx font size in px-ish units. Not exact, but helps.
    const a = typeof t[0] === "number" ? Math.abs(t[0]) : 0;
    const d = typeof t[3] === "number" ? Math.abs(t[3]) : 0;
    const size = Math.max(a, d, 0);

    const fontName = String((it as any)?.fontName ?? "");
    const style = styles?.[fontName];
    const family = style?.fontFamily ? String(style.fontFamily) : "";
    const weightHint = String(style?.fontWeight ?? "");

    const looksBold =
      /bold/i.test(fontName) ||
      /bold/i.test(weightHint) ||
      /black/i.test(fontName);

    const safeText = escape(trimmed);

    const css: string[] = [];
    if (family) css.push(`font-family:${family}`);
    if (size >= 10 && size <= 40) css.push(`font-size:${Math.round(size)}px`);
    if (looksBold) css.push("font-weight:700");

    const html =
      css.length > 0 ? `<span style="${css.join(";")}">${safeText}</span>` : safeText;

    let row = rows.find((r) => Math.abs(r.y - y) <= yTol);
    if (!row) {
      row = { y, parts: [] };
      rows.push(row);
    }
    row.parts.push({ x, html, raw: trimmed });
  }

  rows.sort((a, b) => b.y - a.y);

  const lines: string[] = [];
  for (const row of rows) {
    row.parts.sort((a, b) => a.x - b.x);

    // Join parts with spaces, but avoid doubling spaces.
    let lineHtml = "";
    for (let i = 0; i < row.parts.length; i++) {
      const part = row.parts[i];
      const prev = row.parts[i - 1];
      if (i === 0) lineHtml += part.html;
      else {
        // add a space if previous didn't end with a space and current doesn't start with one
        lineHtml += " " + part.html;
      }
    }

    // Clean up extra whitespace that comes from PDF positioning
    lineHtml = lineHtml.replace(/\s{2,}/g, " ").trim();
    if (lineHtml) lines.push(lineHtml);
  }

  // Convert lines into <div> blocks, preserving blank lines.
  const out: string[] = [];
  let blank = 0;
  for (const ln of lines) {
    if (!ln.trim()) {
      blank++;
      continue;
    }
    if (blank >= 2) out.push("<br/><br/>");
    else if (blank === 1) out.push("<br/>");
    blank = 0;
    out.push(`<div>${ln}</div>`);
  }

  return out.join("").trim();
}
