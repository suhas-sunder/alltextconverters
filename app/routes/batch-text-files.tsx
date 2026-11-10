import { BatchTextTool } from "../client/components/batch-text/BatchTextTool";
import type { Route } from "./+types/batch-text-files";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "Batch Text File Converter | AllTextConverters",
  description: "Normalize, trim, clean, or deduplicate multiple UTF-8 text files locally, with individual downloads or a ZIP.",
  pathname: "/batch-text-files",
  indexable: false,
});

export default function BatchTextFilesRoute() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Batch Text File Converter</h1>
          <p className="max-w-2xl text-slate-700">
            Apply one transformation to multiple text files in your browser. Review each result, then download individual files or a ZIP of the ready outputs.
          </p>
          <p className="max-w-2xl text-sm text-slate-600">
            Files stay in this tab. Downloads use new names, so your original files remain available.
          </p>
        </header>
        <BatchTextTool />
      </div>
    </main>
  );
}
