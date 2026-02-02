import { useState } from "react";
import type { Route } from "./+types/hex-to-text";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { HexToTextToolCard } from "../client/components/hex-to-text/components/HexToTextToolCard";
import { HowItWorksSection } from "../client/components/hex-to-text/components/HowItWorksSection";
import { FaqSection } from "../client/components/hex-to-text/components/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Hex to Text Decoder | AllTextConverters" },
  {
    name: "description",
    content:
      "Decode hexadecimal (hex) into readable ASCII text. Paste or upload hex, decode in one click, then copy or download the result.",
  },
  { property: "og:title", content: "Hex to Text Decoder | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Convert hex to text in your browser. Space-tolerant input, validation, copy, and PDF download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/hex-to-text",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Hex to Text Decoder | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Decode hexadecimal (hex) into ASCII text. Paste or upload, decode, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/hex-to-text",
  },
];

export default function HexToTextRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Hex to Text" />
        </div>
        <HexToTextToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Hex to Text" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/hex-to-text" />
    </main>
  );
}