import { useState } from "react";
import type { Route } from "./+types/text-to-hex";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { TextToHexToolCard } from "../client/components/text-to-hex/TextToHexToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({ title: "Text to Hex: UTF-8 Bytes | AllTextConverters", description: "Convert Unicode text to lowercase or uppercase UTF-8 hexadecimal bytes with space, comma, no, or custom separators and optional 0x prefixes.", pathname: "/text-to-hex" });

export default function TextToHexRoute() { const [input, setInput] = useState(""); return <main className="min-h-screen bg-slate-100 font-sans text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-7 sm:px-6 sm:pb-16"><div className="pb-1"><BreadcrumbRow label="Text to Hex Converter" /></div><TextToHexToolCard input={input} setInput={setInput} /><AdSlot placement="below-utility" /><ConverterInfoSection kind="text-to-hex" /><AdSlot placement="info-square" className="mx-auto" /><ConverterFaqSection kind="text-to-hex" /></section><BreadcrumbListJsonLd label="Text to Hex Converter" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/text-to-hex" /></main>; }
