export type TextConverterFn = (t: string) => string;

export const converters: Record<string, TextConverterFn> = {

  UPPERCASE: (t) => t.toUpperCase(),
  lowercase: (t) => t.toLowerCase(),
  "Title Case": (t) => {
    const smallWords =
      /\b(a|an|and|as|at|but|by|for|if|in|of|on|or|the|to|with)\b/gi;
    return t
      .replace(
        /\b([A-Za-zÀ-ÖØ-öø-ÿ])([A-Za-zÀ-ÖØ-öø-ÿ]*)\b/g,
        (_, first, rest) => first.toUpperCase() + rest.toLowerCase()
      )
      .replace(smallWords, (w) => w.toLowerCase());
  },

  "Capitalized Case": (t) => t.replace(/\b\w/g, (m) => m.toUpperCase()),
  "aLtErNaTiNg cAsE": (t) =>
    t
      .split("")
      .map((c, i) => (i % 2 ? c.toLowerCase() : c.toUpperCase()))
      .join(""),
  "InVeRsE CaSe": (t) =>
    [...t]
      .map((ch) =>
        ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()
      )
      .join(""),
  "Sentence case": (t) =>
    t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (m) => m.toUpperCase()),
  "Encode Base64": (t) => {
    try {
      const binary = new TextEncoder().encode(t);
      const base64 = btoa(String.fromCharCode(...binary));
      return base64;
    } catch {
      return "⚠️ Encoding failed. Check input text.";
    }
  },

  "Decode Base64": (t) => {
    try {
      const binary = atob(t);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return "⚠️ Invalid Base64 string.";
    }
  },
  "Trim & Clean": (t) => t.replace(/\s+/g, " ").trim(),
};

export const converterKeys = Object.keys(converters);
