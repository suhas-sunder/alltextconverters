import { Link } from "react-router";
import type { Route } from "./+types/cookies-policy";
import { BreadcrumbListJsonLd } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";
import { PolicyPage, PolicySection } from "./_shared/PolicyPage";

export const meta: Route.MetaFunction = () =>
  createPageMeta({
    title: "Cookies Policy | AllTextConverters",
    description:
      "How consent preferences, essential storage, and future optional cookies are handled on AllTextConverters.",
    pathname: "/cookies-policy",
    indexable: false,
  });

export default function CookiesPolicy() {
  return (
    <>
      <PolicyPage title="Cookies Policy" updated="July 16, 2026">
        <PolicySection title="Essential storage">
          <p>
            The site can use local browser storage to remember your consent choices.
            This is essential to honoring a choice you have already made and does not
            contain converter input or output.
          </p>
        </PolicySection>
        <PolicySection title="Optional categories">
          <p>
            Analytics and advertising categories are optional and off by default.
            If those services are configured in the future, they may use cookies or
            similar technologies where permitted and according to your choices.
          </p>
        </PolicySection>
        <PolicySection title="Manage preferences">
          <p>
            Use the <strong>Privacy choices</strong> control in the footer to review,
            withdraw, or change optional consent. Withdrawing optional consent stops
            future optional integrations from loading through this site&apos;s consent
            boundary.
          </p>
        </PolicySection>
        <PolicySection title="More information">
          <p>
            Read the <Link className="font-medium text-slate-900 underline underline-offset-4" to="/privacy-policy">Privacy Policy</Link> for the broader explanation of converter content, technical information, and advertising.
          </p>
        </PolicySection>
      </PolicyPage>
      <BreadcrumbListJsonLd label="Cookies Policy" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/cookies-policy" />
    </>
  );
}
