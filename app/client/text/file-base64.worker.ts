import { convertFileBase64 } from "./file-base64-engine";
import type { FileBase64Message, FileBase64Request } from "./file-base64-model";

function send(message: FileBase64Message) {
  self.postMessage(message);
}

self.addEventListener("message", async (event: MessageEvent<FileBase64Request>) => {
  try {
    let last = 0;
    const result = await convertFileBase64(event.data, (percent) => {
      if (percent > last) {
        last = percent;
        send({ kind: "progress", percent });
      }
    });
    send({ kind: "result", result });
  } catch (error) {
    send({ kind: "error", error: error instanceof Error ? error.message : "The file could not be converted." });
  }
});
