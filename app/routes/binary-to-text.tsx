import { useState } from "react";
import type { Route } from "./+types/binary-to-text";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { BinaryToTextToolCard } from "../client/components/binary-to-text/BinaryToTextToolCard";
import { HowItWorksSection } from "../client/components/binary-to-text/HowItWorksSection";
import { FaqSection } from "../client/components/binary-to-text/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Binary to Text Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Decode binary (0s and 1s) into readable text or numbers. Auto-detect 7-bit vs 8-bit, handle spaced input, and export results locally in your browser.",
  },
  { property: "og:title", content: "Binary to Text Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Turn binary into text, decimal, hex, or octal. Auto-detect 7-bit vs 8-bit. Runs locally in your browser.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/binary-to-text",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Binary to Text Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Decode binary to text, decimal, hex, or octal. Auto-detect 7-bit vs 8-bit. Copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/binary-to-text",
  },
];

export default function BinaryToTextRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Binary to Text" />
        </div>
        <BinaryToTextToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Binary to Text" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/binary-to-text" />
    </main>
  );
}