import { useState } from "react";
import type { Route } from "./+types/url-encode";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

import { UrlEncodeToolCard } from "../client/components/url-encode/UrlEncodeToolCard";
import { HowItWorksSection } from "../client/components/url-encode/HowItWorksSection";
import { FaqSection } from "../client/components/url-encode/FaqSection";

export const meta: Route.MetaFunction = () => [
  { title: "URL Encoder | AllTextConverters" },
  {
    name: "description",
    content:
      "Encode text for URLs using encodeURIComponent. Paste or upload text, encode it safely, then copy or download the result.",
  },
  { property: "og:title", content: "URL Encoder | AllTextConverters" },
  {
    property: "og:description",
    content:
      "URL-encode text locally in your browser. Paste or upload, encode with encodeURIComponent, then copy or download.",
  },
  { property: "og:type", content: "website" },
  {
    property: "og:url",
    content: "https://www.alltextconverters.com/url-encode",
  },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "URL Encoder | AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "Encode text for URLs with encodeURIComponent. Copy or download the encoded output.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  {
    rel: "canonical",
    href: "https://www.alltextconverters.com/url-encode",
  },
];

export default function UrlEncodeRoute() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 pt-7 space-y-6">
        <div className="pb-1">
          <BreadcrumbRow label="URL Encoder" />
        </div>
        <UrlEncodeToolCard input={input} setInput={setInput} />
        <HowItWorksSection />
        <FaqSection />
      </section>
      <BreadcrumbListJsonLd label="URL Encoder" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/url-encode" />
    </main>
  );
}