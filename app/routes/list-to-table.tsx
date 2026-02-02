import { useState } from "react";
import type { Route } from "./+types/list-to-table";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { ListToTableToolCard } from "../client/components/list-to-table/ListToTableToolCard";
import { HowItWorksSection } from "../client/components/list-to-table/HowItWorksSection";
import { FaqSection } from "../client/components/list-to-table/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "List to Table | AllTextConverters" },
  {
    name: "description",
    content:
      "Turn a list of items into a simple 1-column table. Paste or upload text, generate HTML table, CSV, or TSV, then copy or download the result.",
  },
  { property: "og:title", content: "List to Table | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Convert a list into a 1-column table format. Copy as HTML table, CSV, or TSV. Runs locally in your browser.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/list-to-table",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "List to Table | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Paste a list and copy it as an HTML table, CSV, or TSV. Fast, deterministic, and local.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/list-to-table",
  },
];

export default function ListToTableRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="List to Table" />
        </div>
        <ListToTableToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="List to Table" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/list-to-table" />
    </main>
  );
}