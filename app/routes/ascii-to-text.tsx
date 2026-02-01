import { useMemo, useState } from "react";
import type { Route } from "./+types/ascii-to-text";

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

  const breadcrumbSchema = useMemo(
    () => ({
      "@context": "https://www.schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.alltextconverters.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "ASCII to Text",
          item: "https://www.alltextconverters.com/ascii-to-text",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <AsciiToTextToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </main>
  );
}
