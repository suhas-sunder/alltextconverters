export type TextStats = { words: number; chars: number; lines: number };

export function getStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const lines = text.split(/\r\n|\r|\n/).length;
  return { words, chars, lines };
}
