import { useState } from "react";
import type { Route } from "./+types/home";
import { TextToolCard } from "../client/components/home/TextToolCard";
import { AboutSection } from "../client/components/home/AboutSection";
import { SeoContent } from "../client/components/home/SeoContent";
import { FaqSection } from "../client/components/home/FaqSection";

/* ──────────────────────────────
  SEO META
────────────────────────────── */
export const meta: Route.MetaFunction = () => [
  {
    title:
      "AllTextConverters, Convert, Format & Clean Text Online | Case, Base64 & Word Counter",
  },
  {
    name: "description",
    content:
      "Free online text converter for every format, instantly change case, clean text, encode or decode Base64, and count words or characters. Simple, fast, and private.",
  },
  {
    property: "og:title",
    content:
      "AllTextConverters, The Ultimate Free Online Text Converter & Word Counter",
  },
  {
    property: "og:description",
    content:
      "Instantly convert, format, and clean text. Change case, encode Base64, remove spaces, or count words, all done locally for privacy.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://www.alltextconverters.com" },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content:
      "AllTextConverters, Convert, Format & Count Text Instantly (Free Online Tool)",
  },
  {
    name: "twitter:description",
    content:
      "Powerful browser-based text converter with Base64 tools, word counter, and format cleaner, secure, fast, and ad-free.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  { rel: "canonical", href: "https://www.alltextconverters.com/" },
];

export default function Index() {
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-6 pt-7 pb-16 space-y-14">
        <TextToolCard input={input} setInput={setInput} />

        <SeoContent />
        <AboutSection />

        <FaqSection />
      </section>
    </main>
  );
}
