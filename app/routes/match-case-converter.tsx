import { useMemo, useState } from "react";
import type { Route } from "./+types/match-case-converter";

import { MatchCaseConverterToolCard } from "../client/components/match-case-converter/MatchCaseConverterToolCard";
import { HowItWorksSection } from "../client/components/match-case-converter/HowItWorksSection";
import { FaqSection } from "../client/components/match-case-converter/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Match Case Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Apply the uppercase/lowercase pattern from a reference text to a target text. Paste or upload, match casing, then copy or download the output.",
  },
  { property: "og:title", content: "Match Case Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Match case from a reference to a target in your browser. Copy the output or export a PDF.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/match-case-converter",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Match Case Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Copy a casing pattern from reference text and apply it to a target. Paste or upload, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/match-case-converter",
  },
];

export default function MatchCaseConverterRoute() {
  const [referenceText, setReferenceText] = useState("");
  const [targetText, setTargetText] = useState("");

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
          name: "Match Case Converter",
          item: "https://www.alltextconverters.com/match-case-converter",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <MatchCaseConverterToolCard
          referenceText={referenceText}
          setReferenceText={setReferenceText}
          targetText={targetText}
          setTargetText={setTargetText}
        />
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
