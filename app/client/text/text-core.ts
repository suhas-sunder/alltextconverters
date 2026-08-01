export type TransformResult = {
  output: string;
  warnings: string[];
  statistics: { inputCharacters: number; outputCharacters: number; inputLines?: number; outputLines?: number; inputItems?: number; outputItems?: number; removedItems?: number };
};

/** Generated plain-text output always uses LF. */
export function normalizeLineEndings(input: string): string {
  return String(input ?? "").replace(/\r\n|\r/g, "\n");
}

export function splitLines(input: string): string[] {
  return normalizeLineEndings(input).split("\n");
}

export function isBlankLine(line: string, whitespaceIsBlank = true): boolean {
  return whitespaceIsBlank ? /^[\t \u00a0]*$/.test(line) : line === "";
}

export function countLines(input: string): number {
  return input === "" ? 0 : splitLines(input).length;
}

export function collapseHorizontalWhitespace(input: string, preserveTabs = false): string {
  const pattern = preserveTabs ? /[ \u00a0]{2,}/g : /[\t \u00a0]{2,}/g;
  return input.replace(pattern, " ");
}

export type LineBreakOptions = {
  mode: "space" | "nothing" | "custom" | "paragraphs" | "blank-lines";
  separator?: string;
  collapseJoinSpaces?: boolean;
  trimEachLine?: boolean;
  preserveIndentation?: boolean;
  whitespaceLinesAreBlank?: boolean;
  retainFinalNewline?: boolean;
};

export function transformLineBreaks(input: string, options: LineBreakOptions): TransformResult {
  const original = String(input ?? "");
  const lines = splitLines(original);
  const hasFinalNewline = /(?:\r\n|\r|\n)$/.test(original);
  const whitespaceLinesAreBlank = options.whitespaceLinesAreBlank ?? true;
  const trimLine = (line: string) => {
    if (options.trimEachLine) return line.trim();
    return options.preserveIndentation ? line.replace(/[ \t]+$/g, "") : line.trim();
  };
  const join = (items: string[], separator: string) => items.map(trimLine).join(separator);
  let output: string;

  if (options.mode === "blank-lines") {
    output = lines.filter((line) => !isBlankLine(line, whitespaceLinesAreBlank)).join("\n");
  } else if (options.mode === "paragraphs") {
    const paragraphs: string[][] = [];
    let current: string[] = [];
    for (const line of lines) {
      if (isBlankLine(line, whitespaceLinesAreBlank)) {
        if (current.length) paragraphs.push(current), (current = []);
      } else current.push(line);
    }
    if (current.length) paragraphs.push(current);
    output = paragraphs.map((paragraph) => join(paragraph, " ")).join("\n\n");
  } else {
    const separator = options.mode === "nothing" ? "" : options.mode === "custom" ? (options.separator ?? "") : " ";
    output = join(lines, separator);
  }

  if (options.collapseJoinSpaces && options.mode !== "nothing") output = output.replace(/[ \t]{2,}/g, " ");
  if (options.retainFinalNewline && hasFinalNewline && output) output += "\n";
  return { output, warnings: options.mode === "paragraphs" ? ["Paragraph mode treats one or more blank lines as paragraph boundaries; intentional short lines are joined."] : [], statistics: { inputCharacters: original.length, outputCharacters: output.length, inputLines: countLines(original), outputLines: countLines(output) } };
}

export function cleanExtraSpaces(input: string, options: { preserveTabs?: boolean; trimLineEdges?: boolean; convertNbsp?: boolean } = {}): TransformResult {
  const original = String(input ?? "");
  let output = normalizeLineEndings(original);
  if (options.convertNbsp ?? true) output = output.replace(/\u00a0/g, " ");
  output = splitLines(output).map((line) => {
    const collapsed = collapseHorizontalWhitespace(line, options.preserveTabs ?? false);
    return options.trimLineEdges ? collapsed.trim() : collapsed;
  }).join("\n");
  return { output, warnings: [], statistics: { inputCharacters: original.length, outputCharacters: output.length, inputLines: countLines(original), outputLines: countLines(output) } };
}

export function cleanUnicodeWhitespace(input: string, options: { convertNbsp?: boolean; removeZeroWidthSpace?: boolean; removeBom?: boolean; removeSoftHyphen?: boolean; normalizeTabs?: boolean } = {}): TransformResult {
  const original = String(input ?? "");
  let output = normalizeLineEndings(original).replace(/[\u2028\u2029]/g, "\n");
  if (options.convertNbsp ?? true) output = output.replace(/\u00a0/g, " ");
  if (options.normalizeTabs) output = output.replace(/\t/g, " ");
  if (options.removeZeroWidthSpace ?? true) output = output.replace(/\u200B/g, "");
  if (options.removeBom ?? true) output = output.replace(/\uFEFF/g, "");
  if (options.removeSoftHyphen) output = output.replace(/\u00AD/g, "");
  return { output, warnings: [], statistics: { inputCharacters: original.length, outputCharacters: output.length, inputLines: countLines(original), outputLines: countLines(output) } };
}
