function lineParts(source: string) {
  return source.split(/(\r\n|\r|\n)/);
}

function mapContentLines(source: string, map: (line: string) => string) {
  const parts = lineParts(source);
  for (let index = 0; index < parts.length; index += 2) parts[index] = map(parts[index]);
  return parts.join("");
}

function fenceScanner() {
  let fence: { marker: string; length: number } | undefined;
  return (line: string) => {
    if (fence) {
      const match = /^ {0,3}(\x60+|~+)[ \t]*$/.exec(line)?.[1];
      if (match && match[0] === fence.marker && match.length >= fence.length) fence = undefined;
      return true;
    }
    const marker = /^ {0,3}(\x60{3,}|~{3,})/.exec(line)?.[1];
    if (!marker) return false;
    fence = { marker: marker[0], length: marker.length };
    return true;
  };
}

export function removeReplyQuotes(source: string) {
  const fenced = fenceScanner();
  return mapContentLines(source, line => fenced(line) ? line : line.replace(/^([ \t]{0,3})>(?:[ \t]|$)/, "$1"));
}

const bullet = /^([ \t]{0,3})[-+*•◦▪▫●○‣⁃][ \t]+(?=\S)/;
const markdownRule = /^ {0,3}(?:\*[ \t]*){3,}$|^ {0,3}(?:-[ \t]*){3,}$/;

export function removeAdjacentBullets(source: string) {
  const parts = lineParts(source);
  const fenced = fenceScanner();
  const candidates = parts.map((line, index) => index % 2 === 0 && !fenced(line) && !markdownRule.test(line) && bullet.test(line));
  for (let index = 0; index < parts.length; index += 2) {
    if (candidates[index] && (candidates[index - 2] || candidates[index + 2])) {
      parts[index] = parts[index].replace(bullet, "$1");
    }
  }
  return parts.join("");
}

function leadingIndent(line: string) {
  return /^[ \t]*/.exec(line)![0];
}
export function expandIndentTabs(source: string, width: 2 | 4 | 8) {
  return mapContentLines(source, line => {
    const indent = leadingIndent(line);
    if (!indent.includes("\t")) return line;
    let columns = 0;
    for (const character of indent) columns += character === "\t" ? width - (columns % width) : 1;
    return " ".repeat(columns) + line.slice(indent.length);
  });
}

export function dedentSpaces(source: string) {
  const parts = lineParts(source);
  let common = Infinity;
  for (let index = 0; index < parts.length; index += 2) {
    const line = parts[index];
    if (/^[ \t]*$/.test(line)) continue;
    common = Math.min(common, /^ */.exec(line)![0].length);
    if (!common) return source;
  }
  if (!Number.isFinite(common)) return source;
  for (let index = 0; index < parts.length; index += 2) {
    if (!/^[ \t]*$/.test(parts[index])) parts[index] = parts[index].slice(common);
  }
  return parts.join("");
}

const blank = /^[ \t]*$/;
export function addSequentialNumbers(source: string) {
  let number = 1;
  return mapContentLines(source, line => blank.test(line) ? line : number++ + ": " + line);
}

export function removeSequentialNumbers(source: string) {
  const parts = lineParts(source);
  const prefixes = new Map<number, number>();
  let number = 1;
  for (let index = 0; index < parts.length; index += 2) {
    const line = parts[index];
    if (blank.test(line)) continue;
    const prefix = number++ + ": ";
    if (!line.startsWith(prefix) || blank.test(line.slice(prefix.length))) return source;
    prefixes.set(index, prefix.length);
  }
  // A single "1: …" is too ambiguous to recognize as a generated sequence.
  if (prefixes.size < 2) return source;
  for (const [index, length] of prefixes) parts[index] = parts[index].slice(length);
  return parts.join("");
}
