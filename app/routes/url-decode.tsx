import { useMemo, useState } from "react";
import type { Route } from "./+types/url-decode";

import { UrlDecodeToolCard } from "../client/components/url-decode/UrlDecodeToolCard";
import { HowItWorksSection } from "../client/components/url-decode/HowItWorksSection";
import { FaqSection } from "../client/components/url-decode/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "URL Decode | AllTextConverters" },
  {
    name: "description",
    content:
      "Decode URL-encoded text (percent escapes) safely using decodeURIComponent. Paste or upload text, decode in one click, then copy or download the result.",
  },
  { property: "og:title", content: "URL Decode | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Decode URL-encoded text in your browser. Safe error handling for invalid input. Copy or download the decoded output.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://www.alltextconverters.com/url-decode" },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "URL Decode | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Decode URL-encoded text (percent escapes) safely. Paste or upload, decode, then copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  { rel: "canonical", href: "https://www.alltextconverters.com/url-decode" },
];

export default function UrlDecodeRoute() {
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
          name: "URL Decode",
          item: "https://www.alltextconverters.com/url-decode",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <UrlDecodeToolCard input={input} setInput={setInput} />
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
