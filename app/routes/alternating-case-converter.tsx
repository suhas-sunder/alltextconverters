import { useMemo, useState } from "react";
import type { Route } from "./+types/alternating-case-converter";

import { AlternatingCaseConverterToolCard } from "../client/components/alternating-case-converter/AlternatingCaseConverterToolCard";
import { HowItWorksSection } from "../client/components/alternating-case-converter/HowItWorksSection";
import { FaqSection } from "../client/components/alternating-case-converter/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Alternating Case Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text to alternating case in one click. Paste or upload text, toggle whether spaces affect the pattern, then copy or download as PDF.",
  },
  {
    property: "og:title",
    content: "Alternating Case Converter | AllTextConverters",
  },
  {
    property: "og:description",
    content:
      "Alternating case in your browser. Paste or upload, optionally count spaces in the pattern, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/alternating-case-converter",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Alternating Case Converter | AllTextConverters",
  },
  {
    name: "twitter:description",
    content:
      "Convert text to alternating case with deterministic rules. Copy or download the result.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/alternating-case-converter",
  },
];

export default function AlternatingCaseConverterRoute() {
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
          name: "Alternating Case Converter",
          item: "https://www.alltextconverters.com/alternating-case-converter",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <AlternatingCaseConverterToolCard input={input} setInput={setInput} />
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
