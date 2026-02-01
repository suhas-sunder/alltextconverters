export type RemoveDuplicateLinesOptions = {
  caseInsensitive: boolean;
  preserveOriginalOrder: boolean;
};

export type RemoveDuplicateLinesResult = {
  output: string;
  totalLines: number;
  uniqueLines: number;
  removedDuplicates: number;
};

function normalizeLine(line: string, caseInsensitive: boolean) {
  return caseInsensitive ? line.toLocaleLowerCase() : line;
}

/**
 * Removes repeated lines while preserving the original content of the kept line.
 * - Matching is performed per line (split on \r?\n)
 * - When preserveOriginalOrder is true, the first occurrence is kept and order is unchanged
 * - When preserveOriginalOrder is false, unique lines are sorted by their match key
 */
export function removeDuplicateLines(
  input: string,
  options: RemoveDuplicateLinesOptions,
): RemoveDuplicateLinesResult {
  const raw = String(input ?? "");
  const lines = raw.split(/\r?\n/);

  const seen = new Set<string>();
  const kept: { key: string; line: string }[] = [];
  let removed = 0;

  for (const line of lines) {
    const key = normalizeLine(line, options.caseInsensitive);
    if (seen.has(key)) {
      removed += 1;
      continue;
    }
    seen.add(key);
    kept.push({ key, line });
  }

  let finalLines: string[];
  if (options.preserveOriginalOrder) {
    finalLines = kept.map((k) => k.line);
  } else {
    finalLines = kept
      .slice()
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((k) => k.line);
  }

  return {
    output: finalLines.join("\n"),
    totalLines: lines.length,
    uniqueLines: finalLines.length,
    removedDuplicates: removed,
  };
}
