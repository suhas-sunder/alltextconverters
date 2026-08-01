import { useState } from "react";
import type { Route } from "./+types/home";
import { TextToolCard } from "../client/components/home/TextToolCard";
import { AboutSection } from "../client/components/home/AboutSection";
import { SeoContent } from "../client/components/home/SeoContent";
import { FaqSection } from "../client/components/home/FaqSection";
import { AdSlot } from "../client/components/advertising/AdSlot";

export const meta: Route.MetaFunction = () => {
  const url = "https://www.alltextconverters.com";
  const title = "AllTextConverters - Browser-Based Text Converters";
  const description = "Convert, clean, format, encode, decode, and count text with focused browser-based tools. Choose a utility, review the result, then copy or download it.";
  return [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: url }, { property: "og:site_name", content: "AllTextConverters" }, { name: "twitter:card", content: "summary" }, { name: "twitter:title", content: title }, { name: "twitter:description", content: description }, { name: "robots", content: "index,follow" }, { "script:ld+json": { "@context": "https://schema.org", "@type": "WebSite", name: "AllTextConverters", url, description } }];
};

export default function Index() {
  const [input, setInput] = useState("");
  return <main className="min-h-screen bg-slate-100 font-sans text-slate-900"><section className="mx-auto max-w-6xl space-y-14 px-6 pb-16 pt-7"><TextToolCard input={input} setInput={setInput} /><AdSlot placement="below-utility" /><SeoContent /><AdSlot placement="info-square" className="mx-auto" /><AboutSection /><FaqSection /></section></main>;
}
