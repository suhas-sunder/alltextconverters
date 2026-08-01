import { toAlternatingCase, toLowerCaseText, toSentenceCase, toTitleCase, toUpperCaseText } from "../../text/case";

export type TextConverterFn = (text: string) => string;

export const converters: Record<string, TextConverterFn> = {
  UPPERCASE: toUpperCaseText,
  lowercase: toLowerCaseText,
  "Title Case": toTitleCase,
  "Capitalized Case": (text) => text.replace(/\b\w/g, (match) => match.toUpperCase()),
  "aLtErNaTiNg cAsE": (text) => toAlternatingCase(text),
  "InVeRsE CaSe": (text) => Array.from(text).map((character) => character === character.toUpperCase() ? character.toLowerCase() : character.toUpperCase()).join(""),
  "Sentence case": toSentenceCase,
  "Encode Base64": (text) => {
    try { return btoa(String.fromCharCode(...new TextEncoder().encode(text))); }
    catch { return "Encoding failed. Check input text."; }
  },
  "Decode Base64": (text) => {
    try { return new TextDecoder().decode(Uint8Array.from(atob(text), (character) => character.charCodeAt(0))); }
    catch { return "Invalid Base64 string."; }
  },
  "Trim & Clean": (text) => text.replace(/\s+/g, " ").trim(),
};

export const converterKeys = Object.keys(converters);
