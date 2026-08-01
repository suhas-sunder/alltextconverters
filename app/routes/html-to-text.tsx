import { AdSlot } from "../client/components/advertising/AdSlot";
import { useState } from "react";
import type { Route } from "./+types/html-to-text";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

import { HtmlToTextToolCard } from "../client/components/html-to-text/HtmlToTextToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";

export const meta: Route.MetaFunction = () => {
  return createPageMeta({ title: "HTML to Text Converter | AllTextConverters", description: "Extract readable text from inert HTML with paragraph, list, table, and safe-link controls. Scripts and remote resources are ignored locally in your browser.", pathname: "/html-to-text" });
};

export default function HtmlToTextRoute() {
  const [htmlInput, setHtmlInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="HTML to Text" />
        </div>
        <HtmlToTextToolCard htmlInput={htmlInput} setHtmlInput={setHtmlInput} />
        <AdSlot placement="below-utility" />
        <ConverterInfoSection kind="html-to-text" />
        <AdSlot placement="info-square" className="mx-auto" />
        <ConverterFaqSection kind="html-to-text" />
      </section>
      <BreadcrumbListJsonLd
        label="HTML to Text"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/html-to-text"
      />
    </main>
  );
}
