import { useState } from "react";
import type { Route } from "./+types/xml-to-text";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { XmlToTextToolCard } from "../client/components/xml-to-text/XmlToTextToolCard";
import { HowItWorksSection } from "../client/components/xml-to-text/HowItWorksSection";
import { FaqSection } from "../client/components/xml-to-text/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "XML to Text Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Extract readable text from XML in one click. Paste or upload XML, extract text locally in your browser, then copy or download the result.",
  },
  { property: "og:title", content: "XML to Text Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Convert XML to plain text locally in your browser. Extract text nodes, normalize whitespace, and copy or download the output.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/xml-to-text",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "XML to Text Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Extract readable text from XML. Runs locally in your browser. Copy or download the plain text output.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/xml-to-text",
  },
];

export default function XmlToTextRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="XML to Text" />
        </div>
        <XmlToTextToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="XML to Text" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/xml-to-text" />
    </main>
  );
}