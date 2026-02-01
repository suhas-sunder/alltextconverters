import { useMemo, useState } from "react";
import type { Route } from "./+types/html-to-text";

import { HtmlToTextToolCard } from "../client/components/html-to-text/HtmlToTextToolCard";
import { HowItWorksSection } from "../client/components/html-to-text/HowItWorksSection";
import { FaqSection } from "../client/components/html-to-text/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "HTML to Text Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Extract readable text from HTML in your browser. Paste or upload HTML, convert to plain text, then copy or download the result.",
  },
  { property: "og:title", content: "HTML to Text Converter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Turn HTML into clean plain text locally in your browser. Great for logs, scraping outputs, exports, and quick readability checks.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/html-to-text",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "HTML to Text Converter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Extract readable text from HTML locally in your browser. Copy or download the plain text output.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/html-to-text",
  },
];

export default function HtmlToTextRoute() {
  const [htmlInput, setHtmlInput] = useState("");

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
          name: "HTML to Text",
          item: "https://www.alltextconverters.com/html-to-text",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <HtmlToTextToolCard htmlInput={htmlInput} setHtmlInput={setHtmlInput} />
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
