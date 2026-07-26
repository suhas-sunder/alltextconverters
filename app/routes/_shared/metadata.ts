import { canonicalUrl, siteConfig } from "../../site-config";

type PageMetaOptions = {
  title: string;
  description: string;
  pathname: string;
  indexable?: boolean;
};

export function createPageMeta({
  title,
  description,
  pathname,
  indexable = true,
}: PageMetaOptions) {
  const canonical = canonicalUrl(pathname);
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonical },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "robots", content: indexable ? "index,follow" : "noindex,follow" },
  ];

  if (siteConfig.socialImageUrl) {
    meta.push({ property: "og:image", content: siteConfig.socialImageUrl });
    meta.push({ name: "twitter:image", content: siteConfig.socialImageUrl });
  }

  return meta;
}

export function createCanonicalMeta(pathname: string) {
  return { tagName: "link", rel: "canonical", href: canonicalUrl(pathname) };
}
