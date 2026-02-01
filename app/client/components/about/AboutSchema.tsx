import { useMemo } from "react";

export function AboutSchema() {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": "https://www.alltextconverters.com/#website",
          name: "AllTextConverters",
          url: "https://www.alltextconverters.com/",
          inLanguage: "en",
          description:
            "Free browser-based text tools for converting, cleaning, formatting, and analyzing text.",
        },
        {
          "@type": "Person",
          "@id": "https://www.suhassunder.com/#person",
          name: "Suhas Sunder",
          url: "https://www.suhassunder.com",
          jobTitle: "Software Developer",
          alumniOf: "Ontario Tech University",
          knowsAbout: [
            "Full-stack web development",
            "React",
            "TypeScript",
            "Remix",
            "Node.js",
            "Express",
            "PostgreSQL",
            "Prisma",
          ],
        },
        {
          "@type": "WebPage",
          "@id": "https://www.alltextconverters.com/about/#webpage",
          url: "https://www.alltextconverters.com/about/",
          name: "About AllTextConverters",
          isPartOf: { "@id": "https://www.alltextconverters.com/#website" },
          about: { "@id": "https://www.suhassunder.com/#person" },
          description:
            "About AllTextConverters: a privacy-first set of text conversion, cleanup, formatting, encoding/decoding, and counting tools.",
        },
      ],
    }),
    []
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
