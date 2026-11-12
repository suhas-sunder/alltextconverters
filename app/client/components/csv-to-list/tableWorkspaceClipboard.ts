import { parseCsv, serializeCsv } from "../../text/csv";
import {
  exportWorkspaceTable,
  projectWorkspaceRow,
  TABLE_WORKSPACE_LIMITS,
  TABLE_WORKSPACE_SIZE_ERROR,
  type WorkspaceTable,
} from "./tableWorkspaceData";

const MAX_CLIPBOARD_HTML_BYTES = 4 * TABLE_WORKSPACE_LIMITS.bytes;
const gridLimit = "Use at most 20,000 records, 64 columns, and 250,000 cells, including any header.";
const ignoredCellElements = new Set([
  "script", "style", "template", "noscript", "svg", "math", "object", "iframe",
]);
const cellBlockElements = new Set(["div", "p"]);

function cellText(cell: HTMLTableCellElement): string {
  // Iterate without recursion so deeply nested clipboard markup stays bounded by the input limit.
  const parts: string[] = [];
  const stack: Array<Node | null> = Array.from(cell.childNodes).reverse();
  let pendingBlockBreak = false;
  while (stack.length) {
    const node = stack.pop();
    if (node === null) {
      pendingBlockBreak = parts.length > 0 && !parts.at(-1)?.endsWith("\n");
      continue;
    }
    if (!node) continue;
    const tag = node.nodeType === 1 ? (node as Element).localName : "";
    if (ignoredCellElements.has(tag)) continue;
    if (cellBlockElements.has(tag) && parts.length > 0 && !parts.at(-1)?.endsWith("\n")) {
      pendingBlockBreak = true;
    }
    const value = node.nodeType === 3 ? node.nodeValue : tag === "br" ? "\n" : "";
    if (value) {
      if (pendingBlockBreak && !value.startsWith("\n")) parts.push("\n");
      pendingBlockBreak = false;
      parts.push(value);
    }
    if (cellBlockElements.has(tag)) stack.push(null);
    for (let child = node.lastChild; child; child = child.previousSibling) stack.push(child);
  }
  return parts.join("");
}

type ClipboardTable = { text: string; merged: boolean } | { error: string };

export function readWorkspaceClipboardTable(html: string, document: Document): ClipboardTable {
  if (html.length > MAX_CLIPBOARD_HTML_BYTES || new TextEncoder().encode(html).byteLength > MAX_CLIPBOARD_HTML_BYTES) {
    return { error: "The clipboard's HTML table is too large. Try pasting as plain text or use a file." };
  }

  // Template contents are inert. Never attach the fragment or copy attributes from it into the page.
  const template = document.createElement("template");
  template.innerHTML = html;
  const tables = template.content.querySelectorAll("table");
  if (tables.length !== 1) return { error: "Paste a single spreadsheet range or delimited text." };

  const tableRows = Array.from(tables[0].rows);
  if (!tableRows.length) return { error: "This clipboard table has no rows." };
  if (tableRows.length > TABLE_WORKSPACE_LIMITS.records) return { error: gridLimit };

  const rowGroupEnds = new Map<HTMLElement | null, number>();
  const grid: Array<Array<string | undefined>> = tableRows.map((row, index) => {
    rowGroupEnds.set(row.parentElement, index + 1);
    return [];
  });
  let width = 0;
  let merged = false;
  for (const [rowIndex, row] of tableRows.entries()) {
    const groupEnd = rowGroupEnds.get(row.parentElement) ?? grid.length;
    let column = 0;
    for (const cell of row.cells) {
      while (grid[rowIndex][column] !== undefined) column++;
      const right = column + cell.colSpan;
      width = Math.max(width, right);
      if (width > TABLE_WORKSPACE_LIMITS.columns || width * grid.length > TABLE_WORKSPACE_LIMITS.cells) {
        return { error: gridLimit };
      }
      const bottom = cell.rowSpan === 0 ? groupEnd : Math.min(groupEnd, rowIndex + cell.rowSpan);
      merged ||= cell.colSpan > 1 || bottom > rowIndex + 1;
      const text = cellText(cell);
      for (let y = rowIndex; y < bottom; y++) {
        for (let x = column; x < right; x++) {
          if (grid[y][x] !== undefined) return { error: "The clipboard table has overlapping cells. Try pasting as plain text." };
          grid[y][x] = y === rowIndex && x === column ? text : "";
        }
      }
      column = right;
    }
  }
  if (!width) return { error: "This clipboard table has no cells." };
  const text = serializeCsv(grid.map((row) => Array.from({ length: width }, (_, column) => row[column] ?? "")), {
    delimiter: "\t",
    lineEnding: "LF",
  });
  if (text.length > TABLE_WORKSPACE_LIMITS.bytes || new TextEncoder().encode(text).byteLength > TABLE_WORKSPACE_LIMITS.bytes) {
    return { error: TABLE_WORKSPACE_SIZE_ERROR };
  }
  return { text, merged };
}

export function looksLikeWorkspaceClipboardTsv(text: string): boolean {
  if (!text.includes("\t") || text.length > TABLE_WORKSPACE_LIMITS.bytes) return false;
  const parsed = parseCsv(text, "\t");
  if ("error" in parsed || !parsed.rows.length) return false;
  const width = parsed.rows[0].length;
  return width > 1 && width <= TABLE_WORKSPACE_LIMITS.columns && parsed.rows.every((row) => row.length === width);
}

const htmlEscapes: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function buildWorkspaceClipboardHtml(table: WorkspaceTable, columns: number[], includeHeader: boolean): string | null {
  const parts = ['<table style="white-space:pre-wrap"><tbody>'];
  let length = parts[0].length;
  const appendRow = (row: string[], tag: "td" | "th") => {
    const cells = projectWorkspaceRow(row, columns).map((cell) => {
      const escaped = cell.replace(/[&<>"']/g, (char) => htmlEscapes[char]).replace(/\r\n?|\n/g, '<br style="mso-data-placement:same-cell">');
      return "<" + tag + ">" + escaped + "</" + tag + ">";
    });
    const markup = "<tr>" + cells.join("") + "</tr>";
    parts.push(markup);
    length += markup.length;
    return length <= MAX_CLIPBOARD_HTML_BYTES;
  };

  if (includeHeader && table.headers && !appendRow(table.headers, "th")) return null;
  for (const row of table.rows) {
    if (!appendRow(row, "td")) return null;
  }
  parts.push("</tbody></table>");
  const html = parts.join("");
  return new TextEncoder().encode(html).byteLength <= MAX_CLIPBOARD_HTML_BYTES ? html : null;
}

export async function writeWorkspaceSpreadsheetClipboard(
  table: WorkspaceTable,
  columns: number[],
  includeHeader: boolean,
): Promise<{ kind: "rich" | "text" } | { kind: "manual"; text: string }> {
  const text = exportWorkspaceTable(table, columns, { format: "tsv", includeHeader });
  const clipboard = navigator.clipboard;
  if (clipboard?.write && typeof ClipboardItem === "function") {
    try {
      const html = buildWorkspaceClipboardHtml(table, columns, includeHeader);
      if (html) {
        await clipboard.write([new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        })]);
        return { kind: "rich" };
      }
    } catch {
      // A denied or unsupported rich write may still allow a plain text write.
    }
  }
  try {
    await clipboard.writeText(text);
    return { kind: "text" };
  } catch {
    return { kind: "manual", text };
  }
}
