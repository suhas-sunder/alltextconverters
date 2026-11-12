import { Link } from "react-router";
import type { Route } from "./+types/unicode-inspector";
import { UnicodeInspector } from "../client/components/unicode-inspector/UnicodeInspector";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({
  title: "Unicode Inspector and Invisible Character Detector | AllTextConverters",
  description: "Find invisible characters and directional controls. See each Unicode code point, grapheme cluster and UTF-8 byte offset in your browser.",
  pathname: "/unicode-inspector",
  indexable: false,
});

export default function UnicodeInspectorRoute() {
  return <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Unicode Inspector</h1>
        <p>Find hidden characters in up to 32 KiB of UTF-8 text. See code points, grapheme groups and their exact positions. All processing stays in your browser.</p>
      </header>
      <UnicodeInspector />
      <section aria-labelledby="unicode-reading" className="space-y-2 text-sm">
        <h2 id="unicode-reading" className="text-lg font-semibold">Read the inspection</h2>
        <p>A single displayed character may be made from several code points. For example, the precomposed “é” and “e” followed by a combining acute accent often look alike but use different code points and bytes.</p>
        <p>Use byte offsets to find a position in a UTF-8 file. Use UTF-16 offsets for JavaScript string positions. For totals alone, use the <Link className="underline" to="/byte-counter/">Byte Counter</Link>.</p>
      </section>
    </div>
  </main>;
}
