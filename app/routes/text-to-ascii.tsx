import { useState } from "react";
import type { Route } from "./+types/text-to-ascii";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { TextToAsciiToolCard } from "../client/components/text-to-ascii/TextToAsciiToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({ title: "Text to ASCII Decimal Converter | AllTextConverters", description: "Convert strict ASCII text to decimal values from 0 through 127. Non-ASCII characters are rejected without transliteration.", pathname: "/text-to-ascii" });

export default function TextToAsciiRoute() {
  const [input, setInput] = useState("");
  return <main className="min-h-screen bg-slate-100 font-sans text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-7 sm:px-6 sm:pb-16"><div className="pb-1"><BreadcrumbRow label="Text to ASCII" /></div><TextToAsciiToolCard input={input} setInput={setInput} /><AdSlot placement="below-utility" /><ConverterInfoSection kind="text-to-ascii" /><AdSlot placement="info-square" className="mx-auto" /><ConverterFaqSection kind="text-to-ascii" /></section><BreadcrumbListJsonLd label="Text to ASCII" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/text-to-ascii" /></main>;
}
