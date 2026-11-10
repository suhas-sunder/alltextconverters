import { createBatchZip } from "./batch-zip";
import type { BatchMessage, BatchRequest } from "./batch-text";

function send(message: BatchMessage) {
  self.postMessage(message);
}

self.addEventListener("message", async (event: MessageEvent<Extract<BatchRequest, { kind: "zip" }>>) => {
  try {
    send({ kind: "zip", blob: await createBatchZip(event.data.outputs) });
  } catch {
    send({ kind: "error" });
  }
});
