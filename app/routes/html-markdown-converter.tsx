import { Link } from "react-router";
import type { Route } from "./+types/html-markdown-converter";
import { HtmlMarkdownTool } from "../client/components/html-markdown/HtmlMarkdownTool";
import licenses from "../client/components/html-markdown/licenses.txt?raw";
import { createPageMeta } from "./_shared/metadata";
import { WorkedExample } from "./_shared/WorkedExample";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "HTML and Markdown Converter | AllTextConverters",
  description: "Convert HTML and Markdown in your browser. Preserve headings, links, nested lists, code and simple tables, then copy or download the result.",
  pathname: "/html-markdown-converter",
  indexable: false,
});

export default function HtmlMarkdownConverterRoute() {
  return <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">HTML and Markdown Converter</h1>
        <p>Move content between HTML and Markdown with local conversion, a safe preview and UTF-8 downloads.</p>
      </header>
      <HtmlMarkdownTool />
      <section aria-labelledby="rich-text-format" className="space-y-2 text-sm">
        <h2 id="rich-text-format" className="text-lg font-semibold">What carries over</h2>
        <p>Headings, paragraphs, links, nested lists, code blocks, quotes and simple tables carry over. Split merged cells before converting. Complex layout, CSS, embedded media and forms are reduced or removed. HTML typed directly into Markdown is displayed as text.</p>
        <WorkedExample title="Convert a table with a literal pipe"
          inputLabel="HTML source" input={"<h2>Dispatch</h2>\n<table><tr><th>Item</th><th>Status</th></tr><tr><td>Kit | Spare</td><td><strong>Ready</strong></td></tr></table>"}
          outputLabel="Markdown output" output={"## Dispatch\n\n| Item | Status |\n| --- | --- |\n| Kit \\| Spare | **Ready** |"} />
        <p>To reverse the example, paste the Markdown and select Markdown to HTML. The output rebuilds the heading, table cells, and bold text. The backslash keeps the pipe in the item name.</p>
        <p>The preview disables links and loads no external resources. To strip all markup instead, use <Link className="underline" to="/html-to-text/">HTML to Text</Link>. For table-only export, use <Link className="underline" to="/markdown-table-converter/">Markdown Table Converter</Link>.</p>
        <details>
          <summary className="cursor-pointer underline">Open-source licenses</summary>
          <pre className="mt-2 whitespace-pre-wrap wrap-anywhere text-xs">{licenses}</pre>
        </details>
      </section>
    </div>
  </main>;
}
