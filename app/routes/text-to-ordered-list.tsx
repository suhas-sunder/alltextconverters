import { useState } from "react";
import type { Route } from "./+types/text-to-ordered-list";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TextToOrderedListToolCard } from "../client/components/text-to-ordered-list/TextToOrderedListToolCard";
import { HowItWorksSection } from "../client/components/text-to-ordered-list/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-ordered-list/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text to Ordered List | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text into an ordered list in one click. Choose lines or comma-separated input, pick numbers, letters, or roman numerals, then copy or download.",
  },
  { property: "og:title", content: "Text to Ordered List | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Turn pasted text into a numbered or lettered list locally in your browser. Pick numbering style, convert, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-to-ordered-list",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text to Ordered List | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert lines or comma-separated text into an ordered list. Numbers, letters, roman numerals. Copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-to-ordered-list",
  },
];

export default function TextToOrderedListRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to Ordered List" />
        </div>
        <TextToOrderedListToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Text to Ordered List" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/text-to-ordered-list" />
    </main>
  );
}