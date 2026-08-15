import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function invoiceCanvas(element: HTMLElement) {
  const previousWidth = element.style.width;
  element.style.width = "794px";
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
  try {
    return await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: 794,
      windowWidth: 794,
    });
  } finally {
    element.style.width = previousWidth;
  }
}

function canvasToPdf(canvas: HTMLCanvasElement) {
  const image = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;
  let remaining = imageHeight;
  let position = 0;

  pdf.addImage(image, "JPEG", 0, position, pageWidth, imageHeight);
  remaining -= pageHeight;

  while (remaining > 0) {
    position = remaining - imageHeight;
    pdf.addPage();
    pdf.addImage(image, "JPEG", 0, position, pageWidth, imageHeight);
    remaining -= pageHeight;
  }

  return pdf;
}

export async function downloadInvoicePdf(element: HTMLElement, filename: string) {
  const pdf = canvasToPdf(await invoiceCanvas(element));
  pdf.save(filename);
}
