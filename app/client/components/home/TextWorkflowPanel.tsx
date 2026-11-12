import { useEffect, useRef, useState } from "react";
import {
  WORKFLOW_MAX_BYTES,
  WORKFLOW_MAX_STEPS,
  advancedWorkflowPresets,
  workflowPresets,
  workflowSteps,
  type WorkflowResult,
  type WorkflowStepId,
} from "../../text/text-workflow";

type Step = { key: number; operation: WorkflowStepId };

const buttonClass = "min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600 disabled:opacity-50";
const fieldClass = "w-full min-w-0 rounded-lg border border-slate-300 bg-white p-3 text-base text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600";

export function TextWorkflowPanel({ initialSource, homepageText }: { initialSource: string; homepageText: string }) {
  const [source, setSource] = useState(initialSource);
  const [steps, setSteps] = useState<Step[]>([]);
  const [history, setHistory] = useState<Step[][]>([]);
  const [operation, setOperation] = useState<WorkflowStepId>("normalize-lines");
  const [advancedRecipe, setAdvancedRecipe] = useState(0);
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const nextKey = useRef(0);
  const copyVersion = useRef(0);
  const worker = useRef<Worker | null>(null);
  const stepPicker = useRef<HTMLSelectElement>(null);
  const selectedStep = workflowSteps[operation];

  useEffect(() => () => worker.current?.terminate(), []);

  function stopPreview() {
    worker.current?.terminate();
    worker.current = null;
    setRunning(false);
  }

  function invalidate() {
    stopPreview();
    copyVersion.current += 1;
    setOutput(null);
    setNotice("");
    setError("");
  }

  function changeSource(value: string) {
    invalidate();
    setSource(value);
  }

  function changeSteps(next: Step[]) {
    invalidate();
    setHistory((prior) => [...prior.slice(-11), steps]);
    setSteps(next);
  }

  function makeStep(id: WorkflowStepId): Step {
    return { key: nextKey.current++, operation: id };
  }

  function moveStep(index: number, destination: number) {
    const next = [...steps];
    [next[index], next[destination]] = [next[destination], next[index]];
    changeSteps(next);
  }

  function undoStepChange() {
    const previous = history.at(-1);
    if (!previous) return;
    invalidate();
    setSteps(previous);
    setHistory((prior) => prior.slice(0, -1));
  }

  function preview() {
    invalidate();
    if (source.length > WORKFLOW_MAX_BYTES) {
      setError("Workflow source exceeds the 256 KiB UTF-8 limit.");
      return;
    }

    try {
      const current = new Worker(new URL("./textWorkflow.worker.ts", import.meta.url), { type: "module" });
      worker.current = current;
      setRunning(true);
      current.onmessage = (event: MessageEvent<WorkflowResult>) => {
        if (worker.current !== current) return;
        stopPreview();
        if (!event.data.ok) {
          setError(event.data.error);
          return;
        }
        setOutput(event.data.output);
        setNotice("Preview ready. The source text is unchanged.");
      };
      current.onerror = (event) => {
        if (worker.current !== current) return;
        event.preventDefault();
        stopPreview();
        setError("The preview worker could not run. Try previewing again.");
      };
      current.postMessage({ source, steps: steps.map((step) => step.operation) });
    } catch {
      stopPreview();
      setError("The preview worker could not start in this browser.");
    }
  }

  async function copyResult() {
    if (output === null) return;
    const version = ++copyVersion.current;
    setError("");
    try {
      await navigator.clipboard.writeText(output);
      if (copyVersion.current === version) setNotice("Result copied.");
    } catch {
      if (copyVersion.current === version) setError("Copy failed. Select the result and copy it manually.");
    }
  }

  function downloadResult() {
    if (output === null) return;
    let url: string | undefined;
    const link = document.createElement("a");
    try {
      url = URL.createObjectURL(new Blob([output], { type: "text/plain;charset=utf-8" }));
      link.href = url;
      link.download = "alltextconverters-workflow.txt";
      document.body.append(link);
      link.click();
      setNotice("TXT download started.");
      setError("");
    } catch {
      setError("Could not start the TXT download.");
    } finally {
      link.remove();
      if (url !== undefined) {
        const downloadUrl = url;
        window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }
    }
  }

  function restoreOriginal() {
    copyVersion.current += 1;
    setOutput(source);
    setError("");
    setNotice("The result was restored to the original source.");
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-slate-700">Build an ordered recipe, preview the result, then copy it or download a TXT file. This workspace runs locally and leaves the homepage editor unchanged. Limits are 12 steps and 256 KiB of UTF-8 text.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={() => changeSource(homepageText)}>Use current homepage text</button>
        {workflowPresets.map((preset) => (
          <button type="button" key={preset.label} className={buttonClass} onClick={() => changeSteps(preset.steps.map(makeStep))}>
            {preset.label}
          </button>
        ))}
      </div>

      <details className="rounded-lg border border-slate-200 p-3">
        <summary className="cursor-pointer rounded py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-sky-700">More cleanup recipes</summary>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <label className="block text-sm font-semibold" htmlFor="advanced-workflow-recipe">Advanced recipe</label>
            <select id="advanced-workflow-recipe" className={fieldClass} value={advancedRecipe} onChange={event => setAdvancedRecipe(Number(event.target.value))}>
              {advancedWorkflowPresets.map((preset, index) => <option key={preset.label} value={index}>{preset.label}</option>)}
            </select>
          </div>
          <button type="button" className={buttonClass} onClick={() => {
            const preset = advancedWorkflowPresets[advancedRecipe];
            changeSteps(preset.steps.map(makeStep));
            setNotice(preset.label + " loaded. Preview the workflow to check the result.");
          }}>Load recipe</button>
        </div>
      </details>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="workflow-source" className="block text-sm font-semibold">Workflow source</label>
          <textarea id="workflow-source" className={fieldClass + " mt-1 min-h-36 font-mono"} value={source} onChange={(event) => changeSource(event.target.value)} />
        </div>
        <div className="min-w-0">
          <label htmlFor="workflow-result" className="block text-sm font-semibold">Workflow result</label>
          <textarea id="workflow-result" className={fieldClass + " mt-1 min-h-36 bg-slate-50 font-mono"} value={output ?? ""} readOnly placeholder="Preview the steps to see the result here." />
        </div>
      </div>

      <fieldset className="min-w-0 space-y-3">
        <legend className="font-semibold">Workflow steps</legend>
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1 text-sm font-medium">
            Choose a step
            <select ref={stepPicker} className={fieldClass + " mt-1"} value={operation}
              aria-describedby={"detail" in selectedStep ? "workflow-step-description" : undefined}
              onChange={(event) => setOperation(event.target.value as WorkflowStepId)}>
              {Object.entries(workflowSteps).map(([id, step]) => <option key={id} value={id}>{step.label}</option>)}
            </select>
          </label>
          <button type="button" className={buttonClass} disabled={steps.length >= WORKFLOW_MAX_STEPS} onClick={() => changeSteps([...steps, makeStep(operation)])}>Add step</button>
        </div>
        {"detail" in selectedStep && <p id="workflow-step-description" className="text-sm text-slate-700">{selectedStep.detail}</p>}
        {steps.length === 0 ? <p className="text-sm text-slate-600">Add a step or choose a recipe above.</p> : (
          <ol className="ml-5 list-decimal space-y-2">
            {steps.map((step, index) => (
              <li key={step.key} className="rounded-lg border border-slate-200 px-2 py-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="break-words text-sm font-medium">{workflowSteps[step.operation].label}</span>
                  <div className="flex flex-wrap gap-1">
                    <button type="button" className={buttonClass} aria-label={"Move step " + (index + 1) + " up"} disabled={index === 0} onClick={() => moveStep(index, index - 1)}>Move up</button>
                    <button type="button" className={buttonClass} aria-label={"Move step " + (index + 1) + " down"} disabled={index === steps.length - 1} onClick={() => moveStep(index, index + 1)}>Move down</button>
                    <button type="button" className={buttonClass} aria-label={"Remove step " + (index + 1)} onClick={() => {
                      stepPicker.current?.focus();
                      changeSteps(steps.filter((entry) => entry.key !== step.key));
                    }}>Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass + " border-sky-700 font-semibold text-sky-800"} disabled={running || steps.length === 0} onClick={preview}>Preview workflow</button>
        {running && <button type="button" className={buttonClass} onClick={() => {
          stopPreview();
          setNotice("Preview canceled.");
        }}>Cancel preview</button>}
        <button type="button" className={buttonClass} disabled={!history.length} onClick={undoStepChange}>Undo step change</button>
        <button type="button" className={buttonClass} disabled={output === null || output === source} onClick={restoreOriginal}>Restore original</button>
        <button type="button" className={buttonClass} disabled={output === null} onClick={() => void copyResult()}>Copy result</button>
        <button type="button" className={buttonClass} disabled={output === null} onClick={downloadResult}>Download result TXT</button>
      </div>
      <p role="status" className="min-h-5 text-sm text-slate-700">{running ? "Running workflow…" : notice}</p>
      {error && <p role="alert" className="text-sm font-medium text-red-800">{error}</p>}
    </div>
  );
}
