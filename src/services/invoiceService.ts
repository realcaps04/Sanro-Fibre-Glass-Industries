import { calculateBill } from "@/lib/calculations";
import { api } from "../../convex/_generated/api";
import { convex } from "@/lib/convex";
import { matchesQuery } from "@/lib/search";
import { settingsService } from "@/services/settingsService";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  PaymentMethod,
} from "@/types";

export interface ConvexBillRow {
  _id: string;
  number: string;
  customerId: string;
  customerName: string;
  date: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  taxableAmount?: number;
  taxRate: number;
  tax: number;
  cgst?: number;
  sgst?: number;
  grandTotal: number;
  amountPaid: number;
  balance: number;
  paymentMethod: PaymentMethod;
  status: InvoiceStatus;
  notes?: string;
  billKind?: Invoice["billKind"];
  gstBill?: boolean;
  createdAt: string;
  shareToken?: string;
  deliveryStatus?: Invoice["deliveryStatus"];
  deliveredAt?: string;
}

export function mapConvexBill(row: ConvexBillRow): Invoice {
  const nonGst = row.taxRate === 0 || row.gstBill === false;
  const totals = nonGst
    ? calculateBill({
        items: row.items,
        discount: row.discount,
        taxRate: 0,
        amountPaid: row.amountPaid,
      })
    : undefined;
  const items = nonGst
    ? row.items.map((item) => ({ ...item, gstRate: 0, tax: 0 }))
    : row.items;
  return {
    id: row._id,
    number: row.number,
    customerId: row.customerId,
    customerName: row.customerName,
    date: row.date,
    items,
    subtotal: totals?.subtotal ?? row.subtotal,
    discount: row.discount,
    taxableAmount: totals?.taxableAmount ?? row.taxableAmount,
    taxRate: nonGst ? 0 : row.taxRate,
    tax: totals?.tax ?? row.tax,
    cgst: totals?.cgst ?? row.cgst,
    sgst: totals?.sgst ?? row.sgst,
    grandTotal: totals?.grandTotal ?? row.grandTotal,
    amountPaid: totals?.amountPaid ?? row.amountPaid,
    balance: totals?.balance ?? row.balance,
    paymentMethod: row.paymentMethod,
    status: row.status,
    notes: row.notes,
    billKind: row.billKind,
    createdAt: row.createdAt,
    shareToken: row.shareToken,
    deliveryStatus: row.deliveryStatus,
    deliveredAt: row.deliveredAt,
  };
}

function lineItems(items: InvoiceLineItem[], nonGst = false) {
  return items.map((item) => ({
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    rate: item.rate,
    amount: item.quantity * item.rate,
    hsnCode: item.hsnCode,
    gstRate: nonGst ? 0 : item.gstRate,
    taxableAmount: nonGst ? item.quantity * item.rate : item.taxableAmount,
    tax: nonGst ? 0 : item.tax,
  }));
}

function billArgs(input: CreateInvoiceInput, prefix: string) {
  const nonGst = input.taxRate === 0;
  return {
    customerId: input.customerId,
    customerName: input.customerName,
    items: lineItems(input.items, nonGst),
    discount: input.discount,
    taxRate: nonGst ? 0 : input.taxRate,
    amountPaid: input.amountPaid,
    paymentMethod: input.paymentMethod,
    notes: input.notes?.trim() || undefined,
    date: input.date ?? new Date().toISOString().slice(0, 10),
    billKind: input.billKind,
    prefix,
  };
}

export const invoiceService = {
  async getInvoices(): Promise<Invoice[]> {
    const [gst, doors, nonGst] = await Promise.all([
      convex.query(api.gstBills.list),
      convex.query(api.doorBills.list),
      convex.query(api.nonGstBills.list),
    ]);
    return [...gst, ...doors, ...nonGst]
      .map(mapConvexBill)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getInvoiceById(id: string): Promise<Invoice | undefined> {
    const invoices = await this.getInvoices();
    return invoices.find((invoice) => invoice.id === id);
  },

  async searchInvoices(query: string, status?: InvoiceStatus | "all"): Promise<Invoice[]> {
    const invoices = await this.getInvoices();
    return invoices.filter((invoice) => {
      const matchesStatus = !status || status === "all" || invoice.status === status;
      return (
        matchesStatus &&
        matchesQuery(query, invoice.number, invoice.customerName, invoice.status)
      );
    });
  },

  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const settings = await settingsService.getSettings();
    const taxRate = input.taxRate === 0 ? 0 : (input.taxRate ?? settings.invoice.taxRate);
    const payload = billArgs({ ...input, taxRate }, settings.invoice.prefix);
    const gst = taxRate > 0;
    const row =
      input.billKind === "mixed"
        ? await convex.mutation(api.anyBills.create, { ...payload, gst })
        : gst
          ? await convex.mutation(api.gstBills.create, payload)
          : await convex.mutation(api.nonGstBills.create, payload);
    if (!row) throw new Error("Unable to create invoice");
    await settingsService.updateSettings({
      invoice: { ...settings.invoice, nextNumber: settings.invoice.nextNumber + 1 },
    });
    return mapConvexBill(row);
  },

  async updateInvoice(id: string, input: CreateInvoiceInput): Promise<Invoice> {
    const settings = await settingsService.getSettings();
    const row = await convex.mutation(api.billActions.update, {
      id,
      ...billArgs(input, settings.invoice.prefix),
    });
    if (!row) throw new Error("Invoice not found");
    return mapConvexBill(row);
  },

  async applyPayment(invoiceId: string, amount: number): Promise<Invoice> {
    const row = await convex.mutation(api.billActions.applyPayment, {
      id: invoiceId,
      amount,
    });
    if (!row) throw new Error("Invoice not found");
    return mapConvexBill(row);
  },

  async cancelInvoice(invoiceId: string): Promise<Invoice> {
    const row = await convex.mutation(api.billActions.cancel, { id: invoiceId });
    if (!row) throw new Error("Invoice not found");
    return mapConvexBill(row);
  },

  async deleteInvoice(invoiceId: string): Promise<void> {
    await convex.mutation(api.billActions.remove, { id: invoiceId });
  },

  async markBillSent(invoiceId: string): Promise<void> {
    await convex.mutation(api.billDelivery.markSent, { id: invoiceId });
  },
};
