import { useState } from "react";
import type { Route } from "./+types/hex-to-text";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { HexToTextToolCard } from "../client/components/hex-to-text/components/HexToTextToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({ title: "Hex to Text: Strict UTF-8 Decoder | AllTextConverters", description: "Decode continuous, spaced, comma-separated, prefixed, or custom-separated hexadecimal bytes as strict UTF-8 in your browser.", pathname: "/hex-to-text" });

export default function HexToTextRoute() { const [input, setInput] = useState(""); return <main className="min-h-screen bg-slate-100 font-sans text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-7 sm:px-6 sm:pb-16"><div className="pb-1"><BreadcrumbRow label="Hex to Text" /></div><HexToTextToolCard input={input} setInput={setInput} /><AdSlot placement="below-utility" /><ConverterInfoSection kind="hex-to-text" /><AdSlot placement="info-square" className="mx-auto" /><ConverterFaqSection kind="hex-to-text" /></section><BreadcrumbListJsonLd label="Hex to Text" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/hex-to-text" /></main>; }
