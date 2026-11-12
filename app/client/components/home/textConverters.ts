import { base64ToBytes, bytesToBase64, decodeUtf8, encodeUtf8Strict } from "../../text/bytes";
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
    const result = encodeUtf8Strict(text);
    if (!result.bytes) throw new Error(result.errors[0]);
    return bytesToBase64(result.bytes);
  },
  "Decode Base64": (text) => {
    const result = base64ToBytes(text, false);
    if (!result.bytes) throw new Error(result.errors[0]);
    const decoded = decodeUtf8(result.bytes);
    if (decoded.errors.length) throw new Error(decoded.errors[0]);
    return decoded.output;
  },
  "Trim & Clean": (text) => text.replace(/\s+/g, " ").trim(),
};

export const converterKeys = Object.keys(converters);
