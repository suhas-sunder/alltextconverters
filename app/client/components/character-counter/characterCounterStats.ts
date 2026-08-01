import { getTextMetrics } from "../../text/metrics";
export function getCharacterCounterStats(text: string) { const metrics = getTextMetrics(text); return { ...metrics, chars: metrics.graphemes, charsNoSpaces: metrics.withoutLiteralSpaces, bytesUtf8: metrics.utf8Bytes }; }
