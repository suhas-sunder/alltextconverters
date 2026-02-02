import { useState } from "react";
import type { Route } from "./+types/text-to-hex";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TextToHexToolCard } from "../client/components/text-to-hex/TextToHexToolCard";
import { HowItWorksSection } from "../client/components/text-to-hex/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-hex/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text to Hex Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text into hexadecimal (hex) in one click. Choose encoding, format the output, then copy or download the result.",
  },
  { property: "og:title", content: "Text to Hex Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Encode text as hex locally in your browser. Supports ASCII and common byte encodings, plus flexible output formatting.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-to-hex",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text to Hex Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert text into hex in one click. Copy or download the hexadecimal output.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-to-hex",
  },
];

export default function TextToHexRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to Hex Converter" />
        </div>
        <TextToHexToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Text to Hex Converter" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/text-to-hex" />
    </main>
  );
}