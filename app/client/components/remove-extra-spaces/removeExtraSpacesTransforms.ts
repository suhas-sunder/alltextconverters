import { cleanExtraSpaces } from "../../text/text-core";
export type RemoveSpacesOptions = { preserveLineBreaks: boolean; preserveTabs?: boolean; trimLineEdges?: boolean };
export function removeExtraSpaces(input: string, options: RemoveSpacesOptions) {
  const result = cleanExtraSpaces(input, { preserveTabs: options.preserveTabs, trimLineEdges: options.trimLineEdges });
  return { output: result.output, stats: { collapsedRuns: 0, removedZeroWidth: 0, replacedTabs: 0, preserveLineBreaks: options.preserveLineBreaks } };
}
