import { useMemo, useState } from "react";
import type { Route } from "./+types/word-counter";
import { WordCounterToolCard } from "../client/components/word-counter/WordCounterToolCard";
import { FaqSection } from "../client/components/word-counter/FaqSection";
import { HowItWorksSection } from "../client/components/word-counter/HowItWorksSection";

export const meta: Route.MetaFunction = () => [
  { title: "Word Counter | AllTextConverters" },
  {
    name: "description",
    content:
      "Count words, characters (with and without spaces), and lines instantly. Fast, free, and privacy-first. Runs locally in your browser.",
  },
  { property: "og:title", content: "Word Counter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Count words, characters, and lines instantly. Everything runs locally for privacy.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://www.alltextconverters.com/word-counter" },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Word Counter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Count words, characters, and lines instantly. Fast, free, and private.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  { rel: "canonical", href: "https://www.alltextconverters.com/word-counter" },
];

export default function WordCounterRoute() {
  const [input, setInput] = useState("");

  const breadcrumbSchema = useMemo(
    () => ({
      "@context": "https://www.schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.alltextconverters.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Word Counter",
          item: "https://www.alltextconverters.com/word-counter",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        {/* Tool */}
        <WordCounterToolCard input={input} setInput={setInput} />
        {/* How it works (SEO-rich) */}
        <HowItWorksSection />

        {/* FAQ (includes FAQ JSON-LD) */}
        <FaqSection />
      </section>

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </main>
  );
}
