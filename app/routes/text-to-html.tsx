import { useState } from "react";
import type { Route } from "./+types/text-to-html";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TextToHtmlToolCard } from "../client/components/text-to-html/TextToHtmlToolCard";
import { HowItWorksSection } from "../client/components/text-to-html/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-html/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/text-to-html";
  const title =
    "Text to HTML Converter (Generate Clean HTML) | AllTextConverters";
  const description =
    "Convert plain text into clean, safe HTML instantly. Applies predictable rules, preserves line breaks, and runs locally in your browser. Copy or download the HTML output.";

  const image = "https://www.alltextconverters.com/social-preview.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Text to HTML Converter",
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

export default function TextToHtmlRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to HTML" />
        </div>
        <TextToHtmlToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd
        label="Text to HTML"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/text-to-html"
      />
    </main>
  );
}
