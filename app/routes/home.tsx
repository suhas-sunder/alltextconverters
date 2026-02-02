import { useState } from "react";
import type { Route } from "./+types/home";
import { TextToolCard } from "../client/components/home/TextToolCard";
import { AboutSection } from "../client/components/home/AboutSection";
import { SeoContent } from "../client/components/home/SeoContent";
import { FaqSection } from "../client/components/home/FaqSection";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com";
  const title =
    "AllTextConverters – Free Online Text Converter, Formatter & Counters";
  const description =
    "Free online text tools to convert, format, and clean text. Change case, encode or decode Base64, sort lines, and count words or characters. Fast, private, and browser-based.";

  const image = "https://www.alltextconverters.com/social-preview.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AllTextConverters",
    url,
    description,
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

export default function Index() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-6 pt-7 pb-16 space-y-14">
        <TextToolCard input={input} setInput={setInput} />

        <SeoContent />
        <AboutSection />

        <FaqSection />
      </section>
    </main>
  );
}
