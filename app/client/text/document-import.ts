export const DOCUMENT_IMPORT_ACCEPT = ".txt,.md,.csv,.tsv,.json,.html,.xml,.log,.pdf,.docx";
export const DOCUMENT_IMPORT_HELP = "Files stay in this browser. PDF and DOCX up to 10 MiB. UTF-8 text and extracted text up to 2 MiB. PDFs need selectable text.";
export const MAX_IMPORTED_TEXT_BYTES = 2 * 1024 * 1024;
const maxDocumentBytes = 10 * 1024 * 1024;

type Progress = (message: string) => void;

function readFile(file: File, signal: AbortSignal): Promise<ArrayBuffer>;
function readFile(file: File, signal: AbortSignal, asText: true): Promise<string>;
function readFile(file: File, signal: AbortSignal, asText = false): Promise<ArrayBuffer | string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const abort = () => reader.abort();
    reader.onloadend = () => signal.removeEventListener("abort", abort);
    reader.onload = () => resolve(reader.result as ArrayBuffer | string);
    reader.onerror = () => reject(new Error("This file could not be read in your browser."));
    reader.onabort = () => reject(signal.reason);
    signal.addEventListener("abort", abort, { once: true });
    try {
      if (asText) reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    } catch {
      signal.removeEventListener("abort", abort);
      reject(new Error("This file could not be read in your browser."));
    }
  });
}

export function checkImportedText(text: string): string {
  if (text.length > MAX_IMPORTED_TEXT_BYTES || new TextEncoder().encode(text).byteLength > MAX_IMPORTED_TEXT_BYTES) {
    throw new Error("The extracted text exceeds 2 MiB. Import a smaller section.");
  }
  return text;
}

export async function importTextFile(file: File, signal: AbortSignal, progress: Progress, keepNativeTextReading = false): Promise<string> {
  signal.throwIfAborted();
  const extension = file.name.toLowerCase().split(".").pop();
  const pdf = extension === "pdf";
  const docx = extension === "docx";
  const document = pdf || docx;
  if (!document && keepNativeTextReading) return readFile(file, signal, true);
  if (!file.size) throw new Error("This file is empty.");
  if (file.size > (document ? maxDocumentBytes : MAX_IMPORTED_TEXT_BYTES)) {
    throw new Error(document ? "Choose a PDF or DOCX file no larger than 10 MiB." : "Choose a UTF-8 text file no larger than 2 MiB.");
  }
  const bytes = await readFile(file, signal);
  signal.throwIfAborted();
  if (pdf) {
    const header = new TextDecoder().decode(bytes.slice(0, 1024));
    if (!header.includes("%PDF-")) throw new Error("This file is not a valid PDF.");
    progress("Opening PDF.");
    const { extractPdfText } = await import("./pdf-text-import");
    return extractPdfText(bytes, signal, progress);
  }
  if (docx) {
    const signature = new Uint8Array(bytes, 0, Math.min(4, bytes.byteLength));
    if (signature[0] !== 0x50 || signature[1] !== 0x4b || signature[2] !== 3 || signature[3] !== 4) {
      throw new Error("This file is not a readable DOCX. Open it in Word and save a new DOCX copy.");
    }
    progress("Extracting DOCX text.");
    const { extractDocxText } = await import("./docx-text-import");
    return extractDocxText(bytes, signal);
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("This file is not valid UTF-8. Save it as UTF-8 and try again.");
  }
}
