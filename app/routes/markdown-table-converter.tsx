import { Link } from "react-router";
import { MarkdownTableTool } from "../client/components/markdown-table/MarkdownTableTool";
import type { Route } from "./+types/markdown-table-converter";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "Markdown Table to CSV and TSV Converter | AllTextConverters",
  description: "Convert Markdown pipe tables to CSV or TSV and turn delimited data into Markdown. Preview, copy, and download the complete table in your browser.",
  pathname: "/markdown-table-converter",
  indexable: false,
});

export default function MarkdownTableConverterRoute() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold">Markdown Table Converter</h1>
          <p>Convert a Markdown pipe table to CSV or TSV, or turn spreadsheet data into a Markdown table. Your text and files stay in this browser tab.</p>
        </header>
        <MarkdownTableTool />
        <section aria-labelledby="markdown-table-format" className="max-w-3xl space-y-2 text-sm text-slate-700">
          <h2 id="markdown-table-format" className="text-lg font-semibold text-slate-900">How the formats map</h2>
          <p>Paste one Markdown table with its heading and dash row. Escape a literal pipe with a backslash. Markdown emphasis, link syntax, and HTML tags stay as text. Alignment is shown in the preview. CSV and TSV carry cell values without alignment.</p>
          <p>For CSV and TSV, use double quotes around cells that contain a delimiter, quote, or line break. Choose whether the first row is the header. Generated Markdown uses character references to carry tabs, line breaks, and spaces at cell edges through a round trip. Line endings within cells are normalized to LF.</p>
          <p>Working with a single list? Use <Link className="underline" to="/list-to-table/">List to Table</Link> to create a one-column table.</p>
        </section>
      </div>
    </main>
  );
}
