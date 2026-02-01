import { useMemo, useState } from "react";
import type { Route } from "./+types/text-case-checker";

import { TextCaseCheckerToolCard } from "../client/components/text-case-checker/TextCaseCheckerToolCard";
import { HowItWorksSection } from "../client/components/text-case-checker/HowItWorksSection";
import { FaqSection } from "../client/components/text-case-checker/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text Case Checker | AllTextConverters" },
  {
    name: "description",
    content:
      "Check what casing style your text uses. Paste or upload text to detect uppercase, lowercase, mixed case, title-like case, or sentence-like case. Runs locally in your browser.",
  },
  { property: "og:title", content: "Text Case Checker | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Detect and label casing style for your text: uppercase, lowercase, mixed, title-like, or sentence-like. Paste or upload text and copy the report.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-case-checker",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text Case Checker | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Detect whether text is uppercase, lowercase, mixed, title-like, or sentence-like. Runs locally in your browser.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-case-checker",
  },
];

export default function TextCaseCheckerRoute() {
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
          name: "Text Case Checker",
          item: "https://www.alltextconverters.com/text-case-checker",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <TextCaseCheckerToolCard input={input} setInput={setInput} />
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
