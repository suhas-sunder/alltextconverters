import { getTextMetrics } from "../../text/metrics";

self.addEventListener("message", (event: MessageEvent<string>) => {
  self.postMessage(getTextMetrics(event.data));
});
