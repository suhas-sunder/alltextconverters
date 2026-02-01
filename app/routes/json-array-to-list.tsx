import { useMemo, useState } from "react";
import type { Route } from "./+types/json-array-to-list";

import { JsonArrayToListToolCard } from "../client/components/json-array-to-list/JsonArrayToListToolCard";
import { HowItWorksSection } from "../client/components/json-array-to-list/HowItWorksSection";
import { FaqSection } from "../client/components/json-array-to-list/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "JSON Array to List | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert a JSON array into a clean line-by-line list. Paste or upload JSON, extract values, then copy or download the result.",
  },
  { property: "og:title", content: "JSON Array to List | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Turn a JSON array into a readable list in your browser. Extract values only, then copy or download the result.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/json-array-to-list",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "JSON Array to List | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert a JSON array to a clean list. Extract values, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/json-array-to-list",
  },
];

export default function JsonArrayToListRoute() {
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
          name: "JSON Array to List",
          item: "https://www.alltextconverters.com/json-array-to-list",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <JsonArrayToListToolCard input={input} setInput={setInput} />
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
