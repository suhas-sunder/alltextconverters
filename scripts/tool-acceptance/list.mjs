export const listFixtures = {
  "comma-separated-to-list": {
    button: "Convert to List", input: "Comma-separated values", copy: "Copy text", clear: "Clear text",
    cases: [
      { source: '"Québec, Canada",東京,"He said ""hi"""', expected: 'Québec, Canada\n東京\nHe said "hi"' },
      { source: " café,, 東京, ", expected: "café\n東京" },
      { source: '"unterminated', error: /quote|quoted/i },
    ],
  },
  "list-to-comma-separated": {
    button: "Convert list to comma-separated", input: "One item per line", copy: "Copy output", download: "Download as text", clear: "Clear text",
    cases: [
      { source: "café\n\n東京", expected: "café, 東京" },
      { source: "first value\nsecond value", expected: "first value,second value", settings: [["press", "Toggle space after comma"]] },
      { source: "  a  \n \nb\n", expected: "a,b" },
    ],
  },
  "list-to-csv": {
    button: "Generate CSV", input: "One item per line", output: "CSV output", copy: "Copy CSV", download: "Download CSV", clear: "Clear",
    cases: [
      { source: 'Québec, Canada\nHe said "東京"\né', expected: '"Québec, Canada"\n"He said ""東京"""\né\n', download: '"Québec, Canada"\r\n"He said ""東京"""\r\né\r\n' },
      { source: "a\na\nb", expected: "value\na\nb\n", settings: [["check", "Include header"], ["check", "Remove duplicate values"], ["select", "Line ending", "LF"]] },
      { source: "a;b", expected: '\uFEFFvalue\n"a;b"\n', settings: [["check", "UTF-8 BOM for Excel"], ["select", "Delimiter", ";"]] },
    ],
  },
  "csv-to-list": {
    button: "Convert", input: "CSV or delimited text", output: "List output", copy: "Copy", clear: "Clear",
    cases: [
      { source: '"Québec, Canada"\n"He said ""東京"""\né', expected: 'Québec, Canada\nHe said "東京"\né' },
      { source: 'city;note\nQuébec;"first\nsecond"\n東京;third', expected: "first\nsecond | third", settings: [["check", "First row is a header"], ["select", "Source delimiter", ";"], ["select", "Column", "1"], ["select", "Output delimiter", "custom"], ["fill", "Custom delimiter", " | "]] },
      { source: 'city;"unterminated', error: /quote/i },
    ],
  },
  "table-to-list": {
    button: "Extract column as list", input: "Table, CSV, or TSV input", copy: "Copy text", download: "Download as text", clear: "Clear text",
    cases: [
      { source: 'City,Note\nQuébec,"snow, sleet"\n東京,clear', filename: "table.csv", expected: "Note\nsnow, sleet\nclear", settings: [["arrowDown", "Column", "1"]] },
      { source: "<table><tr><td>café</td><td>東京</td></tr><tr><td>x</td><td>y</td></tr></table>", expected: "東京\ny" },
      { source: 'city,"unterminated', error: /quote/i },
    ],
  },
  "list-to-table": {
    button: "Build table", input: "List input", preview: "main pre", copy: "Copy HTML table", download: "Export CSV", clear: "Clear",
    cases: [
      { source: "café 東京", expected: "<table><tbody><tr><td>café</td></tr><tr><td>東京</td></tr></tbody></table>", download: "café\n東京" },
      { source: "Hello world\nA & B", expected: "<table><tbody><tr><td>Hello world</td></tr><tr><td>A &amp; B</td></tr></tbody></table>", settings: [["press", "Split on lines"]] },
      { source: '\n\n  A "quoted"\n\n<x>\n', expected: "<table><tbody><tr><td>A &quot;quoted&quot;</td></tr><tr><td>&lt;x&gt;</td></tr></tbody></table>" },
    ],
  },
  "text-to-comma-separated-list": {
    button: "Convert to comma-separated list", input: "Text to convert", copy: "Copy", download: "Download as TXT", clear: "Clear text",
    cases: [
      { source: "café\n\n東京", expected: "café, 東京" },
      { source: 'Québec, Canada\nHe said "東京"', expected: '"Québec, Canada", "He said ""東京"""', settings: [["press", "Quote items: Off"]] },
      { source: "1. one\n2. two", expected: '"one", "two"' },
    ],
  },
  "text-to-bulleted-text-list": {
    button: "Convert to bulleted list", copy: "Copy text", download: "Download as TXT", clear: "Clear text",
    cases: [
      { source: "café\n東京", expected: "- café\n- 東京" },
      { source: "one, ,two", expected: "• one\n• two", settings: [["select", "Choose input split method", "commas"], ["select", "Choose bullet style", "•"]] },
      { source: "a,b,,c", expected: "• a\n• b\n• c" },
    ],
  },
  "text-to-ordered-list": {
    button: "Convert to ordered list", copy: "Copy output", download: "Download as TXT", clear: "Clear text",
    cases: [
      { source: "café\n\n東京", expected: "1. café\n2. 東京" },
      { source: "one,two", expected: "I. one\nII. two", settings: [["press", "Split by Commas"], ["press", "Use Roman (I)"]] },
      { source: "one,,two", expected: "Z. one\nAA. two", settings: [["press", "Use Letters (A)"], ["number", undefined, "26"]] },
    ],
  },
};
