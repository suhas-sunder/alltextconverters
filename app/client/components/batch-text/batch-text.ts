import { collapseHorizontalWhitespace, normalizeLineEndings } from "../../text/text-core";

export const batchLimits = {
  files: 32,
  fileBytes: 1024 * 1024,
  totalBytes: 16 * 1024 * 1024,
};

export const batchOperations = {
  "normalize-lines": "Normalize line endings to LF",
  "trim-lines": "Trim whitespace at line edges",
  "clean-spaces": "Collapse extra spaces, keeping tabs",
  "deduplicate-lines": "Remove duplicate lines",
} as const;

export type BatchOperation = keyof typeof batchOperations;

export type BatchFile = {
  id: number;
  file: File;
  outputName: string;
  issue: string | null;
};

export type BatchResult =
  | { state: "queued" }
  | { state: "ready"; blob: Blob }
  | { state: "error"; message: string }
  | { state: "cancelled" };

export type BatchOutput = { name: string; blob: Blob };

export type BatchRequest =
  | { kind: "convert"; files: BatchFile[]; operation: BatchOperation }
  | { kind: "zip"; outputs: BatchOutput[] };

export type BatchMessage =
  | { kind: "result"; id: number; result: BatchResult }
  | { kind: "zip"; blob: Blob }
  | { kind: "error" }
  | { kind: "done" };

export function planBatch(files: readonly File[]): BatchFile[] {
  const usedNames = new Set<string>();
  let acceptedBytes = 0;

  return files.slice(0, batchLimits.files).map((file, id) => {
    const rawStem = file.name.replace(/\.txt$/i, "").normalize("NFC");
    const cleanStem = rawStem
      .replace(/[<>:"/\\|?*.\x00-\x1f\x7f-\x9f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "_")
      .trim();
    const stem = Array.from(cleanStem).slice(0, 48).join("") || "text";
    let outputName = stem + "-processed.txt";
    let suffix = 2;
    while (usedNames.has(outputName.toLowerCase())) {
      outputName = stem + "-processed-" + suffix + ".txt";
      suffix += 1;
    }
    usedNames.add(outputName.toLowerCase());

    let issue: string | null = null;
    if (!/\.txt$/i.test(file.name)) {
      issue = "Choose a UTF-8 .txt file.";
    } else if (file.size > batchLimits.fileBytes) {
      issue = "This file exceeds the 1 MiB limit.";
    } else if (acceptedBytes + file.size > batchLimits.totalBytes) {
      issue = "This file would exceed the 16 MiB batch limit.";
    } else {
      acceptedBytes += file.size;
    }
    return { id, file, outputName, issue };
  });
}

function transform(input: string, operation: BatchOperation): string {
  const normalized = normalizeLineEndings(input);
  if (operation === "normalize-lines") return normalized;
  if (operation === "clean-spaces") return collapseHorizontalWhitespace(normalized, true);

  const lines = normalized.split("\n");
  if (operation === "trim-lines") return lines.map((line) => line.trim()).join("\n");

  // Treat the terminal separator as a separator, not an additional empty line.
  const finalNewline = normalized.endsWith("\n");
  if (finalNewline) lines.pop();
  return Array.from(new Set(lines)).join("\n") + (finalNewline ? "\n" : "");
}

export async function convertBatchFile(
  item: BatchFile,
  operation: BatchOperation,
): Promise<BatchResult> {
  if (item.issue) return { state: "error", message: item.issue };

  let bytes: ArrayBuffer;
  try {
    bytes = await item.file.arrayBuffer();
  } catch {
    return { state: "error", message: "Could not read the file. Select it again if retrying does not help." };
  }

  let input: string;
  try {
    input = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { state: "error", message: "Invalid UTF-8. Save the original as UTF-8 and select it again." };
  }
  if (input.includes("\0")) {
    return { state: "error", message: "This file contains NUL characters and cannot be processed as plain text." };
  }

  return {
    state: "ready",
    blob: new Blob([transform(input, operation)], { type: "text/plain;charset=utf-8" }),
  };
}

export function batchOutputs(
  files: readonly BatchFile[],
  results: Readonly<Record<number, BatchResult>>,
): BatchOutput[] {
  return files.flatMap(({ id, outputName }) => {
    const result = results[id];
    return result?.state === "ready" ? [{ name: outputName, blob: result.blob }] : [];
  });
}
