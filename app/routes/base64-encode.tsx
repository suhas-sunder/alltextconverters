import { useMemo, useState } from "react";
import type { Route } from "./+types/base64-encode";

import { Base64EncodeToolCard } from "../client/components/base64-encode/Base64EncodeToolCard";
import { HowItWorksSection } from "../client/components/base64-encode/HowItWorksSection";
import { FaqSection } from "../client/components/base64-encode/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Base64 Encoder | AllTextConverters" },
  {
    name: "description",
    content:
      "Encode text to Base64 safely (Unicode supported) in one click. Paste or upload text, encode locally in your browser, then copy or download as PDF.",
  },
  { property: "og:title", content: "Base64 Encoder | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Unicode-safe Base64 encoding that runs locally in your browser. Paste or upload text, encode, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/base64-encode",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Base64 Encoder | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Encode text to Base64 with Unicode support. Runs locally in your browser. Copy or download the result.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/base64-encode",
  },
];

export default function Base64EncodeRoute() {
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
          name: "Base64 Encoder",
          item: "https://www.alltextconverters.com/base64-encode",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <Base64EncodeToolCard input={input} setInput={setInput} />
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
