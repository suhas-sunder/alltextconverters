import { Link } from "react-router";
import { CsvJsonTool } from "../client/components/csv-json/CsvJsonTool";
import type { Route } from "./+types/csv-json-converter";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "CSV to JSON and JSON to CSV Converter | AllTextConverters",
  description: "Convert CSV or TSV tables to JSON objects or arrays. Export JSON records as CSV or TSV with headers and exact numeric text in your browser.",
  pathname: "/csv-json-converter",
  indexable: false,
});

export default function CsvJsonConverterRoute() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold">CSV and JSON Converter</h1>
          <p>Turn a CSV or TSV table into JSON objects or arrays, or export JSON records as a spreadsheet table. Pasted text and files stay in this browser tab.</p>
        </header>
        <CsvJsonTool />
        <section aria-labelledby="csv-json-mapping" className="max-w-3xl space-y-2 text-sm text-slate-700">
          <h2 id="csv-json-mapping" className="text-lg font-semibold text-slate-900">How values are converted</h2>
          <p>With headers enabled, <code>sku,city</code> followed by <code>0012,Montréal</code> becomes <code>{"[{\"sku\": \"0012\", \"city\": \"Montréal\"}]"}</code>. CSV cells stay as strings unless you enable JSON values. Present empty cells become empty strings. Short rows use <code>null</code> for missing cells.</p>
          <p>CSV supports quoted fields and line breaks. Line breaks within a cell are normalized to LF. Blank or missing object keys get generated column names. Repeated headers get a numeric suffix, with existing names reserved.</p>
          <p>JSON export accepts an array of objects or an array of arrays. Object keys become columns in first-seen order. For arrays of arrays, column names come from their positions. The output keeps the source spelling of numbers, writes explicit null as <code>null</code>, and leaves missing and empty strings blank. Nested arrays and objects can stay JSON in one cell.</p>
          <p>For one selected column, use <Link className="underline" to="/csv-to-list/">CSV to List</Link>. For one JSON object per line, use the workspace on <Link className="underline" to="/json-array-to-list/">JSON Array to List</Link>.</p>
        </section>
      </div>
    </main>
  );
}
