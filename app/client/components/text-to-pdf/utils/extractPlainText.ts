export function extractPlainText(html: string): string {
  if (typeof window === "undefined") return html;

  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.innerText || "").replace(/\r\n/g, "\n").trim();
}
