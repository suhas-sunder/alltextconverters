import { useState } from "react";
import type { Route } from "./+types/remove-extra-spaces";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { RemoveExtraSpacesToolCard } from "../client/components/remove-extra-spaces/RemoveExtraSpacesToolCard";
import { HowItWorksSection } from "../client/components/remove-extra-spaces/HowItWorksSection";
import { FaqSection } from "../client/components/remove-extra-spaces/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Remove Extra Spaces | AllTextConverters" },
  {
    name: "description",
    content:
      "Collapse multiple spaces into one in a single click. Paste or upload text, remove extra spaces, then copy or download the cleaned result.",
  },
  { property: "og:title", content: "Remove Extra Spaces | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Clean up spacing instantly in your browser. Collapse repeated spaces, optionally keep line breaks, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/remove-extra-spaces",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Remove Extra Spaces | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Collapse multiple spaces into one. Paste or upload text, clean spacing, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/remove-extra-spaces",
  },
];

export default function RemoveExtraSpacesRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Remove Extra Spaces" />
        </div>
        <RemoveExtraSpacesToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Remove Extra Spaces" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/remove-extra-spaces" />
    </main>
  );
}