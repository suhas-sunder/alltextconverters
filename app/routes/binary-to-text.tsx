import { useState } from "react";
import type { Route } from "./+types/binary-to-text";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { BinaryToTextToolCard } from "../client/components/binary-to-text/BinaryToTextToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({ title: "Binary to Text: Strict UTF-8 Decoder | AllTextConverters", description: "Decode continuous, space-separated, or custom-separated eight-bit binary bytes as strict UTF-8 with visible validation errors.", pathname: "/binary-to-text" });

export default function BinaryToTextRoute() {
  const [input, setInput] = useState("");
  return <main className="min-h-screen bg-slate-100 font-sans text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-7 sm:px-6 sm:pb-16"><div className="pb-1"><BreadcrumbRow label="Binary to Text" /></div><BinaryToTextToolCard input={input} setInput={setInput} /><AdSlot placement="below-utility" /><ConverterInfoSection kind="binary-to-text" /><AdSlot placement="info-square" className="mx-auto" /><ConverterFaqSection kind="binary-to-text" /></section><BreadcrumbListJsonLd label="Binary to Text" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/binary-to-text" /></main>;
}
