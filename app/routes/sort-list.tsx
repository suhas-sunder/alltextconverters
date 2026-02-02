// app/routes/case-insensitive-sort.tsx
import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { BreadcrumbListJsonLd, BreadcrumbRow } from "./_shared/Breadcrumbs";

export const loader: LoaderFunction = async () => {
  throw redirect("/sort-list", { status: 301 });
};

export default function CaseInsensitiveSortRedirect() {
  return null;
}