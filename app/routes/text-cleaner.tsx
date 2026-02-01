import { useMemo, useState } from "react";
import type { Route } from "./+types/text-cleaner";

import { TextCleanerToolCard } from "../client/components/text-cleaner/TextCleanerToolCard";
import { HowItWorksSection } from "../client/components/text-cleaner/HowItWorksSection";
import { FaqSection } from "../client/components/text-cleaner/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text Cleaner | AllTextConverters" },
  {
    name: "description",
    content:
      "Clean up messy text in one click. Trim whitespace, normalize line endings, collapse repeated spaces, and remove zero-width characters. Paste or upload, then copy or download.",
  },
  { property: "og:title", content: "Text Cleaner | AllTextConverters" },
  {
    property: "og:description",
    content:
      "One-click text cleanup in your browser. Trim whitespace, normalize line endings, collapse spaces, and remove zero-width characters. Copy or download the result.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-cleaner",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text Cleaner | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Clean text in one click. Trim, normalize line endings, collapse spaces, and remove zero-width characters.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-cleaner",
  },
];

export default function TextCleanerRoute() {
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
          name: "Text Cleaner",
          item: "https://www.alltextconverters.com/text-cleaner",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <TextCleanerToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </main>
  );
}
