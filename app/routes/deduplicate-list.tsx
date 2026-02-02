// app/routes/deduplicate-list.tsx
import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

export const loader: LoaderFunction = async () => {
  throw redirect("/remove-duplicate-lines", { status: 301 });
};

export default function DeduplicateListRedirect() {
  return null;
}