import { AdSlot } from "../client/components/advertising/AdSlot";
import { useState } from "react";
import type { Route } from "./+types/hex-to-text";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { HexToTextToolCard } from "../client/components/hex-to-text/components/HexToTextToolCard";
import { HowItWorksSection } from "../client/components/hex-to-text/components/HowItWorksSection";
import { FaqSection } from "../client/components/hex-to-text/components/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/hex-to-text";
  const title =
    "Hex to Text Decoder (Hexadecimal to ASCII) | AllTextConverters";
  const description =
    "Decode hexadecimal (hex) into readable ASCII text instantly. Space-tolerant input, validation for invalid hex, and local processing that runs in your browser.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Hex to Text Decoder",
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

export default function HexToTextRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Hex to Text" />
        </div>
        <HexToTextToolCard input={input} setInput={setInput} />
        <AdSlot placement="below-utility" />
        <HowItWorksSection />
        <AdSlot placement="info-square" className="mx-auto" />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd
        label="Hex to Text"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/hex-to-text"
      />
    </main>
  );
}
