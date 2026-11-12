export const caseFixtures = {
  "case-converter": {
    button: "Convert",
    input: "Source text",
    output: "Converted text",
    cases: [
      { source: "café 123!\nγειά 😀", expected: "CAFÉ 123!\nΓΕΙΆ 😀" },
      { source: "ÉLAN 123\n東京", expected: "élan 123\n東京", settings: [["select", "Transformation", "lowercase"]] },
      { source: "漢字 😀 123", expected: "漢字 😀 123" },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "uppercase-converter": {
    button: "Convert", input: "Source text", output: "Converted text",
    cases: [
      { source: "Café 123!\nγειά 漢字 😀", expected: "CAFÉ 123!\nΓΕΙΆ 漢字 😀" },
      { source: "straße", expected: "STRASSE" },
      { source: "e\u0301x\t a", expected: "E\u0301X\t A" },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "lowercase-converter": {
    button: "Convert", input: "Source text", output: "Converted text",
    cases: [
      { source: "CAFÉ 123!\nΓΕΙΆ 漢字 😀", expected: "café 123!\nγειά 漢字 😀" },
      { source: "ΟΣ", expected: "ος" },
      { source: "E\u0301X\t A", expected: "e\u0301x\t a" },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "title-case-converter": {
    button: "Convert", input: "Source text", output: "Converted text",
    cases: [
      { source: "élan déjà\nпривет МИР", expected: "Élan Déjà\nПривет Мир" },
      { source: "the rise-and-fall of NASA", expected: "The Rise-And-Fall Of Nasa" },
      { source: "don't STOP o'neill", expected: "Don't Stop O'neill" },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "sentence-case-converter": {
    button: "Convert", input: "Source text", output: "Converted text",
    cases: [
      { source: 'HELLO. "WORLD!" (HOW ARE YOU?)', expected: 'Hello. "World!" (How are you?)' },
      { source: "VALUE 3.14 IS PI. NEXT", expected: "Value 3.14 is pi. Next" },
      { source: "ПРИВЕТ。 КАК ДЕЛА？ ХОРОШО！", expected: "Привет。 Как дела？ Хорошо！" },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "alternating-case-converter": {
    button: "Convert", input: "Source text", output: "Converted text",
    cases: [
      { source: "a b-c1!d", expected: "a B-c1!D" },
      { source: "e\u0301x", expected: "E\u0301x", settings: [["select", "Starting case", "uppercase"]] },
      { source: "👨‍👩‍👧‍👦ab", expected: "👨‍👩‍👧‍👦Ab" },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
  "match-case-converter": {
    button: "Match case", input: "Target text", output: "Matched text",
    cases: [
      { source: "example target", expected: "ExAMpLE tARgET", settings: [["fill", "Case pattern", "AbC"]] },
      { source: "Café déjà", expected: "cAfÉ dÉjÀ", settings: [["fill", "Case pattern", "aB"]] },
      { source: "Keep 漢字 As-Is", expected: "Keep 漢字 As-Is", settings: [["fill", "Case pattern", "123 😀"]], notice: /no cased letters/i },
    ],
    copy: "Copy", download: "Download TXT", clear: "Clear",
  },
};
