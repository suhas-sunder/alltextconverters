import { getTextMetrics } from "../../text/metrics";
export function getWordCounterStats(text: string) { const metrics = getTextMetrics(text); return { ...metrics, chars: metrics.graphemes, charsNoSpaces: metrics.withoutLiteralSpaces }; }
