import { useState } from "react";
import type { Route } from "./+types/comma-to-json-array";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { CommaToJsonArrayToolCard } from "../client/components/comma-to-json-array/CommaToJsonArrayToolCard";
import { HowItWorksSection } from "../client/components/comma-to-json-array/HowItWorksSection";
import { FaqSection } from "../client/components/comma-to-json-array/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/comma-to-json-array";
  const title =
    "Comma to JSON Array Converter (CSV to JSON) | AllTextConverters";
  const description =
    "Convert comma-separated values into a valid JSON array instantly. Trims whitespace, drops empty entries, preserves order, and runs locally in your browser.";

  const image = "https://www.alltextconverters.com/social-preview.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Comma to JSON Array Converter",
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


export default function CommaToJsonArrayRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Comma to JSON Array" />
        </div>
        <CommaToJsonArrayToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Comma to JSON Array" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/comma-to-json-array" />
    </main>
  );
}