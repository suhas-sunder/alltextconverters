import { parseCsv } from "../../text/csv";
export function commaSeparatedToList(input: string, delimiter = ",") {
  const result = parseCsv(input, delimiter);
  if ("error" in result) return { items: [], output: "", error: result.error };
  const items = result.rows.flat().map((value) => value.trim()).filter(Boolean);
  return { items, output: items.join("\n"), warnings: result.warnings };
}
