import { useState } from "react";
import type { Route } from "./+types/remove-all-styling-from-text";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { RemoveAllStylingFromTextToolCard } from "../client/components/remove-all-styling-from-text/components/RemoveAllStylingFromTextToolCard";
import { HowItWorksSection } from "../client/components/remove-all-styling-from-text/components/HowItWorksSection";
import { FaqSection } from "../client/components/remove-all-styling-from-text/components/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Remove All Styling From Text | AllTextConverters" },
  {
    name: "description",
    content:
      "Strip HTML tags, inline styles, classes, and formatting to get clean plain text. Paste or upload, remove styling, then copy or download.",
  },
  {
    property: "og:title",
    content: "Remove All Styling From Text | AllTextConverters",
  },
  {
    property: "og:description",
    content:
      "Remove formatting from HTML and rich text to get clean plain text in your browser. Paste or upload, strip styling, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/remove-all-styling-from-text",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Remove All Styling From Text | AllTextConverters",
  },
  {
    name: "twitter:description",
    content:
      "Strip HTML tags and formatting to plain text. Copy or download the cleaned result.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/remove-all-styling-from-text",
  },
];

export default function RemoveAllStylingFromTextRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Remove All Styling From Text" />
        </div>
        <RemoveAllStylingFromTextToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Remove All Styling From Text" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/remove-all-styling-from-text" />
    </main>
  );
}