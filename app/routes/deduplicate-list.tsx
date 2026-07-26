import { redirect } from "react-router";
import type { Route } from "./+types/deduplicate-list";

export function loader({}: Route.LoaderArgs) {
  return redirect("/remove-duplicate-lines", { status: 301 });
}

export default function DeduplicateListRedirect() {
  return null;
}
