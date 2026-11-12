import { Unzip, UnzipInflate, zipSync } from "fflate";
import mammoth from "mammoth";

const xmlBudget = 16 * 1024 * 1024;
const htmlBudget = 4 * 1024 * 1024;
type Reply = { html: string } | { error: string };

class DocumentLimit extends Error {}

function textParts(buffer: ArrayBuffer): ArrayBuffer {
  // Stream only the parts Mammoth needs and bound the actual inflated bytes before it reads the package.
  const parts: Record<string, Uint8Array> = Object.create(null);
  const names = new Set<string>();
  let total = 0;
  let entries = 0;
  const unzip = new Unzip((file) => {
    if (++entries > 2048) throw new DocumentLimit("This DOCX contains too many archive entries.");
    if (!/\.(xml|rels)$/i.test(file.name)) return;
    if (file.name.startsWith("/") || file.name.includes("\\") || file.name.split("/").includes("..") || names.has(file.name)) {
      throw new Error("Invalid package path");
    }
    names.add(file.name);
    if (file.originalSize && file.originalSize + total > xmlBudget) throw new DocumentLimit("The expanded DOCX text parts exceed 16 MiB.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    file.ondata = (error, data, final) => {
      if (error) throw error;
      total += data.byteLength;
      size += data.byteLength;
      if (total > xmlBudget) throw new DocumentLimit("The expanded DOCX text parts exceed 16 MiB.");
      chunks.push(data);
      if (final) {
        const part = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          part.set(chunk, offset);
          offset += chunk.byteLength;
        }
        parts[file.name] = part;
      }
    };
    file.start();
  });
  unzip.register(UnzipInflate);
  const bytes = new Uint8Array(buffer);
  for (let start = 0; start < bytes.length; start += 4096) {
    const end = Math.min(bytes.length, start + 4096);
    unzip.push(bytes.subarray(start, end), end === bytes.length);
  }
  if (!parts["[Content_Types].xml"] || !parts["_rels/.rels"]) throw new Error("Missing Word package parts");
  const archive = zipSync(parts, { level: 0 });
  return archive.buffer as ArrayBuffer;
}

function send(reply: Reply) {
  self.postMessage(reply);
}

self.addEventListener("message", async (event: MessageEvent<ArrayBuffer>) => {
  try {
    const arrayBuffer = textParts(event.data);
    const result = await mammoth.convertToHtml({ arrayBuffer }, {
      externalFileAccess: false,
      includeEmbeddedStyleMap: false,
      convertImage: mammoth.images.imgElement(async () => ({ src: "" })),
    });
    if (result.value.length > htmlBudget) throw new DocumentLimit("The DOCX output is too large. Import a smaller section.");
    send({ html: result.value });
  } catch (error) {
    send({ error: error instanceof DocumentLimit ? error.message : "This DOCX could not be opened. It may be damaged or protected." });
  }
});
