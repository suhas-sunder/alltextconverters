import { finishXml, prepareXml } from "./xml-formatter-engine";
import type { XmlWorkerRequest, XmlWorkerResponse } from "./xml-format-options";

type Prepared = Extract<ReturnType<typeof prepareXml>, { prepared: unknown }>["prepared"];
let pending: Prepared | null = null;
function reply(message: XmlWorkerResponse) { self.postMessage(message); }

self.onmessage = (event: MessageEvent<XmlWorkerRequest>) => {
  const request = event.data;
  if (request.kind === "start") {
    const response = prepareXml(request.source, request.options);
    if ("error" in response) reply({ kind: "result", response });
    else {
      pending = response.prepared;
      reply({ kind: "check", bom: pending.bom, shape: pending.shape });
    }
  } else if (pending) {
    const prepared = pending;
    pending = null;
    reply({ kind: "result", response: finishXml(prepared, request.metadata) });
  }
};
