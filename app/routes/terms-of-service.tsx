import { Link } from "react-router";
import type { Route } from "./+types/terms-of-service";
import { BreadcrumbListJsonLd } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";
import { PolicyPage, PolicySection } from "./_shared/PolicyPage";

export const meta: Route.MetaFunction = () =>
  createPageMeta({
    title: "Terms of Service | AllTextConverters",
    description:
      "Terms for using the browser-based text utilities available on AllTextConverters.",
    pathname: "/terms-of-service",
    indexable: false,
  });

export default function TermsOfService() {
  return (
    <>
      <PolicyPage title="Terms of Service" updated="July 16, 2026">
        <PolicySection title="Using the tools">
          <p>
            AllTextConverters provides browser-based text utilities. You are
            responsible for reviewing output before relying on it, especially when
            formatting, encoding, file compatibility, or browser behavior matters.
          </p>
        </PolicySection>
        <PolicySection title="Appropriate use">
          <p>
            Do not use the site in a way that harms its availability, attempts to
            bypass security controls, or violates applicable law. Do not submit
            sensitive information through support unless it is necessary and safely
            redacted.
          </p>
        </PolicySection>
        <PolicySection title="Changes and availability">
          <p>
            Tools and supporting information may change as issues are corrected or
            browser behavior evolves. The site does not promise that every format or
            input will be supported in every browser.
          </p>
        </PolicySection>
        <PolicySection title="Questions">
          <p>
            Use the <Link className="font-medium text-slate-900 underline underline-offset-4" to="/contact">contact page</Link> for a correction or question. See the <Link className="font-medium text-slate-900 underline underline-offset-4" to="/privacy-policy">Privacy Policy</Link> for information about converter content and optional services.
          </p>
        </PolicySection>
      </PolicyPage>
      <BreadcrumbListJsonLd label="Terms of Service" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/terms-of-service" />
    </>
  );
}
