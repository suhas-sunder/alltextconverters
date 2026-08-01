import { applyCaseTransform as applyShared, type CaseMode as SharedCaseMode } from "../../text/case";
export type CaseMode = "UPPERCASE" | "lowercase" | "Title Case" | "Sentence case" | "aLtErNaTiNg cAsE";
export const CASE_MODES: CaseMode[] = ["UPPERCASE", "lowercase", "Title Case", "Sentence case", "aLtErNaTiNg cAsE"];
const modeMap: Record<CaseMode, SharedCaseMode> = { UPPERCASE: "uppercase", lowercase: "lowercase", "Title Case": "title", "Sentence case": "sentence", "aLtErNaTiNg cAsE": "alternating" };
export const applyCaseTransform = (input: string, mode: CaseMode) => applyShared(input, modeMap[mode]);
