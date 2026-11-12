import { Link } from "react-router";
import { FileBase64Tool } from "../client/components/file-base64/FileBase64Tool";
import type { Route } from "./+types/file-base64-converter";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "File to Base64 and Base64 to File Converter | AllTextConverters",
  description: "Encode a local binary file as Base64 or decode Base64 and data URIs to downloadable bytes. Supports standard and URL-safe Base64.",
  pathname: "/file-base64-converter",
  indexable: false,
});

export default function FileBase64ConverterRoute() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold">File to Base64 and Base64 to File</h1>
          <p>Encode a local image, PDF, archive, or other binary file as text. Decode Base64 back to the original bytes. Files, names, and text stay in this tab.</p>
        </header>
        <FileBase64Tool />
        <section aria-labelledby="file-base64-guide" className="max-w-3xl space-y-2 text-sm text-slate-700">
          <h2 id="file-base64-guide" className="text-lg font-semibold text-slate-900">Choose a format</h2>
          <p>Standard Base64 uses padding. URL-safe output uses hyphens and underscores and omits padding. The decoder accepts either canonical padding or omitted padding for the chosen alphabet.</p>
          <p>Data URIs use standard Base64. Paste the literal payload with its <code>;base64,</code> header. Simple media types and unquoted parameters are accepted. This tool reads local files and pasted values.</p>
          <p>The example <code>AAECA/7/</code> decodes to six bytes. Decoded files are limited to 12 MiB and offered as downloads. The extension names the file without verifying its content.</p>
          <p>Encoding words or a sentence? Use the <Link className="underline" to="/base64-encode/">UTF-8 Base64 Encoder</Link>.</p>
        </section>
      </div>
    </main>
  );
}
