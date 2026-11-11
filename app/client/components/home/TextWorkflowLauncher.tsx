import { useState } from "react";

type Panel = typeof import("./TextWorkflowPanel").TextWorkflowPanel;
type LoadState = { status: "idle" | "loading" | "error" } | { status: "ready"; Panel: Panel; initialSource: string };

export function TextWorkflowLauncher({ input }: { input: string }) {
  const [state, setState] = useState<LoadState>({ status: "idle" });

  async function loadWorkflow() {
    setState({ status: "loading" });
    try {
      const { TextWorkflowPanel } = await import("./TextWorkflowPanel");
      setState({ status: "ready", Panel: TextWorkflowPanel, initialSource: input });
    } catch {
      setState({ status: "error" });
    }
  }

  return (
    <details
      className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 text-slate-900 sm:p-6"
      onToggle={(event) => {
        if (event.currentTarget.open && state.status === "idle") void loadWorkflow();
      }}
    >
      <summary className="cursor-pointer font-semibold text-slate-900">Multi-step text workflow</summary>
      {state.status === "loading" && <p className="mt-3" role="status">Loading the workflow editor…</p>}
      {state.status === "error" && (
        <div className="mt-3">
          <p role="alert">The workflow editor could not load.</p>
          <button type="button" onClick={() => void loadWorkflow()} className="mt-2 rounded-md border px-3 py-2">Try again</button>
        </div>
      )}
      {state.status === "ready" && <state.Panel initialSource={state.initialSource} homepageText={input} />}
    </details>
  );
}
