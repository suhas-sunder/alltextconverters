import { useCallback, useEffect, useRef, useState } from "react";
import { chooseExtension, fileBase64Limits, isKnownMedia, knownMedia, safeFileStem } from "../../text/file-base64-model";
import type { Base64Alphabet, Base64Format, FileBase64Message, FileBase64Request, FileBase64Result, FileExtension, KnownMedia } from "../../text/file-base64-model";

const buttonBase = "rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:opacity-50 aria-disabled:opacity-50";
const button = buttonBase + " border-slate-300 bg-white hover:bg-slate-100";
const primary = buttonBase + " border-sky-700 bg-sky-700 text-white hover:bg-sky-800";
const field = "mt-1 block max-w-full rounded-lg border border-slate-300 bg-white p-2 text-sm";
const mediaTypes = Object.keys(knownMedia) as KnownMedia[];

export function FileBase64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [format, setFormat] = useState<Base64Format>("standard");
  const [media, setMedia] = useState<KnownMedia | "file">("file");
  const [alphabet, setAlphabet] = useState<Base64Alphabet>("standard");
  const [source, setSource] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const [result, setResult] = useState<FileBase64Result | null>(null);
  const [name, setName] = useState("decoded-file");
  const [extension, setExtension] = useState<FileExtension | "declared">("bin");
  const [busy, setBusy] = useState(false);
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const active = useRef<{ worker: Worker; timer: number } | null>(null);
  const revision = useRef(0);

  const stopWorker = useCallback(() => {
    if (!active.current) return;
    window.clearTimeout(active.current.timer);
    active.current.worker.terminate();
    active.current = null;
  }, []);

  useEffect(() => stopWorker, [stopWorker]);

  function clearResult() {
    revision.current += 1;
    stopWorker();
    setResult(null);
    setBusy(false);
    setPercent(0);
    setStatus("");
    setError("");
  }

  function clearInput() {
    clearResult();
    setSource(null);
    setPasted("");
  }

  function chooseFile(file: File) {
    clearInput();
    if (mode === "encode" && file.size > fileBase64Limits.binaryBytes) {
      setError("Choose a binary file up to 12 MiB.");
    } else if (mode === "decode" && file.size > fileBase64Limits.textFileBytes) {
      setError("Choose a Base64 text file up to 17 MiB.");
    } else {
      setSource(file);
      setStatus("File selected. Choose the options and start the conversion.");
    }
  }

  function editPasted(value: string) {
    clearResult();
    if (value.length > fileBase64Limits.pastedCharacters) {
      setError("Paste up to 524,288 characters, or open a Base64 text file for larger input.");
      return;
    }
    setSource(null);
    setPasted(value);
  }

  function start() {
    if (active.current || (mode === "encode" && !source)) return;
    clearResult();
    let request: FileBase64Request;
    if (mode === "encode" && source) {
      const candidate = source.type.toLowerCase();
      request = {
        mode: "encode", file: source, format,
        media: media === "file" ? (isKnownMedia(candidate) ? candidate : "application/octet-stream") : media,
      };
    } else {
      request = { mode: "decode", input: source ?? pasted, alphabet };
    }

    try {
      const worker = new Worker(new URL("../../text/file-base64.worker.ts", import.meta.url), { type: "module" });
      const fail = (message: string) => {
        if (active.current?.worker !== worker) return;
        stopWorker();
        setBusy(false);
        setStatus("");
        setError(message);
      };
      const timer = window.setTimeout(() => fail("Conversion timed out. Try again or choose a smaller file."), fileBase64Limits.timeoutMs);
      active.current = { worker, timer };
      worker.onmessage = (event: MessageEvent<FileBase64Message>) => {
        if (active.current?.worker !== worker) return;
        const message = event.data;
        if (message.kind === "progress") {
          setPercent(message.percent);
        } else if (message.kind === "error") {
          fail(message.error);
        } else {
          stopWorker();
          setBusy(false);
          setResult(message.result);
          setStatus(message.result.mode === "encode" ? "Base64 is ready." : "Decoded file is ready.");
        }
      };
      worker.onerror = (event) => { event.preventDefault(); fail("The conversion worker could not run. Try again."); };
      worker.onmessageerror = () => fail("The browser could not read the conversion result. Try again.");
      setBusy(true);
      setStatus(mode === "encode" ? "Encoding the file…" : "Validating and decoding Base64…");
      worker.postMessage(request);
    } catch {
      stopWorker();
      setBusy(false);
      setStatus("");
      setError("The conversion worker could not start. Try again.");
    }
  }

  const selectedExtension = extension === "declared"
    ? chooseExtension(result?.mode === "decode" ? result.declaredMedia : null)
    : extension;
  const outputName = mode === "encode"
    ? safeFileStem(source?.name ?? "", "encoded-file") + ".base64.txt"
    : safeFileStem(name, "decoded-file") + "." + selectedExtension;

  function download() {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = outputName;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copyEncoded() {
    if (result?.mode !== "encode") return;
    const current = revision.current;
    try {
      if (typeof ClipboardItem === "function" && typeof navigator.clipboard?.write === "function") {
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": result.blob })]);
      } else {
        await navigator.clipboard.writeText(await result.blob.text());
      }
      if (current === revision.current) setStatus("Full Base64 copied.");
    } catch {
      if (current === revision.current) setStatus("Automatic copy was unavailable. Download the Base64 text instead.");
    }
  }

  return (
    <section aria-label="Binary Base64 tool" className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap gap-4">
        <div className="min-w-0">
          <label htmlFor="file-base64-mode" className="block text-sm font-semibold">Convert</label>
          <select id="file-base64-mode" className={field} value={mode} onChange={(event) => {
            clearInput();
            setMode(event.target.value as "encode" | "decode");
          }}>
            <option value="encode">File to Base64</option>
            <option value="decode">Base64 to file</option>
          </select>
        </div>
        {mode === "encode" ? (
          <>
            <div className="min-w-0">
              <label htmlFor="file-base64-format" className="block text-sm font-semibold">Encoding format</label>
              <select id="file-base64-format" className={field} value={format} onChange={(event) => {
                clearResult();
                setFormat(event.target.value as Base64Format);
              }}>
                <option value="standard">Standard Base64</option>
                <option value="url-safe">URL-safe Base64</option>
                <option value="data-uri">Base64 data URI</option>
              </select>
            </div>
            {format === "data-uri" && (
              <div className="min-w-0">
                <label htmlFor="file-base64-media" className="block text-sm font-semibold">Data URI media type</label>
                <select id="file-base64-media" className={field} value={media} onChange={(event) => {
                  clearResult();
                  setMedia(event.target.value as KnownMedia | "file");
                }}>
                  <option value="file">Use recognized file type</option>
                  {mediaTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            )}
          </>
        ) : (
          <div className="min-w-0">
            <label htmlFor="file-base64-alphabet" className="block text-sm font-semibold">Base64 alphabet</label>
            <select id="file-base64-alphabet" className={field} value={alphabet} onChange={(event) => {
              clearResult();
              setAlphabet(event.target.value as Base64Alphabet);
            }}>
              <option value="standard">Standard (+ and /)</option>
              <option value="url-safe">URL-safe (- and _)</option>
            </select>
          </div>
        )}
      </div>

      <div className="space-y-2 rounded-lg border border-dashed border-slate-400 p-3" onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (event.dataTransfer.files.length !== 1) {
            clearResult();
            setError("Drop one local file.");
            return;
          }
          chooseFile(event.dataTransfer.files[0]);
        }}>
        <label htmlFor="file-base64-source" className="block text-sm font-semibold">
          {mode === "encode" ? "Open binary file" : "Open Base64 text file"}
        </label>
        <input type="file" id="file-base64-source" className="block max-w-full rounded border border-slate-300 text-sm file:mr-2 file:border-0 file:bg-slate-100 file:p-2"
          accept={mode === "decode" ? ".txt,.b64,.base64,.datauri" : undefined}
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (file) chooseFile(file);
          }} />
        <p className="text-sm text-slate-600">
          You can also drop one file here. {mode === "encode" ? "Binary files up to 12 MiB." : "Base64 text files up to 17 MiB."}
        </p>
        {source && <p className="text-sm [overflow-wrap:anywhere]">Selected <bdi>{source.name}</bdi> · {source.size.toLocaleString("en-US")} bytes</p>}
      </div>

      {mode === "decode" && (
        <>
          <div>
            <label htmlFor="file-base64-input" className="block text-sm font-semibold">Paste Base64 text or a data URI</label>
            <textarea id="file-base64-input" className="mt-1 block min-h-40 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-base"
              value={pasted} onChange={(event) => editPasted(event.target.value)} spellCheck={false}
              onPaste={(event) => {
                const { selectionStart, selectionEnd } = event.currentTarget;
                if (pasted.length - (selectionEnd - selectionStart) + event.clipboardData.getData("text/plain").length > fileBase64Limits.pastedCharacters) {
                  event.preventDefault();
                  clearResult();
                  setError("Paste up to 524,288 characters, or open a Base64 text file for larger input.");
                }
              }}
              aria-describedby="file-base64-paste-help" />
            <p id="file-base64-paste-help" className="mt-1 text-sm text-slate-600">
              Paste up to 524,288 characters. Pasting text replaces a selected file. An empty value produces a zero-byte file.
            </p>
            <button type="button" className={button + " mt-2"} onClick={() => editPasted("AAECA/7/")}>Load decode example</button>
          </div>
          <fieldset className="flex min-w-0 flex-wrap items-end gap-4">
            <legend className="mb-2 text-sm font-semibold">Downloaded file</legend>
            <div className="min-w-0 max-w-full">
              <label htmlFor="file-base64-name" className="block text-sm font-medium">File name without extension</label>
              <input type="text" id="file-base64-name" className={field + " w-full"} value={name} maxLength={180}
                onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="min-w-0 max-w-full">
              <label htmlFor="file-base64-extension" className="block text-sm font-medium">File extension</label>
              <select id="file-base64-extension" className={field} value={extension} onChange={(event) => setExtension(event.target.value as FileExtension | "declared")}>
                <option value="declared">From data URI (or .bin)</option>
                {Object.values(knownMedia).map((value) => <option key={value} value={value}>.{value}</option>)}
              </select>
            </div>
          </fieldset>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" className={primary} onClick={start} aria-disabled={busy || (mode === "encode" && !source)}>
          {mode === "encode" ? "Encode file" : "Decode to file"}
        </button>
        <button type="button" className={button} disabled={!busy} onClick={() => {
          clearResult();
          setStatus("Conversion cancelled.");
        }}>Cancel conversion</button>
        <button type="button" className={button} onClick={clearInput}>Clear</button>
      </div>
      <p role="status" className="text-sm text-slate-700">{status}</p>
      {busy && <progress aria-label="Conversion progress" max={100} value={percent} className="h-2 w-full" />}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      {result && (
        <section aria-labelledby="file-base64-result" className="space-y-3 border-t border-slate-200 pt-4">
          <h2 id="file-base64-result" className="text-lg font-bold">{result.mode === "encode" ? "Base64 result" : "Decoded file"}</h2>
          <p className="text-sm [overflow-wrap:anywhere]">Download as <bdi className="font-semibold">{outputName}</bdi> · {result.blob.size.toLocaleString("en-US")} bytes</p>
          {result.mode === "encode" ? (
            <>
              <p className="text-sm text-slate-600">
                Encoded from {result.byteCount.toLocaleString("en-US")} bytes.
                {result.blob.size > result.preview.length && " Preview shows the first 2,048 characters. Copy and download use the full result."}
              </p>
              <pre aria-label="Base64 preview" tabIndex={0} className="max-h-64 overflow-auto rounded bg-slate-50 p-3 text-sm whitespace-pre-wrap [overflow-wrap:anywhere]">{result.preview || "(Empty Base64 value)"}</pre>
            </>
          ) : result.declaredMedia && (
            <p className="text-sm text-slate-600">Declared data URI type <bdi>{result.declaredMedia}</bdi>. The downloaded bytes use a generic binary content type.</p>
          )}
          <div className="flex flex-wrap gap-3">
            {result.mode === "encode" && <button type="button" className={button} onClick={() => void copyEncoded()}>Copy full Base64</button>}
            <button type="button" className={button} onClick={download}>{result.mode === "encode" ? "Download Base64 text" : "Download decoded file"}</button>
          </div>
        </section>
      )}
    </section>
  );
}
