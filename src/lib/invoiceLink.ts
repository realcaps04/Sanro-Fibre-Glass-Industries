export async function publishInvoicePdf(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file, file.name);
  body.append("expire", "172800");

  const response = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body,
  });
  if (!response.ok) {
    throw new Error("Unable to publish invoice PDF");
  }

  const payload = (await response.json()) as {
    status?: string;
    data?: { url?: string };
  };
  if (payload.status !== "success" || !payload.data?.url) {
    throw new Error("Unable to publish invoice PDF");
  }

  return payload.data.url.replace("http://", "https://").replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

export function invoiceWhatsAppMessage(
  customerName: string,
  invoiceNumber: string,
  businessName: string,
  downloadUrl: string,
) {
  return [
    `Hello ${customerName},`,
    "",
    `Invoice ${invoiceNumber} from ${businessName}.`,
    "",
    "Download PDF:",
    downloadUrl,
    "",
    "This link works for 2 days.",
    "",
    "Thank you.",
  ].join("\n");
}
