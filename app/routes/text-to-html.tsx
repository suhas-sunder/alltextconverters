import { useState } from "react";
import type { Route } from "./+types/text-to-html";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TextToHtmlToolCard } from "../client/components/text-to-html/TextToHtmlToolCard";
import { HowItWorksSection } from "../client/components/text-to-html/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-html/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text to HTML Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert plain text into safe, readable HTML in one click. Paste or upload text, generate HTML, then copy or download the result.",
  },
  { property: "og:title", content: "Text to HTML Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Generate simple HTML from plain text locally in your browser. Copy or download the HTML output.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-to-html",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text to HTML Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert plain text to HTML with predictable rules. Runs locally in your browser.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-to-html",
  },
];

export default function TextToHtmlRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to HTML" />
        </div>
        <TextToHtmlToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Text to HTML" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/text-to-html" />
    </main>
  );
}