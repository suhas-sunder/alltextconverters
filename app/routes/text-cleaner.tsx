import { useState } from "react";
import type { Route } from "./+types/text-cleaner";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TextCleanerToolCard } from "../client/components/text-cleaner/TextCleanerToolCard";
import { HowItWorksSection } from "../client/components/text-cleaner/HowItWorksSection";
import { FaqSection } from "../client/components/text-cleaner/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/text-cleaner";
  const title = "Text Cleaner (Clean & Normalize Text) | AllTextConverters";
  const description =
    "Clean up messy text instantly. Trims whitespace, normalizes line endings, collapses repeated spaces, and removes zero-width characters. Runs locally in your browser. Copy or download the result.";

  const image = "https://www.alltextconverters.com/social-preview.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Text Cleaner",
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

export default function TextCleanerRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text Cleaner" />
        </div>
        <TextCleanerToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd
        label="Text Cleaner"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/text-cleaner"
      />
    </main>
  );
}
