const bom = "\uFEFF";
const binaryUnicode = "01000001 11000011 10101001 11110000 10011111 10011000 10000000";

export const encodingFixtures = {
  "base64-encode": {
    button: "Encode to Base64",
    cases: [
      { source: "Café 東京 😀", expected: "Q2Fmw6kg5p2x5LqsIPCfmIA=" },
      { source: "A\nB", expected: "QQpC" },
      { source: bom + "A", expected: "77u/QQ==" },
    ],
    copy: "Copy Base64", clear: "Clear text", pdf: "Download as PDF",
  },
  "base64-decode": {
    button: "Decode Base64",
    cases: [
      { source: "Q2Fmw6kg5p2x5LqsIPCfmIA=", expected: "Café 東京 😀" },
      { source: "77u/QQ==", expected: bom + "A" },
      { source: "a!=", error: /invalid|base64/i },
      { source: "wyg=", error: /UTF-8/i },
    ],
    copy: "Copy text", clear: "Clear text",
  },
  "url-encode": {
    button: "Encode", input: "Text to encode", output: "Encoded text",
    cases: [
      { source: "café + a&b/?#😀", expected: "caf%C3%A9%20%2B%20a%26b%2F%3F%23%F0%9F%98%80" },
      { source: "a+b c", expected: "a%2Bb+c", settings: [["radio", "Form value mode"]] },
      { source: "A\nB", expected: "A%0AB" },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "url-decode": {
    button: "Decode", input: "Encoded text", output: "Decoded text",
    cases: [
      { source: "caf%C3%A9%20%2B", expected: "café +" },
      { source: "a+b%2Bc", expected: "a b+c", settings: [["radio", "Form value mode"]] },
      { source: "%2", error: /percent|escape|invalid|malformed/i },
      { source: "%C3%28", error: /UTF-8|percent|invalid|malformed/i },
    ],
    copy: "Copy", clear: "Clear",
  },
  "text-to-ascii": {
    button: "Convert", input: "ASCII text input", output: "Decimal ASCII values",
    cases: [
      { source: "Az\n", expected: "65 122 10" },
      { source: "A\tB", expected: "65,9,66", settings: [["radio", "Comma"]] },
      { source: "café", error: /ASCII/i },
      { source: "😀", error: /ASCII/i },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "ascii-to-text": {
    button: "Decode", input: "Decimal ASCII values", output: "Decoded ASCII text",
    cases: [
      { source: "65 9 90", expected: "A\tZ" },
      { source: "0,127", expected: "\x00\x7f", settings: [["radio", "Comma-separated"]], notice: /Decoded control characters/ },
      { source: "128", error: /ASCII|127/i },
      { source: "65,,66", error: /empty|invalid|group/i },
    ],
    copy: "Copy", clear: "Clear",
  },
  "text-to-binary": {
    button: "Convert", input: "Text input", output: "Binary UTF-8 bytes",
    cases: [
      { source: "Aé😀", expected: binaryUnicode },
      { source: "é", expected: "1100001110101001", settings: [["radio", "None"]] },
      { source: "A\n", expected: "0100000100001010" },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "binary-to-text": {
    button: "Decode", input: "Binary input", output: "Decoded UTF-8 text",
    cases: [
      { source: binaryUnicode, expected: "Aé😀" },
      { source: "1100001110101001", expected: "é", settings: [["radio", "Continuous bits"]] },
      { source: "0100000", error: /8|byte|multiple/i },
      { source: "1100001100101000", error: /UTF-8/i },
    ],
    copy: "Copy", clear: "Clear",
  },
  "text-to-hex": {
    button: "Convert", input: "Text input", output: "Hexadecimal UTF-8 bytes",
    cases: [
      { source: "A é 😀", expected: "41 20 c3 a9 20 f0 9f 98 80" },
      { source: "é", expected: "C3A9", settings: [["radio", "Uppercase hex"], ["radio", "None"]] },
      { source: bom + "A", expected: "0xEF,0xBB,0xBF,0x41", settings: [["radio", "Comma"], ["check", "Add 0x prefix to each byte"]] },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "hex-to-text": {
    button: "Decode", input: "Hexadecimal input", output: "Decoded UTF-8 text",
    cases: [
      { source: "41 c3 a9 f0 9f 98 80", expected: "Aé😀" },
      { source: "0xEF,0xBB,0xBF,0x41", expected: bom + "A", settings: [["radio", "Comma-separated"], ["check", "Allow optional 0x prefixes"]] },
      { source: "41,,42", error: /empty|invalid|group/i },
      { source: "c3,28", error: /UTF-8/i },
    ],
    copy: "Copy", clear: "Clear",
  },
};
