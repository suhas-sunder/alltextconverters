import { useState } from "react";
import type { Route } from "./+types/text-to-ascii";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { TextToAsciiToolCard } from "../client/components/text-to-ascii/TextToAsciiToolCard";
import { HowItWorksSection } from "../client/components/text-to-ascii/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-ascii/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text to ASCII | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text into decimal ASCII codes (printable range 32–126). Paste or upload text, encode locally, then copy or download the result.",
  },
  { property: "og:title", content: "Text to ASCII | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Turn text into decimal ASCII codes in your browser. Printable ASCII scope (32–126) with clear skipped-character reporting.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-to-ascii",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text to ASCII | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Encode text into decimal ASCII codes (printable range). Copy or download the output.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-to-ascii",
  },
];

export default function TextToAsciiRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Text to ASCII" />
        </div>
        <TextToAsciiToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="Text to ASCII" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/text-to-ascii" />
    </main>
  );
}