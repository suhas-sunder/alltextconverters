import type { Route } from "./+types/about";
import { AboutHero } from "../client/components/about/AboutHero";
import { AboutScope } from "../client/components/about/AboutScope";
import { AboutBuilder } from "../client/components/about/AboutBuilder";
import { AboutTrustMoat } from "../client/components/about/AboutTrustMoat";
import { AboutToolLinks } from "../client/components/about/AboutToolLinks";
import { AboutFaq } from "../client/components/about/AboutFaq";
import { AboutSchema } from "../client/components/about/AboutSchema";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

/* ──────────────────────────────
  SEO META
────────────────────────────── */
export const meta: Route.MetaFunction = () =>
  createPageMeta({
    title: "About AllTextConverters | Browser-Based Text Tools",
    description:
      "Learn how AllTextConverters provides focused browser-based text utilities, how tools are tested, and how to report an issue.",
    pathname: "/about",
  });

export default function About() {
  return (
    <main className="min-h-screen font-sans bg-slate-100 text-slate-900">
      <section className="max-w-6xl mx-auto px-6 pt-7 pb-16 space-y-8">
        <div className="pb-1">
          <BreadcrumbRow label="About AllTextConverters" />
        </div>
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
      <BreadcrumbListJsonLd
        label="About AllTextConverters"
        homeUrl="https://www.alltextconverters.com/"
        currentUrl="https://www.alltextconverters.com/about"
      />
    </main>
  );
}
