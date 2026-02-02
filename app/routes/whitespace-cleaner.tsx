import { useState } from "react";
import type { Route } from "./+types/whitespace-cleaner";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { WhitespaceCleanerToolCard } from "../client/components/whitespace-cleaner/WhitespaceCleanerToolCard";
import { HowItWorksSection } from "../client/components/whitespace-cleaner/HowItWorksSection";
import { FaqSection } from "../client/components/whitespace-cleaner/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/whitespace-cleaner";
  const title =
    "Whitespace Cleaner (Remove Hidden Characters) | AllTextConverters";
  const description =
    "Remove hidden whitespace and invisible Unicode characters instantly. Cleans tabs, non-breaking spaces, and zero-width characters. Runs locally in your browser. Copy or download the result.";

  const image = "https://www.alltextconverters.com/social-preview.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Whitespace Cleaner",
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

export default function WhitespaceCleanerRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Whitespace Cleaner" />
        </div>
        <WhitespaceCleanerToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd
        label="Whitespace Cleaner"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/whitespace-cleaner"
      />
    </main>
  );
}
