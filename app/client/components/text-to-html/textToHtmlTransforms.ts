type HtmlMode = "paragraphs" | "br" | "pre";

export type TextToHtmlOptions = {
  mode: HtmlMode;
};

/**
 * Convert plain text into a small, predictable HTML snippet.
 *
 * Deterministic rules only:
 * - Escape &, <, >, ", '
 * - Optionally wrap as:
 *   - paragraphs: split on blank lines into <p> blocks, preserve single newlines as <br>
 *   - br: convert every newline to <br>
 *   - pre: wrap in <pre> and preserve whitespace/newlines
 *
 * This is not an HTML sanitizer and does not attempt grammar or language logic.
 */
export function textToHtml(input: string, opts: TextToHtmlOptions): string {
  const raw = String(input ?? "");
  if (!raw) return "";

  const escaped = escapeHtml(raw);

  switch (opts.mode) {
    case "pre":
      return `<pre>${escaped}</pre>`;

    case "br":
      return escaped.replace(/\r\n|\r|\n/g, "<br>\n");

    case "paragraphs":
    default: {
      // Normalize line endings first
      const normalized = escaped.replace(/\r\n|\r/g, "\n");

      // Split on 2+ newlines (blank lines) into paragraph-like chunks
      const chunks = normalized
        .split(/\n{2,}/)
        .map((c) => c.trim())
        .filter(Boolean);

      if (chunks.length === 0) return "";

      const html = chunks
        .map((c) => `<p>${c.replace(/\n/g, "<br>\n")}</p>`)
        .join("\n\n");

      return html;
    }
  }
}

function escapeHtml(s: string): string {
  // Escape important HTML characters. Keep it tiny and predictable.
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
