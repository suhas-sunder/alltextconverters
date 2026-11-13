export const cleanupFixtures = {
  "text-cleaner": {
    button: "Clean text", copy: "Copy text", clear: "Clear text",
    cases: [
      { source: "  blue   sky\nnext line  ", expected: "blue sky\nnext line" },
      { source: "  café   東京\nsecond ", expected: "café 東京\nsecond" },
      { source: "a\u200Bb", expected: "ab" },
      { source: "Family 👨‍👩‍👧‍👦", expected: "Family 👨‍👩‍👧‍👦", gap: { id: "text-cleaner-joiners", observed: "Family 👨👩👧👦" } },
    ],
  },
  "remove-extra-spaces": {
    button: "Remove extra spaces", copy: "Copy text", clear: "Clear text",
    cases: [
      { source: "red   blue\nnext\t\titem", expected: "red blue\nnext item" },
      { source: "a    café\n東京   b", expected: "a café\n東京 b" },
      { source: "a\u00A0\u00A0b", expected: "a b" },
      {
        source: "a  b\nc  d", expected: "a b c d", settings: [["uncheck", "Preserve line breaks"]],
        gap: { id: "spaces-line-break-setting", observed: "a b\nc d" },
      },
    ],
  },
  "whitespace-cleaner": {
    button: "Clean whitespace", copy: "Copy text", clear: "Clear text",
    cases: [
      { source: "A\u00A0B\u200B\tC  D", expected: "A B\tC  D" },
      { source: "café\u00A0東京\u200B", expected: "café 東京" },
      { source: "a\u2028b\u2029c", expected: "a\nb\nc" },
      { source: "a\tb\u00AD👩‍💻", expected: "a\tb\u00AD👩‍💻" },
    ],
  },
  "line-break-remover": {
    button: "Convert", input: "Input text", output: "Output", copy: "Copy", download: "Download TXT", clear: "Clear",
    cases: [
      { source: "café\n\n東京", expected: "café 東京" },
      { source: "A\nB\nC", expected: "ABC", settings: [["radio", "Remove without adding"]] },
      { source: "first\nwrapped\n\nsecond", expected: "first wrapped\n\nsecond", settings: [["radio", "Preserve paragraphs"]] },
    ],
  },
  "remove-duplicate-lines": {
    button: "Remove duplicate lines", copy: "Copy text", clear: "Clear text",
    cases: [
      { source: "café\n東京\ncafé", expected: "café\n東京" },
      { source: "CAFÉ\ncafé\n東京", expected: "CAFÉ\n東京", settings: [["press", "Case-insensitive"]] },
      { source: "z\na\nz", expected: "a\nz", settings: [["press", "Preserve original order"]] },
    ],
  },
  "case-insensitive-sort": {
    button: "Sort lines case-insensitively", copy: "Copy text", clear: "Clear text",
    cases: [
      { source: "zeta\nAlpha\nbeta", expected: "Alpha\nbeta\nzeta" },
      { source: "b\nA\nc", expected: "c\nb\nA", settings: [["press", "Z–A, 9–0"]] },
      { source: "z\na\nA", expected: "z\nA\na" },
    ],
  },
  "remove-all-styling-from-text": {
    button: "Remove styling", copy: "Copy text", clear: "Clear text",
    cases: [
      { source: "<p><b>Café</b> &amp; 東京</p>", expected: "Café & 東京" },
      { source: "<script>throw 1</script><strong>safe</strong>", expected: "safe" },
      { source: "alpha\n\n\n  beta", expected: "alpha\nbeta", settings: [["check", "Strip Empty Lines"]] },
    ],
  },
};
