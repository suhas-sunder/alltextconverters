import type { Route } from "./+types/list-to-csv";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { ListToCsvToolCard } from "../client/components/list-to-csv/ListToCsvToolCard";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";
export const meta: Route.MetaFunction = () => createPageMeta({ title: "List to CSV Converter | AllTextConverters", description: "Convert one item per line into a correctly escaped one-column CSV locally. Choose a header, delimiter, line ending, and Excel BOM.", pathname: "/list-to-csv" });
export default function ListToCsvRoute() { return <main className="min-h-screen bg-slate-100 text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-7 sm:px-6"><BreadcrumbRow label="List to CSV" /><ListToCsvToolCard /><AdSlot placement="below-utility" /></section><BreadcrumbListJsonLd label="List to CSV" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/list-to-csv" /></main>; }
