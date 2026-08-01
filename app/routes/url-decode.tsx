import { useState } from "react";
import type { Route } from "./+types/url-decode";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { UrlDecodeToolCard } from "../client/components/url-decode/UrlDecodeToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({ title: "URL Decode: Component or Form Value | AllTextConverters", description: "Strictly decode percent-encoded UTF-8 in component or form-value mode with visible errors for malformed escapes. Runs locally.", pathname: "/url-decode" });

export default function UrlDecodeRoute() { const [input, setInput] = useState(""); return <main className="min-h-screen bg-slate-100 font-sans text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-7 sm:px-6 sm:pb-16"><div className="pb-1"><BreadcrumbRow label="URL Decode" /></div><UrlDecodeToolCard input={input} setInput={setInput} /><AdSlot placement="below-utility" /><ConverterInfoSection kind="url-decode" /><AdSlot placement="info-square" className="mx-auto" /><ConverterFaqSection kind="url-decode" /></section><BreadcrumbListJsonLd label="URL Decode" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/url-decode" /></main>; }
