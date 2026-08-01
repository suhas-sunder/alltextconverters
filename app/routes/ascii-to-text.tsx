import { useState } from "react";
import type { Route } from "./+types/ascii-to-text";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { AsciiToTextToolCard } from "../client/components/ascii-to-text/AsciiToTextToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({ title: "ASCII Decimal to Text Converter | AllTextConverters", description: "Strictly decode decimal ASCII values from 0 through 127, including accurately labeled control characters, in your browser.", pathname: "/ascii-to-text" });

export default function AsciiToTextRoute() {
  const [input, setInput] = useState("");
  return <main className="min-h-screen bg-slate-100 font-sans text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-7 sm:px-6 sm:pb-16"><div className="pb-1"><BreadcrumbRow label="ASCII to Text" /></div><AsciiToTextToolCard input={input} setInput={setInput} /><AdSlot placement="below-utility" /><ConverterInfoSection kind="ascii-to-text" /><AdSlot placement="info-square" className="mx-auto" /><ConverterFaqSection kind="ascii-to-text" /></section><BreadcrumbListJsonLd label="ASCII to Text" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/ascii-to-text" /></main>;
}
