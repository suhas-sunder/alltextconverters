import { useMemo, useState } from "react";
import type { Route } from "./+types/title-case-converter";
import { TitleCaseConverterToolCard } from "../client/components/title-case-converter/TitleCaseConverterToolCard";
import { HowItWorksSection } from "../client/components/title-case-converter/HowItWorksSection";
import { FaqSection } from "../client/components/title-case-converter/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Title Case Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text to title case using simple deterministic rules. Paste or upload text, convert with one click, then copy or export as PDF.",
  },
  { property: "og:title", content: "Title Case Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Fast title case conversion in your browser. Upload TXT/PDF/DOCX, convert with one click, then copy or download as PDF.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/title-case-converter",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Title Case Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Paste or upload text, convert to Title Case with one click, then copy or export as PDF.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/title-case-converter",
  },
];

export default function TitleCaseConverterRoute() {
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
          name: "Title Case Converter",
          item: "https://www.alltextconverters.com/title-case-converter",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <TitleCaseConverterToolCard input={input} setInput={setInput} />
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
