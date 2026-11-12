import { findLoneSurrogate, utf8Bytes } from "./bytes";
import { toLowerCaseText, toUpperCaseText } from "./case";
import { parseSimpleList, removeDuplicateItems } from "./list-core";
import { collapseHorizontalWhitespace, normalizeLineEndings, splitLines, transformLineBreaks } from "./text-core";
import { addSequentialNumbers, dedentSpaces, expandIndentTabs, removeAdjacentBullets, removeReplyQuotes, removeSequentialNumbers } from "./workflow-cleanup";

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
  "remove-bullet-runs": { label: "Remove consecutive bullet prefixes", apply: removeAdjacentBullets, detail: "Removes adjacent bullets with a space after the marker. Leaves isolated bullets, separators and fenced code in place." },
  "strip-reply-quotes": { label: "Remove one email quote level", apply: removeReplyQuotes, detail: "Removes one leading > marker followed by whitespace or the end of a line. Keeps quoted words and nested levels." },
  "indent-2": { label: "Expand leading tabs to 2-column stops", apply: (text: string) => expandIndentTabs(text, 2), detail: "Uses two-column tab stops in leading indentation. Tabs inside a line stay in place." },
  "indent-4": { label: "Expand leading tabs to 4-column stops", apply: (text: string) => expandIndentTabs(text, 4), detail: "Uses four-column tab stops in leading indentation. Tabs inside a line stay in place." },
  "indent-8": { label: "Expand leading tabs to 8-column stops", apply: (text: string) => expandIndentTabs(text, 8), detail: "Uses eight-column tab stops in leading indentation. Tabs inside a line stay in place." },
  "dedent-spaces": { label: "Remove common leading spaces", apply: dedentSpaces, detail: "Subtracts the smallest leading space count from every nonblank line. Relative indentation and blank lines stay in place." },
  "add-line-numbers": { label: "Number nonblank lines", apply: addSequentialNumbers, detail: "Adds 1: , 2: and so on. Blank lines and original line breaks are preserved." },
  "strip-line-numbers": { label: "Remove a complete line-number sequence", apply: removeSequentialNumbers, detail: "Removes only a complete run of at least two nonblank lines numbered 1: , 2: and so on. Gaps and standalone numbers are kept." },
};

export type WorkflowStepId = keyof typeof workflowSteps;
export type WorkflowResult = { ok: true; output: string } | { ok: false; error: string };

export const workflowPresets = [
  { label: "Clean a pasted spreadsheet column", steps: ["trim-lines", "remove-duplicates"] },
  { label: "Rejoin a wrapped email or document", steps: ["join-paragraphs", "collapse-spaces"] },
  { label: "Make a case-insensitive ID list", steps: ["trim-lines", "lowercase", "remove-duplicates", "join-comma"] },
] as const satisfies ReadonlyArray<{ label: string; steps: readonly WorkflowStepId[] }>;

export const advancedWorkflowPresets = [
  { label: "Flatten copied bullets", steps: ["remove-bullet-runs"] },
  { label: "Unquote a pasted email reply", steps: ["strip-reply-quotes"] },
  { label: "Dedent copied code (4-column tabs)", steps: ["indent-4", "dedent-spaces"] },
  { label: "Number excerpt lines", steps: ["add-line-numbers"] },
  { label: "Remove excerpt line numbers", steps: ["strip-line-numbers"] },
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
