import { canonicalUrl, siteConfig } from "../../../site-config";

export function AboutSchema() {
  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${siteConfig.portfolioUrl}#person`,
    name: siteConfig.maintainerName,
    url: siteConfig.portfolioUrl,
    sameAs: [siteConfig.portfolioUrl, siteConfig.linkedInUrl],
  };

  if (siteConfig.profileImageUrl) person.image = siteConfig.profileImageUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${canonicalUrl("/")}#website`,
        name: siteConfig.name,
        url: canonicalUrl("/"),
        description: siteConfig.defaultDescription,
        creator: { "@id": `${siteConfig.portfolioUrl}#person` },
      },
      person,
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl("/about")}#webpage`,
        url: canonicalUrl("/about"),
        name: "About AllTextConverters",
        isPartOf: { "@id": `${canonicalUrl("/")}#website` },
        about: { "@id": `${siteConfig.portfolioUrl}#person` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
