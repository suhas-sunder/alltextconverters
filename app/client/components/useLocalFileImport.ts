import { useEffect, useRef, useState } from "react";
import { importTextFile } from "../text/document-import";

export function useLocalFileImport(onLoad: (text: string) => void, keepNativeTextReading = false) {
  const request = useRef<AbortController | null>(null);
  const [reading, setReading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => () => {
    request.current?.abort();
    request.current = null;
  }, []);

  function reset(status = "") {
    request.current?.abort();
    request.current = null;
    setReading(false);
    setStatus(status);
    setError("");
  }

  async function open(file: File) {
    reset("Reading file.");
    const controller = new AbortController();
    request.current = controller;
    setReading(true);
    try {
      const text = await importTextFile(file, controller.signal, (message) => {
        if (request.current === controller) setStatus(message);
      }, keepNativeTextReading);
      if (request.current !== controller) return;
      onLoad(text);
      setStatus("File loaded locally.");
    } catch (cause) {
      if (request.current !== controller) return;
      setStatus("");
      setError(cause instanceof Error ? cause.message : "Could not read the file in this browser.");
    } finally {
      if (request.current === controller) {
        request.current = null;
        setReading(false);
      }
    }
  }

  return { reading, status, error, open, reset, cancel: () => reset("File import canceled.") };
}
