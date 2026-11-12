import { inspectUnicode } from "./unicode-inspector";

self.onmessage = (event: MessageEvent<{ source: string; exportRecords: boolean }>) => {
  try {
    const { result, report } = inspectUnicode(event.data.source, event.data.exportRecords);
    const file = event.data.exportRecords ? new Blob(report, { type: "application/x-ndjson;charset=utf-8" }) : undefined;
    self.postMessage({ result, file });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : "Unable to inspect the text." });
  }
};
