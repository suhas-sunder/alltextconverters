import { useEffect, useRef, useState } from "react";
import {
  batchLimits,
  batchOperations,
  batchOutputs,
  planBatch,
} from "./batch-text";
import type { BatchFile, BatchMessage, BatchOperation, BatchRequest, BatchResult } from "./batch-text";

const buttonBase = "min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:opacity-50";
const button = buttonBase + " border-slate-300 bg-white text-slate-900 hover:bg-slate-100";
const primaryButton = buttonBase + " border-sky-700 bg-sky-700 text-white hover:bg-sky-800";

function initialResults(files: BatchFile[]): Record<number, BatchResult> {
  return Object.fromEntries(files.map(({ id, issue }) => [
    id,
    issue ? { state: "error", message: issue } : { state: "queued" },
  ]));
}

function resultLabel(result: BatchResult) {
  switch (result.state) {
    case "queued": return "Waiting";
    case "ready": return "Ready · " + result.blob.size.toLocaleString() + " bytes";
    case "error": return result.message;
    case "cancelled": return "Cancelled";
  }
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BatchTextTool() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [results, setResults] = useState<Record<number, BatchResult>>({});
  const [operation, setOperation] = useState<BatchOperation>("normalize-lines");
  const [activity, setActivity] = useState<BatchRequest["kind"] | null>(null);
  const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null);
  const [archive, setArchive] = useState<Blob | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const active = useRef<{ worker: Worker; request: BatchRequest } | null>(null);

  useEffect(() => () => {
    active.current?.worker.terminate();
    active.current = null;
  }, []);

  function selectFiles(selection: File[]) {
    if (active.current || selection.length === 0) return;
    const planned = planBatch(selection);
    setFiles(planned);
    setResults(initialResults(planned));
    setProgress(null);
    setArchive(null);
    setNotice(planned.length + (planned.length === 1 ? " file selected." : " files selected."));
    setError(selection.length > batchLimits.files ? "Only the first 32 files were added." : "");
  }

  function markUnfinished(request: BatchRequest, result: BatchResult) {
    if (request.kind !== "convert") return;
    setResults((previous) => {
      const updated = { ...previous };
      for (const item of request.files) {
        if (updated[item.id]?.state === "queued") updated[item.id] = result;
      }
      return updated;
    });
  }

  function stopWorker() {
    active.current?.worker.terminate();
    active.current = null;
    setActivity(null);
  }

  function cancel() {
    const current = active.current;
    if (!current) return;
    stopWorker();
    markUnfinished(current.request, { state: "cancelled" });
    setNotice(current.request.kind === "zip"
      ? "ZIP creation cancelled. Individual downloads are still available."
      : "Conversion cancelled. Ready files are still available.");
  }

  function begin(request: BatchRequest) {
    if (active.current) return;
    let worker: Worker;
    try {
      worker = request.kind === "convert"
        ? new Worker(new URL("./batch-text.worker.ts", import.meta.url), { type: "module" })
        : new Worker(new URL("./batch-zip.worker.ts", import.meta.url), { type: "module" });
    } catch {
      setError("Could not start the local file worker. Try again in a browser that supports Web Workers.");
      return;
    }

    active.current = { worker, request };
    setActivity(request.kind);
    setError("");
    setNotice(request.kind === "zip" ? "Preparing ZIP archive." : "Processing selected files.");
    if (request.kind === "convert") {
      setArchive(null);
      setProgress({ processed: 0, total: request.files.length });
      setResults((previous) => ({
        ...previous,
        ...Object.fromEntries(request.files.map(({ id }) => [id, { state: "queued" }])),
      }));
    }

    const handleFailure = () => {
      if (active.current?.worker !== worker) return;
      stopWorker();
      markUnfinished(request, { state: "error", message: "Processing was interrupted. Try again." });
      setNotice("");
      setError("The local worker stopped unexpectedly. Ready files are still available.");
    };
    worker.onerror = (event) => {
      event.preventDefault();
      handleFailure();
    };
    worker.onmessageerror = handleFailure;
    worker.onmessage = ({ data }: MessageEvent<BatchMessage>) => {
      if (active.current?.worker !== worker) return;
      switch (data.kind) {
        case "result":
          setResults((previous) => ({ ...previous, [data.id]: data.result }));
          setProgress((previous) => previous && { ...previous, processed: previous.processed + 1 });
          break;
        case "zip":
          setArchive(data.blob);
          stopWorker();
          setNotice("ZIP archive ready to download.");
          break;
        case "done":
          stopWorker();
          setNotice("Conversion finished. Review the file results.");
          break;
        case "error":
          handleFailure();
          break;
      }
    };
    try {
      worker.postMessage(request);
    } catch {
      handleFailure();
    }
  }

  const outputs = batchOutputs(files, results);
  const unfinished = files.filter((item) => !item.issue && results[item.id]?.state !== "ready");
  const busy = activity !== null;
  const started = progress !== null;

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6" aria-label="Batch conversion">
      <div
        className="rounded-xl border-2 border-dashed border-slate-300 p-3 sm:p-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          selectFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <label className="block font-semibold" htmlFor="batch-text-input">Choose .txt files</label>
        <p id="batch-text-limits" className="mt-1 text-sm text-slate-600">
          Select or drop up to 32 UTF-8 text files, up to 1 MiB each and 16 MiB total. A new selection replaces the current batch.
        </p>
        <input
          id="batch-text-input"
          ref={inputRef}
          type="file"
          accept=".txt,text/plain"
          multiple
          disabled={busy}
          aria-describedby="batch-text-limits"
          className="mt-3 block min-h-11 w-full cursor-pointer text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sky-100 file:px-3 file:py-3 file:font-semibold file:text-sky-900 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed"
          onChange={(event) => {
            selectFiles(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div className="w-full min-w-0 sm:w-auto">
          <label className="block font-semibold" htmlFor="batch-text-operation">Transformation</label>
          <select
            id="batch-text-operation"
            value={operation}
            disabled={busy}
            aria-describedby="batch-text-operation-help"
            className="mt-1 min-h-11 w-full rounded-xl border border-slate-400 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-sky-600"
            onChange={(event) => {
              setOperation(event.currentTarget.value as BatchOperation);
              setResults(initialResults(files));
              setArchive(null);
              setProgress(null);
              setNotice("");
              setError("");
            }}
          >
            {Object.entries(batchOperations).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <button type="button" className={primaryButton} disabled={busy || unfinished.length === 0} onClick={() => begin({ kind: "convert", files: unfinished, operation })}>
          {started ? "Retry unfinished" : "Convert files"}
        </button>
        {busy && <button type="button" className={button} onClick={cancel}>Cancel</button>}
        <button
          type="button"
          className={button}
          disabled={busy || files.length === 0}
          onClick={() => {
            setFiles([]);
            setResults({});
            setProgress(null);
            setArchive(null);
            setError("");
            setNotice("File selection and results cleared.");
            inputRef.current?.focus();
          }}
        >
          Clear files and results
        </button>
      </div>
      <p id="batch-text-operation-help" className="mt-2 text-sm text-slate-600">
        Outputs use UTF-8 and LF line endings. Changing the transformation clears the current results.
      </p>

      <p className="mt-4 text-sm text-slate-700" role="status">{notice}</p>
      {error && <p className="mt-2 text-sm font-medium text-red-800" role="alert">{error}</p>}
      {progress && (
        <div className="mt-3">
          <label htmlFor="batch-text-progress" className="block text-sm font-medium">
            Last run · {progress.processed} of {progress.total} files processed
          </label>
          <progress id="batch-text-progress" className="mt-1 h-3 w-full accent-sky-700" max={progress.total} value={progress.processed} />
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">File results · {outputs.length} ready</h2>
            <button
              type="button"
              className={button}
              disabled={busy || outputs.length === 0}
              onClick={() => archive
                ? downloadBlob(archive, "processed-text-files.zip")
                : begin({ kind: "zip", outputs })}
            >
              {archive ? "Download ZIP" : "Prepare ZIP of ready files"}
            </button>
          </div>
          <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200">
            {files.map((item) => {
              const result = results[item.id] ?? { state: "queued" };
              return (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-semibold"><bdi>{item.file.name}</bdi></p>
                    <p className={result.state === "error" ? "text-sm text-red-800" : "text-sm text-slate-600"}>{resultLabel(result)}</p>
                    {result.state === "ready" && <p className="break-all text-sm text-slate-600"><bdi>{item.outputName}</bdi></p>}
                  </div>
                  {result.state === "ready" && (
                    <button type="button" className={button} onClick={() => downloadBlob(result.blob, item.outputName)} aria-label={"Download " + item.outputName}>
                      Download TXT
                    </button>
                  )}
                  {!item.issue && (result.state === "error" || result.state === "cancelled") && (
                    <button type="button" className={button} disabled={busy} onClick={() => begin({ kind: "convert", files: [item], operation })} aria-label={"Retry " + item.file.name}>
                      Retry file
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
