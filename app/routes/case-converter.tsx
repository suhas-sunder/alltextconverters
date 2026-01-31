import { useMemo, useState } from "react";
import type { Route } from "./+types/case-converter";
import { CaseConverterToolCard } from "../client/components/case-converter/CaseConverterToolCard";
import { HowItWorksSection } from "../client/components/case-converter/HowItWorksSection";
import { FaqSection } from "../client/components/case-converter/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Case Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text to uppercase, lowercase, title case, sentence case, or alternating case instantly. Paste your text, pick a style, and copy the result.",
  },
  { property: "og:title", content: "Case Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Instant case conversion in your browser. Uppercase, lowercase, title case, sentence case, and alternating case.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://www.alltextconverters.com/case-converter" },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Case Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert text case instantly: uppercase, lowercase, title case, sentence case, alternating case.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  { rel: "canonical", href: "https://www.alltextconverters.com/case-converter" },
];

export default function CaseConverterRoute() {
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
          name: "Case Converter",
          item: "https://www.alltextconverters.com/case-converter",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <CaseConverterToolCard input={input} setInput={setInput} />
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
