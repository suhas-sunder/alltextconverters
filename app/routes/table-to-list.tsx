import { AdSlot } from "../client/components/advertising/AdSlot";
import { useState } from "react";
import type { Route } from "./+types/table-to-list";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TableToListToolCard } from "../client/components/table-to-list/TableToListToolCard";
import { HowItWorksSection } from "../client/components/table-to-list/HowItWorksSection";
import { FaqSection } from "../client/components/table-to-list/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/table-to-list";
  const title = "Table to List Converter (Extract Column) | AllTextConverters";
  const description =
    "Extract a clean list from a table instantly. Paste an HTML table, CSV, or TSV, choose a column, preserve order, and run everything locally in your browser. Copy or download the result.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Table to List Converter",
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

export default function TableToListRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Table to List" />
        </div>
        <TableToListToolCard input={input} setInput={setInput} />
        <AdSlot placement="below-utility" />
        <HowItWorksSection />
        <AdSlot placement="info-square" className="mx-auto" />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd
        label="Table to List"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/table-to-list"
      />
    </main>
  );
}
