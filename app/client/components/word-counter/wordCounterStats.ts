export type WordCounterStats = {
  words: number;
  chars: number;
  charsNoSpaces: number;
  spaces: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
};

/**
 * Word counter stats.
 * - words: whitespace-delimited word count (0 if empty/whitespace).
 * - chars: total characters, including spaces and newlines.
 * - charsNoSpaces: characters excluding all whitespace.
 * - lines: newline-delimited line count (matches typical editors; empty text => 1).
 */
export function getWordCounterStats(text: string): WordCounterStats {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const spaces = (text.match(/ /g) || []).length;
  const lines = text.split(/\r\n|\r|\n/).length;

  // Sentences: count sentence-ending punctuation runs. Keep it simple and predictable.
  const sentenceMatches = trimmed.match(/[.!?]+(?=\s|$)/g);
  const sentences = trimmed ? Math.max(1, sentenceMatches ? sentenceMatches.length : 0) : 0;

  // Paragraphs: blocks separated by one or more blank lines.
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n+/).filter(Boolean).length : 0;

  // Reading/speaking time: plain math estimates.
  // - reading: 200 wpm (average adult silent reading)
  // - speaking: 130 wpm (clear spoken pace)
  const readingTimeMinutes = words ? words / 200 : 0;
  const speakingTimeMinutes = words ? words / 130 : 0;

  return {
    words,
    chars,
    charsNoSpaces,
    spaces,
    lines,
    sentences,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}
