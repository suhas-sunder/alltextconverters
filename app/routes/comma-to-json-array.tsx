import { useState } from "react";
import type { Route } from "./+types/comma-to-json-array";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { CommaToJsonArrayToolCard } from "../client/components/comma-to-json-array/CommaToJsonArrayToolCard";
import { HowItWorksSection } from "../client/components/comma-to-json-array/HowItWorksSection";
import { FaqSection } from "../client/components/comma-to-json-array/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Comma to JSON Array Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert comma-separated values to a JSON array in one click. Paste or upload text, trim and drop empty entries, then copy or download the JSON result.",
  },
  {
    property: "og:title",
    content: "Comma to JSON Array Converter | AllTextConverters",
  },
  {
    property: "og:description",
    content:
      "Turn a comma-separated list into a valid JSON array of strings. Runs locally in your browser with copy and download options.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/comma-to-json-array",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Comma to JSON Array Converter | AllTextConverters",
  },
  {
    name: "twitter:description",
    content:
      "Convert a comma-separated list to JSON array format. Trim, drop empties, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/comma-to-json-array",
  },
];

export default function CommaToJsonArrayRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Comma to JSON Array" />
        </div>
        <CommaToJsonArrayToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Comma to JSON Array" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/comma-to-json-array" />
    </main>
  );
}