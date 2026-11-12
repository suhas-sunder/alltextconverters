import { formatJson, type JsonFormatRequest, type JsonFormatResponse } from "./json-formatter";

self.onmessage = (event: MessageEvent<JsonFormatRequest>) => {
  let result: JsonFormatResponse;
  try {
    result = formatJson(event.data);
  } catch {
    result = { error: { message: "The JSON operation could not finish. Try again with a smaller document." } };
  }
  self.postMessage(result);
};
