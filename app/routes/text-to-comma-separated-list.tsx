import { useState } from "react";
import type { Route } from "./+types/text-to-comma-separated-list";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TextToCommaSeparatedListToolCard } from "../client/components/text-to-comma-separated-list/TextToCommaSeparatedListToolCard";
import { HowItWorksSection } from "../client/components/text-to-comma-separated-list/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-comma-separated-list/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text to Comma Separated List | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert pasted text into a comma-separated list in one click. Split by lines, trim values, ignore blanks, then copy or download the result.",
  },
  { property: "og:title", content: "Text to Comma Separated List | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Turn lines of text into a clean comma-separated list in your browser. Paste or upload text, convert, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-to-comma-separated-list",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text to Comma Separated List | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert text into a comma-separated list. Trim, ignore empty items, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-to-comma-separated-list",
  },
];

export default function TextToCommaSeparatedListRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to Comma Separated List" />
        </div>
        <TextToCommaSeparatedListToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Text to Comma Separated List" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/text-to-comma-separated-list" />
    </main>
  );
}