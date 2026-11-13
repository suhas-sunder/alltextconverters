export const markupFixtures = {
  "json-to-text": {
    button: "Extract values from JSON", clear: "Clear text",
    copy: "Copy extracted text", download: "Download as TXT",
    copyGap: "json-to-text-copy-after-convert", downloadGap: "json-to-text-download-after-convert",
    cases: [
      {"source": "{\"user\":{\"name\":\"Ada\"},\"active\":true}", "expected": "Ada\ntrue"},
      { source: '{"places":[{"city":"café"},{"city":"東京"}],"open":false}', expected: "café\n東京\nfalse" },
      {
        source: '{"places":[{"city":"café"},{"city":"東京"}]}',
        expected: "places[0].city: café places[1].city: 東京",
        settings: [["press", "Join extracted values with spaces"], ["press", "Include key paths"]],
      },
      { source: '{"open":', error: /Invalid JSON/i },
    ],
  },
  "text-to-json": {
    button: "Convert text to JSON", output: true, clear: "Clear",
    copy: "Copy output JSON", download: "Download output as JSON",
    clearOnEdit: { id: "text-to-json-stale-result" },
    cases: [
      {"source": "007\ntrue", "expected": ["007", "true"], "format": "json"},
      { source: " café\n\n東京 ", expected: ["café", "東京"], format: "json" },
      { source: "city: Québec\ncity: 東京\nunknown line", expected: { city: "東京", _unparsed: ["unknown line"] }, format: "json", settings: [["press", "Key value mode"]] },
      { source: 'path: a:b\nquoted: He said "hi"', expected: { path: "a:b", quoted: 'He said "hi"' }, format: "json" },
    ],
  },
  "json-array-to-list": {
    button: "Convert JSON array to list", copy: "Copy text", clear: "Clear text",
    cases: [
      {"source": "[\"red\",7,false,null]", "expected": "red\n7\nfalse\nnull"},
      { source: '["café",{"city":"東京"},[1,2],false]', expected: 'café\n{"city":"東京"}\n[1,2]\nfalse' },
      { source: '["  a  ","",null,"b"]', expected: "a\nnull\nb" },
      { source: '["unterminated', error: /valid JSON/i },
      { source: '{"name":"café"}', error: /array/i },
    ],
  },
  "comma-to-json-array": {
    button: "Convert to JSON array", copy: "Copy output", download: "Download JSON", clear: "Clear text",
    cases: [
      {"source": "\"Toronto, ON\",007,true", "expected": ["Toronto, ON", "007", "true"], "format": "json"},
      { source: '"Québec, Canada",東京,"He said ""hi"""', expected: ["Québec, Canada", "東京", 'He said "hi"'], format: "json" },
      { source: "a,, b, ", expected: ["a", "b"], format: "json" },
      { source: '"unterminated', error: /No values found|quote/i },
    ],
  },
  "xml-to-text": {
    button: "Convert", input: "XML input", output: "Extracted text",
    copy: "Copy", download: "Download TXT", clear: "Clear",
    cases: [
      { source: "<root>Before <item>café</item><![CDATA[after]]></root>", expected: "Before\ncafé\nafter" },
      { source: '<root><item>one</item><item>東京</item></root>', expected: "one\n東京", settings: [["radio", "One line per selected element"], ["fill", /Element name/i, "item"]] },
      { source: "<root><broken></root>", error: /malformed XML|mismatch|parse|well-formed/i },
      { source: '<!DOCTYPE root SYSTEM "https://example.invalid/atc-external"><root>test</root>', error: /DTD|declaration/i },
    ],
  },
  "text-to-xml": {
    button: "Convert", input: "Plain-text input", output: "Generated XML",
    copy: "Copy", download: "Download XML", clear: "Clear",
    cases: [
      { source: "Alpha & Café 東京", expected: /<root>\s*<item>Alpha &amp; Café 東京<\/item>\s*<\/root>/ },
      { source: "A & B\n😀", expected: /<item index="1">A &amp; B<\/item>\s*<item index="2">😀<\/item>/, settings: [["radio", "One child per line"], ["check", "Add numeric index attribute"]] },
      { source: "alpha", error: /invalid|root.*name|XML name/i, settings: [["fill", "Root element name", "9root"]] },
      { source: "A\u0001B", error: /XML|character/i, settings: [["fill", "Root element name", "root"]] },
    ],
  },
  "html-to-text": {
    button: "Convert", input: "HTML input", output: "Plain-text output",
    copy: "Copy", download: "Download TXT", clear: "Clear",
    cases: [
      { source: "<p>café &amp; 東京</p><ul><li>One</li><li>Two</li></ul>", expected: /café & 東京\s+- One\n- Two$/ },
      { source: '<script>throw 1</script><img src="https://example.invalid/atc-external"><a href="javascript:alert(1)">safe label</a>', expected: "safe label", settings: [["check", "Append safe link URLs"]] },
      { source: '<a href="https://example.com/a">safe</a>', expected: "safe (https://example.com/a)" },
    ],
  },
  "text-to-html": {
    button: "Convert", input: "Plain-text input", output: "Generated HTML",
    copy: "Copy", download: "Download HTML", clear: "Clear",
    cases: [
      { source: "café & 東京\n\nnext", expected: /<p>café &amp; 東京<\/p>\s*<p>next<\/p>/ },
      { source: "<script>throw 1</script>", expected: /<pre>&lt;script&gt;throw 1&lt;\/script&gt;<\/pre>/, settings: [["radio", "Preformatted (<pre>)"]] },
      { source: "a\nb", expected: /<ol>\s*<li>a<\/li>\s*<li>b<\/li>\s*<\/ol>/, settings: [["radio", "Ordered list"]] },
    ],
  },
};
