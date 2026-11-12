export type EditorSelection = { start: number; end: number; inputType: string };

export function editorValue(raw: string) {
  return raw.includes("\r") ? raw.replace(/\r\n|\r/g, "\n") : raw;
}

export function replaceDisplayedRange(raw: string, start: number, end: number, inserted: string) {
  // The textarea exposes CRLF as one character. Translate its selection to raw offsets.
  let rawStart = start;
  let rawEnd = end;
  for (let index = raw.indexOf("\r\n"); index >= 0 && index < rawEnd; index = raw.indexOf("\r\n", index + 2)) {
    if (index < rawStart) rawStart += 1;
    rawEnd += 1;
  }
  const before = raw.slice(0, rawStart);
  const after = raw.slice(rawEnd);
  // Keep two logical newlines when an edit brings a bare CR and LF together.
  if (!inserted && before.endsWith("\r") && after.startsWith("\n")) return before + "\n" + after;
  if (before.endsWith("\r") && inserted.startsWith("\n")) inserted = "\r" + inserted;
  if (inserted.endsWith("\r") && after.startsWith("\n")) inserted += "\n";
  return before + inserted + after;
}

export function applyEditorEdit(raw: string, edited: string, selection?: EditorSelection) {
  if (!raw.includes("\r")) return edited;
  const shown = editorValue(raw);
  if (shown === edited) return raw;

  if (selection) {
    let { start, end } = selection;
    const removed = shown.length - edited.length;
    if (start === end && removed > 0) {
      if (/^delete.*Backward$/.test(selection.inputType)) start -= removed;
      if (/^delete.*Forward$/.test(selection.inputType)) end += removed;
    }
    // The original selection disambiguates edits among identical display newlines.
    if (start >= 0 && end >= start && end <= shown.length) {
      const before = shown.slice(0, start);
      const after = shown.slice(end);
      if (edited.length >= before.length + after.length && edited.startsWith(before) && edited.endsWith(after)) {
        return replaceDisplayedRange(raw, start, end, edited.slice(start, edited.length - after.length));
      }
    }
  }

  // Autofill, undo and synthetic input can arrive without a usable beforeinput selection.
  let start = 0;
  while (start < shown.length && start < edited.length && shown[start] === edited[start]) start += 1;
  let beforeEnd = shown.length;
  let afterEnd = edited.length;
  while (beforeEnd > start && afterEnd > start && shown[beforeEnd - 1] === edited[afterEnd - 1]) {
    beforeEnd -= 1;
    afterEnd -= 1;
  }
  return replaceDisplayedRange(raw, start, beforeEnd, edited.slice(start, afterEnd));
}
