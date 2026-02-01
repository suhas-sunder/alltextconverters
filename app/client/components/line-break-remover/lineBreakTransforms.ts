export type LineBreakReplaceMode = "space" | "nothing";

export type LineBreakRemovalStats = {
  removedLineBreakRuns: number;
  removedLineBreakCharacters: number;
};

function countRemovedCharactersForRun(run: string) {
  // CRLF is two characters, CR is one, LF is one.
  const crlf = (run.match(/\r\n/g) || []).length;
  const remaining = run.replace(/\r\n/g, "");
  const cr = (remaining.match(/\r/g) || []).length;
  const lf = (remaining.match(/\n/g) || []).length;
  return crlf * 2 + cr + lf;
}

export function removeLineBreaks(
  input: string,
  mode: LineBreakReplaceMode,
): { value: string; stats: LineBreakRemovalStats } {
  const text = String(input ?? "");
  const runs = text.match(/(\r\n|\r|\n)+/g) || [];

  const removedLineBreakRuns = runs.length;
  const removedLineBreakCharacters = runs.reduce(
    (acc, r) => acc + countRemovedCharactersForRun(r),
    0,
  );

  const replacement = mode === "space" ? " " : "";
  const value = text.replace(/(\r\n|\r|\n)+/g, replacement);

  return { value, stats: { removedLineBreakRuns, removedLineBreakCharacters } };
}
