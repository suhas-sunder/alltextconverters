import { AdSlot } from "../client/components/advertising/AdSlot";
import { useState } from "react";
import type { Route } from "./+types/xml-to-text";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

import { XmlToTextToolCard } from "../client/components/xml-to-text/XmlToTextToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";

export const meta: Route.MetaFunction = () => {
  return createPageMeta({ title: "XML to Text Converter | AllTextConverters", description: "Safely extract all XML text, selected elements and one attribute, or element boundaries. DTD and entity declarations are rejected locally.", pathname: "/xml-to-text" });
};

export default function XmlToTextRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="XML to Text" />
        </div>
        <XmlToTextToolCard input={input} setInput={setInput} />
        <AdSlot placement="below-utility" />
        <ConverterInfoSection kind="xml-to-text" />
        <AdSlot placement="info-square" className="mx-auto" />
        <ConverterFaqSection kind="xml-to-text" />
      </section>
      <BreadcrumbListJsonLd
        label="XML to Text"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/xml-to-text"
      />
    </main>
  );
}
