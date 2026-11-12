export const queryByteLimit = 64 * 1024;
export const queryRowLimit = 250;

export type QueryPair = { key: string; value: string };
export type QueryInput = { base: string; fragment: string; pairs: QueryPair[] };
type Result<T> = { ok: true; value: T } | { ok: false; error: string };
const encoder = new TextEncoder();

function tooLarge(value: string) {
  return value.length > queryByteLimit || encoder.encode(value).length > queryByteLimit;
}

function isHttpUrl(value: string) {
  const authority = /^https?:\/\/([^/?#]+)/i.exec(value)?.[1];
  if (!authority || authority.includes("@") || /[\u0000-\u0020\u007f\uD800-\uDFFF\\]/u.test(value)) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname && !url.username && !url.password);
  } catch {
    return false;
  }
}

export function parseQueryInput(source: string, mode: "url" | "query"): Result<QueryInput> {
  if (tooLarge(source)) return { ok: false, error: "Use at most 64 KiB of input." };
  let base = "";
  let fragment = "";
  let query = source;
  if (mode === "url") {
    const hashAt = source.indexOf("#");
    const beforeHash = hashAt < 0 ? source : source.slice(0, hashAt);
    fragment = hashAt < 0 ? "" : source.slice(hashAt);
    const queryAt = beforeHash.indexOf("?");
    base = queryAt < 0 ? beforeHash : beforeHash.slice(0, queryAt);
    query = queryAt < 0 ? "" : beforeHash.slice(queryAt + 1);
    if (!isHttpUrl(base) || /[\u0000-\u0020\u007f\uD800-\uDFFF]/u.test(source)) {
      return { ok: false, error: "Enter an absolute HTTP or HTTPS URL without credentials, raw spaces or control characters." };
    }
  } else {
    if (source.startsWith("?")) query = source.slice(1);
    if (/[\uD800-\uDFFF]/u.test(query)) return { ok: false, error: "The query contains an unpaired Unicode surrogate." };
    if (query.includes("#")) return { ok: false, error: "Encode a literal # as %23 or choose Full URL to preserve a fragment." };
  }

  const pairs: QueryPair[] = [];
  for (const [index, entry] of query.split("&").entries()) {
    if (!entry) continue;
    if (pairs.length === queryRowLimit) return { ok: false, error: "Use at most 250 parameters." };
    const equals = entry.indexOf("=");
    const key = equals < 0 ? entry : entry.slice(0, equals);
    const value = equals < 0 ? "" : entry.slice(equals + 1);
    try {
      // URLSearchParams decodes malformed bytes lossily. Validate each component first.
      pairs.push({ key: decodeURIComponent(key.replaceAll("+", " ")), value: decodeURIComponent(value.replaceAll("+", " ")) });
    } catch {
      return { ok: false, error: `Parameter ${index + 1} contains an invalid percent escape or invalid UTF-8.` };
    }
  }
  return { ok: true, value: { base, fragment, pairs } };
}

export function buildQueryOutput(input: QueryInput, kind: "url" | "query" | "json", spaces: "plus" | "percent"): Result<string> {
  if (input.pairs.length > queryRowLimit) return { ok: false, error: "Use at most 250 parameters." };
  let totalBytes = 0;
  const params = new URLSearchParams();
  for (const { key, value } of input.pairs) {
    if (tooLarge(key) || tooLarge(value)) return { ok: false, error: "Use at most 64 KiB of parameter data." };
    totalBytes += encoder.encode(key).length + encoder.encode(value).length;
    if (totalBytes > queryByteLimit) return { ok: false, error: "Use at most 64 KiB of parameter data." };
    if (/[\uD800-\uDFFF]/u.test(key) || /[\uD800-\uDFFF]/u.test(value)) {
      return { ok: false, error: "A parameter contains an unpaired Unicode surrogate." };
    }
    params.append(key, value);
  }
  if (kind === "json") return { ok: true, value: JSON.stringify(input.pairs, null, 2) };
  const encoded = params.toString();
  const query = spaces === "percent" ? encoded.replaceAll("+", "%20") : encoded;
  if (kind === "query") return { ok: true, value: query };
  if (!isHttpUrl(input.base) || /[?#]/.test(input.base) || tooLarge(input.base + input.fragment) ||
      (input.fragment && (!input.fragment.startsWith("#") || /[\u0000-\u0020\u007f\uD800-\uDFFF]/u.test(input.fragment)))) {
    return { ok: false, error: "Enter an HTTP or HTTPS base URL without a query and a valid optional fragment starting with #." };
  }
  return { ok: true, value: input.base + (query ? "?" + query : "") + input.fragment };
}
