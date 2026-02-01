import { useMemo, useState } from "react";
import type { Route } from "./+types/remove-duplicate-lines";

import { RemoveDuplicateLinesToolCard } from "../client/components/remove-duplicate-lines/RemoveDuplicateLinesToolCard";
import { HowItWorksSection } from "../client/components/remove-duplicate-lines/HowItWorksSection";
import { FaqSection } from "../client/components/remove-duplicate-lines/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Remove Duplicate Lines | AllTextConverters" },
  {
    name: "description",
    content:
      "Remove repeated lines from text in one click. Paste or upload, choose case-insensitive and order options, then copy or download the unique lines.",
  },
  { property: "og:title", content: "Remove Duplicate Lines | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Deduplicate lines instantly in your browser. Keep original order or sort, toggle case-insensitive matching, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/remove-duplicate-lines",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Remove Duplicate Lines | AllTextConverters",
  },
  {
    name: "twitter:description",
    content:
      "Remove repeated lines quickly. Preserve order, choose case-insensitive matching, then copy or download the result.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/remove-duplicate-lines",
  },
];

export default function RemoveDuplicateLinesRoute() {
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
          name: "Remove Duplicate Lines",
          item: "https://www.alltextconverters.com/remove-duplicate-lines",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <RemoveDuplicateLinesToolCard input={input} setInput={setInput} />
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
