import { useState } from "react";
import type { Route } from "./+types/text-to-binary";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TextToBinaryToolCard } from "../client/components/text-to-binary/TextToBinaryToolCard";
import { HowItWorksSection } from "../client/components/text-to-binary/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-binary/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text to Binary Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert ASCII text to binary in one click. Choose 7-bit or 8-bit output, upload a file, then copy or download the result.",
  },
  { property: "og:title", content: "Text to Binary Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Encode ASCII text into space-separated binary in your browser. Pick 7-bit or 8-bit, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-to-binary",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text to Binary Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Convert ASCII text to 7-bit or 8-bit binary. Runs locally in your browser.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-to-binary",
  },
];

export default function TextToBinaryRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to Binary Converter" />
        </div>
        <TextToBinaryToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Text to Binary Converter" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/text-to-binary" />
    </main>
  );
}