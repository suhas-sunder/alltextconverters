// Native JSON.parse remains the validator. Some browsers omit the error offset, so scan invalid
// input to locate the first broken token without exposing the native exception's source excerpt.
export function locateJsonSyntaxError(source: string): number {
  const numberToken = /-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/y;
  let index = 0;

  function skipWhitespace() {
    while (index < source.length && /[ \t\r\n]/.test(source[index])) index++;
  }

  function expect(character: string) {
    if (source[index] !== character) throw index;
    index++;
  }

  function readString() {
    expect('"');
    while (index < source.length) {
      const character = source[index++];
      if (character === '"') return;
      if (character < " ") throw index - 1;
      if (character !== "\\") continue;
      const escape = source[index++];
      if (escape === "u") {
        for (let digit = 0; digit < 4; digit++) {
          if (index >= source.length || !/[0-9a-f]/i.test(source[index])) throw index;
          index++;
        }
      } else if (escape === undefined || !'"\\/bfnrt'.includes(escape)) {
        throw index - 1;
      }
    }
    throw index;
  }

  function readCollection(depth: number, object: boolean) {
    const close = object ? "}" : "]";
    index++;
    skipWhitespace();
    if (source[index] === close) {
      index++;
      return;
    }
    while (index < source.length) {
      if (object) {
        readString();
        skipWhitespace();
        expect(":");
      }
      readValue(depth + 1);
      skipWhitespace();
      if (source[index] === close) {
        index++;
        return;
      }
      expect(",");
      skipWhitespace();
    }
    throw index;
  }

  function readValue(depth: number) {
    skipWhitespace();
    if (depth > 256) throw index;
    const character = source[index];
    if (character === '"') {
      readString();
    } else if (character === "[" || character === "{") {
      readCollection(depth, character === "{");
    } else if (character === "t" || character === "f" || character === "n") {
      const literal = character === "t" ? "true" : character === "f" ? "false" : "null";
      for (const letter of literal) expect(letter);
    } else {
      numberToken.lastIndex = index;
      if (!numberToken.test(source)) throw index;
      index = numberToken.lastIndex;
    }
  }

  try {
    readValue(0);
    skipWhitespace();
    return index;
  } catch (offset) {
    if (typeof offset !== "number") throw offset;
    return offset;
  }
}
