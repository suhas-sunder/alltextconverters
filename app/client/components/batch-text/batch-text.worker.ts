import { convertBatchFile } from "./batch-text";
import type { BatchMessage, BatchRequest } from "./batch-text";

function send(message: BatchMessage) {
  self.postMessage(message);
}

self.addEventListener("message", async (event: MessageEvent<Extract<BatchRequest, { kind: "convert" }>>) => {
  try {
    const request = event.data;
    for (const item of request.files) {
      send({ kind: "result", id: item.id, result: await convertBatchFile(item, request.operation) });
    }
    send({ kind: "done" });
  } catch {
    send({ kind: "error" });
  }
});
