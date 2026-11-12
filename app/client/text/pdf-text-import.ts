import type { TextContent } from "pdfjs-dist/types/src/display/api";
import { checkImportedText, MAX_IMPORTED_TEXT_BYTES } from "./document-import";

const maxPages = 200;

export async function extractPdfText(buffer: ArrayBuffer, signal: AbortSignal, progress: (message: string) => void): Promise<string> {
  signal.throwIfAborted();
  const [pdfjs, worker] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"),
  ]);
  signal.throwIfAborted();
  // Own the native worker so cancellation can stop it even before PDF.js finishes opening the file.
  let port: Worker;
  try {
    port = new Worker(worker.default, { type: "module" });
  } catch {
    throw new Error("This browser could not start local PDF extraction.");
  }
  const pdfWorker = pdfjs.PDFWorker.create({ port });
  const task = pdfjs.getDocument({
    data: buffer,
    worker: pdfWorker,
    disableRange: true,
    disableStream: true,
    disableAutoFetch: true,
    useWorkerFetch: false,
  });
  let abandoned = false;
  let closed = false;
  const closeWorker = () => {
    if (closed) return;
    closed = true;
    if (!pdfWorker.destroyed) pdfWorker.destroy();
    port.terminate();
  };
  let stop: (reason: unknown) => void = () => {};
  const interruption = new Promise<never>((_, reject) => { stop = reject; });
  const abandon = (reason: unknown) => {
    abandoned = true;
    stop(reason);
    closeWorker();
  };
  const onAbort = () => abandon(signal.reason);
  const onWorkerError = () => abandon(new Error("The browser could not complete PDF extraction."));
  signal.addEventListener("abort", onAbort, { once: true });
  port.addEventListener("error", onWorkerError, { once: true });
  task.onPassword = () => stop(new Error("This PDF is password protected. Open it and save an unlocked copy to import."));
  const timeout = setTimeout(() => {
    abandon(new Error("PDF extraction took too long. Try importing fewer pages."));
  }, 30_000);
  try {
    const pdf = await Promise.race([task.promise.catch(() => { throw new Error("This PDF could not be opened. It may be damaged."); }), interruption]);
    if (pdf.numPages > maxPages) throw new Error("Choose a PDF with 200 pages or fewer.");
    const pages: string[] = [];
    const encoder = new TextEncoder();
    let bytes = 0;
    for (let number = 1; number <= pdf.numPages; number++) {
      signal.throwIfAborted();
      progress("Reading PDF page " + number + " of " + pdf.numPages + ".");
      const page = await Promise.race([
        pdf.getPage(number).catch(() => { throw new Error("Could not read PDF page " + number + "."); }),
        interruption,
      ]);
      const reader = (page.streamTextContent() as ReadableStream<TextContent>).getReader();
      try {
        const parts: string[] = [];
        bytes += number > 1 ? 2 : 0;
        for (;;) {
          const { value, done } = await Promise.race([
            reader.read().catch(() => { throw new Error("Could not extract text from PDF page " + number + "."); }),
            interruption,
          ]);
          if (done) break;
          const text = value.items.map((item) => "str" in item ? item.str + (item.hasEOL ? "\n" : "") : "").join("");
          bytes += encoder.encode(text).byteLength;
          if (bytes > MAX_IMPORTED_TEXT_BYTES) throw new Error("The extracted text exceeds 2 MiB. Import a smaller section.");
          parts.push(text);
        }
        pages.push(parts.join("").trim());
      } finally {
        void reader.cancel().catch(() => {});
        reader.releaseLock();
        if (!abandoned) page.cleanup();
      }
    }
    const text = pages.join("\n\n").trim();
    if (!text) throw new Error("This PDF has no selectable text. Scanned pages require OCR.");
    return checkImportedText(text);
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", onAbort);
    port.removeEventListener("error", onWorkerError);
    const cleanup = task.destroy().catch(() => {});
    if (!abandoned) await cleanup;
    closeWorker();
  }
}
