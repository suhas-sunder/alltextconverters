import { useState } from "react";
import type { Route } from "./+types/text-to-binary";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { TextToBinaryToolCard } from "../client/components/text-to-binary/TextToBinaryToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({ title: "Text to Binary: UTF-8 Bytes | AllTextConverters", description: "Convert text to complete eight-bit UTF-8 binary bytes with spaces, no separator, or a custom literal separator. Runs locally.", pathname: "/text-to-binary" });

export default function TextToBinaryRoute() {
  const [input, setInput] = useState("");
  return <main className="min-h-screen bg-slate-100 font-sans text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-7 sm:px-6 sm:pb-16"><div className="pb-1"><BreadcrumbRow label="Text to Binary Converter" /></div><TextToBinaryToolCard input={input} setInput={setInput} /><AdSlot placement="below-utility" /><ConverterInfoSection kind="text-to-binary" /><AdSlot placement="info-square" className="mx-auto" /><ConverterFaqSection kind="text-to-binary" /></section><BreadcrumbListJsonLd label="Text to Binary Converter" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/text-to-binary" /></main>;
}
