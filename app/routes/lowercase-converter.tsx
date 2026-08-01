import { AdSlot } from "../client/components/advertising/AdSlot";
import { useState } from "react";
import type { Route } from "./+types/lowercase-converter";
import { LowercaseConverterToolCard } from "../client/components/lowercase-converter/LowercaseConverterToolCard";
import { CaseCounterInfoSections } from "../client/components/converter/CaseCounterInfoSections";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/lowercase-converter";
  const title =
    "Lowercase Converter (Convert Text to Lowercase) | AllTextConverters";
  const description =
    "Convert text to lowercase instantly. Paste or upload text, transform everything to lowercase, and copy or download the result. Runs locally in your browser.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lowercase Converter",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    url,
    description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return [
    { title },
    { name: "description", content: description },

    // Canonical (NO trailing slash)

    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "AllTextConverters" },

    // Twitter
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },

    // Indexing / UI
    { name: "robots", content: "index, follow" },
    { name: "theme-color", content: "#1e293b" },

    // Structured data
    { "script:ld+json": jsonLd },
  ];
};

export default function LowercaseConverterRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Lowercase Converter" />
        </div>
        <LowercaseConverterToolCard input={input} setInput={setInput} />
        <AdSlot placement="below-utility" />
        <CaseCounterInfoSections kind="lowercase" />
        <AdSlot placement="info-square" className="mx-auto" />
      </section>
      <BreadcrumbListJsonLd
        label="Lowercase Converter"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/lowercase-converter"
      />
    </main>
  );
}
