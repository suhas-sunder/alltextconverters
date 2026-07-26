export const siteConfig = {
  name: "AllTextConverters",
  origin: "https://www.alltextconverters.com",
  defaultTitle: "AllTextConverters | Free Browser-Based Text Tools",
  titleTemplate: "%s | AllTextConverters",
  defaultDescription:
    "Free browser-based text tools for converting, cleaning, formatting, encoding, and counting text.",
  maintainerName: "Suhas Sunder",
  portfolioUrl: "https://www.suhassunder.com/",
  linkedInUrl: "https://www.linkedin.com/in/s-sunder/",
  contactPath: "/contact",
  profileImageSource: "app/client/assets/images/suhas.jpg",
  // Intentionally null until a real, production-served social image is supplied.
  socialImageUrl: null as string | null,
  // Intentionally false until app/client/assets/images/suhas.jpg exists.
  profileImageUrl: null as string | null,
  advertisingEnabled: false,
  adPlaceholderEnabled: true,
  adMode: "placeholder" as "off" | "reserved" | "placeholder" | "live",
} as const;

export const indexablePaths = [
  "/",
  "/word-counter",
  "/character-counter",
  "/case-converter",
  "/uppercase-converter",
  "/lowercase-converter",
  "/title-case-converter",
  "/sentence-case-converter",
  "/alternating-case-converter",
  "/text-cleaner",
  "/remove-extra-spaces",
  "/whitespace-cleaner",
  "/line-break-remover",
  "/remove-duplicate-lines",
  "/case-insensitive-sort",
  "/base64-encode",
  "/base64-decode",
  "/url-encode",
  "/url-decode",
  "/text-case-checker",
  "/match-case-converter",
  "/ascii-to-text",
  "/text-to-ascii",
  "/json-to-text",
  "/text-to-json",
  "/xml-to-text",
  "/text-to-xml",
  "/html-to-text",
  "/text-to-html",
  "/comma-separated-to-list",
  "/list-to-comma-separated",
  "/list-to-table",
  "/table-to-list",
  "/comma-to-json-array",
  "/json-array-to-list",
  "/text-to-comma-separated-list",
  "/text-to-bulleted-text-list",
  "/text-to-ordered-list",
  "/binary-to-text",
  "/text-to-binary",
  "/hex-to-text",
  "/text-to-hex",
  "/remove-all-styling-from-text",
  "/contact",
  "/about",
] as const;

export const noindexCanonicalPaths = [
  "/privacy-policy",
  "/terms-of-service",
  "/cookies-policy",
] as const;

const canonicalPathSet = new Set<string>([
  ...indexablePaths,
  ...noindexCanonicalPaths,
]);
const indexablePathSet = new Set<string>(indexablePaths);

export function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return `/${pathname.replace(/^\/+|\/+$/g, "")}`;
}

export function canonicalUrl(pathname: string) {
  const path = normalizePathname(pathname);
  return path === "/" ? siteConfig.origin : `${siteConfig.origin}${path}`;
}

export function isCanonicalPath(pathname: string) {
  return canonicalPathSet.has(normalizePathname(pathname));
}

export function isIndexablePath(pathname: string) {
  return indexablePathSet.has(normalizePathname(pathname));
}

export function isNoindexCanonicalPath(pathname: string) {
  return noindexCanonicalPaths.includes(
    normalizePathname(pathname) as (typeof noindexCanonicalPaths)[number],
  );
}
