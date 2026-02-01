import { useMemo, useState } from "react";
import type { Route } from "./+types/text-to-json";

import { TextToJsonToolCard } from "../client/components/text-to-json/TextToJsonToolCard";
import { HowItWorksSection } from "../client/components/text-to-json/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-json/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text to JSON Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert plain text into JSON in seconds. Turn lines into a JSON array or parse key:value pairs into an object. Copy or download the result.",
  },
  {
    property: "og:title",
    content: "Text to JSON Converter | AllTextConverters",
  },
  {
    property: "og:description",
    content:
      "Best-effort Text to JSON converter that runs locally in your browser. Convert lines to an array or key:value to an object, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-to-json",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text to JSON Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert plain text into JSON with deterministic rules. Copy or download your JSON output.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-to-json",
  },
];

export default function TextToJsonRoute() {
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
          name: "Text to JSON",
          item: "https://www.alltextconverters.com/text-to-json",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <TextToJsonToolCard input={input} setInput={setInput} />
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
