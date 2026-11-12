import assert from "node:assert/strict";
import test from "node:test";
import { addSequentialNumbers, dedentSpaces, expandIndentTabs, removeAdjacentBullets, removeReplyQuotes, removeSequentialNumbers } from "../app/client/text/workflow-cleanup.ts";

const fixtures = [
  ["Word paste with bullets and smart punctuation", removeAdjacentBullets, "• Bonjour\r\n• l’été\r\n", "Bonjour\r\nl’été\r\n"],
  ["PDF list markers and mixed separators", removeAdjacentBullets, "▪ 東京\r▪ Montréal\n▪ São Paulo", "東京\rMontréal\nSão Paulo"],
  ["Email list with indentation", removeAdjacentBullets, "  - Start\r\n  + Check\r\n  * Finish", "  Start\r\n  Check\r\n  Finish"],
  ["List run followed by a blank and a standalone symbol", removeAdjacentBullets, "- one\n- two\n\n- an isolated label", "one\ntwo\n\n- an isolated label"],
  ["A prose bullet symbol without an adjacent run", removeAdjacentBullets, "• Note to self", "• Note to self"],
  ["Minus signs and telephone prefixes", removeAdjacentBullets, "-10°C\n+44 20 1234", "-10°C\n+44 20 1234"],
  ["Code and a decorative Markdown rule", removeAdjacentBullets, "- one\n- two\n* * *\n    - data\n    - data", "one\ntwo\n* * *\n    - data\n    - data"],
  ["Quoted bullets in a code sample", removeAdjacentBullets, "~~~markdown\n- one\n- two\n~~~\n- red\n- blue", "~~~markdown\n- one\n- two\n~~~\nred\nblue"],
  ["Longer Markdown fence shields shorter delimiters", removeAdjacentBullets, "~~~~\n~~~\n- a\n- b\n~~~~\n- c\n- d", "~~~~\n~~~\n- a\n- b\n~~~~\nc\nd"],
  ["Outlook reply preserves blank lines and words", removeReplyQuotes, "> Hi 👋\r\n>\r\n> Thanks!\r\n", "Hi 👋\r\n\r\nThanks!\r\n"],
  ["Gmail nested quote retains older level", removeReplyQuotes, "> > older\n> newer\nsent today", "> older\nnewer\nsent today"],
  ["Indented plain reply", removeReplyQuotes, "  > Résumé\r>\t東京\n  plain", "  Résumé\r東京\n  plain"],
  ["Shell and operators with no delimiter stay intact", removeReplyQuotes, ">>> prompt\n>x\n>=5\nout > file", ">>> prompt\n>x\n>=5\nout > file"],
  ["Quotation-looking code in a fence", removeReplyQuotes, "~~~sh\n> file\n~~~\n> actual quote", "~~~sh\n> file\n~~~\nactual quote"],
  ["Three-space email quote and deeper code indentation", removeReplyQuotes, "   > quoted\n    > code", "   quoted\n    > code"],
  ["Pasted Python indentation uses visual four-column tab stops", text => expandIndentTabs(text, 4), "\tif ready:\r\n \t\treturn value\t# comment", "    if ready:\r\n        return value\t# comment"],
  ["Nested config from two-column editor", text => expandIndentTabs(text, 2), " \t- first\n\t\t- second", "  - first\n    - second"],
  ["Eight-column terminal excerpt", text => expandIndentTabs(text, 8), "  \tfoo\tbar\r\tbaz", "        foo\tbar\r        baz"],
  ["Indent transform preserves non-ASCII whitespace", text => expandIndentTabs(text, 4), "\u00A0\tX\n  漢", "\u00A0\tX\n  漢"],
  ["Dedent body while preserving blank line spaces and relative structure", dedentSpaces, "    title\r\n    \r\n        body\n    tail", "title\r\n    \r\n    body\ntail"],
  ["Dedent zero-margin source leaves relative structure", dedentSpaces, "header\n    body", "header\n    body"],
  ["Dedent does not reinterpret a leading tab", dedentSpaces, "    a\r\tb", "    a\r\tb"],
  ["Dedent entirely blank source remains exact", dedentSpaces, " \r\n\t\n ", " \r\n\t\n "],
  ["Number selected excerpt without consuming blank lines", addSequentialNumbers, "first\r\n\r\n  second\r終\n", "1: first\r\n\r\n2:   second\r3: 終\n"],
  ["Number meaningful NBSP in source as text", addSequentialNumbers, "\u00A0\n \t\nfoo", "1: \u00A0\n \t\n2: foo"],
  ["Strip exact generated sequence", removeSequentialNumbers, "1: first\r\n\r\n2:   second\r3: 終\n", "first\r\n\r\n  second\r終\n"],
  ["Reject prose with a lone prefixed line", removeSequentialNumbers, "1: one", "1: one"],
  ["Reject a pasted numbered fragment that begins at 2", removeSequentialNumbers, "2: two\r3: three", "2: two\r3: three"],
  ["Reject a partial or gapped sequence", removeSequentialNumbers, "1: x\n3: y\nplain", "1: x\n3: y\nplain"],
  ["Reject ambiguous leading zeros and empty numbered rows", removeSequentialNumbers, "01: x\n2: y", "01: x\n2: y"],
  ["Preserve ZWJ and RTL tokens through numbering", removeSequentialNumbers, "1: 👩🏽‍💻\n2: مرحبا\u200F", "👩🏽‍💻\nمرحبا\u200F"],
];

for (const [name, apply, source, expected] of fixtures) test(name, () => assert.equal(apply(source), expected));

test("large mixed-ending numbering and removal are stable and lossless", () => {
  const endings = ["\r\n", "\r", "\n"];
  const source = Array.from({ length: 25000 }, (_, index) => index % 11 ? "row" + endings[index % 3] : "\t" + endings[index % 3]).join("");
  assert.equal(removeSequentialNumbers(addSequentialNumbers(source)), source);
});
