import { compareText } from "./text-diff-engine";
import type { DiffRequest } from "./text-diff-model";

self.addEventListener("message", (event: MessageEvent<DiffRequest>) => {
  self.postMessage(compareText(event.data));
});
