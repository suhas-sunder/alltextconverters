import { Link } from "react-router";
import type { Route } from "./+types/privacy-policy";
import { BreadcrumbListJsonLd } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";
import { PolicyPage, PolicySection } from "./_shared/PolicyPage";

export const meta: Route.MetaFunction = () =>
  createPageMeta({
    title: "Privacy Policy | AllTextConverters",
    description:
      "How AllTextConverters handles local converter text, consent choices, technical information, and optional services.",
    pathname: "/privacy-policy",
    indexable: false,
  });

export default function PrivacyPolicy() {
  return (
    <>
      <PolicyPage title="Privacy Policy" updated="July 16, 2026">
        <PolicySection title="Converter content">
          <p>
            Supported converter operations are designed to run in your browser.
            Pasted input and generated output are not intentionally sent to an
            AllTextConverters application server for conversion, and must not be
            included in analytics or error-monitoring events.
          </p>
          <p>
            You remain responsible for deciding whether it is appropriate to paste
            sensitive material into your device and browser environment.
          </p>
        </PolicySection>
        <PolicySection title="Site operations">
          <p>
            Operating a website can involve technical information such as IP-derived
            security data, request logs, browser details, and consent preferences.
            This information is used for reliability, security, and the choices you
            make on the site. It is not a substitute for converter content and must
            not be used to reconstruct text you process with a tool.
          </p>
        </PolicySection>
        <PolicySection title="Optional analytics and advertising">
          <p>
            The site may use optional analytics or display third-party advertising in
            the future. Optional categories are off by default in the site&apos;s consent
            controls. Where permitted and configured, advertising or analytics
            services may use cookies or similar technologies to process technical
            information.
          </p>
          <p>
            Converter input and output are not intentionally supplied to advertisers.
            Your choices can affect whether optional analytics or personalized
            advertising is available when those services are introduced.
          </p>
        </PolicySection>
        <PolicySection title="Your choices">
          <p>
            You can reopen and change optional consent choices at any time using
            <span> </span>the <strong>Privacy choices</strong> control in the footer.
            Essential storage is limited to functionality such as remembering that
            choice.
          </p>
        </PolicySection>
        <PolicySection title="Contact">
          <p>
            For privacy questions or to report a tool issue, use the <Link className="font-medium text-slate-900 underline underline-offset-4" to="/contact">contact page</Link>. Do not include passwords, private documents, or unredacted sensitive text in an email.
          </p>
        </PolicySection>
      </PolicyPage>
      <BreadcrumbListJsonLd label="Privacy Policy" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/privacy-policy" />
    </>
  );
}
