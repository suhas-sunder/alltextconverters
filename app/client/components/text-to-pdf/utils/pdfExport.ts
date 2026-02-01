type PdfPageSize = "letter" | "a4";
type PdfOrientation = "portrait" | "landscape";

export type ExportPdfOptions = {
  fileName: string;
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  marginPt: number;
  scale: number;
};

export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions,
) {
  // Requires: html2canvas + jspdf (both client side).
  const [{ default: html2canvas }, jsPDFMod] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const JsPDF: any = (jsPDFMod as any)?.jsPDF ?? (jsPDFMod as any)?.default;
  if (!JsPDF) throw new Error("jsPDF not available");

  const doc = new JsPDF({
    unit: "pt",
    format: options.pageSize,
    orientation: options.orientation,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = Math.max(0, options.marginPt);

  // Render full element to a canvas, then slice into pages.
  const canvas = await html2canvas(element, {
    scale: options.scale,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const imgWidth = pageWidth - margin * 2;

  // Convert canvas px to points proportionally.
  const pxFullWidth = canvas.width;
  const pxFullHeight = canvas.height;
  const ratio = imgWidth / pxFullWidth; // pt per px
  const imgHeight = pxFullHeight * ratio;

  const usableHeight = pageHeight - margin * 2;

  // If it fits on one page, keep it simple.
  if (imgHeight <= usableHeight) {
    doc.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    doc.save(options.fileName);
    return;
  }

  // Slice: draw on temp canvas each page section.
  const pagePxHeight = Math.floor(usableHeight / ratio); // px per page
  let renderedPx = 0;
  let pageIndex = 0;

  while (renderedPx < pxFullHeight) {
    if (pageIndex > 0) doc.addPage();

    const sliceHeight = Math.min(pagePxHeight, pxFullHeight - renderedPx);

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = pxFullWidth;
    pageCanvas.height = sliceHeight;

    const ctx = pageCanvas.getContext("2d");
    if (!ctx) break;

    // White background in case transparent
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    ctx.drawImage(
      canvas,
      0,
      renderedPx,
      pxFullWidth,
      sliceHeight,
      0,
      0,
      pxFullWidth,
      sliceHeight,
    );

    const pageImg = pageCanvas.toDataURL("image/png");
    const ptHeight = sliceHeight * ratio;

    doc.addImage(pageImg, "PNG", margin, margin, imgWidth, ptHeight);

    renderedPx += sliceHeight;
    pageIndex += 1;
  }

  doc.save(options.fileName);
}
