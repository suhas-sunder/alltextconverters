import { useMemo, useState } from "react";
import type { Route } from "./+types/json-to-text";

import { JsonToTextToolCard } from "../client/components/json-to-text/JsonToTextToolCard";
import { HowItWorksSection } from "../client/components/json-to-text/HowItWorksSection";
import { FaqSection } from "../client/components/json-to-text/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "JSON to Text | AllTextConverters" },
  {
    name: "description",
    content:
      "Extract readable text from JSON values in one click. Paste or upload JSON, flatten values, then copy or download the result.",
  },
  { property: "og:title", content: "JSON to Text | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Turn JSON into readable text by flattening values only. Runs locally in your browser with optional file uploads.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/json-to-text",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "JSON to Text | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Extract readable text from JSON values. Paste or upload JSON, flatten values, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  { rel: "canonical", href: "https://www.alltextconverters.com/json-to-text" },
];

export default function JsonToTextRoute() {
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
          name: "JSON to Text",
          item: "https://www.alltextconverters.com/json-to-text",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <JsonToTextToolCard input={input} setInput={setInput} />
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
