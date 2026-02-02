import { useState } from "react";
import type { Route } from "./+types/comma-separated-to-list";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { CommaSeparatedToListToolCard } from "../client/components/comma-separated-to-list/CommaSeparatedToListToolCard";
import { HowItWorksSection } from "../client/components/comma-separated-to-list/HowItWorksSection";
import { FaqSection } from "../client/components/comma-separated-to-list/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Comma Separated to List | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert comma-separated values into a clean newline list. Trims whitespace, ignores empty values, and keeps the original order.",
  },
  {
    property: "og:title",
    content: "Comma Separated to List | AllTextConverters",
  },
  {
    property: "og:description",
    content:
      "Turn “a, b, c” into one item per line. Split on commas, trim, and copy the list instantly.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/comma-separated-to-list",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Comma Separated to List | AllTextConverters",
  },
  {
    name: "twitter:description",
    content:
      "Convert comma-separated values into a newline list. Trim whitespace, ignore blanks, and copy.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/comma-separated-to-list",
  },
];

export default function CommaSeparatedToListRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Comma Separated to List" />
        </div>
        <CommaSeparatedToListToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Comma Separated to List" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/comma-separated-to-list" />
    </main>
  );
}