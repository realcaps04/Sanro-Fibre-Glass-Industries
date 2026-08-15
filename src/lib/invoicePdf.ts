import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { INVOICE_SHEET_WIDTH } from "@/lib/invoiceSheet";

function waitForImages(root: HTMLElement) {
  return Promise.all(
    Array.from(root.querySelectorAll("img")).map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

async function invoiceCanvas(element: HTMLElement) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = `${INVOICE_SHEET_WIDTH}px`;
  host.style.background = "#ffffff";
  host.style.zIndex = "-1";

  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = "invoice-print-clone";
  clone.style.width = `${INVOICE_SHEET_WIDTH}px`;
  clone.style.maxWidth = `${INVOICE_SHEET_WIDTH}px`;
  clone.style.transform = "none";
  host.appendChild(clone);
  document.body.appendChild(host);

  await waitForImages(clone);
  await new Promise((resolve) => window.setTimeout(resolve, 80));

  try {
    return await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: INVOICE_SHEET_WIDTH,
      windowWidth: INVOICE_SHEET_WIDTH,
    });
  } finally {
    host.remove();
  }
}

function canvasToPdf(canvas: HTMLCanvasElement) {
  const image = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageHeight = (canvas.height * pageWidth) / canvas.width;

  if (imageHeight <= pageHeight) {
    pdf.addImage(image, "JPEG", 0, 0, pageWidth, imageHeight);
    return pdf;
  }

  let remaining = imageHeight;
  let position = 0;
  pdf.addImage(image, "JPEG", 0, position, pageWidth, imageHeight);
  remaining -= pageHeight;
  while (remaining > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(image, "JPEG", 0, position, pageWidth, imageHeight);
    remaining -= pageHeight;
  }
  return pdf;
}

export async function createInvoicePdfFile(element: HTMLElement, filename: string) {
  const pdf = canvasToPdf(await invoiceCanvas(element));
  return new File([pdf.output("blob")], filename, { type: "application/pdf" });
}

export function canSharePdfFile(file: File) {
  try {
    return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export async function downloadInvoicePdf(element: HTMLElement, filename: string) {
  const file = await createInvoicePdfFile(element, filename);
  downloadPdfFile(file);
}

export function downloadPdfFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
