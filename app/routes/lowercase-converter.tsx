import { useState } from "react";
import type { Route } from "./+types/lowercase-converter";
import { LowercaseConverterToolCard } from "../client/components/lowercase-converter/LowercaseConverterToolCard";
import { HowItWorksSection } from "../client/components/lowercase-converter/HowItWorksSection";
import { FaqSection } from "../client/components/lowercase-converter/FaqSection";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

export const meta: Route.MetaFunction = () => [
  { title: "Lowercase Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text to lowercase instantly. Paste or upload text, click convert, then copy or download the lowercase output.",
  },
  { property: "og:title", content: "Lowercase Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Fast lowercase conversion in your browser. Upload TXT/PDF/DOCX, convert with one click, then copy or export.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/lowercase-converter",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Lowercase Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Paste or upload text and convert to lowercase with one click. Copy the result or download as TXT/PDF.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/lowercase-converter",
  },
];

export default function LowercaseConverterRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Lowercase Converter" />
        </div>
        <LowercaseConverterToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Lowercase Converter" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/lowercase-converter" />
    </main>
  );
}