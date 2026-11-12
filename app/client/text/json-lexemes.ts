// These scanners locate boundaries in text that has already passed JSON.parse.
function skipWhitespace(source: string, start: number): number {
  let index = start;
  while (index < source.length && /[ \t\r\n]/.test(source[index])) index++;
  return index;
}

function skipString(source: string, start: number): number {
  let index = start + 1;
  while (source[index] !== '"') index += source[index] === "\\" ? 2 : 1;
  return index + 1;
}

function valueEnd(source: string, start: number): number {
  let depth = 0;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    if (char === '"') index = skipString(source, index) - 1;
    else if (depth === 0 && (char === "," || char === "}" || char === "]")) return index;
    else if (char === "[" || char === "{") depth++;
    else if (char === "]" || char === "}") depth--;
  }
  return source.length;
}

export function* jsonArrayValues(source: string): Generator<string> {
  const opening = skipWhitespace(source, 0);
  let start = skipWhitespace(source, opening + 1);
  while (start < source.length && source[start] !== "]") {
    const end = valueEnd(source, start);
    yield source.slice(start, end).trimEnd();
    if (source[end] === "]") return;
    start = skipWhitespace(source, end + 1);
  }
}

export function* jsonObjectEntries(source: string): Generator<[key: string, raw: string]> {
  const opening = skipWhitespace(source, 0);
  let keyStart = skipWhitespace(source, opening + 1);
  while (source[keyStart] === '"') {
    const keyEnd = skipString(source, keyStart);
    const key: string = JSON.parse(source.slice(keyStart, keyEnd));
    const colon = skipWhitespace(source, keyEnd);
    const start = skipWhitespace(source, colon + 1);
    const end = valueEnd(source, start);
    yield [key, source.slice(start, end).trimEnd()];
    keyStart = skipWhitespace(source, end + 1);
  }
}
