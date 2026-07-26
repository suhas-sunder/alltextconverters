import { redirect } from "react-router";
import type { Route } from "./+types/sort-list";

// Legacy alias retained for existing links. The sortable utility lives at the
// descriptive canonical route and this remains a single permanent hop.
export function loader({}: Route.LoaderArgs) {
  return redirect("/case-insensitive-sort", { status: 301 });
}

export default function SortListRedirect() {
  return null;
}
