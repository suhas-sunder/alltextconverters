import { useState } from "react";
import type { Route } from "./+types/word-counter";
import { WordCounterToolCard } from "../client/components/word-counter/WordCounterToolCard";
import { FaqSection } from "../client/components/word-counter/FaqSection";
import { HowItWorksSection } from "../client/components/word-counter/HowItWorksSection";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com/word-counter";
  const title = "Word Counter (Words, Characters & Lines) | AllTextConverters";
  const description =
    "Count words, characters (with and without spaces), and lines instantly. Live updates, strict limits, and privacy-first processing that runs locally in your browser.";

  const image = "https://www.alltextconverters.com/social-preview.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Word Counter",
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

export default function WordCounterRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Word Counter" />
        </div>
        {/* Tool */}
        <WordCounterToolCard input={input} setInput={setInput} />
        {/* How it works (SEO-rich) */}
        <HowItWorksSection />

        {/* FAQ (includes FAQ JSON-LD) */}
        <FaqSection />
      </section>

      {/* Breadcrumb JSON-LD */}
      <BreadcrumbListJsonLd
        label="Word Counter"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/word-counter"
      />
    </main>
  );
}
