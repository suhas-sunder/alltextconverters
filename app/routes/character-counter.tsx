import { useState } from "react";
import type { Route } from "./+types/character-counter";
import { CharacterCounterToolCard } from "../client/components/character-counter/CharacterCounterToolCard";
import { FaqSection } from "../client/components/character-counter/FaqSection";
import { HowItWorksSection } from "../client/components/character-counter/HowItWorksSection";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

export const meta: Route.MetaFunction = () => [
  { title: "Character Counter | AllTextConverters" },
  {
    name: "description",
    content:
      "Count characters with spaces, without spaces, and (optionally) bytes in UTF-8 instantly. Fast, free, and privacy-first. Runs locally in your browser.",
  },
  { property: "og:title", content: "Character Counter | AllTextConverters" },
  {
    property: "og:description",
    content:
      "Live character counts for strict limits. Optional UTF-8 byte count. Everything runs locally for privacy.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://www.alltextconverters.com/character-counter" },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Character Counter | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Count characters with spaces, without spaces, and bytes (UTF-8). Fast, free, and private.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  { rel: "canonical", href: "https://www.alltextconverters.com/character-counter" },
];

export default function CharacterCounterRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="Character Counter" />
        </div>
        {/* Tool */}
        <CharacterCounterToolCard input={input} setInput={setInput} />
        {/* How it works (SEO-rich) */}
        <HowItWorksSection />

        {/* FAQ (includes FAQ JSON-LD) */}
        <FaqSection />
      </section>

      {/* Breadcrumb JSON-LD */}
      <BreadcrumbListJsonLd label="Character Counter" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/character-counter" />
    </main>
  );
}