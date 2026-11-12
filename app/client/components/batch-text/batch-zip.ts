import { zipSync } from "fflate";
import type { BatchOutput } from "./batch-text";

export async function createBatchZip(outputs: readonly BatchOutput[]): Promise<Blob> {
  const entries = await Promise.all(outputs.map(async ({ name, blob }) => [
    name, new Uint8Array(await blob.arrayBuffer()),
  ] as const));
  // Stored ZIP keeps archive creation bounded by the batch size and file count.
  const archive = zipSync(Object.fromEntries(entries), { level: 0 });
  return new Blob([archive], { type: "application/zip" });
}
