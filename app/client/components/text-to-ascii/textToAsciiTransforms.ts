export type AsciiDelimiter = "space" | "comma";

export type TextToAsciiOptions = {
  delimiter: AsciiDelimiter;
  printableOnly: boolean; // when true, only allow 32..126
};

export type TextToAsciiStats = {
  totalCharacters: number;
  encodedCharacters: number;
  skippedCharacters: number;
  skippedBreakdown: {
    tabs: number;
    newlines: number;
    carriageReturns: number;
    nbsp: number;
    zeroWidth: number;
    otherNonPrintable: number;
    nonAscii: number;
  };
};

export type TextToAsciiResult = {
  output: string;
  stats: TextToAsciiStats;
};

const ZERO_WIDTH = new Set<number>([
  0x200b, // zero width space
  0x200c, // zero width non-joiner
  0x200d, // zero width joiner
  0x2060, // word joiner
  0xfeff, // byte order mark / zero width no-break space
]);

function isPrintableAscii(code: number) {
  return code >= 32 && code <= 126;
}

export function textToAscii(
  input: string,
  options: TextToAsciiOptions,
): TextToAsciiResult {
  const delimiterStr = options.delimiter === "comma" ? ", " : " ";
  const codes: number[] = [];

  const stats: TextToAsciiStats = {
    totalCharacters: 0,
    encodedCharacters: 0,
    skippedCharacters: 0,
    skippedBreakdown: {
      tabs: 0,
      newlines: 0,
      carriageReturns: 0,
      nbsp: 0,
      zeroWidth: 0,
      otherNonPrintable: 0,
      nonAscii: 0,
    },
  };

  for (const ch of input || "") {
    stats.totalCharacters += 1;
    const code = ch.codePointAt(0) ?? 0;

    const printable = isPrintableAscii(code);

    if (options.printableOnly) {
      if (!printable) {
        stats.skippedCharacters += 1;
        if (ch === "\t") stats.skippedBreakdown.tabs += 1;
        else if (ch === "\n") stats.skippedBreakdown.newlines += 1;
        else if (ch === "\r") stats.skippedBreakdown.carriageReturns += 1;
        else if (code === 0x00a0) stats.skippedBreakdown.nbsp += 1;
        else if (ZERO_WIDTH.has(code)) stats.skippedBreakdown.zeroWidth += 1;
        else if (code > 127) stats.skippedBreakdown.nonAscii += 1;
        else stats.skippedBreakdown.otherNonPrintable += 1;
        continue;
      }
    } else {
      // Not recommended for this page, but kept for completeness.
      if (code > 255) {
        stats.skippedCharacters += 1;
        stats.skippedBreakdown.nonAscii += 1;
        continue;
      }
      if (code < 0 || Number.isNaN(code)) {
        stats.skippedCharacters += 1;
        stats.skippedBreakdown.otherNonPrintable += 1;
        continue;
      }
    }

    codes.push(code);
    stats.encodedCharacters += 1;
  }

  return {
    output: codes.join(delimiterStr),
    stats,
  };
}

export function summarizeSkipped(stats: TextToAsciiStats) {
  const b = stats.skippedBreakdown;
  const parts: Array<[string, number]> = [
    ["tabs", b.tabs],
    ["line breaks", b.newlines + b.carriageReturns],
    ["non-breaking spaces", b.nbsp],
    ["zero-width/invisible", b.zeroWidth],
    ["other non-printable", b.otherNonPrintable],
    ["non-ASCII", b.nonAscii],
  ];
  return parts.filter(([, n]) => n > 0);
}
