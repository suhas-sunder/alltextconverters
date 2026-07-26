import { AdSlot } from "../client/components/advertising/AdSlot";
import { useState } from "react";
import type { Route } from "./+types/text-to-bulleted-text-list";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TextToBulletedTextListToolCard } from "../client/components/text-to-bulleted-text-list/TextToBulletedTextListToolCard";
import { HowItWorksSection } from "../client/components/text-to-bulleted-text-list/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-bulleted-text-list/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/text-to-bulleted-text-list";
  const title =
    "Text to Bulleted List (Create Bullet Points) | AllTextConverters";
  const description =
    "Convert text into a bulleted list instantly. Paste line-by-line text or comma-separated items, choose a bullet (•, -, *, or custom), and run everything locally in your browser. Copy or download the result.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Text to Bulleted List",
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

export default function TextToBulletedTextListRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to Bulleted List" />
        </div>
        <TextToBulletedTextListToolCard input={input} setInput={setInput} />
        <AdSlot placement="below-utility" />
        <HowItWorksSection />
        <AdSlot placement="info-square" className="mx-auto" />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd
        label="Text to Bulleted List"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/text-to-bulleted-text-list"
      />
    </main>
  );
}
