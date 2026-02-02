import { useState } from "react";
import type { Route } from "./+types/base64-encode";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { Base64EncodeToolCard } from "../client/components/base64-encode/Base64EncodeToolCard";
import { HowItWorksSection } from "../client/components/base64-encode/HowItWorksSection";
import { FaqSection } from "../client/components/base64-encode/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/base64-encode";
  const title = "Base64 Encoder (Encode Text to Base64) | AllTextConverters";
  const description =
    "Encode text to Base64 instantly with full Unicode support. Paste or upload text, encode locally in your browser, then copy or download the result.";

  const image = "https://www.alltextconverters.com/social-preview.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Base64 Encoder",
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

export default function Base64EncodeRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Base64 Encoder" />
        </div>
        <Base64EncodeToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd
        label="Base64 Encoder"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/base64-encode"
      />
    </main>
  );
}
