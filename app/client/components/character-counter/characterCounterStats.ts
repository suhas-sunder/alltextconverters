export type CharacterCounterStats = {
  words: number;
  chars: number;
  charsNoSpaces: number;
  spaces: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  bytesUtf8: number;
};

/**
 * Character and basic text stats.
 *
 * Notes:
 * - "Characters" counts UTF-16 code units (the same as JavaScript string length).
 * - "Bytes (UTF-8)" uses TextEncoder when available. This better matches APIs that
 *   enforce limits in bytes rather than visible characters.
 */
export function getCharacterCounterStats(text: string): CharacterCounterStats {
  const trimmed = text.trim();

  // Keep a few extra stats for convenience, even though this route is character-first.
  const words = trimmed ? trimmed.split(/\s+/).length : 0;

  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const spaces = (text.match(/ /g) || []).length;
  const lines = text.split(/\r\n|\r|\n/).length;

  // Sentences: simple, predictable heuristic (not full grammar parsing).
  const sentenceMatches = trimmed.match(/[.!?]+(?=\s|$)/g);
  const sentences = trimmed ? Math.max(1, sentenceMatches ? sentenceMatches.length : 0) : 0;

  // Paragraphs: blocks separated by one or more blank lines.
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n+/).filter(Boolean).length : 0;

  // Reading/speaking time: plain math estimates.
  const readingTimeMinutes = words ? words / 200 : 0;
  const speakingTimeMinutes = words ? words / 130 : 0;

  const bytesUtf8 = (() => {
    try {
      if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text).length;
      if (typeof Blob !== "undefined") return new Blob([text]).size;
    } catch {
      // ignore
    }

    // Very conservative fallback.
    return unescape(encodeURIComponent(text)).length;
  })();

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
    bytesUtf8,
  };
}
