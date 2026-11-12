import { Link } from "react-router";
import jsdiffLicense from "../../docs/licenses/jsdiff.txt?raw";
import { TextDiffTool } from "../client/components/text-diff/TextDiffTool";
import type { Route } from "./+types/text-diff";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "Text Diff Checker | AllTextConverters",
  description: "Compare two versions of text line by line. Review additions, removals, whitespace, and line endings, then copy or download a change report.",
  pathname: "/text-diff",
  indexable: false,
});

export default function TextDiffRoute() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold">Text Diff Checker</h1>
          <p>Compare two drafts, contract clauses, or code snippets. Paste each version or open a UTF-8 file. The comparison runs in this tab, with no upload or saved history.</p>
        </header>
        <TextDiffTool />
        <section aria-labelledby="text-diff-guide" className="max-w-3xl space-y-2 text-sm text-slate-700">
          <h2 id="text-diff-guide" className="text-lg font-semibold text-slate-900">Read the comparison</h2>
          <p>The example shows a supplier changing the payment term from 30 days to 45 days, then changing the invoice delivery method. Use Next change to review the second edit.</p>
          <p>Spaces, tabs, letter case, Unicode forms, LF, CRLF, CR, and a missing final newline can all produce differences. Open each file for exact line endings. Native paste can change line endings before this page receives the text.</p>
          <p>The report lists removed and added lines with their line numbers and endings. Large change groups have a paged preview. Very different inputs can reach the edit or time limit. You can compare smaller sections when that happens.</p>
          <p>To normalize spacing or line endings before comparing, use <Link className="underline" to="/text-cleaner/">Text Cleaner</Link>.</p>
          <details className="text-xs text-slate-600">
            <summary className="cursor-pointer">jsdiff license</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">{jsdiffLicense}</pre>
          </details>
        </section>
      </div>
    </main>
  );
}
