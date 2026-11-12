import { serializeCsv } from "./csv";
import { checkImportedText, MAX_IMPORTED_TEXT_BYTES } from "./document-import";

const ignored = new Set(["script", "style", "template", "img", "svg", "iframe", "object", "video", "audio"]);
const paragraph = /^(?:p|h[1-6]|blockquote)$/;

export function docxHtmlToText(html: string, document: Document): string {
  // The fragment is never mounted, so links, images, and other document content remain inert.
  const template = document.createElement("template");
  template.innerHTML = html;
  function checkLength(length: number) {
    if (length > MAX_IMPORTED_TEXT_BYTES) throw new Error("The extracted text exceeds 2 MiB. Import a smaller section.");
  }
  function children(node: Node, depth: number): string {
    const parts: string[] = [];
    let length = 0;
    for (const child of node.childNodes) {
      const text = walk(child, depth);
      length += text.length;
      checkLength(length);
      parts.push(text);
    }
    return parts.join("");
  }
  function walk(node: Node, depth: number): string {
    if (depth > 128) throw new Error("This DOCX has deeply nested content. Import a simpler copy.");
    if (node.nodeType === 3) return node.nodeValue ?? "";
    if (node.nodeType !== 1) return "";
    const element = node as HTMLElement;
    const tag = element.localName;
    if (ignored.has(tag)) return "";
    if (tag === "br") return "\n";
    if (tag === "table") {
      let length = 0;
      const rows = Array.from((element as HTMLTableElement).rows, (row) => Array.from(row.cells, (cell) => {
        const text = walk(cell, depth + 1).replace(/^\n+|\n+$/g, "");
        length += text.length + 1;
        checkLength(length);
        return text;
      }));
      const text = serializeCsv(rows, { delimiter: "\t", lineEnding: "LF" });
      checkLength(text.length);
      return text ? text + "\n" : "";
    }
    const content = children(element, depth + 1);
    if (tag === "li") return "- " + content.replace(/\n+$/g, "") + "\n";
    if (tag === "ul" || tag === "ol") return content + "\n";
    if (paragraph.test(tag)) return content + "\n\n";
    return content;
  }
  return children(template.content, 0).replace(/^\n+|\n+$/g, "");
}

type Reply = { html: string } | { error: string };

export async function extractDocxText(buffer: ArrayBuffer, signal: AbortSignal): Promise<string> {
  signal.throwIfAborted();
  const html = await new Promise<string>((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./docx-text-import.worker.ts", import.meta.url), { type: "module" });
    } catch {
      reject(new Error("This browser could not start local DOCX extraction."));
      return;
    }
    const finish = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
      worker.terminate();
    };
    const abort = () => { finish(); reject(signal.reason); };
    const timeout = setTimeout(() => {
      finish();
      reject(new Error("DOCX extraction took too long. Try importing a smaller section."));
    }, 20_000);
    signal.addEventListener("abort", abort, { once: true });
    worker.onmessage = (event: MessageEvent<Reply>) => {
      finish();
      if ("error" in event.data) reject(new Error(event.data.error));
      else resolve(event.data.html);
    };
    const fail = () => { finish(); reject(new Error("The browser could not complete DOCX extraction.")); };
    worker.onerror = fail;
    worker.onmessageerror = fail;
    try {
      worker.postMessage(buffer, [buffer]);
    } catch {
      finish();
      reject(new Error("The browser could not start DOCX extraction."));
    }
  });
  signal.throwIfAborted();
  const text = docxHtmlToText(html, document);
  if (!text.trim()) throw new Error("This DOCX has no readable text.");
  return checkImportedText(text);
}
