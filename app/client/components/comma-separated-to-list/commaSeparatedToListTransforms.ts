export function commaSeparatedToList(input: string) {
  // Split on commas, trim whitespace, ignore empty tokens.
  // Keeps original token order.
  const raw = String(input ?? "");
  const parts = raw.split(",");
  const cleaned = parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return {
    items: cleaned,
    output: cleaned.join("\n"),
  };
}
