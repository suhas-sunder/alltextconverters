import type { Route } from "./+types/csv-to-list";
import { AdSlot } from "../client/components/advertising/AdSlot";
import { CsvToListToolCard } from "../client/components/csv-to-list/CsvToListToolCard";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";
import { createPageMeta } from "./_shared/metadata";
export const meta: Route.MetaFunction = () => createPageMeta({ title: "CSV to List Converter | AllTextConverters", description: "Extract a selected column from quoted CSV or delimited text into a list, entirely in your browser.", pathname: "/csv-to-list" });
export default function CsvToListRoute() { return <main className="min-h-screen bg-slate-100 text-slate-900"><section className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-7 sm:px-6"><BreadcrumbRow label="CSV to List" /><CsvToListToolCard /><AdSlot placement="below-utility" /></section><BreadcrumbListJsonLd label="CSV to List" homeUrl="https://www.alltextconverters.com/" currentUrl="https://www.alltextconverters.com/csv-to-list" /></main>; }
