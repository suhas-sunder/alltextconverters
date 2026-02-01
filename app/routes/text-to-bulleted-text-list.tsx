import { useMemo, useState } from "react";
import type { Route } from "./+types/text-to-bulleted-text-list";

import { TextToBulletedTextListToolCard } from "../client/components/text-to-bulleted-text-list/TextToBulletedTextListToolCard";
import { HowItWorksSection } from "../client/components/text-to-bulleted-text-list/HowItWorksSection";
import { FaqSection } from "../client/components/text-to-bulleted-text-list/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Text to Bulleted List | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert text into a bulleted list in one click. Paste a line-by-line list or comma-separated items, choose a bullet, then copy or download the result.",
  },
  { property: "og:title", content: "Text to Bulleted List | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Create clean bulleted lists locally in your browser. Paste items, choose a bullet, convert, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/text-to-bulleted-text-list",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Text to Bulleted List | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Turn pasted items into a bulleted list. Choose -, *, •, or a custom bullet. Copy or download.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/text-to-bulleted-text-list",
  },
];

export default function TextToBulletedTextListRoute() {
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
          name: "Text to Bulleted List",
          item: "https://www.alltextconverters.com/text-to-bulleted-text-list",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <TextToBulletedTextListToolCard input={input} setInput={setInput} />
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
