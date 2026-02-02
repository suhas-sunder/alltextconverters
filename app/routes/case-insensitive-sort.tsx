import { useState } from "react";
import type { Route } from "./+types/case-insensitive-sort";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { CaseInsensitiveSortToolCard } from "../client/components/case-insensitive-sort/CaseInsensitiveSortToolCard";
import { HowItWorksSection } from "../client/components/case-insensitive-sort/HowItWorksSection";
import { FaqSection } from "../client/components/case-insensitive-sort/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Case-Insensitive Sort | AllTextConverters" },
  {
    name: "description",
    content:
      "Sort lines alphabetically while ignoring case. Paste or upload text, choose A–Z or Z–A, optionally remove duplicates, then copy or download the result.",
  },
  { property: "og:title", content: "Case-Insensitive Sort | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Alphabetically sort text lines ignoring case. Choose A–Z or Z–A, optionally deduplicate, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/case-insensitive-sort",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Case-Insensitive Sort | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Sort lines alphabetically ignoring case. Toggle A–Z or Z–A and unique lines, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/case-insensitive-sort",
  },
];

export default function CaseInsensitiveSortRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Case-Insensitive Sort" />
        </div>
        <CaseInsensitiveSortToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Case-Insensitive Sort" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/case-insensitive-sort" />
    </main>
  );
}