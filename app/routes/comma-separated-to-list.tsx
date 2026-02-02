import { useState } from "react";
import type { Route } from "./+types/comma-separated-to-list";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { CommaSeparatedToListToolCard } from "../client/components/comma-separated-to-list/CommaSeparatedToListToolCard";
import { HowItWorksSection } from "../client/components/comma-separated-to-list/HowItWorksSection";
import { FaqSection } from "../client/components/comma-separated-to-list/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/comma-separated-to-list";
  const title =
    "Comma Separated to List (CSV to Newlines) | AllTextConverters";
  const description =
    "Convert comma-separated values into a clean newline list instantly. Trims whitespace, ignores empty values, preserves order, and runs locally in your browser.";

  const image = "https://www.alltextconverters.com/social-preview.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Comma Separated to List",
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
    { rel: "canonical", href: url },

    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:site_name", content: "AllTextConverters" },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },

    // Indexing / UI
    { name: "robots", content: "index, follow" },
    { name: "theme-color", content: "#1e293b" },

    // Structured data
    { "script:ld+json": jsonLd },
  ];
};


export default function CommaSeparatedToListRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Comma Separated to List" />
        </div>
        <CommaSeparatedToListToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Comma Separated to List" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/comma-separated-to-list" />
    </main>
  );
}