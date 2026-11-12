import { Link } from "react-router";
import { CompareTwoListsTool } from "../client/components/compare-two-lists/CompareTwoListsTool";
import type { Route } from "./+types/compare-two-lists";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "Compare Two Lists | AllTextConverters",
  description: "Compare two lists of IDs or other text values. Find items only in either list, items in both, and the union. Count duplicates and copy or export each result.",
  pathname: "/compare-two-lists",
  indexable: false,
});

export default function CompareTwoListsRoute() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold">Compare Two Lists</h1>
          <p>Paste two lists of IDs, domains, or spreadsheet values, or import local UTF-8 text files. Compare them in your browser and export each result as text.</p>
        </header>
        <CompareTwoListsTool />
        <section aria-labelledby="compare-list-rules" className="max-w-3xl space-y-3 text-sm text-slate-700">
          <h2 id="compare-list-rules" className="text-lg font-semibold text-slate-900">How matches and repeats are counted</h2>
          <p>If List A has three copies of SKU-12 and List B has one, set mode reports one in Common and one in Union. Multiset mode reports one in Common, two in Only A, and three in Union.</p>
          <p>By default, matching preserves case, whitespace, empty lines, and Unicode forms. An empty editor contains zero entries. A final line break ends the last entry. Ignore letter case compares lowercase forms. Trimming and ignoring empty entries are separate options.</p>
          <p>Exports keep the original spelling and whitespace of each selected entry and use LF line endings. Source order starts with List A for matches and appends unmatched entries from List B in the union. Sorted output compares keys in Unicode UTF-16 order.</p>
          <p>Need a single list with duplicates removed? Use <Link className="underline" to="/remove-duplicate-lines/">Remove Duplicate Lines</Link>. To extract a column first, use <Link className="underline" to="/table-to-list/">Table to List</Link>.</p>
        </section>
      </div>
    </main>
  );
}
