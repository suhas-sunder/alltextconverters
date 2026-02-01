import type { Route } from "./+types/about";
import { AboutHero } from "../client/components/about/AboutHero";
import { AboutScope } from "../client/components/about/AboutScope";
import { AboutBuilder } from "../client/components/about/AboutBuilder";
import { AboutTrustMoat } from "../client/components/about/AboutTrustMoat";
import { AboutToolLinks } from "../client/components/about/AboutToolLinks";
import { AboutFaq } from "../client/components/about/AboutFaq";
import { AboutSchema } from "../client/components/about/AboutSchema";

/* ──────────────────────────────
  SEO META
────────────────────────────── */
export const meta: Route.MetaFunction = () => [
  {
    title:
      "About AllTextConverters | Privacy-First Text Tools for Case, Cleanup & Encoding",
  },
  {
    name: "description",
    content:
      "AllTextConverters is a fast, privacy-first toolbox for converting, cleaning, formatting, encoding/decoding, and counting text in your browser. Built by software developer Suhas Sunder.",
  },
  { property: "og:title", content: "About AllTextConverters" },
  {
    property: "og:description",
    content:
      "Learn what AllTextConverters is, what it is not, and why it is built as a utility-first site for reliable text conversion and cleanup.",
  },
  { property: "og:type", content: "website" },
  { property: "og:url", content: "https://www.alltextconverters.com/about/" },
  {
    property: "og:image",
    content: "https://www.alltextconverters.com/social-preview.png",
  },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "About AllTextConverters" },
  {
    name: "twitter:description",
    content:
      "A utility-first text toolbox: convert case, clean formatting, encode/decode, and count text locally in your browser.",
  },
  { name: "robots", content: "index, follow" },
  { name: "theme-color", content: "#1e293b" },
  { rel: "canonical", href: "https://www.alltextconverters.com/about/" },
];

export default function About() {
  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-6 pt-7 pb-16 space-y-14">
        <AboutSchema />

        <AboutHero />

        <div className="grid lg:grid-cols-2 gap-6">
          <AboutScope />
          <AboutToolLinks />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <AboutBuilder />
          <AboutTrustMoat />
        </div>

        <AboutFaq />
      </section>
    </main>
  );
}
