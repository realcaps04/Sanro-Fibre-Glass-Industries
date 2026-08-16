import { formatInvoiceAmount } from "@/lib/currency";
import { invoiceWhatsAppMessage, publicBillUrl } from "@/lib/invoiceLink";
import { openPreparingWindow, openWhatsAppChat, openWhatsAppChatIn } from "@/lib/whatsapp";
import { invoiceService } from "@/services/invoiceService";
import type { AppSettings, Invoice } from "@/types";

export const BILL_DELIVERY_WINDOW_MS = 60 * 60 * 1000;

export function isBillDeliveryPending(invoice: Invoice) {
  if (invoice.deliveryStatus !== "pending") return false;
  return Date.now() - new Date(invoice.createdAt).getTime() < BILL_DELIVERY_WINDOW_MS;
}

export function billWhatsAppText(invoice: Invoice, settings: AppSettings) {
  return invoiceWhatsAppMessage(
    invoice.customerName,
    invoice.number,
    settings.business.legalName,
    formatInvoiceAmount(invoice.grandTotal),
    invoice.balance > 0 ? formatInvoiceAmount(invoice.balance) : "",
    invoice.shareToken ? publicBillUrl(invoice.shareToken) : "",
  );
}

export async function sendBillToRegisteredPhone(
  invoice: Invoice,
  phone: string | undefined,
  settings: AppSettings,
  popup?: Window | null,
) {
  if (!phone) return false;
  const text = billWhatsAppText(invoice, settings);
  const opened = popup
    ? openWhatsAppChatIn(popup, phone, text)
    : Boolean(openWhatsAppChat(phone, text));
  if (opened) {
    await invoiceService.markBillSent(invoice.id);
  }
  return opened;
}

export function prepareBillWhatsAppWindow() {
  return openPreparingWindow("Opening WhatsApp to send this bill…");
}
