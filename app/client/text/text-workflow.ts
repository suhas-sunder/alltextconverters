import { findLoneSurrogate, utf8Bytes } from "./bytes";
import { toLowerCaseText, toUpperCaseText } from "./case";
import { parseSimpleList, removeDuplicateItems } from "./list-core";
import { collapseHorizontalWhitespace, normalizeLineEndings, splitLines, transformLineBreaks } from "./text-core";

export const WORKFLOW_MAX_BYTES = 256 * 1024;
export const WORKFLOW_MAX_STEPS = 12;

export const workflowSteps = {
  "normalize-lines": { label: "Normalize line endings to LF", apply: normalizeLineEndings },
  "trim-text": { label: "Trim outer whitespace", apply: (text: string) => text.trim() },
  "trim-lines": { label: "Trim each line (LF output)", apply: (text: string) => splitLines(text).map((line) => line.trim()).join("\n") },
  "collapse-spaces": { label: "Collapse repeated spaces, preserving tabs", apply: (text: string) => collapseHorizontalWhitespace(text, true) },
  "remove-duplicates": { label: "Remove duplicate lines (keep first, LF output)", apply: (text: string) => removeDuplicateItems(splitLines(text)).items.join("\n") },
  lowercase: { label: "Convert to lowercase", apply: toLowerCaseText },
  uppercase: { label: "Convert to uppercase", apply: toUpperCaseText },
  "join-paragraphs": { label: "Join wrapped lines, preserving paragraphs", apply: (text: string) => transformLineBreaks(text, { mode: "paragraphs" }).output },
  "join-comma": { label: "Join nonblank lines with comma and space", apply: (text: string) => parseSimpleList(text).join(", ") },
};

export type WorkflowStepId = keyof typeof workflowSteps;
export type WorkflowResult = { ok: true; output: string } | { ok: false; error: string };

export const workflowPresets = [
  { label: "Clean a pasted spreadsheet column", steps: ["trim-lines", "remove-duplicates"] },
  { label: "Rejoin a wrapped email or document", steps: ["join-paragraphs", "collapse-spaces"] },
  { label: "Make a case-insensitive ID list", steps: ["trim-lines", "lowercase", "remove-duplicates", "join-comma"] },
] as const satisfies ReadonlyArray<{ label: string; steps: readonly WorkflowStepId[] }>;

export function runTextWorkflow(source: string, steps: readonly string[]): WorkflowResult {
  if (!steps.length || steps.length > WORKFLOW_MAX_STEPS) {
    return { ok: false, error: "Choose between 1 and 12 workflow steps." };
  }
  if (source.length > WORKFLOW_MAX_BYTES || utf8Bytes(source).length > WORKFLOW_MAX_BYTES) {
    return { ok: false, error: "Workflow source exceeds the 256 KiB UTF-8 limit." };
  }
  if (findLoneSurrogate(source) >= 0) {
    return { ok: false, error: "The source contains an invalid Unicode sequence." };
  }

  let output = source;
  for (const step of steps) {
    if (!Object.hasOwn(workflowSteps, step)) {
      return { ok: false, error: "The workflow contains an unknown step." };
    }
    output = workflowSteps[step as WorkflowStepId].apply(output);
    if (output.length > WORKFLOW_MAX_BYTES || utf8Bytes(output).length > WORKFLOW_MAX_BYTES) {
      return { ok: false, error: "A workflow step exceeded the 256 KiB output limit." };
    }
  }
  return { ok: true, output };
}
