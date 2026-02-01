import { useMemo, useState } from "react";
import type { Route } from "./+types/text-to-xml";

import { TextToXmlToolCard } from "../client/components/text-to-xml/TextToXmlToolCard";
import { HowItWorksSection } from "../client/components/text-to-xml/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-xml/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text to XML Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert plain text into simple XML in your browser. Upload or paste text, generate XML with predictable rules, then copy or download the result.",
  },
  { property: "og:title", content: "Text to XML Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Turn plain text into clean XML locally in your browser. Convert, copy, or download your XML output.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-to-xml",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text to XML Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert plain text to simple XML using deterministic rules. Copy or download the result.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-to-xml",
  },
];

export default function TextToXmlRoute() {
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
          name: "Text to XML",
          item: "https://www.alltextconverters.com/text-to-xml",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <TextToXmlToolCard input={input} setInput={setInput} />
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
