export const xmlFormatLimits = { inputBytes: 512 * 1024, outputBytes: 2 * 1024 * 1024, depth: 128, tokens: 30_000, preview: 16 * 1024 } as const;
export type XmlFormatOperation = "format" | "compact" | "validate";
export type XmlFormatIndent = "two" | "four" | "tab";
export type XmlFormatOptions = { operation: XmlFormatOperation; indent: XmlFormatIndent; reindentContent: boolean };
export type XmlFormatPosition = { offset: number; line: number; column: number };
export type XmlFormatResult = {
  output: string | null;
  sourceBytes: number;
  outputBytes: number | null;
  elements: number;
  depth: number;
  protectedSections: number;
};
export type XmlFormatError = { message: string; position?: XmlFormatPosition };
export type XmlFormatResponse = { result: XmlFormatResult } | { error: XmlFormatError };

export type XmlNativeMetadata = { count: number; preserveIndices: number[]; includeIndex: number | null };
export type XmlValidationShape = {
  rootName: string | null;
  elementCount: number;
  parsererrorNames: { start: number; end: number }[];
};
export type XmlWorkerRequest =
  | { kind: "start"; source: string; options: XmlFormatOptions }
  | { kind: "finish"; metadata: XmlNativeMetadata };
export type XmlWorkerResponse =
  | { kind: "check"; bom: number; shape: XmlValidationShape }
  | { kind: "result"; response: XmlFormatResponse };
