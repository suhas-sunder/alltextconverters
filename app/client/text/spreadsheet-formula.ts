const formulaPrefix = /^(?:[\u0000\t\r\n]|[\s\u0000-\u001f]*[=+\-@＝＋－＠])/u;

export function startsLikeSpreadsheetFormula(text: string): boolean {
  return formulaPrefix.test(text);
}
