export type PublishedInvoicePdf = {
  id: string;
  remoteName: string;
  downloadUrl: string;
};

function isLocalHost() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

export function toTmpfilesDownloadUrl(url: string) {
  const httpsUrl = url.replace("http://", "https://");
  const parsed = new URL(httpsUrl);
  if (!parsed.pathname.startsWith("/dl/")) {
    parsed.pathname = `/dl${parsed.pathname}`;
  }
  return parsed.toString();
}

export function parseTmpfilesId(url: string) {
  const parsed = new URL(toTmpfilesDownloadUrl(url));
  const parts = parsed.pathname.replace(/^\/dl\/?/, "").split("/").filter(Boolean);
  return {
    id: parts[0] ?? "",
    remoteName: decodeURIComponent(parts.slice(1).join("/") || ""),
  };
}

export async function publishInvoicePdf(file: File): Promise<PublishedInvoicePdf> {
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

  const downloadUrl = toTmpfilesDownloadUrl(payload.data.url);
  const parsed = parseTmpfilesId(downloadUrl);
  if (!parsed.id) {
    throw new Error("Unable to publish invoice PDF");
  }

  return {
    id: parsed.id,
    remoteName: parsed.remoteName || file.name,
    downloadUrl,
  };
}

export function customerPdfLink(published: PublishedInvoicePdf, filename: string) {
  if (isLocalHost()) return published.downloadUrl;
  const safe = (filename || published.remoteName || "invoice.pdf").replace(/[^\w.\-]+/g, "_");
  return `${window.location.origin}/get-bill/${published.id}/${safe}`;
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
    "Tap this link to download the PDF:",
    downloadUrl,
    "",
    "Thank you.",
  ].join("\n");
}
