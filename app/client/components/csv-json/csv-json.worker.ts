import { convertCsvJson, type CsvJsonRequest, type CsvJsonResult } from "../../text/csv-json";

self.addEventListener("message", (event: MessageEvent<CsvJsonRequest>) => {
  let result: CsvJsonResult;
  try {
    result = convertCsvJson(event.data);
  } catch {
    result = { ok: false, error: "Could not convert this table." };
  }
  self.postMessage(result);
});
