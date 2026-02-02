/* eslint-disable react/no-unescaped-entities */

import * as React from "react";
import { Link } from "react-router";
import type { Route } from "./+types/privacy-policy";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

export const meta: Route.MetaFunction = () => {
  const canonical = "https://www.alltextconverters.com/privacy-policy";

  const title = "Privacy Policy | AllTextConverters";
  const description =
    "Read the AllTextConverters privacy policy. Learn what data is collected, how it is used, and the choices you have when using our text converters and word tools.";

  // Update this to your real OG image path for AllTextConverters
  const ogImage =
    "https://www.alltextconverters.com/og/alltextconverters-privacy.jpg";

  return [
    { title },
    { name: "description", content: description },

    { tagName: "link", rel: "canonical", href: canonical },

    { property: "og:site_name", content: "AllTextConverters" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: "AllTextConverters privacy policy" },
    { property: "og:locale", content: "en_US" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },

    // Keep this noindex if you intentionally don't want it indexed.
    // If you DO want it indexed, switch to: "index,follow".
    { name: "robots", content: "noindex,follow" },
  ];
};

export default function PrivacyPolicy({}: Route.ComponentProps) {
  return (
    <>
      <main className="min-h-[100dvh] bg-slate-50 text-slate-900">
        <div className="max-w-[1180px] mx-auto px-4 pt-6 pb-12">
          {/* Header */}
          <header className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <BreadcrumbRow label="Privacy Policy" />

            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Last updated January 10, 2026
            </p>

            <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
              <p>
                This privacy notice for AllTextConverters
                (https://www.alltextconverters.com) ("we", "us", or "our")
                describes how and why we might collect, store, use, and/or share
                ("process") your information when you use our services
                ("Services"), such as when you:
              </p>

              <ul className="mt-4 list-inside list-disc flex flex-col gap-2 pl-5">
                <li>
                  Visit our website at https://www.alltextconverters.com, or any
                  website of ours that links to this privacy notice
                </li>
                <li>
                  Engage with us in other related ways, including support
                  requests, feedback, marketing, or events (for example, if we
                  offer optional accounts, subscriptions, or purchases in the
                  future)
                </li>
              </ul>

              <p>
                Questions or concerns? Reading this privacy notice will help you
                understand your privacy rights and choices. If you do not agree
                with our policies and practices, please do not use our Services.
              </p>

              <p className="space-y-1">
                <span className="block">
                  Data controller: AllTextConverters is responsible for deciding
                  how your personal information is processed for the purposes
                  described in this privacy notice.
                </span>
                <span className="block">
                  Contact: support@alltextconverters.com (Toronto, Ontario,
                  Canada).
                </span>
              </p>
            </div>
          </header>

          {/* Content */}
          <article className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="prose prose-slate max-w-none">
              <Section title="SUMMARY OF KEY POINTS">
                <p>
                  This summary provides key points from our privacy notice. You
                  can find more details about any topic by using the table of
                  contents within this page.
                </p>
                <p>
                  What personal information do we process? When you visit, use,
                  or navigate our Services, we may process personal information
                  depending on how you interact with the Services, the choices
                  you make, and the features you use.
                </p>
                <p>
                  How do we process your information? We process your
                  information to provide, improve, and administer our Services,
                  communicate with you, for security and fraud prevention, to
                  measure performance (including analytics), and to comply with
                  law. We process your information only when we have a valid
                  legal basis.
                </p>
                <p>
                  In what situations and with which parties do we share personal
                  information? We may share information in specific situations
                  and with specific third parties described below (for example,
                  analytics providers, ad networks, and service providers).
                </p>
                <p>
                  What are your rights? Depending on where you are located, you
                  may have certain rights regarding your personal information.
                </p>
              </Section>

              <Section title="1. WHAT INFORMATION DO WE COLLECT?">
                <h3 className="text-lg font-bold text-slate-900">
                  Personal information you disclose to us
                </h3>
                <p>
                  In Short: We collect personal information that you provide to
                  us.
                </p>

                <p>
                  We collect personal information that you voluntarily provide
                  to us when you contact us (for example, by email), submit
                  feedback, or request support. If we introduce optional
                  accounts, subscriptions, or purchases in the future, we may
                  also collect information needed to provide those features.
                </p>

                <p>
                  <span>
                    Personal Information Provided by You. The personal
                    information that we collect depends on the context of your
                    interactions with us and the Services. It may include:
                  </span>
                </p>
                <ul>
                  <li>email addresses</li>
                  <li>names or usernames (if we offer accounts)</li>
                  <li>contact preferences</li>
                  <li>support messages and attachments you choose to send</li>
                  <li>billing details (only if we offer paid features)</li>
                </ul>

                <p>
                  Sensitive Information. We do not intentionally process
                  sensitive information.
                </p>

                <p>
                  Payment Data. If we introduce paid features, payment
                  processing may be handled by third-party payment processors
                  (such as Stripe). We do not store full payment card details on
                  our servers. You can review Stripe’s privacy notice here:{" "}
                  <a
                    href="https://stripe.com/en-ca/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://stripe.com/en-ca/privacy
                  </a>
                  .
                </p>

                <p>
                  Affiliate Links and Referrals. We may include affiliate links
                  on our Services. If you click an affiliate link and make a
                  purchase, we may receive a commission. Affiliate partners may
                  use cookies or similar technologies to track referrals
                  according to their own privacy policies.
                </p>

                <h3 className="text-lg font-bold text-slate-900 mt-8">
                  Information automatically collected
                </h3>
                <p>
                  <b>In Short:</b> Some information (such as IP address and
                  browser/device characteristics) is collected automatically
                  when you visit our Services.
                </p>

                <p>
                  We automatically collect certain information when you visit,
                  use, or navigate the Services. This information does not
                  reveal your specific identity (like your name) but may include
                  device and usage information such as IP address, browser and
                  device characteristics, operating system, language
                  preferences, referring URLs, approximate location, and
                  information about how and when you use the Services.
                </p>

                <p>
                  Like many websites, we also collect information through
                  cookies and similar technologies. You can find out more in our
                  Cookie Notice:{" "}
                  <a href="/cookies" className="cursor-pointer hover:underline">
                    https://www.alltextconverters.com/cookies
                  </a>
                  .
                </p>

                <p>
                  Analytics. We may use analytics tools (for example, PostHog)
                  to understand usage and improve the Services. Analytics may
                  collect device and browser details, pages viewed,
                  interactions, and approximate location (based on IP).
                </p>

                <p className="mt-4">
                  <span>The information we collect may include:</span>
                </p>
                <ul>
                  <li>
                    Log and Usage Data (e.g., pages viewed, feature usage,
                    timestamps, error reports).
                  </li>
                  <li>
                    Device Data (e.g., browser type, operating system, device
                    identifiers).
                  </li>
                  <li>
                    Location Data (generally approximate, based on IP; precise
                    only if explicitly enabled).
                  </li>
                  <li>
                    Advertising and Measurement Data (if we show ads, ad
                    interactions and related identifiers).
                  </li>
                </ul>
              </Section>

              <Section title="2. HOW DO WE PROCESS YOUR INFORMATION?">
                <p>
                  In Short: We process your information to provide, improve, and
                  administer the Services, communicate with you, for security
                  and fraud prevention, and to comply with law.
                </p>

                <p>
                  We may process your personal information for reasons such as:
                </p>
                <ul>
                  <li>
                    To provide and maintain site functionality and performance.
                  </li>
                  <li>To respond to support requests and user inquiries.</li>
                  <li>
                    To improve our converters and tools based on usage trends
                    and feedback.
                  </li>
                  <li>
                    To deliver and measure advertising (where applicable and
                    permitted).
                  </li>
                  <li>
                    To protect the Services (security monitoring, abuse
                    prevention, fraud detection).
                  </li>
                  <li>
                    To comply with legal obligations and enforce our rights.
                  </li>
                </ul>
              </Section>

              <Section title="3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?">
                <p>
                  In Short: We only process your personal information when we
                  believe it is necessary and we have a valid legal reason
                  (legal basis) to do so under applicable law, such as your
                  consent, performance of a contract, legitimate interests, and
                  legal obligations.
                </p>

                <h3 className="text-lg font-bold text-slate-900">
                  If you are located in the EU or UK, this section applies to
                  you.
                </h3>
                <ul>
                  <li>
                    Consent: You can withdraw consent at any time where
                    processing is based on consent.
                  </li>
                  <li>
                    Performance of a Contract: If we offer accounts or paid
                    features, we may process data to deliver those services.
                  </li>
                  <li>
                    Legitimate Interests: Improving the Services, ensuring
                    security, preventing fraud, and measuring performance.
                  </li>
                  <li>Legal Obligations: Where required by applicable law.</li>
                </ul>

                <h3 className="text-lg font-bold text-slate-900 mt-6">
                  If you are located in Canada, this section applies to you.
                </h3>
                <p>
                  We may process your information with express or implied
                  consent, depending on the circumstances and applicable law.
                </p>
              </Section>

              <Section title="4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?">
                <p>
                  In Short: We may share information in specific situations
                  and/or with certain third parties.
                </p>

                <p>We may share your information with third parties such as:</p>
                <ul>
                  <li>Analytics providers (for example, PostHog).</li>
                  <li>
                    Advertising networks and partners (for example, Google
                    AdSense), if ads are shown.
                  </li>
                  <li>
                    Payment processors (for example, Stripe) if we offer paid
                    features.
                  </li>
                  <li>Affiliate partners when you click affiliate links.</li>
                  <li>
                    Service providers (hosting, security, email providers,
                    customer support tools).
                  </li>
                </ul>

                <p>We may also share information in these situations:</p>
                <ul>
                  <li>
                    Business Transfers: During mergers, acquisitions, or sale of
                    assets.
                  </li>
                  <li>
                    Legal Requirements: To comply with law or protect rights,
                    safety, and prevent fraud.
                  </li>
                </ul>
              </Section>

              <Section title="5. WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?">
                <p>
                  In Short: We are not responsible for the safety of information
                  you share with third parties we may link to or who advertise
                  on our Services.
                </p>
                <p>
                  The Services may link to third-party websites or contain
                  third-party ads. We do not control those third parties and are
                  not responsible for their content, policies, or practices.
                </p>
              </Section>

              <Section title="6. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?">
                <p>
                  In Short: We may use cookies and similar technologies to
                  collect and store information.
                </p>
                <p>
                  Details about how we use cookies and how you can control them
                  are set out in our Cookie Notice:{" "}
                  <a href="/cookies" className="cursor-pointer hover:underline">
                    https://www.alltextconverters.com/cookies
                  </a>
                  .
                </p>
              </Section>

              <Section title="7. HOW LONG DO WE KEEP YOUR INFORMATION?">
                <p>
                  In Short: We keep your information for as long as necessary to
                  fulfill the purposes outlined in this privacy notice unless
                  otherwise required by law.
                </p>
                <p>
                  Retention periods depend on the type of data and why it was
                  collected. We may retain certain data for security, fraud
                  prevention, compliance, and legitimate business purposes.
                </p>
              </Section>

              <Section title="8. DO WE COLLECT INFORMATION FROM MINORS?">
                <p>
                  In Short: We do not knowingly collect personal information
                  from children under 13 years of age.
                </p>
                <p>
                  The Services are intended for a general audience and are not
                  directed to children under 13. If you believe a child has
                  provided personal information to us, contact us at{" "}
                  <a
                    href="mailto:support@alltextconverters.com"
                    className="cursor-pointer hover:underline"
                  >
                    support@alltextconverters.com
                  </a>
                  .
                </p>
              </Section>

              <Section title="9. WHAT ARE YOUR PRIVACY RIGHTS?">
                <p>
                  In Short: Depending on where you are located, you may have
                  certain rights regarding your personal information.
                </p>
                <p>
                  You can request access to, correction of, or deletion of your
                  personal information by contacting us at{" "}
                  <a
                    href="mailto:support@alltextconverters.com"
                    className="cursor-pointer hover:underline"
                  >
                    support@alltextconverters.com
                  </a>
                  . We may need to verify your identity before responding.
                </p>
              </Section>

              <Section title="10. DO WE MAKE UPDATES TO THIS NOTICE?">
                <p>In Short: Yes, we will update this notice as necessary.</p>
                <p>
                  We may update this privacy notice from time to time. The
                  updated version will be indicated by an updated "Last updated"
                  date and will be effective as soon as it is accessible.
                </p>
              </Section>

              <Section title="11. CONTACT US">
                <p>
                  If you have questions or comments about this notice, email us
                  at{" "}
                  <a
                    href="mailto:support@alltextconverters.com"
                    className="cursor-pointer hover:underline"
                  >
                    support@alltextconverters.com
                  </a>{" "}
                  or contact us by post at:
                </p>
                <p>https://www.alltextconverters.com/</p>
                <p>Toronto, Ontario</p>
                <p>Canada</p>
              </Section>
            </div>
          </article>
        </div>
              <BreadcrumbListJsonLd label="Privacy Policy" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/privacy-policy" />
</main>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-lg md:text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-3 text-sm md:text-base text-slate-700 leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}