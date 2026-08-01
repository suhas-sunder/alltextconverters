import { parseSimpleList } from "../../text/list-core";
import { serializeCsv } from "../../text/csv";
export function parseLines(input: string): string[] { return parseSimpleList(input); }
export function listToCommaSeparated(input: string, opts: { spaceAfterComma: boolean }) { const items = parseLines(input); const delimiter = opts.spaceAfterComma ? ", " : ","; return { output: items.join(delimiter), items, delimiter }; }
export function listToCsvSingleColumn(input: string): { csv: string; rows: string[] } { const rows = parseLines(input); return { csv: serializeCsv([["value"], ...rows.map((item) => [item])]), rows }; }
