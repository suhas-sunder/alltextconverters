import { runTextWorkflow, type WorkflowResult } from "../../text/text-workflow";

self.addEventListener("message", (event: MessageEvent<{ source: string; steps: string[] }>) => {
  let result: WorkflowResult;
  try {
    result = runTextWorkflow(event.data.source, event.data.steps);
  } catch {
    result = { ok: false, error: "The workflow could not be completed." };
  }
  self.postMessage(result);
});
