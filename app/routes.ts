import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("word-counter", "routes/word-counter.tsx"),
  route("character-counter", "routes/character-counter.tsx"),
  route("case-converter", "routes/case-converter.tsx"),
  route("uppercase-converter", "routes/uppercase-converter.tsx"),
  route("lowercase-converter", "routes/lowercase-converter.tsx"),
  route("title-case-converter", "routes/title-case-converter.tsx"),
  route("sentence-case-converter", "routes/sentence-case-converter.tsx"),
  route("alternating-case-converter", "routes/alternating-case-converter.tsx"),
  route("text-cleaner", "routes/text-cleaner.tsx"),
  route("remove-extra-spaces", "routes/remove-extra-spaces.tsx"),
  route("whitespace-cleaner", "routes/whitespace-cleaner.tsx"),
  route("line-break-remover", "routes/line-break-remover.tsx"),
  route("remove-duplicate-lines", "routes/remove-duplicate-lines.tsx"),
  route("case-insensitive-sort", "routes/case-insensitive-sort.tsx"),
  route("base64-encode", "routes/base64-encode.tsx"),
  route("base64-decode", "routes/base64-decode.tsx"),
  route("url-encode", "routes/url-encode.tsx"),
  route("url-decode", "routes/url-decode.tsx"), 
  route("text-case-checker", "routes/text-case-checker.tsx"),
  route("match-case-converter", "routes/match-case-converter.tsx"),
  route("ascii-to-text", "routes/ascii-to-text.tsx"),
  route("text-to-ascii", "routes/text-to-ascii.tsx"),

  // Fallback
  route("*", "routes/not-found.tsx"),
  route("privacy-policy", "routes/privacy-policy.tsx"),
  route("terms-of-service", "routes/terms-of-service.tsx"),
  route("cookies-policy", "routes/cookies-policy.tsx"),
  route("contact", "routes/contact.tsx"),
] satisfies RouteConfig;
