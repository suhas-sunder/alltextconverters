export function needsUnicodePrint(text: string) {
  return /[^\t\n\r\x20-\x7e]/u.test(text);
}

const printStyles = [
  "@page { margin: 16mm; }",
  "body { margin: 1rem auto; padding: 0 1rem; max-width: 58rem; color: #0f172a; font: 1rem/1.55 system-ui, sans-serif; }",
  "button { padding: .6em 1em; font: inherit; }",
  "button:focus-visible { outline: 2px solid #0369a1; outline-offset: 3px; }",
  "pre { font: inherit; white-space: pre-wrap; overflow-wrap: anywhere; unicode-bidi: plaintext; tab-size: 4; }",
  "@media print { body { margin: 0; padding: 0; max-width: none; font-size: 11pt; } .print-controls { display: none; } }",
].join("\n");

export function buildTextPrintDocument(doc: Document, title: string, text: string, print: () => void) {
  doc.documentElement.lang = "en";
  doc.title = title;
  const charset = doc.createElement("meta");
  charset.setAttribute("charset", "utf-8");
  const viewport = doc.createElement("meta");
  viewport.name = "viewport";
  viewport.content = "width=device-width, initial-scale=1";
  const style = doc.createElement("style");
  style.textContent = printStyles;
  doc.head.append(charset, viewport, style);

  const heading = doc.createElement("h1");
  heading.textContent = title;
  const controls = doc.createElement("div");
  controls.className = "print-controls";
  const button = doc.createElement("button");
  button.type = "button";
  button.textContent = "Print or save as PDF";
  button.addEventListener("click", print);
  const note = doc.createElement("p");
  note.textContent = "Choose Save as PDF in the print dialog. Preview the result first. Glyphs depend on the fonts on this device. Use a plain-text export when you need exact source text.";
  controls.append(button, note);
  const content = doc.createElement("pre");
  content.dir = "auto";
  content.textContent = text;
  const main = doc.createElement("main");
  main.append(heading, controls, content);
  doc.body.replaceChildren(main);
  button.focus();
}

export function openTextPrintView(title: string, text: string) {
  let view: Window | null = null;
  try {
    // Open synchronously from the export gesture. The tab remains local and receives only text.
    view = window.open("about:blank", "_blank");
    if (!view) return false;
    view.opener = null;
    const printWindow = view;
    buildTextPrintDocument(printWindow.document, title, text, () => printWindow.print());
    return true;
  } catch {
    view?.close();
    return false;
  }
}
