import { Link } from "react-router";
import { JsonFormatterTool } from "../client/components/json-formatter/JsonFormatterTool";
import type { Route } from "./+types/json-formatter";
import { createPageMeta } from "./_shared/metadata";
import { WorkedExample } from "./_shared/WorkedExample";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "JSON Formatter, Minifier and Validator | AllTextConverters",
  description: "Format, minify, and validate JSON in your browser. Inspect its structure, jump to syntax errors, and preserve exact numbers, escapes, and key order.",
  pathname: "/json-formatter",
  indexable: false,
});

export default function JsonFormatterRoute() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold">JSON Formatter</h1>
          <p>Paste JSON or open a local file to format, minify, or check it. Your source stays in your browser. Choose a top-level entry to inspect its value in the editor.</p>
        </header>
        <JsonFormatterTool />
        <section aria-labelledby="json-format-rules" className="max-w-3xl space-y-3 text-sm text-slate-700">
          <h2 id="json-format-rules" className="text-lg font-semibold text-slate-900">What formatting changes</h2>
          <p>Format adds indentation and a final line break. Minify removes spacing outside strings. Numbers, string escapes, and key order stay as written.</p>
        <WorkedExample title="Format JSON with two-space indentation"
          inputLabel="Source JSON" input={"{\"id\":900719925474099312345,\"label\":\"\\u00E9\",\"flags\":[true,null]}"}
          outputLabel="Formatted JSON" output={"{\n  \"id\": 900719925474099312345,\n  \"label\": \"\\u00E9\",\n  \"flags\": [\n    true,\n    null\n  ]\n}\n"} />
          <p>Validation identifies the first syntax error by line and column. JSON requires double-quoted keys and excludes comments and trailing commas. Repeated keys are valid syntax and can give different results in other readers.</p>
          <p>To pull out values, use <Link className="underline" to="/json-to-text/">JSON to Text</Link>. To put each array entry on its own line, open the JSON Lines workspace in <Link className="underline" to="/json-array-to-list/">JSON Array to List</Link>.</p>
        </section>
      </div>
    </main>
  );
}
