export function toUppercase(input: string): string {
  // Keep behavior predictable across browsers. Use built-in Unicode uppercasing.
  // Note: locale-specific rules (e.g., Turkish i/İ) can differ by locale; we intentionally
  // avoid locale forcing so the result matches the user's environment.
  return (input ?? "").toUpperCase();
}
