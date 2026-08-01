export type HtmlMode = "paragraphs" | "br" | "pre" | "unordered-list" | "ordered-list";
export type ParagraphLineMode = "br" | "space" | "preserve";
export type TextToHtmlOptions = { mode: HtmlMode; paragraphLineMode?: ParagraphLineMode; fullDocument?: boolean; title?: string };

export const DEFAULT_TEXT_TO_HTML_OPTIONS: Required<TextToHtmlOptions> = {
  mode: "paragraphs", paragraphLineMode: "br", fullDocument: false, title: "Text document",
};

export const escapeHtml = (text: string) => String(text ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function paragraphContent(paragraph: string, mode: ParagraphLineMode): string {
  const escaped = escapeHtml(paragraph);
  if (mode === "space") return escaped.replace(/\n+/g, " ");
  if (mode === "preserve") return escaped;
  return escaped.replace(/\n/g, "<br>\n");
}

export function textToHtml(input: string, partialOptions: TextToHtmlOptions): string {
  const options = { ...DEFAULT_TEXT_TO_HTML_OPTIONS, ...partialOptions };
  const normalized = String(input ?? "").replace(/\r\n|\r/g, "\n");
  if (!normalized) return "";
  const lines = normalized.split("\n");
  let output: string;
  if (options.mode === "pre") output = `<pre>${escapeHtml(normalized)}</pre>`;
  else if (options.mode === "br") output = escapeHtml(normalized).replace(/\n/g, "<br>\n");
  else if (options.mode === "unordered-list" || options.mode === "ordered-list") {
    const tag = options.mode === "ordered-list" ? "ol" : "ul";
    output = `<${tag}>\n${lines.filter((line) => line.trim()).map((line) => `  <li>${escapeHtml(line)}</li>`).join("\n")}\n</${tag}>`;
  } else {
    output = normalized.split(/\n[\t ]*\n+/).filter(Boolean)
      .map((paragraph) => `<p>${paragraphContent(paragraph, options.paragraphLineMode)}</p>`).join("\n\n");
  }
  if (!options.fullDocument) return output;
  return `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>${escapeHtml(options.title)}</title>\n</head>\n<body>\n${output}\n</body>\n</html>`;
}
