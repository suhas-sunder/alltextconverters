import { useState } from "react";
import type { Route } from "./+types/url-encode";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { UrlEncodeToolCard } from "../client/components/url-encode/UrlEncodeToolCard";
import { ConverterFaqSection, ConverterInfoSection } from "../client/components/converter/ConverterInfoSections";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";

export const meta: Route.MetaFunction = () => createPageMeta({ title: "URL Encode: Component or Form Value | AllTextConverters", description: "Percent-encode text in URL component mode or form-value mode. Component spaces become %20; form spaces become +. Runs locally.", pathname: "/url-encode" });

export default function UrlEncodeRoute() { const [input, setInput] = useState(""); return <main className="min-h-screen bg-slate-100 font-sans text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-10 pt-7 sm:px-6 sm:pb-16"><div className="pb-1"><BreadcrumbRow label="URL Encoder" /></div><UrlEncodeToolCard input={input} setInput={setInput} /><AdSlot placement="below-utility" /><ConverterInfoSection kind="url-encode" /><AdSlot placement="info-square" className="mx-auto" /><ConverterFaqSection kind="url-encode" /></section><BreadcrumbListJsonLd label="URL Encoder" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/url-encode" /></main>; }
