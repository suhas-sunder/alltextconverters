import { useMemo, useState } from "react";
import type { Route } from "./+types/table-to-list";

import { TableToListToolCard } from "../client/components/table-to-list/TableToListToolCard";
import { HowItWorksSection } from "../client/components/table-to-list/HowItWorksSection";
import { FaqSection } from "../client/components/table-to-list/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "Table to List Converter | AllTextConverters" },
  {
    name: "description",
    content:
      "Extract a clean list from a pasted table, CSV, or TSV. Choose a column, copy the list, or download it as a PDF.",
  },
  {
    property: "og:title",
    content: "Table to List Converter | AllTextConverters",
  },
  {
    property: "og:description",
    content:
      "Paste a table, CSV, or TSV and extract a column as a clean list in your browser.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/table-to-list",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Table to List Converter | AllTextConverters",
  },
  {
    name: "twitter:description",
    content:
      "Extract a column from a pasted table, CSV, or TSV and copy it as a clean list.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/table-to-list",
  },
];

export default function TableToListRoute() {
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
          name: "Table to List",
          item: "https://www.alltextconverters.com/table-to-list",
        },
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-12">
        <TableToListToolCard input={input} setInput={setInput} />
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
