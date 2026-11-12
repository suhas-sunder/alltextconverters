import { Link } from "react-router";
import type { Route } from "./+types/url-query-builder";
import { createPageMeta } from "./_shared/metadata";
import { UrlQueryTool } from "../client/components/url-query/UrlQueryTool";
import { WorkedExample } from "./_shared/WorkedExample";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "URL Query Parameter Builder and Parser | AllTextConverters",
  description: "Edit, reorder and rebuild URL query parameters. Preserve duplicate keys, blank values and fragments. Copy URLs or export ordered JSON in your browser.",
  pathname: "/url-query-builder",
  indexable: false,
});

export default function UrlQueryBuilderRoute() {
  return <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">URL Query Parameter Builder</h1>
        <p>Parse a full URL or a query string into editable rows. Reorder repeated keys and export the result locally.</p>
      </header>
      <UrlQueryTool />
      <section aria-labelledby="query-format" className="space-y-2 text-sm">
        <h2 id="query-format" className="text-lg font-semibold">How query encoding works</h2>
        <p>Enter a literal plus as <code>%2B</code>. A key without an equals sign loads as an empty value and exports with <code>=</code> in a rebuilt query. Input and total parameter data each support up to 64 KiB, with at most 250 rows.</p>
        <WorkedExample title="Keep repeated tags in ordered JSON"
          inputLabel="Query string" input={"tag=red&tag=blue&label=A+B&flag"}
          outputLabel="Ordered JSON pairs" output={"[\n  {\n    \"key\": \"tag\",\n    \"value\": \"red\"\n  },\n  {\n    \"key\": \"tag\",\n    \"value\": \"blue\"\n  },\n  {\n    \"key\": \"label\",\n    \"value\": \"A B\"\n  },\n  {\n    \"key\": \"flag\",\n    \"value\": \"\"\n  }\n]"} />
        <p>Choose Query string, load the parameters, select Ordered JSON pairs, then build the output. Each tag keeps its own entry, <code>+</code> becomes a space, and <code>flag</code> has an empty value. Download output saves the array as a JSON file.</p>
        <p>Full URL output preserves the base spelling and fragment. Query-only output omits the question mark and fragment. The tool never opens the URL. For a single value, use <Link to="/url-encode/" className="underline">URL Encode</Link>.</p>
      </section>
    </div>
  </main>;
}
