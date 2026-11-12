import { Link } from "react-router";
import type { Route } from "./+types/url-query-builder";
import { createPageMeta } from "./_shared/metadata";
import { UrlQueryTool } from "../client/components/url-query/UrlQueryTool";

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
        <p>For example, <code>tag=red&amp;tag=blue&amp;name=A+B</code> has two tag values and the name “A B.” Enter a literal plus as <code>%2B</code>. A key without an equals sign loads as an empty value and exports with <code>=</code>.</p>
        <p>Full URL output preserves the base spelling and fragment. Query-only output omits the question mark and fragment. The tool never opens the URL. For a single value, use <Link to="/url-encode/" className="underline">URL Encode</Link>.</p>
      </section>
    </div>
  </main>;
}
