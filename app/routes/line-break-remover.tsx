import { useState } from "react";
import type { Route } from "./+types/line-break-remover";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { LineBreakRemoverToolCard } from "../client/components/line-break-remover/LineBreakRemoverToolCard";
import { HowItWorksSection } from "../client/components/line-break-remover/HowItWorksSection";
import { FaqSection } from "../client/components/line-break-remover/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Line Break Remover | AllTextConverters" },
  {
    name: "description",
    content:
      "Remove all line breaks from text in one click. Choose to replace breaks with spaces or nothing, then copy or download the cleaned result.",
  },
  { property: "og:title", content: "Line Break Remover | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Flatten multi-line text instantly in your browser. Replace line breaks with spaces or remove them entirely, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/line-break-remover",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Line Break Remover | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Remove line breaks in one click. Replace with spaces or nothing, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/line-break-remover",
  },
];

export default function LineBreakRemoverRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Line Break Remover" />
        </div>
        <LineBreakRemoverToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Line Break Remover" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/line-break-remover" />
    </main>
  );
}