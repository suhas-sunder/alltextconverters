import { Link } from "react-router";
import type { Route } from "./+types/byte-counter";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { ByteCounterToolCard } from "../client/components/byte-counter/ByteCounterToolCard";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";
import { CaseCounterInfoSections } from "../client/components/converter/CaseCounterInfoSections";
export const meta: Route.MetaFunction = () => createPageMeta({ title: "UTF-8 Byte Counter | AllTextConverters", description: "Count UTF-8 bytes, grapheme clusters, Unicode code points, and UTF-16 code units locally in your browser.", pathname: "/byte-counter" });
export default function ByteCounterRoute() {
  return <main className="min-h-screen bg-slate-100 text-slate-900">
    <section className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-7 sm:px-6">
      <BreadcrumbRow label="Byte Counter" />
      <ByteCounterToolCard />
      <p className="rounded-xl border border-slate-200 bg-white p-4">
        To locate hidden characters and see their byte offsets, use the{" "}
        <Link className="font-semibold text-sky-800 underline" to="/unicode-inspector/">Unicode Inspector</Link>.
      </p>
      <AdSlot placement="below-utility" />
      <CaseCounterInfoSections kind="bytes" />
      <AdSlot placement="info-square" className="mx-auto" />
    </section>
    <BreadcrumbListJsonLd label="Byte Counter" pathname="/byte-counter" />
  </main>;
}
