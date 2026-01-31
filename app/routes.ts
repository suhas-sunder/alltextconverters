import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("word-counter", "routes/word-counter.tsx"),
  route("character-counter", "routes/character-counter.tsx"),
  route("case-converter", "routes/case-converter.tsx"),
  route("uppercase-converter", "routes/uppercase-converter.tsx"),
  route("lowercase-converter", "routes/lowercase-converter.tsx"),
  route("title-case-converter", "routes/title-case-converter.tsx"),

  // Fallback
  route("*", "routes/not-found.tsx"),
  route("privacy-policy", "routes/privacy-policy.tsx"),
  route("terms-of-service", "routes/terms-of-service.tsx"),
  route("cookies-policy", "routes/cookies-policy.tsx"),
  route("contact", "routes/contact.tsx"),
] satisfies RouteConfig;
