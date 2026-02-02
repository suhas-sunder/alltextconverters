import { useState } from "react";
import type { Route } from "./+types/whitespace-cleaner";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { WhitespaceCleanerToolCard } from "../client/components/whitespace-cleaner/WhitespaceCleanerToolCard";
import { HowItWorksSection } from "../client/components/whitespace-cleaner/HowItWorksSection";
import { FaqSection } from "../client/components/whitespace-cleaner/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Whitespace Cleaner | AllTextConverters" },
  {
    name: "description",
    content:
      "Remove hidden whitespace and invisible Unicode characters in one click. Clean tabs, non-breaking spaces, and zero-width characters, then copy or download the result.",
  },
  { property: "og:title", content: "Whitespace Cleaner | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Clean hidden whitespace instantly in your browser. Remove tabs, non-breaking spaces, and invisible Unicode characters, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/whitespace-cleaner",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Whitespace Cleaner | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Remove hidden whitespace and invisible Unicode characters in one click. Copy or download the cleaned result.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/whitespace-cleaner",
  },
];

export default function WhitespaceCleanerRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Whitespace Cleaner" />
        </div>
        <WhitespaceCleanerToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Whitespace Cleaner" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/whitespace-cleaner" />
    </main>
  );
}