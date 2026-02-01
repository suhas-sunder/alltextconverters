import { useMemo, useState } from "react";
import type { Route } from "./+types/base64-decode";

import { Base64DecodeToolCard } from "../client/components/base64-decode/Base64DecodeToolCard";
import { HowItWorksSection } from "../client/components/base64-decode/HowItWorksSection";
import { FaqSection } from "../client/components/base64-decode/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Base64 Decoder | AllTextConverters" },
  {
    name: "description",
    content:
      "Decode Base64 to plain text in your browser. Paste a Base64 string or upload a file, decode safely, then copy or download the result.",
  },
  { property: "og:title", content: "Base64 Decoder | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Decode Base64 to text locally in your browser. Handles invalid input gracefully with clear feedback.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/base64-decode",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Base64 Decoder | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Decode Base64 to plain text locally. Paste or upload, decode, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/base64-decode",
  },
];

export default function Base64DecodeRoute() {
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
          name: "Base64 Decoder",
          item: "https://www.alltextconverters.com/base64-decode",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <Base64DecodeToolCard input={input} setInput={setInput} />
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
