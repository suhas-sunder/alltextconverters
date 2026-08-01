import { AdSlot } from "../client/components/advertising/AdSlot";
import { useState } from "react";
import type { Route } from "./+types/text-to-html";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

import { TextToHtmlToolCard } from "../client/components/text-to-html/TextToHtmlToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";

export const meta: Route.MetaFunction = () => {
  return createPageMeta({ title: "Text to HTML Converter | AllTextConverters", description: "Convert escaped plain text to HTML paragraphs, line breaks, preformatted text, lists, or a complete HTML document in your browser.", pathname: "/text-to-html" });
};

export default function TextToHtmlRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to HTML" />
        </div>
        <TextToHtmlToolCard input={input} setInput={setInput} />
        <AdSlot placement="below-utility" />
        <ConverterInfoSection kind="text-to-html" />
        <AdSlot placement="info-square" className="mx-auto" />
        <ConverterFaqSection kind="text-to-html" />
      </section>
      <BreadcrumbListJsonLd
        label="Text to HTML"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/text-to-html"
      />
    </main>
  );
}
