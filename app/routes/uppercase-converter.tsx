import { useMemo, useState } from "react";
import type { Route } from "./+types/uppercase-converter";

import { UppercaseConverterToolCard } from "../client/components/uppercase-converter/UppercaseConverterToolCard";
import { HowItWorksSection } from "../client/components/uppercase-converter/HowItWorksSection";
import { FaqSection } from "../client/components/uppercase-converter/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Uppercase Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text to ALL CAPS in one click. Paste or upload text, convert to uppercase, then copy or download the result.",
  },
  { property: "og:title", content: "Uppercase Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Uppercase text instantly in your browser. Paste or upload, convert to ALL CAPS, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/uppercase-converter",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Uppercase Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert text to ALL CAPS in one click. Copy or download the uppercase result.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/uppercase-converter",
  },
];

export default function UppercaseConverterRoute() {
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
          name: "Uppercase Converter",
          item: "https://www.alltextconverters.com/uppercase-converter",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <UppercaseConverterToolCard input={input} setInput={setInput} />
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
