export function toUrlEncoded(input: string): string {
  const value = String(input ?? "");
  // encodeURIComponent is deterministic and intended for individual URL components.
  // It throws URIError for invalid surrogate pairs. We let the caller handle errors.
  return encodeURIComponent(value);
}
