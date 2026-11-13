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
        <table className="w-full max-w-lg border-collapse text-left">
          <caption className="pb-2 text-left font-semibold">Offsets for <code>{"A💡e\u0301"}</code></caption>
          <thead>
            <tr className="border-b border-slate-300">
              <th scope="col" className="p-2">Code point</th>
              <th scope="col" className="p-2">UTF-8 offset</th>
              <th scope="col" className="p-2">UTF-16 offset</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["U+0041", 0, 0],
              ["U+1F4A1", 1, 1],
              ["U+0065", 5, 3],
              ["U+0301", 6, 4],
            ].map(([code, utf8, utf16]) => (
              <tr key={code} className="border-b border-slate-200">
                <th scope="row" className="p-2 font-mono font-normal">{code}</th>
                <td className="p-2">{utf8}</td>
                <td className="p-2">{utf16}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Offsets start at zero. The bulb uses four UTF-8 bytes and two UTF-16 code units. The final two code points form one displayed character. The full JSON Lines download includes both offsets for every code point.</p>
        <p>Use byte offsets for UTF-8 file positions and UTF-16 offsets for JavaScript string positions. For totals alone, use the <Link className="underline" to="/byte-counter/">Byte Counter</Link>.</p>
      </section>
    </div>
  </main>;
}
