import { useState } from "react";
import type { Route } from "./+types/ascii-to-text";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { AsciiToTextToolCard } from "../client/components/ascii-to-text/AsciiToTextToolCard";
import { HowItWorksSection } from "../client/components/ascii-to-text/HowItWorksSection";
import { FaqSection } from "../client/components/ascii-to-text/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "ASCII to Text Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Decode decimal ASCII codes into readable text. Space and comma tolerant input. Converts printable ASCII (32–126) locally in your browser.",
  },
  { property: "og:title", content: "ASCII to Text Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Turn decimal ASCII codes into text instantly. Paste or upload codes, decode printable ASCII (32–126), then copy or download.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://www.alltextconverters.com/ascii-to-text" },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "ASCII to Text Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Decode decimal ASCII codes into text locally in your browser. Copy or download the result.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/ascii-to-text",
  },
];

export default function AsciiToTextRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="ASCII to Text" />
        </div>
        <AsciiToTextToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="ASCII to Text" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/ascii-to-text" />
    </main>
  );
}