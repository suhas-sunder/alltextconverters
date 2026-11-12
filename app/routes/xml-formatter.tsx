import { Link } from "react-router";
import { XmlFormatterTool } from "../client/components/xml-formatter/XmlFormatterTool";
import type { Route } from "./+types/xml-formatter";
import { createPageMeta } from "./_shared/metadata";
import { WorkedExample } from "./_shared/WorkedExample";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "XML Formatter and Validator | AllTextConverters",
  description: "Format, compact, or validate XML 1.0 in your browser. Protect mixed content and xml:space, and copy or download the complete UTF-8 result.",
  pathname: "/xml-formatter",
  indexable: false,
});

export default function XmlFormatterRoute() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold">XML Formatter</h1>
          <p>Paste XML or import a local UTF-8 file. Format attributes, compact markup, or check whether the document is well-formed. Your source stays in your browser.</p>
        </header>
        <XmlFormatterTool />
        <section aria-labelledby="xml-format-rules" className="max-w-3xl space-y-3 text-sm text-slate-700">
          <h2 id="xml-format-rules" className="text-lg font-semibold text-slate-900">How whitespace is handled</h2>
          <p>Default formatting adjusts spacing inside markup and around the root. Character data inside the root stays as supplied. For a data file such as a catalog, turn on reindentation to lay out child elements on separate lines or remove their inter-element padding in compact mode.</p>
          <p>Elements containing mixed text, character references, or CDATA are left verbatim, as are <code>xml:space="preserve"</code> sections and their descendants. Namespace declarations, comments, and ordinary processing instructions stay in the document.</p>
        <WorkedExample title="Reindent a catalog while preserving the label text"
          inputLabel="Source XML" input={"<catalog  owner = \"team\"><item  id = \"01\"/><label>Pack <b>spare</b> parts.</label></catalog>"}
          outputLabel="Formatted XML" output={"<catalog owner=\"team\">\n  <item id=\"01\"/>\n  <label>Pack <b>spare</b> parts.</label>\n</catalog>\n"} />
          <p>For this example, turn on Reindent element-only content, select two spaces, and choose Format XML. The catalog rows move onto separate lines. The spaces around <code>&lt;b&gt;spare&lt;/b&gt;</code> stay in the label.</p>
          <p>Validation checks XML 1.0 well-formedness. DTDs, entity declarations, stylesheet instructions, and XInclude are disabled. External schemas and URLs are never fetched.</p>
          <p>To extract the readable values instead, use <Link className="underline" to="/xml-to-text/">XML to Text</Link>. To wrap plain text in XML elements, use <Link className="underline" to="/text-to-xml/">Text to XML</Link>.</p>
        </section>
      </div>
    </main>
  );
}
