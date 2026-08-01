import { AdSlot } from "../client/components/advertising/AdSlot";
import { useState } from "react";
import type { Route } from "./+types/text-to-xml";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

import { TextToXmlToolCard } from "../client/components/text-to-xml/TextToXmlToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";

export const meta: Route.MetaFunction = () => {
  return createPageMeta({ title: "Text to XML Converter | AllTextConverters", description: "Generate validated XML from entire text, lines, or paragraphs with optional declaration, blank records, and numeric indexes.", pathname: "/text-to-xml" });
};

export default function TextToXmlRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to XML" />
        </div>
        <TextToXmlToolCard input={input} setInput={setInput} />
        <AdSlot placement="below-utility" />
        <ConverterInfoSection kind="text-to-xml" />
        <AdSlot placement="info-square" className="mx-auto" />
        <ConverterFaqSection kind="text-to-xml" />
      </section>
      <BreadcrumbListJsonLd
        label="Text to XML"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/text-to-xml"
      />
    </main>
  );
}
