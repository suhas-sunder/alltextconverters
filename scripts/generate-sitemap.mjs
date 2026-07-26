import { readFile, writeFile } from "node:fs/promises";

const configPath = new URL("../app/site-config.ts", import.meta.url);
const outputPath = new URL("../public/sitemap.xml", import.meta.url);
const config = await readFile(configPath, "utf8");
const origin = config.match(/origin:\s*"([^"]+)"/)?.[1];
const array = config.match(/export const indexablePaths = \[([\s\S]*?)\] as const;/)?.[1];

if (!origin || !array) throw new Error("Could not read the canonical site configuration.");

const paths = [...array.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
const urls = paths.map((path) => (path === "/" ? origin : `${origin}${path}`));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

await writeFile(outputPath, xml, "utf8");
