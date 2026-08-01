import { toAlternatingCase as sharedAlternatingCase } from "../../text/case";
export function toAlternatingCase(input: string, ignoreSpaces = true): string { return sharedAlternatingCase(input, { start: "lowercase", unit: ignoreSpaces ? "letters" : "graphemes" }); }
