import { useMemo, useState } from "react";
import type { Route } from "./+types/list-to-comma-separated";

import { ListToCommaSeparatedToolCard } from "../client/components/list-to-comma-separated/ListToCommaSeparatedToolCard";
import { HowItWorksSection } from "../client/components/list-to-comma-separated/HowItWorksSection";
import { FaqSection } from "../client/components/list-to-comma-separated/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "List to Comma Separated | AllTextConverters" },
  {
    name: "description",
    content:
      "Convert a line-based list into a comma-separated line. Trim whitespace, ignore blank items, copy the output, or export CSV and PDF.",
  },
  {
    property: "og:title",
    content: "List to Comma Separated | AllTextConverters",
  },
  {
    property: "og:description",
    content:
      "Paste a list, collapse it into comma-separated text, then copy or download. Includes CSV export and optional space-after-comma toggle.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/list-to-comma-separated",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "List to Comma Separated | AllTextConverters",
  },
  {
    name: "twitter:description",
    content:
      "Turn one item per line into a comma-separated line. Copy, export CSV, or download as PDF.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/list-to-comma-separated",
  },
];

export default function ListToCommaSeparatedRoute() {
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
          name: "List to Comma Separated",
          item: "https://www.alltextconverters.com/list-to-comma-separated",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <ListToCommaSeparatedToolCard input={input} setInput={setInput} />
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
