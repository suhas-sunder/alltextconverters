import { compareTwoLists, type ComparisonRequest, type ComparisonResponse } from "./compare-two-lists";

self.onmessage = (event: MessageEvent<ComparisonRequest>) => {
  let response: ComparisonResponse;
  try {
    response = compareTwoLists(event.data);
  } catch {
    response = { error: "The comparison could not finish. Try again with shorter lists." };
  }
  self.postMessage(response);
};
