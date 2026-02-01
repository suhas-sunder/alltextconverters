import { useMemo, useState } from "react";
import type { Route } from "./+types/sentence-case-converter";

import { SentenceCaseConverterToolCard } from "../client/components/sentence-case-converter/SentenceCaseConverterToolCard";
import { HowItWorksSection } from "../client/components/sentence-case-converter/HowItWorksSection";
import { FaqSection } from "../client/components/sentence-case-converter/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Sentence Case Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text to sentence case using simple rules. Capitalize the first letter of each sentence after . ! ? Paste or upload text, then copy or download the result.",
  },
  {
    property: "og:title",
    content: "Sentence Case Converter | AllTextConverters",
  },
  {
    property: "og:description",
    content:
      "Convert text to sentence case in your browser. Capitalize after . ! ? with deterministic rules, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/sentence-case-converter",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Sentence Case Converter | AllTextConverters",
  },
  {
    name: "twitter:description",
    content:
      "Capitalize the first letter of each sentence after . ! ? Copy or download the result.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/sentence-case-converter",
  },
];

export default function SentenceCaseConverterRoute() {
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
          name: "Sentence Case Converter",
          item: "https://www.alltextconverters.com/sentence-case-converter",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <SentenceCaseConverterToolCard input={input} setInput={setInput} />
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
